import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  assetsFor,
  areAllAssetsDecoded,
  preloadAssets,
  getRouteConfig,
  RouteConfig,
  preloadAhead,
  checkDOMAndLayoutReady,
} from '../lib/preload';
import { UserProfile } from '../services/sessionContext';

export interface PageReadyState {
  isReady: boolean;
  showLoader: boolean;
  isTakingLonger: boolean;
  config: RouteConfig;
  pendingUrls: string[];
  totalUrls: string[];
  retry: () => void;
}

export function usePageReady(
  routeOrPath: string,
  state?: {
    userProfile?: UserProfile | null;
    partnerProfile?: UserProfile | null;
  },
  containerRef?: React.RefObject<HTMLElement | null>
): PageReadyState {
  const config = useMemo(() => getRouteConfig(routeOrPath), [routeOrPath]);

  const userAvatarId = state?.userProfile?.avatarId;
  const partnerAvatarId = state?.partnerProfile?.avatarId;

  // Memoize stable target URLs array for this route
  const targetUrls = useMemo(() => {
    return assetsFor(routeOrPath, {
      userProfile: userAvatarId ? ({ avatarId: userAvatarId } as any) : null,
      partnerProfile: partnerAvatarId ? ({ avatarId: partnerAvatarId } as any) : null,
    });
  }, [routeOrPath, userAvatarId, partnerAvatarId]);

  const targetUrlsKey = targetUrls.join('|');

  // Check if throttle is active via ?throttle=slow
  const isThrottled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('throttle') === 'slow';

  // Always show loader on all page changes; keep page hidden until fully loaded
  const [isReady, setIsReady] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [isTakingLonger, setIsTakingLonger] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const loaderShownAtRef = useRef<number>(performance.now());

  useEffect(() => {
    let mounted = true;
    loaderShownAtRef.current = performance.now();

    // Reset states on every route change: show loader immediately, keep page hidden
    setIsReady(false);
    setShowLoader(true);
    setIsTakingLonger(false);

    // 1. Failsafe 1: 8 seconds -> "Still working on it…" + "Try again"
    const longerTimer = setTimeout(() => {
      if (mounted) {
        setIsTakingLonger(true);
      }
    }, 8000);

    // 2. Failsafe 2: 15 seconds -> Continue and show page anyway so app never hangs
    const forceShowTimer = setTimeout(() => {
      if (mounted) {
        console.warn(`[Preload Failsafe] 15s elapsed on route ${routeOrPath}, rendering page anyway.`);
        setShowLoader(false);
        setIsReady(true);
      }
    }, 15000);

    // 3. Dynamic Loading Sequence:
    // a) Decode all route image assets (decorations, avatars, blobs, icons) and Nunito fonts
    preloadAssets(targetUrls, isThrottled)
      .then(async () => {
        if (!mounted) return;

        // b, c, d, e) DOM verification:
        // Wait for page component in DOM to complete loading all <img>, verify computed CSS
        // background images, settle layout and stage scaling, and observe 2 animation frames + 100ms
        if (containerRef?.current) {
          try {
            await checkDOMAndLayoutReady(containerRef.current);
          } catch (err) {
            console.warn('[DOM Readiness Check Warning]', err);
          }
        } else {
          // If no container ref, wait 2 animation frames + 100ms settle window
          await new Promise<void>((r) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => setTimeout(r, 100));
            });
          });
        }

        if (!mounted) return;
        clearTimeout(longerTimer);
        clearTimeout(forceShowTimer);

        // Ensure loader stays visible for a minimum smooth human perception window (350ms)
        // so fast cached transitions don't result in a 5ms micro-flicker
        const elapsed = performance.now() - loaderShownAtRef.current;
        const remainingMinTime = Math.max(0, 350 - elapsed);

        setTimeout(() => {
          if (!mounted) return;
          // All assets confirmed 100% loaded and settled! Now hide loader and show page
          setShowLoader(false);
          setIsReady(true);
          preloadAhead(routeOrPath, {
            userProfile: userAvatarId ? ({ avatarId: userAvatarId } as any) : null,
            partnerProfile: partnerAvatarId ? ({ avatarId: partnerAvatarId } as any) : null,
          });
        }, remainingMinTime);
      })
      .catch((err) => {
        console.error('[Preload Error]', err);
        if (!mounted) return;
        setShowLoader(false);
        setIsReady(true);
      });

    return () => {
      mounted = false;
      clearTimeout(longerTimer);
      clearTimeout(forceShowTimer);
    };
  }, [routeOrPath, targetUrlsKey, isThrottled, retryCount, userAvatarId, partnerAvatarId]);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const pendingUrls = useMemo(() => {
    return targetUrls.filter((u) => !areAllAssetsDecoded([u]));
  }, [targetUrls, isReady]);

  return {
    isReady,
    showLoader,
    isTakingLonger,
    config,
    pendingUrls,
    totalUrls: targetUrls,
    retry,
  };
}
