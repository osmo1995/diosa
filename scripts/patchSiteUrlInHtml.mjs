import fs from 'node:fs';

const SITE_URL = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://diosa.vercel.app').replace(/\/$/, '');

const htmlPath = 'index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const patched = html.replace(/%VITE_SITE_URL%/g, SITE_URL);

if (patched !== html) {
  fs.writeFileSync(htmlPath, patched, 'utf8');
  console.log('[patchSiteUrlInHtml] patched index.html with', SITE_URL);
} else {
  console.log('[patchSiteUrlInHtml] no placeholders found');
}
