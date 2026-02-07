import './generateSeoFiles.mjs';

// Optional: fetch a stock hero video from Pexels (opt-in so builds are deterministic).
if (process.env.FETCH_PEXELS_HERO === 'true') {
  await import('./fetchPexelsHeroVideo.mjs');
}

import './copyExportsToPublic.mjs';
import './generateHeroWebm.mjs';
