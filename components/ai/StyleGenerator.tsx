
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
  const [error, setError] = useState<string | null>(null);

  const [preset, setPreset] = useState<ExtensionPreset>('extensions-natural-blend');
  const [shade, setShade] = useState<ExtensionColor>('champagne');
  const [length, setLength] = useState<ExtensionLength>('22');

  const availableShades = useMemo(() => {
    const avail = stylePreviewAvailability[preset] as Record<string, readonly string[]> | undefined;
    const ids = new Set(Object.keys(avail ?? {}));
    return extensionColors.filter((c) => ids.has(c.id));
  }, [preset]);

  const availableLengths = useMemo(() => {
    const avail = stylePreviewAvailability[preset] as Record<string, readonly string[]> | undefined;
    const lengths = (avail?.[shade] ?? []) as readonly string[];
    const ids = new Set(lengths);
    return extensionLengths.filter((l) => ids.has(l.id));
  }, [preset, shade]);

  // Keep selection valid as user changes preset/shade.
  useEffect(() => {
    if (!availableShades.some((c) => c.id === shade) && availableShades[0]) {
      setShade(availableShades[0].id);
    }
  }, [availableShades, shade]);

  useEffect(() => {
    if (!availableLengths.some((l) => l.id === length) && availableLengths[0]) {
      setLength(availableLengths[0].id);
    }
  }, [availableLengths, length]);

  const selectedPreview = useMemo(() => {
    return getExtensionPreviewUrl({ preset, color: shade, length, size: 700 });
  }, [preset, shade, length]);

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
    setIsGenerating(true);

    const output = await generateStylePreview(image, preset, shade, length);
    setResult(output);

    if (!output) {
      setError('We could not generate a preview right now. Please try again in a moment.');
    }

    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Configuration */}
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Step 1: Upload Portrait</label>
          <div className="relative group border-2 border-dashed border-gray-200 h-[400px] flex flex-col items-center justify-center hover:border-divine-gold transition-colors overflow-hidden">
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Source" />
            ) : (
              <>
                <Upload size={48} className="text-gray-300 mb-4 group-hover:text-divine-gold transition-colors" />
                <p className="text-sm text-gray-500 font-light">Drag & drop your photo or</p>
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload a photo"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleUpload}
                />
                <Button variant="outline" className="mt-4 pointer-events-none">Choose File</Button>
              </>
            )}
            {image && (
              <button 
                type="button"
                aria-label="Remove uploaded photo"
                onClick={() => setImage(null)} 
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Step 2: Choose Your Goddess Look</label>

          {/* Preset */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Preset</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extensionPresets.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`text-left p-4 border transition-all ${
                    preset === p.id
                      ? 'border-divine-gold bg-divine-gold/10'
                      : 'border-gray-200 hover:border-divine-gold'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{p.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Shade */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Shade</p>
            <div className="flex flex-wrap gap-2">
              {availableShades.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setShade(c.id)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                    shade === c.id
                      ? 'bg-deep-charcoal text-white border-deep-charcoal'
                      : 'border-gray-200 hover:border-deep-charcoal'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Length</p>
            <div className="flex flex-wrap gap-2">
              {availableLengths.map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setLength(l.id)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
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

          {/* Preview thumbnail (static, from exports) */}
          <div className="border border-gray-100 bg-white p-4">
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Preset Preview</div>
            <div className="aspect-[3/4] overflow-hidden bg-soft-champagne">
              <OptimizedImage src={selectedPreview} alt="Selected preset preview" className="w-full h-full" />
            </div>
          </div>
        </div>

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
              <span>Generating Magic...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Sparkles className="group-hover:animate-pulse" />
              <span>Generate Virtual Preview</span>
            </span>
          )}
        </Button>
      </div>

      {/* Result Display */}
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Virtual Preview Result</label>
        <div
          className="bg-soft-champagne h-[600px] border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative"
          aria-live="polite"
          aria-busy={isGenerating}
        >
          {result ? (
            <>
              <img src={result} className="w-full h-full object-cover animate-fade-in" alt="Transformation" crossOrigin="anonymous" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-md p-6 text-center shadow-xl">
                <p className="font-serif text-xl uppercase tracking-widest mb-4">You look divine!</p>
                <Button size="sm" onClick={() => window.location.hash = '/booking'}>Book This Style Now</Button>
              </div>
            </>
          ) : (
            <div className="text-center px-8">
              {isGenerating ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-divine-gold/20 border-t-divine-gold rounded-full animate-spin mb-6" />
                  <p className="font-serif text-2xl uppercase tracking-widest text-divine-gold">Refining Your Blend</p>
                  <p className="text-gray-500 mt-2 text-sm italic">Our AI is analyzing skin tone and hair density...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center">
                  <p className="font-serif text-2xl uppercase tracking-widest text-deep-charcoal">Preview Unavailable</p>
                  <p className="text-sm mt-2 text-gray-600">{error}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-40">
                  <Camera size={64} className="mb-4" />
                  <p className="font-serif text-2xl uppercase tracking-widest">No Preview Generated</p>
                  <p className="text-sm mt-2 font-light">Select your options and click generate above</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
