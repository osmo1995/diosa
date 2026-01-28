import fs from 'node:fs';
import path from 'node:path';

let sharp;
try {
  // dynamic import so local dev can run even if sharp isn't installed yet
  ({ default: sharp } = await import('sharp'));
} catch (e) {
  console.warn('[generateAvifToPublic] sharp not installed; skipping AVIF generation');
  process.exit(0);
}

const TARGETS = [
  { base: path.join('public', 'exports', 'hero'), sizes: [400, 700, 1000, 2000] },
  { base: path.join('public', 'exports', 'cta'), sizes: [400, 700, 1000, 2000] },
];

async function ensureAvif(baseDir, size) {
  const webp = path.join(baseDir, `${size}.webp`);
  const avif = path.join(baseDir, `${size}.avif`);

  if (!fs.existsSync(webp)) return;

  // Skip if AVIF exists and is newer than source.
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
  let count = 0;

  for (const t of TARGETS) {
    if (!fs.existsSync(t.base)) continue;
    for (const s of t.sizes) {
      await ensureAvif(t.base, s);
      count += 1;
    }
  }

  console.log(`[generateAvifToPublic] Done (${count} attempts) in ${Date.now() - started}ms`);
}

main().catch((e) => {
  console.warn('[generateAvifToPublic] Failed', e?.message ?? e);
  // don’t fail build
  process.exit(0);
});
