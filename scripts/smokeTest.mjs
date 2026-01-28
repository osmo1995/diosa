import { spawn } from 'node:child_process';

const PREVIEW_PORT = 4173;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    // In some Windows environments (including this sandbox), spawning npm directly from Node can throw EINVAL.
    // Use cmd.exe /c as a robust fallback.
    const isWin = process.platform === 'win32';
    const finalCmd = isWin ? 'cmd.exe' : cmd;
    const finalArgs = isWin ? ['/c', cmd, ...args] : args;

    const p = spawn(finalCmd, finalArgs, {
      stdio: 'inherit',
      shell: false,
      ...opts,
    });

    p.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
    });
    p.on('error', (err) => reject(err));
  });
}

async function waitFor(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  // Build first
  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await run(npmBin, ['run', 'build']);

  // Preview
  const isWin = process.platform === 'win32';
  const previewCmd = isWin ? 'cmd.exe' : npmBin;
  const previewArgs = isWin
    ? ['/c', npmBin, 'run', 'preview', '--', '--port', String(PREVIEW_PORT), '--strictPort']
    : ['run', 'preview', '--', '--port', String(PREVIEW_PORT), '--strictPort'];

  const preview = spawn(previewCmd, previewArgs, {
    stdio: 'inherit',
    shell: false,
  });

  try {
    await waitFor(`http://localhost:${PREVIEW_PORT}/`);

    const routes = ['/', '/#/services', '/#/gallery', '/#/about', '/#/booking', '/#/style-generator'];
    for (const r of routes) {
      const resp = await fetch(`http://localhost:${PREVIEW_PORT}${r}`);
      if (!resp.ok) throw new Error(`Route ${r} failed: ${resp.status}`);
    }

    const assets = ['/exports/hero/700.webp', '/exports/cta/700.webp', '/exports/services/tape-in/700.webp'];
    for (const a of assets) {
      const resp = await fetch(`http://localhost:${PREVIEW_PORT}${a}`, { method: 'HEAD' });
      if (!resp.ok) throw new Error(`Asset ${a} failed: ${resp.status}`);
    }

    console.log('[smoke] OK');
  } finally {
    preview.kill('SIGINT');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
