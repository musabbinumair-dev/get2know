import { useState, useEffect } from 'react';
import {
  preloadAllDecorationImages,
  getPreloadProgress,
  ALL_PRELOAD_URLS,
} from '../utils/preloadAssets';

export interface PreloadState {
  isReady: boolean;
  progress: number;
  loadedCount: number;
  totalCount: number;
}

// Session-level flag so subsequent in-app navigation or re-renders don't flash the skeleton
const SESSION_CACHE_KEY = 'duo_decorations_preloaded_v1';

export function usePreloadAssets(): PreloadState {
  const initialDone = () => {
    if (typeof window === 'undefined') return false;
    return (
      getPreloadProgress().isComplete ||
      sessionStorage.getItem(SESSION_CACHE_KEY) === 'true'
    );
  };

  const [isReady, setIsReady] = useState<boolean>(initialDone);
  const [progress, setProgress] = useState<number>(() =>
    initialDone() ? 100 : getPreloadProgress().progress
  );
  const [loadedCount, setLoadedCount] = useState<number>(() =>
    initialDone() ? ALL_PRELOAD_URLS.length : getPreloadProgress().loaded
  );
  const totalCount = ALL_PRELOAD_URLS.length;

  useEffect(() => {
    if (isReady) return;

    let mounted = true;

    // Safety timeout: Never keep the user waiting longer than 2000ms even on slow networks
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        setIsReady(true);
        setProgress(100);
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, 'true');
        } catch {}
      }
    }, 2000);

    // Kick off upfront parallel preloading
    preloadAllDecorationImages((newProgress, loaded) => {
      if (!mounted) return;
      setProgress(newProgress);
      setLoadedCount(loaded);
      if (newProgress >= 100 || loaded >= totalCount) {
        clearTimeout(fallbackTimeout);
        setIsReady(true);
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, 'true');
        } catch {}
      }
    }).then(() => {
      if (!mounted) return;
      clearTimeout(fallbackTimeout);
      setIsReady(true);
      setProgress(100);
      setLoadedCount(totalCount);
      try {
        sessionStorage.setItem(SESSION_CACHE_KEY, 'true');
      } catch {}
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [isReady, totalCount]);

  return { isReady, progress, loadedCount, totalCount };
}
