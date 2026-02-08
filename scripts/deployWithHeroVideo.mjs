#!/usr/bin/env node
/**
 * One-command deploy with Pexels hero video fetch + build + Vercel deploy.
 * 
 * Prerequisites:
 * - .env.local exists with PEXELS_API_KEY set
 * - Vercel CLI authenticated (run `vercel login` first)
 * - Node.js 18+
 * 
 * Usage:
 *   node scripts/deployWithHeroVideo.mjs
 * 
 * Or add to package.json:
 *   "deploy:with-video": "node scripts/deployWithHeroVideo.mjs"
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MP4_PATH = path.resolve('exports/hero/hero-install.mp4');

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
    
    if (!trimmed || trimmed.startsWith('#')) {
      if (currentKey) {
        process.env[currentKey] = currentValue.trim();
        currentKey = null;
        currentValue = '';
      }
      continue;
    }
    
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0 && !line.startsWith(' ') && !line.startsWith('\t')) {
      if (currentKey) {
        process.env[currentKey] = currentValue.trim();
      }
      currentKey = line.substring(0, eqIndex).trim();
      currentValue = line.substring(eqIndex + 1);
    } else if (currentKey) {
      currentValue += '\n' + line;
    }
  }
  
  if (currentKey) {
    process.env[currentKey] = currentValue.trim();
  }
}

function log(msg) {
  console.log(`\n[deploy-hero] ${msg}\n`);
}

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true, ...opts });
}

function checkEnv(name) {
  const val = process.env[name];
  if (!val || val.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}. Add it to .env.local (gitignored).`);
  }
}

async function main() {
  log('Starting full deploy workflow with Pexels hero video...');

  // 1. Check prerequisites
  log('Step 1/5: Checking prerequisites');
  checkEnv('PEXELS_API_KEY');
  
  // Ensure Vercel CLI is available
  try {
    execSync('npx vercel --version', { stdio: 'ignore' });
  } catch {
    throw new Error('Vercel CLI not available. Run: npm install -g vercel');
  }

  // 2. Download hero video from Pexels (if missing)
  if (fs.existsSync(MP4_PATH) && process.env.FORCE_PEXELS_HERO !== 'true') {
    log(`Step 2/5: Hero MP4 already exists at ${MP4_PATH} (set FORCE_PEXELS_HERO=true to re-download)`);
  } else {
    log('Step 2/5: Downloading hero video from Pexels...');
    process.env.FETCH_PEXELS_HERO = 'true';
    await import('./fetchPexelsHeroVideo.mjs');
    
    if (!fs.existsSync(MP4_PATH)) {
      throw new Error('fetchPexelsHeroVideo.mjs did not produce the expected MP4.');
    }
    log(`✓ Downloaded: ${MP4_PATH}`);
  }

  // 3. Run prebuild (WebM generation + copy to public/exports)
  log('Step 3/5: Running prebuild (WebM gen + copy)');
  run('npm run prebuild');

  // 4. Build production bundle
  log('Step 4/5: Building production bundle');
  run('npm run build');

  // 5. Deploy to Vercel production using prebuilt output
  log('Step 5/5: Deploying to Vercel (--prebuilt --prod)');
  run('npx vercel build');
  run('npx vercel deploy --prebuilt --prod');

  log('✅ Deploy complete! Verifying...');
  
  // Quick verify (optional, non-blocking)
  try {
    execSync('curl -I https://diosa.vercel.app/exports/hero/hero-install.mp4', { stdio: 'inherit' });
  } catch {
    console.warn('Could not verify hero MP4 URL (may still be propagating).');
  }

  log('All done. Visit https://diosa.vercel.app to see the hero video.');
}

main().catch((e) => {
  console.error('\n❌ Deploy failed:', e.message);
  process.exit(1);
});
