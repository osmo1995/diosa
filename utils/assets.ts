export const EXPORT_SIZES = [400, 700, 1000, 2000] as const;
export type ExportSize = (typeof EXPORT_SIZES)[number];

/**
 * Normalize to a URL rooted at site origin.
 *
 * Accepts:
 *  - 'exports/hero/700.webp'
 *  - '/exports/hero/700.webp'
 */
export function getExportImageUrl(p: string): string {
  if (!p) return p;
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * Given a folder base like '/exports/hero', generates a srcSet string:
 * '/exports/hero/400.webp 400w, /exports/hero/700.webp 700w, ...'
 */
export function getExportSrcSet(basePath: string, ext: 'webp' | 'jpg' | 'png' | 'avif' = 'webp'): string {
  const base = basePath.replace(/\/$/, '');
  return EXPORT_SIZES.map((s) => `${base}/${s}.${ext} ${s}w`).join(', ');
}

/**
 * Convenience: returns the default (700) URL for a base folder.
 */
export function getExportDefaultSrc(basePath: string, ext: 'webp' | 'jpg' | 'png' | 'avif' = 'webp'): string {
  const base = basePath.replace(/\/$/, '');
  return `${base}/700.${ext}`;
}
