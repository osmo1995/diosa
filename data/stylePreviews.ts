export type ExtensionPreset =
  | 'extensions-natural-blend'
  | 'extensions-volume-set'
  | 'extensions-length-set'
  | 'extensions-soft-waves'
  | 'extensions-sleek-straight'
  | 'extensions-glam-density'
  | 'extensions-luxe-curl'
  | 'extensions-rooted-bronde'
  | 'extensions-butterfly-layers'
  | 'extensions-bombshell-blowout';

export type ExtensionColor =
  | 'old-money'
  | 'champagne'
  | 'beige'
  | 'ash'
  | 'honey'
  | 'espresso'
  | 'platinum-icy'
  | 'neutral-gloss'
  | 'caramel-bronde'
  | 'chocolate-mocha'
  | 'copper-glow'
  | 'soft-black'
  | 'butter-blonde'
  | 'vanilla-cream'
  | 'sandy-beige'
  | 'pearl-blonde'
  | 'sun-kissed'
  | 'smoky-bronde'
  | 'rooted-ash'
  | 'bright-blonde'
  | 'icy-pearl'
  | 'silver-ash'
  | 'nordic-blonde'
  | 'platinum-smoke'
  | 'cool-beige'
  | 'frosted-vanilla'
  | 'rooted-vanilla'
  | 'shadow-root-blonde'
  | 'melted-beige'
  | 'lived-in-bronde'
  | 'smudge-root-ash'
  | 'mushroom-blonde'
  | 'cool-chestnut'
  | 'deep-espresso-melt'
  | 'smoky-mocha'
  | 'cherry-cola'
  | 'auburn-velvet'
  | 'cinnamon-spice';

export type ExtensionLength = '14' | '18' | '22' | '24';

export const extensionPresets: { id: ExtensionPreset; label: string; description: string }[] = [
  { id: 'extensions-natural-blend', label: 'Natural Blend', description: 'Seamless everyday density with invisible roots.' },
  { id: 'extensions-volume-set', label: 'Volume Set', description: 'Fuller ends and lifted density through mids.' },
  { id: 'extensions-length-set', label: 'Length Set', description: 'Clean length with a polished fall.' },
  { id: 'extensions-soft-waves', label: 'Soft Waves', description: 'Soft movement with a luxury finish.' },
  { id: 'extensions-sleek-straight', label: 'Sleek Straight', description: 'Silky, polished straight finish with shine.' },
  { id: 'extensions-glam-density', label: 'Glam Density', description: 'High-impact fullness with a camera-ready finish.' },
  { id: 'extensions-luxe-curl', label: 'Luxe Curl', description: 'Defined curl pattern with a soft, elevated bounce.' },
  { id: 'extensions-rooted-bronde', label: 'Rooted Bronde', description: 'Dimensional bronde with a natural root melt.' },
  { id: 'extensions-butterfly-layers', label: 'Butterfly Layers', description: 'Face-framing layers with airy movement and shape.' },
  { id: 'extensions-bombshell-blowout', label: 'Bombshell Blowout', description: 'High-volume blowout with bouncy, glossy body.' },
];

export type ExtensionColorGroup = 'Blondes' | 'Brunettes' | 'Reds';

export type ExtensionColorSection =
  | 'Blondes'
  | 'Brunettes'
  | 'Reds';

export type ExtensionColorSubsection =
  | 'Warm & Golden'
  | 'Cool & Icy'
  | 'Dimensional & Rooted'
  | 'Neutral'
  | 'Cool'
  | 'Rich'
  | 'Copper'
  | 'Auburn & Deep';

export const extensionColors: {
  id: ExtensionColor;
  label: string;
  group: ExtensionColorGroup;
  section: ExtensionColorSection;
  subsection?: ExtensionColorSubsection;
  popular?: boolean;
}[] = [
  // Blondes
  { id: 'butter-blonde', label: 'Butter Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Warm & Golden' },
  { id: 'honey', label: 'Honey Bronde', group: 'Blondes', section: 'Blondes', subsection: 'Warm & Golden', popular: true },
  { id: 'sun-kissed', label: 'Sun-Kissed Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Warm & Golden' },
  { id: 'caramel-bronde', label: 'Caramel Bronde', group: 'Blondes', section: 'Blondes', subsection: 'Warm & Golden', popular: true },
  { id: 'champagne', label: 'Champagne', group: 'Blondes', section: 'Blondes', subsection: 'Warm & Golden', popular: true },

  { id: 'platinum-icy', label: 'Platinum Icy', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'icy-pearl', label: 'Icy Pearl', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'silver-ash', label: 'Silver Ash', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'nordic-blonde', label: 'Nordic Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'platinum-smoke', label: 'Platinum Smoke', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'ash', label: 'Cool Ash', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'pearl-blonde', label: 'Pearl Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'frosted-vanilla', label: 'Frosted Vanilla', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },
  { id: 'cool-beige', label: 'Cool Beige', group: 'Blondes', section: 'Blondes', subsection: 'Cool & Icy' },

  { id: 'old-money', label: 'Old Money Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted', popular: true },
  { id: 'beige', label: 'Beige Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'vanilla-cream', label: 'Vanilla Cream', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'sandy-beige', label: 'Sandy Beige', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'smoky-bronde', label: 'Smoky Bronde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'rooted-ash', label: 'Rooted Ash Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'bright-blonde', label: 'Bright Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'rooted-vanilla', label: 'Rooted Vanilla', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted', popular: true },
  { id: 'shadow-root-blonde', label: 'Shadow Root Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'melted-beige', label: 'Melted Beige', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'lived-in-bronde', label: 'Lived-In Bronde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'smudge-root-ash', label: 'Smudge Root Ash', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },
  { id: 'mushroom-blonde', label: 'Mushroom Blonde', group: 'Blondes', section: 'Blondes', subsection: 'Dimensional & Rooted' },

  // Brunettes
  { id: 'neutral-gloss', label: 'Neutral Gloss', group: 'Brunettes', section: 'Brunettes', subsection: 'Neutral' },
  { id: 'chocolate-mocha', label: 'Chocolate Mocha', group: 'Brunettes', section: 'Brunettes', subsection: 'Neutral', popular: true },

  { id: 'smoky-mocha', label: 'Smoky Mocha', group: 'Brunettes', section: 'Brunettes', subsection: 'Cool' },
  { id: 'cool-chestnut', label: 'Cool Chestnut', group: 'Brunettes', section: 'Brunettes', subsection: 'Cool' },

  { id: 'deep-espresso-melt', label: 'Deep Espresso Melt', group: 'Brunettes', section: 'Brunettes', subsection: 'Rich' },
  { id: 'espresso', label: 'Rich Espresso', group: 'Brunettes', section: 'Brunettes', subsection: 'Rich', popular: true },
  { id: 'soft-black', label: 'Soft Black', group: 'Brunettes', section: 'Brunettes', subsection: 'Rich' },

  // Reds
  { id: 'copper-glow', label: 'Copper Glow', group: 'Reds', section: 'Reds', subsection: 'Copper', popular: true },
  { id: 'cinnamon-spice', label: 'Cinnamon Spice', group: 'Reds', section: 'Reds', subsection: 'Copper' },

  { id: 'auburn-velvet', label: 'Auburn Velvet', group: 'Reds', section: 'Reds', subsection: 'Auburn & Deep' },
  { id: 'cherry-cola', label: 'Cherry Cola', group: 'Reds', section: 'Reds', subsection: 'Auburn & Deep' },
];

// NOTE: Available lengths depend on preset+color. See stylePreviewAvailability.
export const extensionLengths: { id: ExtensionLength; label: string }[] = [
  { id: '14', label: '14"' },
  { id: '18', label: '18"' },
  { id: '22', label: '22"' },
  { id: '24', label: '24"' },
];

export const EXPORT_IMAGE_SIZES = [400, 700, 1000, 2000] as const;
export type ExportImageSize = (typeof EXPORT_IMAGE_SIZES)[number];

/**
 * Build the URL to a preset thumbnail.
 * Example:
 * /exports/style-previews/extensions/extensions-natural-blend/ash/18/700.webp
 */
export function getExtensionPreviewUrl(args: {
  preset: ExtensionPreset;
  color: ExtensionColor;
  length: ExtensionLength;
  size?: ExportImageSize;
}): string {
  const { preset, color, length, size = 700 } = args;
  return `/exports/style-previews/extensions/${preset}/${color}/${length}/${size}.webp`;
}

/**
 * Convenience: maps our UI preset id to the underlying folder naming.
 * This keeps the UI clean and the filesystem stable.
 */
export function getExtensionPresetFolder(preset: ExtensionPreset): string {
  return preset;
}
