/**
 * Automated Vite-Native Asset Preloader
 *
 * Eagerly imports all PNG, WebP, SVG, and JPEG assets from `src/assets/` using Vite's `import.meta.glob`.
 * Provides instant in-memory browser caching via `new Image().src = url` and `.decode()`.
 */

// 1. Eagerly import all asset files from src/assets/ and subdirectories
const assetModules = import.meta.glob<string>(
  '../assets/**/*.{png,webp,svg,jpg,jpeg,PNG,WEBP,SVG,JPG,JPEG}',
  { eager: true, import: 'default' }
);

export interface PreloadProgress {
  isLoaded: boolean;
  progress: number; // 0 - 100
  loadedCount: number;
  totalCount: number;
  urls: string[];
}

// 2. Normalized mapping of asset paths & filenames to resolved Vite asset URLs
export const ASSET_MAP: Record<string, string> = {};
export const WEBP_MAP: Record<string, string> = {};
export const PNG_MAP: Record<string, string> = {};

// Populate the asset lookup maps
for (const [rawPath, resolvedUrl] of Object.entries(assetModules)) {
  if (typeof resolvedUrl !== 'string') continue;

  // Standardize paths:
  // rawPath e.g.: "../assets/blobs/pink-avatar-blob.webp"
  const normalized = rawPath.replace(/^\.\.\/assets\//, ''); // "blobs/pink-avatar-blob.webp"
  const filename = normalized.split('/').pop() || normalized; // "pink-avatar-blob.webp"
  const basename = filename.replace(/\.[^/.]+$/, ''); // "pink-avatar-blob"
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // Store various lookup keys for ergonomic resolution:
  ASSET_MAP[rawPath] = resolvedUrl;
  ASSET_MAP[`/assets/${normalized}`] = resolvedUrl;
  ASSET_MAP[`assets/${normalized}`] = resolvedUrl;
  ASSET_MAP[normalized] = resolvedUrl;
  ASSET_MAP[filename] = resolvedUrl;
  ASSET_MAP[`/${filename}`] = resolvedUrl;

  if (ext === 'webp') {
    WEBP_MAP[basename] = resolvedUrl;
    WEBP_MAP[normalized] = resolvedUrl;
    WEBP_MAP[`/assets/${normalized}`] = resolvedUrl;
  } else if (ext === 'png') {
    PNG_MAP[basename] = resolvedUrl;
    PNG_MAP[normalized] = resolvedUrl;
    PNG_MAP[`/assets/${normalized}`] = resolvedUrl;
  }
}

/**
 * Resolves an asset URL by flexible path, filename, or relative name.
 */
export function getAssetUrl(pathOrName: string): string | undefined {
  if (!pathOrName) return undefined;
  if (ASSET_MAP[pathOrName]) return ASSET_MAP[pathOrName];

  // Try removing leading slashes or prefix
  const clean = pathOrName.replace(/^\/+/, '').replace(/^assets\//, '');
  if (ASSET_MAP[clean]) return ASSET_MAP[clean];

  // Try matching just the filename
  const filename = pathOrName.split('/').pop() || pathOrName;
  if (ASSET_MAP[filename]) return ASSET_MAP[filename];

  return undefined;
}

/**
 * Returns all unique resolved asset URLs.
 */
export function getAllAssetUrls(): string[] {
  const uniqueUrls = new Set<string>(Object.values(assetModules));
  return Array.from(uniqueUrls);
}

// Global caching promise to prevent redundant preloading runs
let preloadPromise: Promise<void> | null = null;
let globalLoadedState = false;
let globalProgress = 0;
let globalLoadedCount = 0;

/**
 * Preloads and decodes all eager Vite assets into browser memory immediately.
 */
export function preloadAllAssets(
  onProgress?: (progress: number, loaded: number, total: number) => void
): Promise<void> {
  if (globalLoadedState) {
    onProgress?.(100, globalLoadedCount, globalLoadedCount);
    return Promise.resolve();
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  const urls = getAllAssetUrls();
  const total = urls.length;

  if (total === 0) {
    globalLoadedState = true;
    globalProgress = 100;
    onProgress?.(100, 0, 0);
    return Promise.resolve();
  }

  preloadPromise = new Promise<void>((resolve) => {
    let completed = 0;

    const handleItemFinished = () => {
      completed++;
      globalLoadedCount = completed;
      globalProgress = Math.round((completed / total) * 100);
      onProgress?.(globalProgress, completed, total);

      if (completed >= total) {
        globalLoadedState = true;
        resolve();
      }
    };

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;

      // Force decoding if supported for zero frame drop rendering
      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(() => handleItemFinished())
          .catch(() => handleItemFinished());
      } else {
        img.onload = () => handleItemFinished();
        img.onerror = () => handleItemFinished();
      }
    });
  });

  return preloadPromise;
}

/**
 * Returns current global preload state.
 */
export function getPreloadState(): PreloadProgress {
  const urls = getAllAssetUrls();
  return {
    isLoaded: globalLoadedState,
    progress: globalProgress,
    loadedCount: globalLoadedCount,
    totalCount: urls.length,
    urls,
  };
}
