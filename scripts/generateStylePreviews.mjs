import fs from 'node:fs';
import path from 'node:path';

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
  for (const a of argv.slice(2)) {
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    args[k] = v ?? true;
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
  const model = String(args.model ?? 'models/gemini-2.5-flash-image');

  const inputPath = String(args.input ?? path.join('exports', 'misc', 'quiz', '700.webp'));
  if (!fs.existsSync(inputPath)) {
    console.error('[generateStylePreviews] Missing input image at', inputPath);
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('[generateStylePreviews] Missing GEMINI_API_KEY. Set it in your environment (or use --dry-run).');
    process.exit(1);
  }

  const { GoogleGenAI } = await import('@google/genai');

  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error('[generateStylePreviews] sharp is required to resize outputs. Install it first.');
    process.exit(1);
  }

  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const root = path.join('exports', 'style-previews', 'extensions');

  // Resolve targets: if not specified, read from existing dirs.
  const listDirs = (p) =>
    fs.existsSync(p)
      ? fs
          .readdirSync(p, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
      : [];

  const resolvedPresets = presets ?? listDirs(root);
  if (!resolvedPresets.length) {
    console.error('[generateStylePreviews] No presets found. Provide --presets or ensure exports/style-previews exists.');
    process.exit(1);
  }

  const inputBuffer = fs.readFileSync(inputPath);
  const inputBase64 = inputBuffer.toString('base64');
  const mimeType = inputPath.endsWith('.png')
    ? 'image/png'
    : inputPath.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

  let generated = 0;
  let skipped = 0;

  for (const preset of resolvedPresets) {
    const presetDir = path.join(root, preset);
    const resolvedColors = colors ?? listDirs(presetDir);
    if (!resolvedColors.length) continue;

    for (const color of resolvedColors) {
      const colorDir = path.join(presetDir, color);
      const resolvedLengths = lengths ?? listDirs(colorDir);
      if (!resolvedLengths.length) continue;

      for (const len of resolvedLengths) {
        const outDir = path.join(colorDir, len);
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

        const outputBase64 = imagePart.inlineData.data;
        const outputBuffer = Buffer.from(outputBase64, 'base64');

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
    }
  }

  console.log(`[generateStylePreviews] Done. generated=${generated} skipped=${skipped}`);
}

main().catch((e) => {
  console.error('[generateStylePreviews] Failed', e?.stack ?? e);
  process.exit(1);
});
