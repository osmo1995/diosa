import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const MP4 = path.resolve('exports/hero/hero-install.mp4');
const WEBM = path.resolve('exports/hero/hero-install.webm');

function log(msg) {
  console.log(`[hero-webm] ${msg}`);
}

async function main() {
  // Nothing to do if there's no MP4 or WebM already exists.
  if (!existsSync(MP4)) {
    log('No MP4 found at exports/hero/hero-install.mp4; skipping WebM generation.');
    return;
  }

  if (existsSync(WEBM)) {
    log('WebM already exists; skipping generation.');
    return;
  }

  // Attempt to run ffmpeg if available.
  const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore', shell: true });
  if (ffmpegCheck.status !== 0) {
    log('ffmpeg is not available; cannot generate WebM. (This is non-fatal.)');
    log('Install ffmpeg locally and re-run `npm run build` to generate hero-install.webm.');
    return;
  }

  log('Generating WebM from MP4...');

  // VP9 + Opus is a good baseline for web. We keep it simple and reasonably compatible.
  // CRF lower = better quality; 32 is a common balance for background videos.
  const args = [
    '-y',
    '-i', MP4,
    '-c:v', 'libvpx-vp9',
    '-b:v', '0',
    '-crf', '32',
    '-pix_fmt', 'yuv420p',
    '-row-mt', '1',
    '-deadline', 'good',
    '-cpu-used', '2',
    '-an',
    WEBM,
  ];

  const res = spawnSync('ffmpeg', args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    log('ffmpeg failed to generate WebM. (Non-fatal)');
    return;
  }

  log('WebM generated successfully.');
}

// When imported during prebuild, we MUST NOT terminate the process.
// If invoked directly, still avoid hard-exiting on non-critical errors.
await main();
