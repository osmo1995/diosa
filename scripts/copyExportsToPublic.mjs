import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = 'exports';
const DEST_DIR = path.join('public', 'exports');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.warn(`[copyExportsToPublic] Skipping: '${SRC_DIR}' folder not found.`);
    return;
  }

  // Freshen destination to avoid stale files across renames.
  if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
  }

  copyDir(SRC_DIR, DEST_DIR);

  const stat = fs.statSync(DEST_DIR);
  console.log(`[copyExportsToPublic] Copied '${SRC_DIR}' -> '${DEST_DIR}' (mtime=${stat.mtime.toISOString()})`);
}

main();
