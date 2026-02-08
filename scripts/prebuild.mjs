import './generateSeoFiles.mjs';

function isTruthyEnv(v) {
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'on';
}

const fetchFlag = process.env.FETCH_PEXELS_HERO;
const explicitFetchRequested = isTruthyEnv(fetchFlag);
const hasPexelsKey = String(process.env.PEXELS_API_KEY ?? '').trim().length > 0;

// Fetch rules:
// - If FETCH_PEXELS_HERO is explicitly truthy => fetch is required (fail build if it errors)
// - Otherwise, if a PEXELS_API_KEY is present => fetch is best-effort (warn on errors)
const shouldFetchPexelsHero = explicitFetchRequested || (!String(fetchFlag ?? '').trim() && hasPexelsKey);

if (shouldFetchPexelsHero) {
  console.log(`[prebuild] Pexels hero fetch: ${explicitFetchRequested ? 'required' : 'best-effort'}`);
  try {
    await import('./fetchPexelsHeroVideo.mjs');
  } catch (e) {
    if (explicitFetchRequested) throw e;
    console.warn('[prebuild] Pexels hero fetch failed (continuing without video):', e?.message ?? e);
  }
} else {
  console.log('[prebuild] Pexels hero fetch: skipped');
}

import './generateHeroWebm.mjs';
import './copyExportsToPublic.mjs';
