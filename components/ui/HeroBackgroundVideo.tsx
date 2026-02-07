import React from 'react';

function canAutoplayVideo(): boolean {
  // Respect reduced motion.
  if (typeof window !== 'undefined') {
    try {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return false;
    } catch {
      // ignore
    }
  }

  // Respect Save-Data if available.
  try {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    const conn = nav?.connection ?? nav?.mozConnection ?? nav?.webkitConnection;
    if (conn?.saveData) return false;
  } catch {
    // ignore
  }

  return true;
}

export interface HeroBackgroundVideoProps {
  /** Video URL (e.g. '/exports/hero/hero-install.mp4') */
  videoSrc: string;

  /** Poster image URL used by the <video> element. */
  poster?: string;

  /** Extra classes for the <video> element */
  className?: string;

  /**
   * Delay mounting the video until the browser is idle to protect LCP.
   * Defaults to true.
   */
  deferUntilIdle?: boolean;

  /** Optional callback when the video fails (lets the parent decide to hide it). */
  onError?: () => void;
}

export const HeroBackgroundVideo: React.FC<HeroBackgroundVideoProps> = ({
  videoSrc,
  poster,
  className = '',
  deferUntilIdle = true,
  onError,
}) => {
  const [mounted, setMounted] = React.useState(!deferUntilIdle);

  React.useEffect(() => {
    if (!deferUntilIdle) return;

    const w = window as any;
    const schedule = (cb: () => void) => {
      if (typeof w.requestIdleCallback === 'function') {
        return w.requestIdleCallback(cb, { timeout: 1500 });
      }
      return window.setTimeout(cb, 600);
    };

    const id = schedule(() => setMounted(true));

    return () => {
      if (typeof w.cancelIdleCallback === 'function') {
        try {
          w.cancelIdleCallback(id);
        } catch {
          // ignore
        }
      } else {
        clearTimeout(id);
      }
    };
  }, [deferUntilIdle]);

  if (!mounted) return null;
  if (!canAutoplayVideo()) return null;

  const webmSrc = videoSrc.endsWith('.mp4') ? videoSrc.replace(/\.mp4$/, '.webm') : null;

  // Autoplay background videos on mobile Safari require muted + playsInline.
  // We intentionally omit controls; this is decorative.
  return (
    <video
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onError={() => onError?.()}
    >
      {/* Prefer WebM where supported (usually smaller), fall back to MP4 (Safari). */}
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
};
