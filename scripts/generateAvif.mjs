import fs from 'node:fs';
import path from 'node:path';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.warn('[generateAvif] sharp not installed; skipping');
  process.exit(0);
}

const TARGETS = [
  { base: path.join('exports', 'hero'), sizes: [400, 700, 1000, 2000] },
  { base: path.join('exports', 'cta'), sizes: [400, 700, 1000, 2000] },
];

async function ensureAvif(baseDir, size) {
  const webp = path.join(baseDir, `${size}.webp`);
  const avif = path.join(baseDir, `${size}.avif`);

  if (!fs.existsSync(webp)) return;

  if (fs.existsSync(avif)) {
    const w = fs.statSync(webp).mtimeMs;
    const a = fs.statSync(avif).mtimeMs;
    if (a >= w) return;
  }

  await sharp(webp)
    .avif({ quality: 50, effort: 4 })
    .toFile(avif);
}

async function main() {
  const started = Date.now();
  let generated = 0;

  for (const t of TARGETS) {
    if (!fs.existsSync(t.base)) continue;
    for (const s of t.sizes) {
      await ensureAvif(t.base, s);
      generated += 1;
    }
  }

  console.log(`[generateAvif] Done (${generated} attempts) in ${Date.now() - started}ms`);
}

main().catch((e) => {
  console.warn('[generateAvif] Failed', e?.message ?? e);
  process.exit(0);
});
