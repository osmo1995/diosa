import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Small-batch style preview generator for exports/style-previews.
//
// Generates:
// exports/style-previews/extensions/<preset>/<color>/<length>/{400,700,1000,2000}.webp
//
// Usage example (popular-only):
// node scripts/generateStylePreviews.mjs --category=extensions --force \
//   --presets=extensions-natural-blend,extensions-volume-set \
//   --colors=old-money,champagne,espresso \
//   --lengths=18,22,24
//
// Notes:
// - Requires GEMINI_API_KEY.
// - Uses exports/misc/quiz/700.webp as the default input image.

const EXPORT_SIZES = [400, 700, 1000, 2000];

function parseArgs(argv) {
  const args = {};
  const list = argv.slice(2);
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    if (!a.startsWith('--')) continue;

    const raw = a.slice(2);
    const eq = raw.indexOf('=');

    // Support both:
    //  --key=value
    //  --key value
    if (eq !== -1) {
      const k = raw.slice(0, eq);
      const v = raw.slice(eq + 1);
      args[k] = v === '' ? true : v;
      continue;
    }

    const k = raw;
    const next = list[i + 1];
    if (next && !next.startsWith('--')) {
      args[k] = next;
      i += 1;
    } else {
      args[k] = true;
    }
  }
  return args;
}

function splitList(v) {
  if (!v || v === true) return null;
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function stableSeed(input) {
  // Deterministic 32-bit seed from an arbitrary string.
  const buf = crypto.createHash('sha256').update(String(input)).digest();
  return buf.readUInt32LE(0);
}

function buildComfyPrompt({ preset, color, length, promptSuffix }) {
  // Keep these prompts explicit and “camera-real” to reduce drift.
  // We intentionally avoid mentioning other colors; we specify tone and undertone clearly.
  const base =
    'Photorealistic luxury salon editorial photo of a woman, chest-up portrait. ' +
    'Hair extensions applied seamlessly with invisible blend at the root and natural density. ' +
    'Professional salon lighting, daylight-proof, realistic hair strand detail, high resolution.';

  // Map our abstract length to language and visual cues.
  const lengthCue =
    length === '14'
      ? 'above shoulders, collarbone length'
      : length === '18'
        ? 'shoulder to chest length'
        : length === '22'
          ? 'mid-back length'
          : 'lower back length';

  // Color-specific phrasing: keep it stable and consistent.
  // If you add more colors later, extend this map.
  const colorMap = {
    'old-money': 'old money blonde, neutral-beige blonde with soft dimension, subtle root shadow, no orange, no platinum',
    champagne: 'champagne blonde, creamy warm-neutral blonde, subtle brightness, no orange, no platinum',
    beige: 'beige blonde, neutral beige blonde, soft natural dimension, no brass, no platinum',
    ash: 'cool ash blonde, cool-toned ash, subtle root, no warmth, no yellow',
    honey: 'honey bronde, warm golden beige, sunlit warmth, not copper, not orange',
    espresso: 'rich espresso brunette, deep neutral brown, glossy, not black',
  };

  const colorCue = colorMap[color] ?? `${color} hair color (accurate, natural)`;

  // Preset-specific structure/texture cues.
  const presetMap = {
    'extensions-natural-blend': 'natural blend, seamless everyday density, invisible installation, soft natural texture',
    'extensions-volume-set': 'volume set, fuller ends, lifted density through the mid-lengths, glamorous but believable',
    'extensions-length-set': 'length set, clean length with polished fall, smooth ends',
    'extensions-soft-waves': 'soft waves, gentle movement, luxury finish, not curly',
  };

  const presetCue = presetMap[preset] ?? preset;

  const suffix = promptSuffix ? ` ${promptSuffix}` : '';
  return `${base} Style: ${presetCue}. Color: ${colorCue}. Length: ${lengthCue}.${suffix}`;
}

function buildComfyNegativePrompt() {
  return (
    'cartoon, illustration, painting, anime, 3d, cgi, lowres, blurry, out of focus, jpeg artifacts, watermark, text, logo, ' +
    'bad anatomy, deformed, extra fingers, extra limbs, unrealistic hairline, wig, harsh highlights, color banding'
  );
}

async function comfyQueueAndGetPng({ serverUrl, workflow, promptId }) {
  const historyUrl = `${serverUrl}/history/${promptId}`;

  // Poll until the prompt appears in history and contains an image output.
  const started = Date.now();
  const timeoutMs = 5 * 60_000;

  while (Date.now() - started < timeoutMs) {
    const res = await fetch(historyUrl);
    if (res.ok) {
      const json = await res.json();
      const item = json?.[promptId];
      const outputs = item?.outputs;
      if (outputs) {
        for (const nodeId of Object.keys(outputs)) {
          const out = outputs[nodeId];
          const images = out?.images;
          if (Array.isArray(images) && images.length) {
            const img = images[0];
            // ComfyUI serves images via /view?filename=...&subfolder=...&type=output
            const filename = encodeURIComponent(img.filename);
            const subfolder = encodeURIComponent(img.subfolder ?? '');
            const type = encodeURIComponent(img.type ?? 'output');
            const viewUrl = `${serverUrl}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
            const imgRes = await fetch(viewUrl);
            if (!imgRes.ok) throw new Error(`ComfyUI /view failed (${imgRes.status})`);
            const arr = await imgRes.arrayBuffer();
            return Buffer.from(arr);
          }
        }
      }
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error('Timed out waiting for ComfyUI generation');
}

async function main() {
  const args = parseArgs(process.argv);
  const category = args.category ?? 'extensions';
  if (category !== 'extensions') {
    console.error('[generateStylePreviews] Only --category=extensions is supported right now.');
    process.exit(1);
  }

  const presets = splitList(args.presets);
  const colors = splitList(args.colors);
  const lengths = splitList(args.lengths);
  const force = Boolean(args.force);
  const dryRun = Boolean(args['dry-run']);
  const provider = String(args.provider ?? 'gemini');
  const mode = String(args.mode ?? (provider === 'comfyui' ? 'img2img' : 'img2img'));
  const denoise = Number(args.denoise ?? 0.55);
  const batchSize = args.batchSize ? Number(args.batchSize) : null;
  const startIndex = args.startIndex ? Number(args.startIndex) : 0;
  const limit = args.limit ? Number(args.limit) : null;
  const model = String(
    args.model ?? (provider === 'hf' ? 'black-forest-labs/FLUX.2-klein-4B' : 'models/gemini-2.5-flash-image')
  );
  const comfyServerUrl = String(args.comfyServerUrl ?? 'http://127.0.0.1:8188');
  const comfyCheckpoint = String(args.comfyCheckpoint ?? 'RealVisXL_V4.0.safetensors');
  const outputRoot = String(args.outputRoot ?? path.join('exports', 'style-previews', 'extensions'));
  const promptSuffix = String(args.promptSuffix ?? '');

  const hfBaseModel = String(args.hfBaseModel ?? 'Tongyi-MAI/Z-Image');

  const inputPath = String(args.input ?? path.join('exports', 'misc', 'quiz', '700.webp'));
  if (!fs.existsSync(inputPath)) {
    console.error('[generateStylePreviews] Missing input image at', inputPath);
    process.exit(1);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  if (!dryRun) {
    if (provider === 'gemini' && !geminiKey) {
      console.error('[generateStylePreviews] Missing GEMINI_API_KEY. Set it in your environment (or use --dry-run).');
      process.exit(1);
    }
    if (provider === 'hf' && !hfToken) {
      console.error('[generateStylePreviews] Missing HF_TOKEN. Set it in your environment (or use --dry-run).');
      process.exit(1);
    }
    if (provider === 'comfyui') {
      // Basic health check so we fail fast.
      try {
        const res = await fetch(`${comfyServerUrl}/system_stats`);
        if (!res.ok) throw new Error(`status=${res.status}`);
      } catch (e) {
        console.error('[generateStylePreviews] ComfyUI not reachable at', comfyServerUrl, String(e?.message ?? e));
        process.exit(1);
      }
    }
  }

  const { GoogleGenAI } = provider === 'gemini' ? await import('@google/genai') : { GoogleGenAI: null };

  // Node 18+ provides global fetch/FormData/Blob; for older runtimes, polyfill via undici.
  if (typeof FormData === 'undefined' || typeof Blob === 'undefined') {
    const undici = await import('undici');
    globalThis.FormData = undici.FormData;
    globalThis.Blob = undici.Blob;
  }

  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error('[generateStylePreviews] sharp is required to resize outputs. Install it first.');
    process.exit(1);
  }

  const ai = provider === 'gemini' && geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

  const root = outputRoot;

  // Prefer authoritative lists from data/stylePreviews.ts when no CLI filters are provided.
  // This script runs in plain Node, so we parse the TS file as text (no TS runtime required).
  let allPresets = null;
  let allColors = null;
  let allLengths = null;

  try {
    const ts = fs.readFileSync(path.join('data', 'stylePreviews.ts'), 'utf8');

    const sliceBetween = (startNeedle, endNeedle) => {
      const s = ts.indexOf(startNeedle);
      if (s === -1) return '';
      const e = ts.indexOf(endNeedle, s);
      if (e === -1) return ts.slice(s);
      return ts.slice(s, e + endNeedle.length);
    };

    const extractIds = (block) => {
      const ids = [];
      const re = /\bid\s*:\s*'([^']+)'/g;
      let m;
      while ((m = re.exec(block))) ids.push(m[1]);
      return Array.from(new Set(ids));
    };

    const presetsBlock = sliceBetween('export const extensionPresets', '];');
    const colorsBlock = sliceBetween('export const extensionColors', '];');
    const lengthsBlock = sliceBetween('export const extensionLengths', '];');

    allPresets = extractIds(presetsBlock);
    allColors = extractIds(colorsBlock);
    allLengths = extractIds(lengthsBlock);
  } catch {
    // Fall back to filesystem discovery.
  }

  // Resolve targets: CLI args > data/stylePreviews.ts > existing dirs.
  const listDirs = (p) =>
    fs.existsSync(p)
      ? fs
          .readdirSync(p, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
      : [];

  const resolvedPresets = presets ?? allPresets ?? listDirs(root);
  const resolvedColorsAll = colors ?? allColors;
  const resolvedLengthsAll = lengths ?? allLengths;

  if (!resolvedPresets?.length) {
    console.error('[generateStylePreviews] No presets found. Provide --presets or ensure data/stylePreviews.ts exists.');
    process.exit(1);
  }
  if (!resolvedColorsAll?.length) {
    console.error('[generateStylePreviews] No colors found. Provide --colors or ensure data/stylePreviews.ts exists.');
    process.exit(1);
  }
  if (!resolvedLengthsAll?.length) {
    console.error('[generateStylePreviews] No lengths found. Provide --lengths or ensure data/stylePreviews.ts exists.');
    process.exit(1);
  }

  // Build full variant list for chunking.
  const allVariants = [];
  for (const preset of resolvedPresets) {
    for (const color of resolvedColorsAll) {
      for (const len of resolvedLengthsAll) {
        allVariants.push({ preset, color, len: String(len) });
      }
    }
  }

  const effectiveLimit = limit ?? batchSize;
  const sliceStart = Math.max(0, Number.isFinite(startIndex) ? startIndex : 0);
  const sliceEnd = effectiveLimit ? sliceStart + effectiveLimit : allVariants.length;
  const variants = allVariants.slice(sliceStart, sliceEnd);

  console.log('[generateStylePreviews] Variants', {
    total: allVariants.length,
    startIndex: sliceStart,
    limit: effectiveLimit,
    running: variants.length,
    provider,
    mode,
  });

  // For HF provider, we can optionally generate a single base portrait once (text-to-image)
  // and then run img2img variants against that base.
  const hfBaseOut = path.join('exports', 'misc', 'style-preview-base.png');

  if (provider === 'hf' && !fs.existsSync(hfBaseOut) && !dryRun) {
    console.log('[generateStylePreviews] Creating HF base portrait once', { out: hfBaseOut });
    ensureDir(path.dirname(hfBaseOut));

    const { spawnSync } = await import('node:child_process');
    const basePrompt = String(
      args.basePrompt ??
        'A single centered studio portrait photo of a woman from chest up, neutral expression, plain background, luxury salon lighting, high resolution, natural skin tone, realistic.'
    );

    const r = spawnSync(
      'python',
      [
        'scripts/hf_generate_base.py',
        '--model',
        hfBaseModel,
        '--prompt',
        basePrompt,
        '--output',
        hfBaseOut,
      ],
      { stdio: 'inherit', env: { ...process.env, HF_TOKEN: hfToken } }
    );

    if (r.status !== 0) {
      console.error('[generateStylePreviews] Failed to generate HF base portrait');
      process.exit(1);
    }
  }

  const effectiveInputPath = provider === 'hf' ? hfBaseOut : inputPath;

  const inputBuffer = provider === 'comfyui' ? null : fs.readFileSync(effectiveInputPath);
  const inputBase64 = provider === 'comfyui' ? null : inputBuffer.toString('base64');
  const mimeType =
    provider === 'comfyui'
      ? null
      : effectiveInputPath.endsWith('.png')
        ? 'image/png'
        : effectiveInputPath.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';

  // For comfyui img2img: upload base image once per run (after resizing to match width/height).
  let comfyUploadedBase = null;

  async function comfyUploadBaseIfNeeded({ width, height }) {
    if (comfyUploadedBase) return comfyUploadedBase;

    // Resize the base portrait to match generation dims and upload as PNG.
    const basePng = await sharp(inputPath).resize({ width, height, fit: 'cover' }).png().toBuffer();

    const form = new FormData();
    form.append('image', new Blob([basePng], { type: 'image/png' }), 'tmp_rovodev_base.png');
    form.append('type', 'input');
    form.append('overwrite', 'true');

    const res = await fetch(`${comfyServerUrl}/upload/image`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`ComfyUI /upload/image failed (${res.status}): ${await res.text()}`);
    const json = await res.json();

    // Response typically includes { name, subfolder, type }
    const name = json?.name;
    if (!name) throw new Error('ComfyUI upload did not return image name');

    comfyUploadedBase = { name, subfolder: json?.subfolder ?? '', type: json?.type ?? 'input', width, height };
    return comfyUploadedBase;
  }

  let generated = 0;
  let skipped = 0;

  for (const { preset, color, len } of variants) {
    const outDir = path.join(root, preset, color, len);
    const out700 = path.join(outDir, '700.webp');

    if (!force && fs.existsSync(out700)) {
      skipped += 1;
      continue;
    }

    console.log('[generateStylePreviews] generating', { preset, color, length: len });
    ensureDir(outDir);

    if (dryRun) {
      generated += 1;
      continue;
    }

    let outputBuffer;

    if (provider === 'gemini') {
      const prompt = `You are a luxury hair extension editor for Diosa Studio Yorkville.
Edit the provided portrait photo to apply premium hair extensions.
Preset: ${preset}
Shade: ${color}
Length: ${len}
Requirements:
- seamless blend at root
- natural density and believable texture
- keep face identity and skin tone consistent
- professional salon lighting, daylight-proof
Return ONLY the edited image.`;

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ inlineData: { data: inputBase64, mimeType } }, { text: prompt }],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p) => p?.inlineData?.data);
      if (!imagePart?.inlineData?.data) {
        console.warn('[generateStylePreviews] No image returned', { preset, color, len });
        continue;
      }

      outputBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
    } else if (provider === 'hf') {
      const prompt = `You are a luxury hair extension editor for Diosa Studio Yorkville.
Edit the provided portrait photo to apply premium hair extensions.
Preset: ${preset}
Shade: ${color}
Length: ${len}
Requirements:
- seamless blend at root
- natural density and believable texture
- keep face identity and skin tone consistent
- professional salon lighting, daylight-proof
Return ONLY the edited image.`;

      const { spawnSync } = await import('node:child_process');
      const tmpOut = path.join('tmp_rovodev_hf_out.png');
      const r = spawnSync(
        'python',
        ['scripts/hf_img2img.py', '--model', model, '--prompt', prompt, '--input', effectiveInputPath, '--output', tmpOut],
        { stdio: 'inherit', env: { ...process.env, HF_TOKEN: hfToken } }
      );

      if (r.status !== 0 || !fs.existsSync(tmpOut)) {
        console.error('[generateStylePreviews] HF img2img failed');
        process.exit(1);
      }

      outputBuffer = fs.readFileSync(tmpOut);
      try {
        fs.rmSync(tmpOut, { force: true });
      } catch {}
    } else if (provider === 'comfyui') {
      const seed = stableSeed(`${preset}|${color}|${len}`);
      const comfyPrompt = buildComfyPrompt({ preset, color, length: String(len), promptSuffix });
      const neg = buildComfyNegativePrompt();
      const width = Number(args.width ?? 832);
      const height = Number(args.height ?? 1216);
      const steps = Number(args.steps ?? 30);
      const cfg = Number(args.cfg ?? 5.5);
      const sampler_name = String(args.sampler ?? 'euler');
      const scheduler = String(args.scheduler ?? 'normal');

      const filenamePrefix = `tmp_rovodev_stylepreview_${preset}_${color}_${len}`.replace(/[^a-z0-9_\-]/gi, '_');

      let comfyWorkflow;

      if (mode === 'img2img') {
        const uploaded = await comfyUploadBaseIfNeeded({ width, height });

        comfyWorkflow = {
          '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: comfyCheckpoint } },
          '2': { class_type: 'LoadImage', inputs: { image: uploaded.name } },
          '3': { class_type: 'VAEEncode', inputs: { pixels: ['2', 0], vae: ['1', 2] } },
          '4': {
            class_type: 'CLIPTextEncodeSDXL',
            inputs: {
              clip: ['1', 1],
              text_g: comfyPrompt,
              text_l: 'photo, realistic, high detail',
              width,
              height,
              crop_w: 0,
              crop_h: 0,
              target_width: width,
              target_height: height,
            },
          },
          '5': {
            class_type: 'CLIPTextEncodeSDXL',
            inputs: {
              clip: ['1', 1],
              text_g: neg,
              text_l: 'cartoon, illustration',
              width,
              height,
              crop_w: 0,
              crop_h: 0,
              target_width: width,
              target_height: height,
            },
          },
          '6': {
            class_type: 'KSampler',
            inputs: {
              seed,
              steps,
              cfg,
              sampler_name,
              scheduler,
              denoise,
              model: ['1', 0],
              positive: ['4', 0],
              negative: ['5', 0],
              latent_image: ['3', 0],
            },
          },
          '7': { class_type: 'VAEDecode', inputs: { samples: ['6', 0], vae: ['1', 2] } },
          '8': { class_type: 'SaveImage', inputs: { filename_prefix: filenamePrefix, images: ['7', 0] } },
        };
      } else {
        // txt2img fallback
        comfyWorkflow = {
          '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: comfyCheckpoint } },
          '2': {
            class_type: 'CLIPTextEncodeSDXL',
            inputs: {
              clip: ['1', 1],
              text_g: comfyPrompt,
              text_l: 'photo, realistic, high detail',
              width,
              height,
              crop_w: 0,
              crop_h: 0,
              target_width: width,
              target_height: height,
            },
          },
          '3': {
            class_type: 'CLIPTextEncodeSDXL',
            inputs: {
              clip: ['1', 1],
              text_g: neg,
              text_l: 'cartoon, illustration',
              width,
              height,
              crop_w: 0,
              crop_h: 0,
              target_width: width,
              target_height: height,
            },
          },
          '4': { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
          '5': {
            class_type: 'KSampler',
            inputs: {
              seed,
              steps,
              cfg,
              sampler_name,
              scheduler,
              denoise: 1.0,
              model: ['1', 0],
              positive: ['2', 0],
              negative: ['3', 0],
              latent_image: ['4', 0],
            },
          },
          '6': { class_type: 'VAEDecode', inputs: { samples: ['5', 0], vae: ['1', 2] } },
          '7': { class_type: 'SaveImage', inputs: { filename_prefix: filenamePrefix, images: ['6', 0] } },
        };
      }

      const promptRes = await fetch(`${comfyServerUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: comfyWorkflow }),
      });

      if (!promptRes.ok) {
        throw new Error(`ComfyUI /prompt failed (${promptRes.status}): ${await promptRes.text()}`);
      }

      const promptJson = await promptRes.json();
      const promptId = promptJson.prompt_id;
      if (!promptId) throw new Error('ComfyUI did not return prompt_id');

      outputBuffer = await comfyQueueAndGetPng({ serverUrl: comfyServerUrl, workflow: comfyWorkflow, promptId });
    } else {
      console.error('[generateStylePreviews] Unknown provider', provider);
      process.exit(1);
    }

    // Write 700.webp then derive other sizes.
    await sharp(outputBuffer).webp({ quality: 82 }).toFile(out700);
    for (const s of EXPORT_SIZES) {
      const outFile = path.join(outDir, `${s}.webp`);
      if (s === 700) continue;
      await sharp(outputBuffer)
        .resize({ width: s })
        .webp({ quality: 82 })
        .toFile(outFile);
    }

    generated += 1;
  }

  console.log(`[generateStylePreviews] Done. generated=${generated} skipped=${skipped}`);
}

main().catch((e) => {
  console.error('[generateStylePreviews] Failed', e?.stack ?? e);
  process.exit(1);
});
