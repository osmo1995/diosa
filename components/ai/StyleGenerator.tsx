
import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Camera, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { OptimizedImage } from '../ui/OptimizedImage';
import { generateStylePreview } from '../../services/geminiService';
import {
  extensionColors,
  extensionLengths,
  extensionPresets,
  getExtensionPreviewUrl,
  type ExtensionColor,
  type ExtensionLength,
  type ExtensionPreset,
} from '../../data/stylePreviews';
import { stylePreviewAvailability } from '../../data/stylePreviewAvailability';

export const StyleGenerator: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [usage, setUsage] = useState<{ freeRemaining: number; freeUsed: number; freeLimit: number; paidCredits: number } | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const [paywall, setPaywall] = useState<{ open: boolean; message?: string }>({ open: false });
  const [billingPacks, setBillingPacks] = useState<
    { priceId: string; label: string; credits: number; amountUsd: number }[]
  >([]);

  const [preset, setPreset] = useState<ExtensionPreset>('extensions-natural-blend');
  const [shade, setShade] = useState<ExtensionColor>('champagne');
  const [length, setLength] = useState<ExtensionLength>('22');

  // We list all styles/colors/lengths in the UI, even if we don't have a static thumbnail preview.
  // Availability is used only to decide whether a preset preview image exists.
  const availableShades = extensionColors;
  const availableLengths = extensionLengths;

  const hasStaticPreview = useMemo(() => {
    const avail = stylePreviewAvailability[preset] as Record<string, readonly string[]> | undefined;
    const lengthsForShade = avail?.[shade] ?? [];
    return lengthsForShade.includes(length);
  }, [preset, shade, length]);

  useEffect(() => {
    async function loadBilling() {
      try {
        const r = await fetch('/api/billing/config');
        if (!r.ok) return;
        const j = await r.json();
        if (Array.isArray(j.packs)) setBillingPacks(j.packs);
      } catch {}
    }

    void loadBilling();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUsage() {
      setUsageLoading(true);
      try {
        const res = await fetch('/api/usage');
        if (!res.ok) {
          if (mounted) setUsage(null);
          return;
        }
        const json = await res.json();
        if (mounted) {
          setUsage({
            freeRemaining: json.freeRemaining,
            freeUsed: json.freeUsed,
            freeLimit: json.freeLimit,
            paidCredits: json.paidCredits,
          });
        }
      } catch {
        if (mounted) setUsage(null);
      } finally {
        if (mounted) setUsageLoading(false);
      }
    }

    void loadUsage();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPreview = useMemo(() => {
    if (!hasStaticPreview) return null;
    return getExtensionPreviewUrl({ preset, color: shade, length, size: 700 });
  }, [preset, shade, length, hasStaticPreview]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startGeneration = async () => {
    if (!image) return;

    setError(null);
    setPaywall({ open: false });
    setIsGenerating(true);

    try {
      const output = await generateStylePreview(image, preset, shade, length);
      setResult(output);
      setResultUrl(output && output.startsWith('http') ? output : null);
      setCopied(false);

      // Refresh usage after success
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const json = await res.json();
          setUsage({
            freeRemaining: json.freeRemaining,
            freeUsed: json.freeUsed,
            freeLimit: json.freeLimit,
            paidCredits: json.paidCredits,
          });
        }
      } catch {}

      if (!output) {
        setError('We could not generate a preview right now. Please try again in a moment.');
      }
    } catch (e: any) {
      if (e?.message === 'quota_exhausted') {
        setPaywall({ open: true, message: 'You’ve used your 15 free generations this month.' });
        setError(null);
      } else if (e?.message === 'auth_required') {
        setError('Please sign in to generate previews.');
      } else {
        setError('Failed to generate preview');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const afterPreview = result ?? selectedPreview;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        {/* Controls column */}
        <div className="lg:sticky lg:top-28 space-y-4">
          <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Virtual Preview Stylist</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                {usageLoading ? (
                  'Checking quota…'
                ) : usage ? (
                  `${usage.freeRemaining}/${usage.freeLimit} free left` + (usage.paidCredits ? ` · ${usage.paidCredits} credits` : '')
                ) : (
                  ''
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Upload</div>
              <div className="relative group border border-dashed border-gray-200 rounded-xl h-[220px] overflow-hidden flex items-center justify-center bg-gray-50">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Before" />
                ) : (
                  <>
                    <div className="text-center px-6">
                      <Upload size={32} className="text-gray-300 mx-auto mb-3 group-hover:text-divine-gold transition-colors" />
                      <p className="text-sm text-gray-600">Tap to upload a portrait</p>
                      <p className="text-xs text-gray-400 mt-1">Front-facing, good lighting</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload a photo"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleUpload}
                    />
                  </>
                )}

                {image && (
                  <button
                    type="button"
                    aria-label="Remove uploaded photo"
                    onClick={() => setImage(null)}
                    className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Preset */}
            <div className="mt-6 space-y-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Preset</div>
              <div className="grid grid-cols-2 gap-2">
                {extensionPresets.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`text-left rounded-xl border px-3 py-3 transition-all ${
                      preset === p.id
                        ? 'border-divine-gold bg-divine-gold/10'
                        : 'border-gray-200 bg-white hover:border-divine-gold/40'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-600">{p.label}</div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-snug">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Shade */}
            <div className="mt-6 space-y-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Shade</div>
              <div className="flex flex-wrap gap-2">
                {availableShades.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setShade(c.id)}
                    className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all rounded-xl ${
                      shade === c.id
                        ? 'bg-deep-charcoal text-white border-deep-charcoal'
                        : 'border-gray-200 hover:border-deep-charcoal'
                    }`}
                  >
                    {c.label}
                    {(c as any).popular ? <span className="ml-2 text-[9px] text-divine-gold">POPULAR</span> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className="mt-6 space-y-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Length</div>
              <div className="flex flex-wrap gap-2">
                {availableLengths.map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => setLength(l.id)}
                    className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all rounded-xl ${
                      length === l.id
                        ? 'bg-divine-gold text-deep-charcoal border-divine-gold'
                        : 'border-gray-200 hover:border-divine-gold'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky action bar (mobile + desktop) */}
          <div className="sticky bottom-4 lg:static">
            <div className="bg-white/95 backdrop-blur border border-gray-100 shadow-lg rounded-2xl p-4">
              {error && !isGenerating && (
                <div className="text-sm text-red-700 mb-3">{error}</div>
              )}

              {paywall.open && billingPacks.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    {paywall.message ?? 'Free quota exhausted.'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {billingPacks.map((p) => (
                      <Button
                        key={p.priceId}
                        size="lg"
                        variant="primary"
                        onClick={async () => {
                          const { startCheckout } = await import('../../services/billingService');
                          await startCheckout(p.priceId, 'payment', 1);
                        }}
                      >
                        {p.credits} for ${p.amountUsd}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Credits are added instantly after checkout completes.
                  </div>
                </div>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  disabled={!image || isGenerating}
                  onClick={startGeneration}
                  className="relative overflow-hidden group"
                >
                {isGenerating ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" />
                    <span>Rendering…</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Sparkles className="group-hover:animate-pulse" />
                    <span>Render Photoreal Preview</span>
                  </span>
                )}
                </Button>
              )}

              {!paywall.open && billingPacks.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-widest text-gray-600 hover:text-deep-charcoal"
                    onClick={() => setPaywall({ open: true, message: 'Buy credits (optional).' })}
                  >
                    Buy credits
                  </button>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500 leading-snug">
                Tip: your selection preview updates instantly; render only when you’re ready.
              </div>
            </div>
          </div>
        </div>

        {/* Preview column */}
        <div className="lg:sticky lg:top-28 space-y-4">
          <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Before / After</div>
              {resultUrl ? (
                <button
                  type="button"
                  className="text-[10px] uppercase tracking-widest font-bold text-gray-600 hover:text-deep-charcoal"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(resultUrl);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    } catch {
                      setCopied(false);
                    }
                  }}
                >
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden bg-soft-champagne aspect-[3/4]">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Before" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Upload a photo</div>
                )}
              </div>
              <div className="rounded-xl overflow-hidden bg-soft-champagne aspect-[3/4] relative" aria-live="polite" aria-busy={isGenerating}>
                {afterPreview ? (
                  <img
                    src={afterPreview}
                    className={`w-full h-full object-cover ${result ? 'animate-fade-in' : ''}`}
                    alt={result ? 'Photoreal render' : 'Live preview'}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Choose options</div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur rounded-xl px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Rendering…
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button size="sm" onClick={() => (window.location.hash = '/booking')} className="w-full sm:w-auto">
                Book This Style
              </Button>
              {selectedPreview && !result && (
                <div className="text-xs text-gray-500 flex items-center">Live preview (static) shown until you render.</div>
              )}
              {!selectedPreview && !result && (
                <div className="text-xs text-gray-500 flex items-center">No static preview for this combo (render still works).</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
