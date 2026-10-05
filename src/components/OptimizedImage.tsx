import React, { useState } from 'react';
import { getAssetUrl, WEBP_MAP, PNG_MAP } from '../utils/preloadAssets';

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Asset path, filename, or relative Vite path (e.g. "blobs/blue-avatar-blob.webp" or "/assets/avatars/avatar-1.png") */
  src: string;
  /** Explicit WebP source URL override */
  webpSrc?: string;
  /** Explicit PNG fallback source URL override */
  pngSrc?: string;
  /** Fallback URL if primary image fails to load */
  fallbackSrc?: string;
  /** Class name for wrapping `<picture>` element */
  pictureClassName?: string;
  /** Alt text for accessibility */
  alt?: string;
}

/**
 * Reusable OptimizedImage component:
 * - Prioritizes `.webp` with `<source srcset="..." type="image/webp" />`
 * - Fallbacks to `.png` inside `<picture>`
 * - Uses `loading="eager"` and `fetchpriority="high"` for instant CLS-free rendering
 * - Automatically resolves paths from Vite's eagerly bundled cache
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  webpSrc,
  pngSrc,
  fallbackSrc,
  pictureClassName = '',
  className = '',
  style,
  alt = '',
  draggable = false,
  loading = 'eager',
  fetchPriority = 'high',
  onError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  // Extract base key to discover companion .webp or .png versions if not explicitly provided
  const cleanPath = src.replace(/^\/+/, '').replace(/^assets\//, '');
  const filename = cleanPath.split('/').pop() || cleanPath;
  const basename = filename.replace(/\.[^/.]+$/, '');

  // 1. Resolve WebP URL
  const resolvedWebp =
    webpSrc ||
    (src.toLowerCase().endsWith('.webp') ? getAssetUrl(src) : undefined) ||
    WEBP_MAP[basename] ||
    WEBP_MAP[cleanPath];

  // 2. Resolve PNG/Primary URL
  const resolvedPng =
    pngSrc ||
    (src.toLowerCase().endsWith('.png') ? getAssetUrl(src) : undefined) ||
    PNG_MAP[basename] ||
    PNG_MAP[cleanPath] ||
    getAssetUrl(src) ||
    src;

  const finalImgSrc = hasError
    ? fallbackSrc || resolvedPng
    : resolvedPng || resolvedWebp || src;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
    }
    onError?.(e);
  };

  return (
    <picture className={`inline-block ${pictureClassName}`}>
      {/* WebP priority format */}
      {resolvedWebp && !hasError && (
        <source srcSet={resolvedWebp} type="image/webp" />
      )}

      {/* Fallback & primary rendering */}
      <img
        src={finalImgSrc}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        // @ts-expect-error - fetchPriority attribute support
        fetchpriority={fetchPriority}
        fetchPriority={fetchPriority}
        draggable={draggable}
        onError={handleImageError}
        {...rest}
      />
    </picture>
  );
};
