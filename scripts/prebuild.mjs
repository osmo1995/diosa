import './generateSeoFiles.mjs';

// Optional: fetch a stock hero video from Pexels (opt-in so builds are deterministic).
const shouldFetchPexelsHero = String(process.env.FETCH_PEXELS_HERO ?? '').trim().toLowerCase() === 'true';
if (shouldFetchPexelsHero) {
  await import('./fetchPexelsHeroVideo.mjs');
}

import './generateHeroWebm.mjs';
import './copyExportsToPublic.mjs';
