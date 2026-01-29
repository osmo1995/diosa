import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://diosa.vercel.app').replace(/\/$/, '');

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const urls = [
  `${SITE_URL}/`,
  `${SITE_URL}/#/services`,
  `${SITE_URL}/#/gallery`,
  `${SITE_URL}/#/about`,
  `${SITE_URL}/#/booking`,
  `${SITE_URL}/#/style-generator`,
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync(path.join('public', 'robots.txt'), robots, 'utf8');
fs.writeFileSync(path.join('public', 'sitemap.xml'), sitemap, 'utf8');

console.log('[generateSeoFiles] wrote robots.txt + sitemap.xml for', SITE_URL);
