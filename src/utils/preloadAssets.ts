/**
 * Two-tier asset preloader.
 *
 * Uses the exact same static "/assets/..." paths that <img> tags request
 * from public/assets/ — no import.meta.glob, no Vite hashing, no src/assets/.
 *
 * Tier 1 – critical: Welcome, CreateProfile, Home screens (shown on first paint).
 *          Loaded immediately on call, in parallel.
 * Tier 2 – deferred: every other screen's assets.
 *          Loaded via requestIdleCallback (setTimeout fallback) so the first
 *          render is never blocked.
 */

// ─── Tier 1: screens visible on first or second paint ──────────────────────

const CRITICAL_URLS: readonly string[] = [
  // Welcome screen
  '/assets/welcome/crescent-yellow-top.png',
  '/assets/welcome/heart-pink-right.png',
  '/assets/welcome/logo-duo.png',
  '/assets/welcome/starburst-blue-right.png',
  '/assets/welcome/hero-pair.png',
  '/assets/welcome/starburst-blue-left.png',
  '/assets/welcome/cross-olive.png',
  '/assets/welcome/heart-pink-left.png',
  '/assets/welcome/crescent-yellow-bottom.png',
  // Avatar blobs + faces used on CreateProfile (PNG versions — always exist)
  '/assets/blobs/avatar-blob-1.png',
  '/assets/blobs/avatar-blob-2.png',
  '/assets/blobs/avatar-blob-3.png',
  '/assets/blobs/avatar-blob-4.png',
  '/assets/blobs/avatar-blob-5.png',
  '/assets/blobs/avatar-blob-6.png',
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
  '/assets/avatars/avatar-5.png',
  '/assets/avatars/avatar-6.png',
  // Blob shapes used on Home + lobby entry
  '/assets/blobs/blue-avatar-blob.webp',
  '/assets/blobs/pink-avatar-blob.webp',
  '/assets/blobs/crescent-pink-bottom-right.png',
  '/assets/welcome/starburst-blue-right.png',
  // CreateProfile decorations
  '/assets/welcome/starburst-blue-left.png',
];

// ─── Tier 2: remaining screens ──────────────────────────────────────────────

const DEFERRED_URLS: readonly string[] = [
  // Avatar webp (3-6 exist; 1-2 fall back to PNG, preloading is a no-op on miss)
  '/assets/avatars/avatar-3.webp',
  '/assets/avatars/avatar-4.webp',
  '/assets/avatars/avatar-5.webp',
  '/assets/avatars/avatar-6.webp',
  '/assets/blobs/avatar-blob-1.webp',
  '/assets/blobs/avatar-blob-2.webp',
  '/assets/blobs/avatar-blob-3.webp',
  '/assets/blobs/avatar-blob-4.webp',
  '/assets/blobs/avatar-blob-5.webp',
  '/assets/blobs/avatar-blob-6.webp',
  // Blob colours used by MemoryCard / legacy paths
  '/assets/blobs/color-blob-salmon.png',
  '/assets/blobs/color-blob-teal.png',
  '/assets/blobs/color-blob-blue.png',
  '/assets/blobs/color-blob-pink-root.png',
  // SVG decorations
  '/assets/blobs/starburst-yellow-small.svg',
  '/assets/blobs/starburst-blue-join.svg',
  '/assets/blobs/heart-pink.svg',
  '/assets/blobs/heart-pink-small.svg',
  '/assets/blobs/cross-olive-decorative.svg',
  // Guess screen
  '/assets/guess/answer-blob-cream.webp',
  '/assets/guess/answer-blob-green.webp',
  '/assets/guess/answer-blob-pink.webp',
  '/assets/guess/answer-blob-yellow.webp',
  '/assets/guess/badge-starburst-yellow.webp',
  '/assets/guess/deco-cross-olive.webp',
  '/assets/guess/deco-heart-pink.webp',
  '/assets/guess/deco-moon-yellow.webp',
  '/assets/guess/deco-star-blue.webp',
  // Join / invite
  '/assets/join/avatar-blob-blue.webp',
  '/assets/join/bubble-cream.webp',
  '/assets/join/deco-cross-olive.webp',
  '/assets/join/deco-moon-yellow.webp',
  '/assets/join/deco-star-blue.webp',
  '/assets/join/sparkle-yellow.webp',
  // Landing (hero blob)
  '/assets/landing/hero-blob-yellow.webp',
  // Desktop landing
  '/assets/landing-desktop/badge-vs-starburst.webp',
  '/assets/landing-desktop/deco-cross-olive-bottomright.webp',
  '/assets/landing-desktop/deco-cross-olive-hero.webp',
  '/assets/landing-desktop/deco-heart-pink-hero.webp',
  '/assets/landing-desktop/deco-heart-pink-topright.webp',
  '/assets/landing-desktop/deco-moon-yellow-bottomright.webp',
  '/assets/landing-desktop/deco-moon-yellow-topleft.webp',
  '/assets/landing-desktop/deco-star-blue-bottomleft.webp',
  '/assets/landing-desktop/deco-star-blue-hero.webp',
  '/assets/landing-desktop/mode-know-me.webp',
  '/assets/landing-desktop/mode-random.webp',
  '/assets/landing-desktop/mode-trivia.webp',
  '/assets/landing-desktop/sparkle-left.webp',
  '/assets/landing-desktop/sparkle-right.webp',
  // Lobby
  '/assets/lobby/badge-vs-starburst.webp',
  '/assets/lobby/deco-cross-olive.webp',
  '/assets/lobby/deco-heart-pink.webp',
  '/assets/lobby/deco-moon-yellow.webp',
  '/assets/lobby/deco-star-blue.webp',
  '/assets/lobby/emoji-brain.webp',
  '/assets/lobby/emoji-wave.webp',
  '/assets/lobby/hero-card-yellow.webp',
  '/assets/lobby/sparkle-left.webp',
  '/assets/lobby/sparkle-right.webp',
  // Memory wall
  '/assets/memorywall/badge-starburst-yellow.png',
  // Profile
  '/assets/profile/deco-cross-olive.webp',
  '/assets/profile/deco-heart-pink.webp',
  '/assets/profile/deco-moon-yellow.webp',
  '/assets/profile/deco-star-blue.webp',
  '/assets/profile/icon-blob-blue.webp',
  '/assets/profile/icon-blob-olive.webp',
  '/assets/profile/icon-blob-pink.webp',
  '/assets/profile/sparkle-sun-yellow.webp',
  // Reveal
  '/assets/reveal/card-blob-blue.webp',
  '/assets/reveal/card-blob-pink.webp',
  '/assets/reveal/crescent-yellow.webp',
  '/assets/reveal/cross-olive.webp',
  '/assets/reveal/deco-bottom-left.webp',
  '/assets/reveal/deco-bottom-right.webp',
  '/assets/reveal/emoji-cry.webp',
  '/assets/reveal/emoji-heart.webp',
  '/assets/reveal/emoji-laugh.webp',
  '/assets/reveal/emoji-smile.webp',
  '/assets/reveal/emoji-smirk.webp',
  '/assets/reveal/emoji-surprised.webp',
  '/assets/reveal/heart-pink-small.webp',
  '/assets/reveal/match-starburst-black.webp',
  '/assets/reveal/match-starburst.webp',
  '/assets/reveal/starburst-blue.webp',
  // Scores
  '/assets/scores/deco-cross-olive-right.webp',
  '/assets/scores/deco-heart-pink-bottom-right-cropped.webp',
  '/assets/scores/deco-heart-pink-top-left-cropped.webp',
  '/assets/scores/deco-moon-yellow-bottom-left.webp',
  '/assets/scores/deco-sparks-yellow-around-heart.webp',
  '/assets/scores/deco-star-blue-top-right-cropped.webp',
  '/assets/scores/hero-heart-pink-sync-score.webp',
  '/assets/scores/icon-category-dreams-blue-moon.webp',
  '/assets/scores/icon-category-fears-green-scream.webp',
  '/assets/scores/icon-category-food-pink-pizza.webp',
  '/assets/scores/stat-cross-olive-guess-wins.webp',
  '/assets/scores/stat-starburst-yellow-streak.webp',
  '/assets/scores/stat-teardrop-blue-matches.webp',
  // Waiting / answer-locked
  '/assets/waiting/crescent-yellow.webp',
  '/assets/waiting/cross-olive.webp',
  '/assets/waiting/heart-pink-right.webp',
  '/assets/waiting/heart-pink.webp',
  '/assets/waiting/lock-hero.webp',
  '/assets/waiting/logo-duo.webp',
  '/assets/waiting/starburst-blue.png',
  '/assets/waiting/streak-flame.webp',
  '/assets/waiting/waiting-avatar-ring.webp',
];

// ─── Preload primitive ───────────────────────────────────────────────────────

function preloadOne(url: string): void {
  const img = new Image();
  img.src = url;
  if ('decode' in img && typeof img.decode === 'function') {
    img.decode().catch(() => { /* ignore — file may simply not exist */ });
  } else {
    img.onerror = null; // silence console errors for missing optional assets
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

let started = false;

/**
 * Fire-and-forget two-tier preloader.
 * Safe to call multiple times — runs only once.
 */
export function preloadAllAssets(): void {
  if (started) return;
  started = true;

  // Tier 1: start immediately, in parallel
  for (const url of CRITICAL_URLS) preloadOne(url);

  // Tier 2: wait for the browser's idle slot (or 2 s fallback)
  const scheduleDeferred = (): void => {
    for (const url of DEFERRED_URLS) preloadOne(url);
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(scheduleDeferred, { timeout: 2000 });
  } else {
    setTimeout(scheduleDeferred, 200);
  }
}

/**
 * Returns a de-duped list of every URL this preloader touches.
 * Useful for auditing coverage — not required at runtime.
 */
export function getAllPreloadUrls(): string[] {
  return Array.from(new Set([...CRITICAL_URLS, ...DEFERRED_URLS]));
}
