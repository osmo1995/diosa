import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('exports/hero');
const OUT_FILE = path.join(OUT_DIR, 'hero-install.mp4');

// Load .env.local if it exists (ESM doesn't auto-load dotenv)
const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  let currentKey = null;
  let currentValue = '';
  
  const lines = envContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      if (currentKey) {
        process.env[currentKey] = currentValue.trim();
        currentKey = null;
        currentValue = '';
      }
      continue;
    }
    
    // Check if this is a new key=value line
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0 && !line.startsWith(' ') && !line.startsWith('\t')) {
      // Save previous key if exists
      if (currentKey) {
        process.env[currentKey] = currentValue.trim();
      }
      
      currentKey = line.substring(0, eqIndex).trim();
      currentValue = line.substring(eqIndex + 1);
    } else if (currentKey) {
      // Continuation of previous value
      currentValue += '\n' + line;
    }
  }
  
  // Save last key
  if (currentKey) {
    process.env[currentKey] = currentValue.trim();
  }
}

function log(msg) {
  console.log(`[pexels-hero] ${msg}`);
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing ${name}. Add it to .env.local (ignored) or set it in your shell environment.`);
  }
  return v.trim();
}

function pickBestVideoFile(videoFiles, targetWidth = 1280) {
  // Prefer an MP4 close to ~720p (width ~1280), but accept any MP4.
  const mp4s = (videoFiles || []).filter((f) => String(f.file_type || '').toLowerCase() === 'video/mp4');
  if (mp4s.length === 0) return null;

  const sorted = [...mp4s].sort((a, b) => {
    const da = Math.abs((a.width ?? targetWidth) - targetWidth);
    const db = Math.abs((b.width ?? targetWidth) - targetWidth);
    return da - db;
  });

  return sorted[0];
}

async function downloadTo(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

async function main() {
  const key = requireEnv('PEXELS_API_KEY');
  const query = process.env.PEXELS_HERO_QUERY || 'hair extensions installation';

  // Avoid unnecessary downloads.
  if (fs.existsSync(OUT_FILE) && process.env.FORCE_PEXELS_HERO !== 'true') {
    log(`Already exists: ${path.relative(process.cwd(), OUT_FILE)} (set FORCE_PEXELS_HERO=true to re-download)`);
    return;
  }

  log(`Searching Pexels Videos for query: "${query}"`);

  const url = new URL('https://api.pexels.com/videos/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '15');
  url.searchParams.set('orientation', 'landscape');

  const searchRes = await fetch(url.toString(), {
    headers: {
      Authorization: key,
      // Some CDNs behave better with a UA.
      'User-Agent': 'diosa-studio-build-script',
    },
  });

  if (!searchRes.ok) {
    const text = await searchRes.text().catch(() => '');
    throw new Error(`Pexels search failed: ${searchRes.status} ${searchRes.statusText}\n${text}`);
  }

  const data = await searchRes.json();
  const videos = data?.videos ?? [];
  if (!Array.isArray(videos) || videos.length === 0) {
    throw new Error('No videos returned from Pexels for that query. Try changing PEXELS_HERO_QUERY.');
  }

  // Pick the first video that has a decent mp4 file close to 720p.
  let picked = null;
  let pickedFile = null;
  for (const v of videos) {
    const f = pickBestVideoFile(v.video_files, 1280);
    if (f?.link) {
      picked = v;
      pickedFile = f;
      break;
    }
  }

  if (!picked || !pickedFile) {
    throw new Error('Could not find a suitable MP4 file in the search results.');
  }

  log(`Selected video id=${picked.id} by ${picked.user?.name ?? 'Unknown'} (${picked.url ?? 'no-url'})`);
  log(`Downloading ~${pickedFile.width}x${pickedFile.height} from: ${pickedFile.link}`);

  const bytes = await downloadTo(pickedFile.link, OUT_FILE);
  log(`Saved ${Math.round(bytes / 1024 / 1024)}MB to ${path.relative(process.cwd(), OUT_FILE)}`);
  log(`Absolute path: ${OUT_FILE}`);

  log('Next: run `npm run build` (prebuild will copy exports -> public/exports).');
  log('Optional: set FETCH_PEXELS_HERO=true during build to refresh automatically.');
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
