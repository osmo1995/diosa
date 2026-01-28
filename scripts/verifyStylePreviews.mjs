import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.join('exports', 'style-previews', 'extensions');

function listDirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

let missing = 0;
let checked = 0;

// Source-of-truth verification: walk exports folder and confirm a 700.webp exists
for (const preset of listDirs(ROOT)) {
  for (const color of listDirs(path.join(ROOT, preset))) {
    for (const length of listDirs(path.join(ROOT, preset, color))) {
      const file = path.join(ROOT, preset, color, length, '700.webp');
      checked += 1;
      if (!exists(file)) {
        missing += 1;
        console.log('MISSING', file);
      }
    }
  }
}

if (missing > 0) {
  console.error(`[verifyStylePreviews] Missing ${missing}/${checked} preview files`);
  process.exit(1);
}

console.log(`[verifyStylePreviews] OK (${checked} combinations checked)`);
