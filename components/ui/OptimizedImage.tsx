
import React from 'react';
import { getExportDefaultSrc, getExportSrcSet } from '../../utils/assets';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;

  /**
   * If provided, OptimizedImage will assume a 4-size export folder structure:
   *   {basePath}/400.webp, 700.webp, 1000.webp, 2000.webp
   * and will auto-generate src + srcSet.
   */
  basePath?: string;

  /** Defaults to 'webp' when using basePath */
  ext?: 'webp' | 'jpg' | 'png' | 'avif';

  /** If true and basePath is provided, renders a <picture> with AVIF source + fallback ext (usually webp). */
  preferAvif?: boolean;

  /** Defaults to: "(max-width: 768px) 100vw, 33vw" when using basePath */
  sizesAttr?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  containerClassName = "",
  className = "",
  loading = "lazy",
  basePath,
  ext = 'webp',
  preferAvif = false,
  sizesAttr,
  ...props
}) => {
  const exportExt = ext as 'webp' | 'jpg' | 'png' | 'avif';

  const computedSrc = basePath ? getExportDefaultSrc(basePath, exportExt) : src;
  const srcSet = basePath ? getExportSrcSet(basePath, exportExt) : props.srcSet;
  const sizes = basePath ? (sizesAttr ?? '(max-width: 768px) 100vw, 33vw') : props.sizes;

  if (basePath && preferAvif) {
    const avifSrc = getExportDefaultSrc(basePath, 'avif');
    const avifSet = getExportSrcSet(basePath, 'avif');
    return (
      <div className={`overflow-hidden ${containerClassName}`}>
        <picture>
          <source type="image/avif" srcSet={avifSet} sizes={sizes} />
          <img
            src={computedSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            loading={loading}
            className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${className}`}
            {...props}
          />
        </picture>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${containerClassName}`}>
      <img
        src={computedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${className}`}
        {...props}
      />
    </div>
  );
};
