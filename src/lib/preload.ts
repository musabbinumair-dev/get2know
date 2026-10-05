/**
 * Central Asset Registry & Real Preloader Engine
 *
 * Ensures the user NEVER sees unloaded, popping-in, or half-loaded images or fonts.
 * The loader stays visible until ALL of that page's decorations, avatars, blobs,
 * icons, and fonts are fully loaded and decoded, DOM images are complete, layout settled,
 * and 2 animation frames + 100ms settle window have elapsed with no mutations.
 */

import { UserProfile } from '../services/sessionContext';

export type LoaderTheme = 'cream' | 'blue' | 'pink' | 'yellow' | 'olive';

export interface RouteConfig {
  id: string;
  path: string;
  aliases?: string[];
  bg: string;
  theme: LoaderTheme;
  assets: string[];
  nextLikely?: string[];
}

// ── COMPLETE GAME FLOW ASSETS PRELOADED WHEN USER OPENS LOBBY ──
export const GAME_FLOW_ASSETS: readonly string[] = [
  // Lobby decorations & emoji
  '/game-settings-decorations/emoji-pizza.webp',
  '/game-settings-decorations/emoji-clapper.webp',
  '/game-settings-decorations/emoji-music.webp',
  '/game-settings-decorations/emoji-moon.webp',
  '/game-settings-decorations/emoji-fears.webp',
  '/game-settings-decorations/emoji-plane.webp',
  '/game-settings-decorations/emoji-flask.webp',
  '/game-settings-decorations/emoji-funny.webp',
  '/game-settings-decorations/emoji-cloud.webp',
  '/game-settings-decorations/icon-bulb.webp',
  '/game-settings-decorations/icon-wink.webp',
  '/game-settings-decorations/icon-dice-color.webp',
  '/assets/lobby/deco-moon-yellow.webp',
  '/assets/lobby/deco-heart-pink.webp',
  '/assets/lobby/deco-star-blue.webp',
  '/assets/lobby/deco-cross-olive.webp',
  '/assets/lobby/hero-card-yellow.webp',
  '/assets/lobby/sparkle-left.webp',
  '/assets/lobby/sparkle-right.webp',
  '/assets/lobby/badge-vs-starburst.webp',
  '/assets/lobby/emoji-wave.webp',
  // Game settings sheet
  '/game-settings-decorations/emoji-dice-outline.webp',
  '/assets/lobby/emoji-brain.webp',
  // Countdown screen
  '/countdown/deco-crescent-yellow-top-left-cropped.webp',
  '/countdown/deco-heart-pink-top-right-cropped.webp',
  '/countdown/deco-star-blue-top-right.webp',
  '/countdown/deco-star-blue-left.webp',
  '/countdown/deco-cross-olive-right.webp',
  '/countdown/deco-sparks-yellow-around-number.webp',
  '/countdown/countdown-blob-pink-behind-number.webp',
  '/countdown/deco-sparks-yellow-around-players.webp',
  '/countdown/deco-star-blue-bottom-left-cropped.webp',
  '/countdown/deco-cross-olive-bottom-right.webp',
  '/countdown/badge-vs-starburst-yellow.webp',
  // Question & Guess screens
  '/assets/blobs/heart-pink-small.svg',
  '/assets/blobs/cross-olive-decorative.svg',
  '/assets/blobs/starburst-blue-join.svg',
  '/assets/guess/deco-moon-yellow.webp',
  '/assets/guess/deco-heart-pink.webp',
  '/assets/guess/deco-star-blue.webp',
  '/assets/guess/deco-cross-olive.webp',
  '/assets/guess/answer-blob-pink.webp',
  '/assets/guess/answer-blob-yellow.webp',
  '/assets/guess/answer-blob-cream.webp',
  '/assets/guess/answer-blob-green.webp',
  '/assets/guess/badge-starburst-yellow.webp',
  // Reveal & Round Result screens
  '/assets/reveal/emoji-smile.webp',
  '/assets/reveal/emoji-heart.webp',
  '/assets/reveal/emoji-laugh.webp',
  '/assets/reveal/emoji-surprised.webp',
  '/assets/reveal/emoji-smirk.webp',
  '/assets/reveal/emoji-cry.webp',
  '/assets/reveal/card-blob-pink.webp',
  '/assets/reveal/match-starburst.webp',
  '/assets/reveal/card-blob-blue.webp',
  '/assets/reveal/crescent-yellow.webp',
  '/assets/reveal/heart-pink-small.webp',
  '/assets/reveal/starburst-blue.webp',
  '/assets/reveal/cross-olive.webp',
  '/assets/reveal/deco-bottom-left.webp',
  '/assets/reveal/deco-bottom-right.webp',
  // Final Results screen
  '/assets/scores/hero-heart-pink-sync-score.webp',
  '/assets/scores/stat-starburst-yellow-streak.webp',
  '/assets/scores/stat-teardrop-blue-matches.webp',
  '/assets/scores/stat-cross-olive-guess-wins.webp',
  // All 6 avatars & blobs
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
  '/assets/avatars/avatar-5.png',
  '/assets/avatars/avatar-6.png',
  '/assets/blobs/avatar-blob-1.png',
  '/assets/blobs/avatar-blob-2.png',
  '/assets/blobs/avatar-blob-3.png',
  '/assets/blobs/avatar-blob-4.png',
  '/assets/blobs/avatar-blob-5.png',
  '/assets/blobs/avatar-blob-6.png',
];

// ── 1. ROUTE ASSET REGISTRY (Scanned from real page & component renders) ──
export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  landing: {
    id: 'landing',
    path: '/welcome',
    aliases: ['/'],
    bg: '#F8F1E1',
    theme: 'cream',
    assets: [
      '/assets/welcome/crescent-yellow-top.png',
      '/assets/welcome/heart-pink-right.png',
      '/assets/welcome/logo-duo.png',
      '/assets/welcome/starburst-blue-right.png',
      '/assets/welcome/hero-pair.png',
      '/assets/welcome/starburst-blue-left.png',
      '/assets/welcome/cross-olive.png',
      '/assets/welcome/heart-pink-left.png',
      '/assets/welcome/crescent-yellow-bottom.png',
    ],
    nextLikely: ['whoAreYou', 'join'],
  },
  whoAreYou: {
    id: 'whoAreYou',
    path: '/create-profile',
    bg: '#FDE473',
    theme: 'yellow',
    assets: [
      '/assets/blobs/avatar-blob-1.png',
      '/assets/avatars/avatar-1.png',
      '/assets/blobs/avatar-blob-2.png',
      '/assets/avatars/avatar-2.png',
      '/assets/blobs/avatar-blob-3.png',
      '/assets/avatars/avatar-3.png',
      '/assets/blobs/avatar-blob-4.png',
      '/assets/avatars/avatar-4.png',
      '/assets/blobs/avatar-blob-5.png',
      '/assets/avatars/avatar-5.png',
      '/assets/blobs/avatar-blob-6.png',
      '/assets/avatars/avatar-6.png',
      '/assets/welcome/starburst-blue-right.png',
      '/assets/welcome/starburst-blue-left.png',
      '/assets/blobs/crescent-pink-bottom-right.png',
    ],
    nextLikely: ['invite', 'join'],
  },
  invite: {
    id: 'invite',
    path: '/invite',
    bg: '#FDE473',
    theme: 'yellow',
    assets: [
      '/assets/blobs/starburst-yellow-small.svg',
      '/assets/blobs/cross-olive-decorative.svg',
      '/assets/blobs/heart-pink-small.svg',
      '/file_00000000199c8207ba1ef4dff8b5f719.png',
      '/file_00000000872c821185f1f972a55e71f3.png',
      '/assets/blobs/avatar-blob-1.png',
      '/assets/avatars/avatar-1.png',
      '/assets/blobs/avatar-blob-2.png',
      '/assets/avatars/avatar-2.png',
    ],
    nextLikely: ['playHome'],
  },
  join: {
    id: 'join',
    path: '/join',
    aliases: ['/join-code'],
    bg: '#FDE473',
    theme: 'yellow',
    assets: [
      '/assets/join/deco-moon-yellow.webp',
      '/assets/join/deco-star-blue.webp',
      '/assets/join/deco-cross-olive.webp',
      '/assets/join/avatar-blob-blue.webp',
      '/assets/join/bubble-cream.webp',
      '/assets/join/sparkle-yellow.webp',
    ],
    nextLikely: ['playHome', 'whoAreYou'],
  },
  playHome: {
    id: 'playHome',
    path: '/home',
    aliases: ['/today'],
    bg: '#F8F1E1',
    theme: 'cream',
    assets: [
      '/deco-heart-pink-top-left-cropped.webp',
      '/deco-starburst-blue-top-right-cropped.webp',
      '/deco-cross-olive-bottom-left.webp',
      '/deco-crescent-yellow-bottom-right.webp',
      '/assets/blobs/heart-pink.svg',
      '/logo-duo-sparks.webp',
      '/icon-flame.webp',
      '/card-hero-yellow.webp',
      '/deco-sparks-yellow-around-avatars.webp',
      '/avatar-alex-pink-blob-boy.webp',
      '/avatar-sam-blue-blob-girl.webp',
      '/badge-vs-starburst-yellow.webp',
      '/quick-blob-pink-know-me.webp',
      '/quick-icon-wink-face-sparks.webp',
      '/quick-blob-blue-trivia.webp',
      '/quick-icon-lightbulb-sparks.webp',
      '/quick-blob-green-random.webp',
      '/quick-icon-dice-sparks.webp',
      '/icon-trophy-yellow-blob.webp',
    ],
    nextLikely: ['today', 'lobby', 'settingsGame', 'scores', 'profile', 'memoryWall'],
  },
  lobby: {
    id: 'lobby',
    path: '/lobby',
    bg: '#96B9FC',
    theme: 'blue',
    // Preloads the entire game flow in one go!
    assets: Array.from(new Set([...GAME_FLOW_ASSETS])),
    nextLikely: ['countdown', 'playHome'],
  },
  countdown: {
    id: 'countdown',
    path: '/countdown',
    bg: '#FEE36F',
    theme: 'yellow',
    assets: [
      '/countdown/deco-crescent-yellow-top-left-cropped.webp',
      '/countdown/deco-heart-pink-top-right-cropped.webp',
      '/countdown/deco-star-blue-top-right.webp',
      '/countdown/deco-star-blue-left.webp',
      '/countdown/deco-cross-olive-right.webp',
      '/countdown/deco-sparks-yellow-around-number.webp',
      '/countdown/countdown-blob-pink-behind-number.webp',
      '/countdown/deco-sparks-yellow-around-players.webp',
      '/countdown/deco-star-blue-bottom-left-cropped.webp',
      '/countdown/deco-cross-olive-bottom-right.webp',
      '/countdown/badge-vs-starburst-yellow.webp',
    ],
    nextLikely: ['today', 'guess'],
  },
  settingsGame: {
    id: 'settingsGame',
    path: '/settings-game',
    aliases: ['/game-settings'],
    bg: '#F6EFDD',
    theme: 'cream',
    assets: [
      '/game-settings-decorations/emoji-pizza.webp',
      '/game-settings-decorations/emoji-moon.webp',
      '/game-settings-decorations/emoji-fears.webp',
      '/game-settings-decorations/emoji-clapper.webp',
      '/game-settings-decorations/emoji-music.webp',
      '/game-settings-decorations/emoji-plane.webp',
      '/game-settings-decorations/emoji-flask.webp',
      '/game-settings-decorations/emoji-funny.webp',
      '/game-settings-decorations/emoji-cloud.webp',
      '/game-settings-decorations/emoji-dice-outline.webp',
      '/game-settings-decorations/deco-moon-yellow.webp',
      '/game-settings-decorations/deco-heart-pink.webp',
      '/game-settings-decorations/deco-star-blue.webp',
      '/game-settings-decorations/deco-cross-olive.webp',
      '/quick-blob-pink-know-me.webp',
      '/quick-icon-wink-face-sparks.webp',
      '/quick-blob-blue-trivia.webp',
      '/quick-icon-lightbulb-sparks.webp',
      '/quick-blob-green-random.webp',
      '/quick-icon-dice-sparks.webp',
    ],
    nextLikely: ['lobby', 'playHome'],
  },
  today: {
    id: 'today',
    path: '/today-question',
    bg: '#F7C8E2',
    theme: 'pink',
    assets: [
      '/assets/blobs/heart-pink-small.svg',
      '/assets/blobs/cross-olive-decorative.svg',
      '/assets/blobs/starburst-blue-join.svg',
    ],
    nextLikely: ['locked', 'guess', 'reveal'],
  },
  locked: {
    id: 'locked',
    path: '/locked',
    aliases: ['/answer-locked'],
    bg: '#96B9FC',
    theme: 'blue',
    assets: [
      '/assets/waiting/heart-pink.webp',
      '/assets/waiting/cross-olive.webp',
      '/assets/waiting/lock-hero.webp',
      '/assets/waiting/crescent-yellow.webp',
      '/assets/waiting/heart-pink-right.webp',
    ],
    nextLikely: ['guess', 'playHome'],
  },
  guess: {
    id: 'guess',
    path: '/guess',
    bg: '#FEE36F',
    theme: 'yellow',
    assets: [
      '/assets/guess/deco-moon-yellow.webp',
      '/assets/guess/deco-heart-pink.webp',
      '/assets/guess/deco-star-blue.webp',
      '/assets/guess/deco-cross-olive.webp',
      '/assets/guess/answer-blob-pink.webp',
      '/assets/guess/answer-blob-yellow.webp',
      '/assets/guess/answer-blob-cream.webp',
      '/assets/guess/answer-blob-green.webp',
      '/assets/guess/badge-starburst-yellow.webp',
    ],
    nextLikely: ['reveal'],
  },
  reveal: {
    id: 'reveal',
    path: '/reveal',
    bg: '#9BAE6F',
    theme: 'olive',
    assets: [
      '/assets/reveal/emoji-smile.webp',
      '/assets/reveal/emoji-heart.webp',
      '/assets/reveal/emoji-laugh.webp',
      '/assets/reveal/emoji-surprised.webp',
      '/assets/reveal/emoji-smirk.webp',
      '/assets/reveal/emoji-cry.webp',
      '/assets/reveal/card-blob-pink.webp',
      '/assets/reveal/match-starburst.webp',
      '/assets/reveal/card-blob-blue.webp',
      '/assets/reveal/crescent-yellow.webp',
      '/assets/reveal/heart-pink-small.webp',
      '/assets/reveal/starburst-blue.webp',
      '/assets/reveal/cross-olive.webp',
      '/assets/reveal/deco-bottom-left.webp',
      '/assets/reveal/deco-bottom-right.webp',
    ],
    nextLikely: ['final', 'playHome'],
  },
  scores: {
    id: 'scores',
    path: '/scores',
    bg: '#F8F1E1',
    theme: 'cream',
    assets: [
      '/assets/scores/icon-category-dreams-blue-moon.webp',
      '/assets/scores/deco-cross-olive-right.webp',
      '/assets/scores/deco-star-blue-top-right-cropped.webp',
      '/assets/scores/deco-heart-pink-top-left-cropped.webp',
      '/assets/scores/icon-category-fears-green-scream.webp',
      '/assets/scores/deco-moon-yellow-bottom-left.webp',
      '/assets/scores/deco-sparks-yellow-around-heart.webp',
      '/assets/scores/deco-heart-pink-bottom-right-cropped.webp',
      '/assets/scores/icon-category-food-pink-pizza.webp',
      '/assets/scores/hero-heart-pink-sync-score.webp',
      '/assets/scores/stat-starburst-yellow-streak.webp',
      '/assets/scores/stat-teardrop-blue-matches.webp',
      '/assets/scores/stat-cross-olive-guess-wins.webp',
    ],
    nextLikely: ['playHome', 'profile'],
  },
  memoryWall: {
    id: 'memoryWall',
    path: '/memory',
    bg: '#F8F1E1',
    theme: 'cream',
    assets: [
      '/assets/blobs/color-blob-salmon.png',
      '/assets/blobs/color-blob-teal.png',
      '/assets/blobs/color-blob-blue-root.png',
      '/assets/blobs/color-blob-pink-root.png',
    ],
    nextLikely: ['playHome', 'scores'],
  },
  profile: {
    id: 'profile',
    path: '/profile',
    bg: '#F8F1E1',
    theme: 'cream',
    assets: [
      '/assets/profile/deco-moon-yellow.webp',
      '/assets/profile/deco-heart-pink.webp',
      '/assets/profile/deco-star-blue.webp',
      '/assets/profile/deco-cross-olive.webp',
      '/assets/profile/sparkle-sun-yellow.webp',
      '/assets/profile/icon-blob-pink.webp',
      '/assets/profile/icon-blob-blue.webp',
      '/assets/profile/icon-blob-olive.webp',
      '/assets/waiting/logo-duo.webp',
      '/assets/waiting/streak-flame.webp',
    ],
    nextLikely: ['friend', 'whoAreYou', 'playHome'],
  },
  friend: {
    id: 'friend',
    path: '/friend',
    aliases: ['/friend-profile'],
    bg: '#F8F1E1',
    theme: 'cream',
    assets: [
      '/assets/scores/stat-starburst-yellow-streak.webp',
      '/assets/scores/stat-teardrop-blue-matches.webp',
      '/assets/scores/stat-cross-olive-guess-wins.webp',
      '/deco-crescent-yellow-top-left-cropped.webp',
      '/deco-heart-pink-top-right-cropped.webp',
      '/deco-starburst-blue-bottom-left-cropped.webp',
      '/icon-clock-teal-blob.webp',
      '/icon-wave-hand.webp',
    ],
    nextLikely: ['profile', 'playHome'],
  },
  final: {
    id: 'final',
    path: '/game-final',
    bg: '#9BAE6F',
    theme: 'olive',
    assets: [
      '/countdown/deco-crescent-yellow-top-left-cropped.webp',
      '/countdown/deco-heart-pink-top-right-cropped.webp',
      '/countdown/deco-star-blue-bottom-left-cropped.webp',
      '/countdown/deco-cross-olive-bottom-right.webp',
      '/countdown/badge-vs-starburst-yellow.webp',
    ],
    nextLikely: ['scores', 'playHome'],
  },
};

// ── 2. CRITICAL ASSETS (Preloaded once at app start) ──
export const CRITICAL_SHARED_ASSETS: readonly string[] = [
  // Six avatar characters
  '/assets/avatars/avatar-1.png',
  '/assets/avatars/avatar-2.png',
  '/assets/avatars/avatar-3.png',
  '/assets/avatars/avatar-4.png',
  '/assets/avatars/avatar-5.png',
  '/assets/avatars/avatar-6.png',
  // Six avatar blobs
  '/assets/blobs/avatar-blob-1.png',
  '/assets/blobs/avatar-blob-2.png',
  '/assets/blobs/avatar-blob-3.png',
  '/assets/blobs/avatar-blob-4.png',
  '/assets/blobs/avatar-blob-5.png',
  '/assets/blobs/avatar-blob-6.png',
  // Logos
  '/logo-duo-sparks.webp',
  '/assets/welcome/logo-duo.png',
  '/assets/waiting/logo-duo.webp',
  // Pink and blue hero blobs
  '/assets/blobs/pink-avatar-blob.webp',
  '/assets/blobs/blue-avatar-blob.webp',
];

// Helper to find config by pathname or ID
export function getRouteConfig(routeOrPath: string): RouteConfig {
  const norm = routeOrPath.toLowerCase().replace(/\/+$/, '') || '/';
  for (const config of Object.values(ROUTE_CONFIGS)) {
    if (
      config.id.toLowerCase() === norm ||
      config.path.toLowerCase() === norm ||
      config.aliases?.some((a) => a.toLowerCase() === norm)
    ) {
      return config;
    }
  }
  return ROUTE_CONFIGS.landing;
}

export function isRouteGated(pathname: string): boolean {
  const norm = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  for (const config of Object.values(ROUTE_CONFIGS)) {
    if (
      config.path.toLowerCase() === norm ||
      config.aliases?.some((a) => a.toLowerCase() === norm)
    ) {
      return true;
    }
  }
  return false;
}

export function getAllGatedRoutesAudit(): { path: string; id: string; theme: string; gated: boolean }[] {
  const list: { path: string; id: string; theme: string; gated: boolean }[] = [];
  for (const config of Object.values(ROUTE_CONFIGS)) {
    list.push({ path: config.path, id: config.id, theme: config.theme, gated: true });
    if (config.aliases) {
      for (const alias of config.aliases) {
        list.push({ path: alias, id: config.id, theme: config.theme, gated: true });
      }
    }
  }
  return list;
}

/**
 * assetsFor: Computes the complete list of image URLs needed for a route,
 * including user and partner chosen avatars & blob files based on state.
 */
export function assetsFor(
  routeOrPath: string,
  state?: {
    userProfile?: UserProfile | null;
    partnerProfile?: UserProfile | null;
  }
): string[] {
  const config = getRouteConfig(routeOrPath);
  const set = new Set<string>(config.assets);

  // Inject chosen user profile avatar & blob
  if (state?.userProfile?.avatarId) {
    const id = Math.min(6, Math.max(1, state.userProfile.avatarId));
    set.add(`/assets/avatars/avatar-${id}.png`);
    set.add(`/assets/blobs/avatar-blob-${id}.png`);
  }

  // Inject chosen partner profile avatar & blob
  if (state?.partnerProfile?.avatarId) {
    const id = Math.min(6, Math.max(1, state.partnerProfile.avatarId));
    set.add(`/assets/avatars/avatar-${id}.png`);
    set.add(`/assets/blobs/avatar-blob-${id}.png`);
  }

  return Array.from(set);
}

// ── 3. MODULE-LEVEL CACHE & TIMING MAPS ──
export const CACHE_DECODED_URLS = new Set<string>();
export const ASSET_LOAD_TIMINGS = new Map<string, number>();

export function isAssetDecoded(url: string): boolean {
  return CACHE_DECODED_URLS.has(url);
}

export function areAllAssetsDecoded(urls: string[]): boolean {
  return urls.every((u) => CACHE_DECODED_URLS.has(u));
}

/**
 * Preload a single asset using new Image() + img.decode().
 * Supports ?throttle=slow by injecting 400-900ms delay.
 */
export async function preloadSingleAsset(
  url: string,
  throttleSlow = false
): Promise<void> {
  if (CACHE_DECODED_URLS.has(url)) return;

  const startTime = performance.now();

  try {
    if (throttleSlow) {
      const artificialDelay = 400 + Math.random() * 500;
      await new Promise((r) => setTimeout(r, artificialDelay));
    }

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';

      const finish = () => {
        CACHE_DECODED_URLS.add(url);
        ASSET_LOAD_TIMINGS.set(url, Math.round(performance.now() - startTime));
        resolve();
      };

      img.onload = () => {
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().then(finish).catch(finish);
        } else {
          finish();
        }
      };

      img.onerror = () => {
        console.warn(`[Asset Preload] Failed to load image: ${url}`);
        // Count as finished so one broken asset never blocks the app
        CACHE_DECODED_URLS.add(url);
        ASSET_LOAD_TIMINGS.set(url, Math.round(performance.now() - startTime));
        resolve();
      };

      img.src = url;
    });
  } catch (err) {
    console.warn(`[Asset Preload] Error during decode for ${url}:`, err);
    CACHE_DECODED_URLS.add(url);
  }
}

let fontsPromise: Promise<void> | null = null;

export async function preloadFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  if (!fontsPromise) {
    fontsPromise = (async () => {
      try {
        const weights = ['400', '500', '600', '700', '800', '900'];
        await Promise.all([
          ...weights.map((w) => document.fonts.load(`${w} 1em Nunito`)),
          document.fonts.ready,
        ]);
      } catch (err) {
        console.warn('[Asset Preload] Font loading error:', err);
      }
    })();
  }
  return fontsPromise;
}

/**
 * Preload an array of asset URLs and wait for Nunito fonts.
 */
export async function preloadAssets(
  urls: string[],
  throttleSlow = false
): Promise<void> {
  await Promise.all([
    ...urls.map((u) => preloadSingleAsset(u, throttleSlow)),
    preloadFonts(),
  ]);
}

/**
 * Step 2 DOM Readiness Verification:
 * 1. Checks that every <img> in containerEl has completed loading (naturalWidth > 0 or error)
 * 2. Checks computed background-image on elements
 * 3. Uses MutationObserver to catch images injected late (e.g. after data arrives)
 * 4. Waits 2 requestAnimationFrames for stage/layout scaling to settle
 * 5. Enforces a 100ms settle window with no new DOM mutations before resolving
 */
export async function checkDOMAndLayoutReady(containerEl: HTMLElement): Promise<void> {
  if (typeof window === 'undefined' || !containerEl) return;

  const checkCurrentImages = async (): Promise<boolean> => {
    const images = Array.from(containerEl.querySelectorAll('img'));
    const pendingImages: Promise<void>[] = [];

    for (const img of images) {
      if (!img.complete) {
        pendingImages.push(
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
        );
      } else if (img.naturalWidth === 0 && img.naturalHeight === 0 && !img.src.includes('data:')) {
        if ('decode' in img && typeof img.decode === 'function') {
          pendingImages.push(img.decode().catch(() => {}));
        }
      }
    }

    if (pendingImages.length > 0) {
      await Promise.all(pendingImages);
    }

    // Check CSS background images
    const elementsWithBg = Array.from(containerEl.querySelectorAll('*')).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundImage && style.backgroundImage !== 'none';
    });

    const bgPromises: Promise<void>[] = [];
    for (const el of elementsWithBg) {
      const bg = window.getComputedStyle(el).backgroundImage;
      const match = bg.match(/url\(["']?([^"']+)["']?\)/);
      if (match && match[1] && !match[1].startsWith('data:')) {
        const url = match[1];
        if (!CACHE_DECODED_URLS.has(url)) {
          bgPromises.push(preloadSingleAsset(url, false));
        }
      }
    }

    if (bgPromises.length > 0) {
      await Promise.all(bgPromises);
    }

    return true;
  };

  // Wait for initial images in DOM
  await checkCurrentImages();

  // Wait 2 animation frames for layout calculation & stage transforms
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });

  // Settle window: 100ms with no new DOM/image mutations
  await new Promise<void>((resolve) => {
    let timer: any;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        observer.disconnect();
        await checkCurrentImages();
        resolve();
      }, 100);
    };

    const observer = new MutationObserver(() => {
      resetTimer();
    });

    observer.observe(containerEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'style', 'class'],
    });

    resetTimer();
  });
}

/**
 * Preload likely next pages when the app is idle.
 */
export function preloadAhead(
  currentRouteOrPath: string,
  state?: {
    userProfile?: UserProfile | null;
    partnerProfile?: UserProfile | null;
  }
): void {
  if (typeof window === 'undefined') return;

  const conn = (navigator as any).connection;
  if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
    return;
  }

  const runIdle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 500));

  runIdle(() => {
    const config = getRouteConfig(currentRouteOrPath);
    if (!config.nextLikely || config.nextLikely.length === 0) return;

    for (const nextId of config.nextLikely) {
      const nextAssets = assetsFor(nextId, state);
      for (const asset of nextAssets) {
        if (!CACHE_DECODED_URLS.has(asset)) {
          preloadSingleAsset(asset, false);
        }
      }
    }
  });
}

/**
 * Debug Mode: Monitors DOM for images rendered on a page that were not registered.
 */
export function initDebugAssetScanner(getCurrentRouteId: () => string) {
  if (typeof window === 'undefined') return;
  const isDebug = new URLSearchParams(window.location.search).get('debug') === '1';
  if (!isDebug) return;

  console.info('[Asset Registry] ?debug=1 active. Monitoring image registrations...');

  const observer = new MutationObserver(() => {
    const routeId = getCurrentRouteId();
    const config = getRouteConfig(routeId);
    const registered = new Set(config.assets);

    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (
        src &&
        src.startsWith('/') &&
        !registered.has(src) &&
        !src.includes('/mockups/') &&
        !src.startsWith('/assets/avatars/') &&
        !src.startsWith('/assets/blobs/avatar-blob-')
      ) {
        console.warn(
          `[Asset Registry Warning] Unregistered <img> on route "${routeId}": ${src}. Add it to ROUTE_CONFIGS.${config.id}.assets.`
        );
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
