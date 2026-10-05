import { useState, useEffect } from 'react';
import {
  preloadAllAssets,
  getPreloadState,
  PreloadProgress,
} from '../utils/preloadAssets';

/**
 * Hook to initialize and monitor Vite asset preloading.
 * Call this at application root (e.g. `App.tsx` or `main.tsx`).
 */
export function usePreloadAssets(): PreloadProgress {
  const [state, setState] = useState<PreloadProgress>(() => getPreloadState());

  useEffect(() => {
    let isMounted = true;

    preloadAllAssets((progress, loaded, total) => {
      if (!isMounted) return;
      setState((prev) => ({
        ...prev,
        isLoaded: progress >= 100,
        progress,
        loadedCount: loaded,
        totalCount: total,
      }));
    }).then(() => {
      if (!isMounted) return;
      setState((prev) => ({
        ...prev,
        isLoaded: true,
        progress: 100,
      }));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
