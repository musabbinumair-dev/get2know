/**
 * Decoration Image Preloading and In-Browser Caching System
 *
 * Ensures all decoration WebP images appear INSTANTLY on first paint:
 * 1. Preloads all decoration images upfront on app mount (no lazy loading).
 * 2. Uses both `<link rel="preload">` in DOM and `new Image()` with `img.decode()`.
 * 3. Keeps decoded Image instances in-memory to prevent GC and re-decoding.
 * 4. Persists images to browser Cache Storage (`caches.open`) when supported.
 * 5. Provides progress tracking for placeholder/skeleton UI during initial load.
 */

// ── 1. Comprehensive list of all decoration WebP images ──
export const DECORATION_WEBP_URLS: readonly string[] = [
  // Primary /assets/decoration*.webp files
  '/assets/decoration-heart.webp',
  '/assets/decoration-star.webp',
  '/assets/decoration-cross.webp',
  '/assets/decoration-moon.webp',
  '/assets/decoration1.webp',
  '/assets/decoration2.webp',
  '/assets/decoration3.webp',
  '/assets/decoration4.webp',
  '/assets/deco-heart-pink.webp',
  '/assets/deco-star-blue.webp',
  '/assets/deco-cross-olive.webp',
  '/assets/deco-moon-yellow.webp',

  // Root decoration WebP files (used on Home, Countdown, Scores, etc.)
  '/deco-heart-pink-top-left-cropped.webp',
  '/deco-starburst-blue-top-right-cropped.webp',
  '/deco-cross-olive-bottom-left.webp',
  '/deco-cross-olive-bottom-right.webp',
  '/deco-cross-olive-right.webp',
  '/deco-crescent-yellow-bottom-right.webp',
  '/deco-crescent-yellow-top-left-cropped.webp',
  '/deco-heart-pink-bottom-right-cropped.webp',
  '/deco-heart-pink-top-right-cropped.webp',
  '/deco-sparks-yellow-around-avatars.webp',
  '/deco-sparks-yellow-around-number.webp',
  '/deco-sparks-yellow-around-players.webp',
  '/deco-star-blue-bottom-left-cropped.webp',
  '/deco-star-blue-left.webp',
  '/deco-star-blue-top-right.webp',
  '/deco-starburst-blue-bottom-left-cropped.webp',
  '/deco-starburst-blue-top-right-cropped.webp',

  // Screen-specific WebP decorations
  '/assets/profile/deco-heart-pink.webp',
  '/assets/profile/deco-star-blue.webp',
  '/assets/profile/deco-cross-olive.webp',
  '/assets/profile/deco-moon-yellow.webp',
  '/assets/profile/sparkle-sun-yellow.webp',

  '/assets/lobby/badge-vs-starburst.webp',
  '/assets/lobby/deco-cross-olive.webp',
  '/assets/lobby/deco-heart-pink.webp',
  '/assets/lobby/deco-moon-yellow.webp',
  '/assets/lobby/deco-star-blue.webp',
  '/assets/lobby/hero-card-yellow.webp',
  '/assets/lobby/sparkle-left.webp',
  '/assets/lobby/sparkle-right.webp',

  '/assets/landing/deco-cross-olive.webp',
  '/assets/landing/deco-heart-pink.webp',
  '/assets/landing/deco-moon-yellow.webp',
  '/assets/landing/deco-star-blue.webp',
  '/assets/landing/hero-blob-yellow.webp',
  '/assets/landing/sparkle-sun-yellow.webp',

  '/assets/landing-desktop/deco-cross-olive-bottomright.webp',
  '/assets/landing-desktop/deco-cross-olive-hero.webp',
  '/assets/landing-desktop/deco-heart-pink-hero.webp',
  '/assets/landing-desktop/deco-heart-pink-topright.webp',
  '/assets/landing-desktop/deco-moon-yellow-bottomright.webp',
  '/assets/landing-desktop/deco-moon-yellow-topleft.webp',
  '/assets/landing-desktop/deco-star-blue-bottomleft.webp',
  '/assets/landing-desktop/deco-star-blue-hero.webp',
  '/assets/landing-desktop/sparkle-left.webp',
  '/assets/landing-desktop/sparkle-right.webp',

  '/assets/scores/deco-cross-olive-right.webp',
  '/assets/scores/deco-heart-pink-bottom-right-cropped.webp',
  '/assets/scores/deco-heart-pink-top-left-cropped.webp',
  '/assets/scores/deco-moon-yellow-bottom-left.webp',
  '/assets/scores/deco-sparks-yellow-around-heart.webp',
  '/assets/scores/deco-star-blue-top-right-cropped.webp',

  '/assets/guess/deco-cross-olive.webp',
  '/assets/guess/deco-heart-pink.webp',
  '/assets/guess/deco-moon-yellow.webp',
  '/assets/guess/deco-star-blue.webp',
  '/assets/guess/badge-starburst-yellow.webp',
  '/assets/guess/answer-blob-1-pink.webp',
  '/assets/guess/answer-blob-2-yellow.webp',
  '/assets/guess/answer-blob-3-cream.webp',
  '/assets/guess/answer-blob-4-green.webp',
  '/assets/guess/answer-blob-cream-selected.webp',
  '/assets/guess/answer-blob-pink-selected.webp',
  '/assets/guess/answer-blob-yellow-selected.webp',
  '/assets/guess/answer-blob-green-selected.webp',
  '/assets/guess/moon-yellow-top-left.webp',
  '/assets/guess/heart-pink-top-right.webp',
  '/assets/guess/points-burst.webp',
  '/assets/guess/star-blue-faded-bottom-left.webp',
  '/assets/guess/cross-green-bottom-right.webp',
  '/assets/guess/icon-flame.webp',

  '/assets/join/deco-cross-olive.webp',
  '/assets/join/deco-moon-yellow.webp',
  '/assets/join/deco-star-blue.webp',
  '/assets/join/sparkle-yellow.webp',

  '/assets/reveal/deco-bottom-left.webp',
  '/assets/reveal/deco-bottom-right.webp',
  '/assets/reveal/crescent-yellow.webp',
  '/assets/reveal/cross-olive.webp',
  '/assets/reveal/match-starburst.webp',
  '/assets/reveal/starburst-blue.webp',

  '/assets/waiting/crescent-yellow.webp',
  '/assets/waiting/cross-olive.webp',
  '/assets/waiting/heart-pink-right.webp',
  '/assets/waiting/heart-pink.webp',
  '/assets/waiting/lock-hero.webp',

  // Countdown WebP decorations
  '/countdown/deco-crescent-yellow-top-left-cropped.webp',
  '/countdown/deco-cross-olive-bottom-right.webp',
  '/countdown/deco-cross-olive-right.webp',
  '/countdown/deco-heart-pink-top-right-cropped.webp',
  '/countdown/deco-sparks-yellow-around-number.webp',
  '/countdown/deco-sparks-yellow-around-players.webp',
  '/countdown/deco-star-blue-bottom-left-cropped.webp',
  '/countdown/deco-star-blue-left.webp',
  '/countdown/deco-star-blue-top-right.webp',

  // Game Settings WebP decorations
  '/game-settings-decorations/deco-cross-olive.webp',
  '/game-settings-decorations/deco-heart-pink.webp',
  '/game-settings-decorations/deco-moon-yellow.webp',
  '/game-settings-decorations/deco-star-blue.webp',
  '/game-settings-decorations/sparkle-left.webp',
  '/game-settings-decorations/sparkle-right.webp',
];

// Additional high-priority hero elements and UI blobs
export const CORE_HERO_ASSETS: readonly string[] = [
  '/card-hero-yellow.webp',
  '/badge-vs-starburst-yellow.webp',
  '/logo-duo-sparks.webp',
  '/icon-flame.webp',
  '/icon-trophy-yellow-blob.webp',
  '/icon-gear-settings.webp',
  '/icon-wave-hand.webp',
  '/icon-clock-teal-blob.webp',
  '/quick-blob-pink-know-me.webp',
  '/quick-blob-blue-trivia.webp',
  '/quick-blob-green-random.webp',
  '/quick-icon-wink-face-sparks.webp',
  '/quick-icon-lightbulb-sparks.webp',
  '/quick-icon-dice-sparks.webp',
  '/stat-cross-olive-guess-wins.webp',
  '/stat-starburst-yellow-streak.webp',
  '/stat-teardrop-blue-matches.webp',
  '/avatar-alex-pink-blob-boy.webp',
  '/avatar-sam-blue-blob-girl.webp',
  '/avatar-sam-teal-blob-bun-girl.webp',
  '/assets/blobs/blue-avatar-blob.webp',
  '/assets/blobs/pink-avatar-blob.webp',
  '/assets/blobs/heart-pink.svg',
  '/assets/blobs/starburst-yellow-small.svg',
  '/assets/blobs/cross-olive-decorative.svg',
  '/assets/welcome/crescent-yellow-top.png',
  '/assets/welcome/heart-pink-right.png',
  '/assets/welcome/logo-duo.png',
  '/assets/welcome/starburst-blue-right.png',
  '/assets/welcome/hero-pair.png',
  '/assets/welcome/starburst-blue-left.png',
  '/assets/welcome/cross-olive.png',
  '/assets/welcome/heart-pink-left.png',
  '/assets/welcome/crescent-yellow-bottom.png',
];

// Complete list of all upfront assets to preload
export const ALL_PRELOAD_URLS: readonly string[] = Array.from(
  new Set([...DECORATION_WEBP_URLS, ...CORE_HERO_ASSETS])
);

// ── 2. In-Memory Image Cache (Store decoded HTMLImageElements) ──
const inMemoryCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();
const preloadedUrlSet = new Set<string>();

/**
 * Check if a URL has already been preloaded and decoded in memory.
 */
export function isImagePreloaded(url: string): boolean {
  return preloadedUrlSet.has(url);
}

/**
 * Injects a `<link rel="preload" as="image" href="..." />` tag in `<head>`
 * so the browser network pipeline begins fetching before parser execution.
 */
export function injectPreloadLink(url: string): void {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (url.endsWith('.webp')) {
    link.type = 'image/webp';
  } else if (url.endsWith('.svg')) {
    link.type = 'image/svg+xml';
  } else if (url.endsWith('.png')) {
    link.type = 'image/png';
  }
  document.head.appendChild(link);
}

/**
 * Caches an image in the browser CacheStorage API (`window.caches`)
 * for instant sub-millisecond retrieval on revisits and reloads.
 */
const CACHE_NAME = 'get2know-decorations-v1';

async function cacheInBrowserStorage(url: string): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await window.caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (!match) {
      await cache.add(url);
    }
  } catch {
    // Non-fatal if CacheStorage fails or is disabled (e.g. private mode)
  }
}

/**
 * Preloads a single image using `new Image()`, decodes it with `img.decode()`,
 * stores it in the in-memory cache, and writes to Cache Storage.
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  // If already in memory, return immediately
  const cached = inMemoryCache.get(url);
  if (cached) {
    return Promise.resolve(cached);
  }

  // If currently loading, reuse the inflight promise
  const inflight = loadingPromises.get(url);
  if (inflight) {
    return inflight;
  }

  // Also inject <link rel="preload"> to give browser priority
  injectPreloadLink(url);

  // Trigger Cache Storage caching in parallel (background)
  cacheInBrowserStorage(url).catch(() => {});

  const promise = new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    // Do NOT set crossOrigin for same-origin local assets
    img.decoding = 'async';

    const onDone = async () => {
      try {
        if ('decode' in img && typeof img.decode === 'function') {
          await img.decode();
        }
      } catch {
        // decode error is non-fatal (image still usable or handled by fallback)
      }
      inMemoryCache.set(url, img);
      preloadedUrlSet.add(url);
      resolve(img);
    };

    img.onload = onDone;
    img.onerror = () => {
      // Resolve anyway so one missing optional asset never blocks the entire app
      preloadedUrlSet.add(url);
      resolve(img);
    };

    img.src = url;

    // Check if the browser had it instantly cached
    if (img.complete) {
      onDone();
    }
  }).finally(() => {
    loadingPromises.delete(url);
  });

  loadingPromises.set(url, promise);
  return promise;
}

// ── 3. Batch Preloader with Progress Tracking ──
let preloadingStarted = false;
let preloadingComplete = false;
const listeners = new Set<(progress: number, loaded: number, total: number) => void>();

export interface PreloadProgress {
  isComplete: boolean;
  progress: number;
  loaded: number;
  total: number;
}

let currentProgress: PreloadProgress = {
  isComplete: false,
  progress: 0,
  loaded: 0,
  total: ALL_PRELOAD_URLS.length,
};

export function getPreloadProgress(): PreloadProgress {
  return currentProgress;
}

/**
 * Preload all decoration images upfront on app initialization.
 * No lazy loading — loads all decorations before user sees the app.
 */
export function preloadAllDecorationImages(
  onProgress?: (progress: number, loaded: number, total: number) => void
): Promise<void> {
  if (onProgress) {
    listeners.add(onProgress);
  }

  if (preloadingComplete) {
    onProgress?.(100, ALL_PRELOAD_URLS.length, ALL_PRELOAD_URLS.length);
    return Promise.resolve();
  }

  if (preloadingStarted) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (preloadingComplete) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  preloadingStarted = true;
  const urls = ALL_PRELOAD_URLS;
  const total = urls.length;
  let loaded = 0;

  // In bulk, inject preload links in batches of 10 to warm the network pipe
  for (const url of urls) {
    injectPreloadLink(url);
  }

  const updateProgress = () => {
    loaded++;
    const progress = Math.min(100, Math.round((loaded / total) * 100));
    currentProgress = {
      isComplete: loaded >= total,
      progress,
      loaded,
      total,
    };
    listeners.forEach((listener) => listener(progress, loaded, total));
  };

  const tasks = urls.map((url) =>
    preloadImage(url).then(() => {
      updateProgress();
    }).catch(() => {
      updateProgress();
    })
  );

  return Promise.allSettled(tasks).then(() => {
    preloadingComplete = true;
    currentProgress = {
      isComplete: true,
      progress: 100,
      loaded: total,
      total,
    };
    listeners.forEach((listener) => listener(100, total, total));
    listeners.clear();
  });
}

/**
 * Legacy compatibility export for existing callers.
 */
export const preloadAllAssets = preloadAllDecorationImages;
export const getAllPreloadUrls = () => Array.from(ALL_PRELOAD_URLS);
