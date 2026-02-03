export type ExtensionPreset =
  | 'extensions-natural-blend'
  | 'extensions-volume-set'
  | 'extensions-length-set'
  | 'extensions-soft-waves';

export type ExtensionColor =
  // Curated set (7): 2 blondes + brunette + red + platinum + ash + silver
  | 'old-money'
  | 'champagne'
  | 'espresso'
  | 'copper-glow'
  | 'platinum-icy'
  | 'ash'
  | 'silver-ash';

export type ExtensionLength = '14' | '18' | '22' | '24';

export const extensionPresets: { id: ExtensionPreset; label: string; description: string }[] = [
  { id: 'extensions-natural-blend', label: 'Natural Blend', description: 'Seamless everyday density with invisible roots.' },
  { id: 'extensions-volume-set', label: 'Volume Set', description: 'Fuller ends and lifted density through mids.' },
  { id: 'extensions-length-set', label: 'Length Set', description: 'Clean length with a polished fall.' },
  { id: 'extensions-soft-waves', label: 'Soft Waves', description: 'Soft movement with a luxury finish.' },
];

// Single flat list (small curated set)
export const extensionColors: {
  id: ExtensionColor;
  label: string;
  popular?: boolean;
}[] = [
  // 2 popular blondes
  { id: 'old-money', label: 'Old Money Blonde', popular: true },
  { id: 'champagne', label: 'Champagne Blonde', popular: true },

  // Platinum / Ash / Silver
  { id: 'platinum-icy', label: 'Platinum Icy' },
  { id: 'ash', label: 'Cool Ash Blonde' },
  { id: 'silver-ash', label: 'Silver Ash' },

  // Brunette / Red
  { id: 'espresso', label: 'Rich Espresso' },
  { id: 'copper-glow', label: 'Copper Glow' },
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
