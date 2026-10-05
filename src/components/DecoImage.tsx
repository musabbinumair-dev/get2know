import React, { useState, useEffect } from 'react';
import { isImagePreloaded } from '../utils/preloadAssets';

interface DecoImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  skeletonClassName?: string;
}

/**
 * DecoImage
 *
 * Dedicated component for decoration WebP/PNG/SVG images.
 * - Enforces eager upfront loading (never lazy-loaded).
 * - Avoids layout shifts and blank flashes.
 * - Displays instantly when preloaded in memory.
 * - Provides an organic placeholder/skeleton UI if rendering before decode completes.
 */
export const DecoImage: React.FC<DecoImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc,
  skeletonClassName = '',
  style,
  ...rest
}) => {
  const [loaded, setLoaded] = useState<boolean>(() => isImagePreloaded(src));
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    if (isImagePreloaded(src)) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative inline-block ${className}`} style={style}>
      {/* Placeholder / skeleton UI while decoration image is loading */}
      {!loaded && !hasError && (
        <div
          className={`absolute inset-0 bg-[#E8DEC3]/40 rounded-full animate-pulse pointer-events-none ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Actual decoration image: eager loading, sync decoding for instant paint */}
      <img
        src={currentSrc}
        alt={alt}
        loading="eager"
        decoding="sync"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          } else {
            setHasError(true);
          }
          setLoaded(true);
        }}
        className={`w-full h-full object-contain pointer-events-none select-none transition-opacity duration-150 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...rest}
      />
    </div>
  );
};
