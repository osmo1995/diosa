
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
  ext?: 'webp' | 'jpg' | 'png';

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
  sizesAttr,
  ...props
}) => {
  const exportExt = ext as 'webp' | 'jpg' | 'png';

  const computedSrc = basePath ? getExportDefaultSrc(basePath, exportExt) : src;
  const srcSet = basePath ? getExportSrcSet(basePath, exportExt) : props.srcSet;
  const sizes = basePath ? (sizesAttr ?? '(max-width: 768px) 100vw, 33vw') : props.sizes;

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
