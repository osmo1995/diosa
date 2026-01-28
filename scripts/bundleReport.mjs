import { execSync } from 'node:child_process';

// Lightweight bundle report: prints dist asset sizes.
// (Use a full visualizer if you prefer, but this keeps deps minimal.)

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let b = bytes;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

const out = execSync(process.platform === 'win32' ? 'powershell -NoProfile -Command "Get-ChildItem -Recurse dist | Where-Object { -not $_.PSIsContainer } | Select-Object FullName,Length"' : 'find dist -type f -printf "%p %s\n"', {
  encoding: 'utf8',
});

const lines = out.trim().split(/\r?\n/).filter(Boolean);
let total = 0;
for (const line of lines) {
  const m = line.match(/(\d+)\s*$/);
  if (m) total += Number(m[1]);
}

console.log(`[bundleReport] dist total: ${formatBytes(total)}`);
