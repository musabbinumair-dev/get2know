import { useEffect } from 'react';
import { preloadAllAssets } from '../utils/preloadAssets';

/**
 * Kicks off the two-tier asset preloader once, at application root.
 * Fire-and-forget — never blocks rendering.
 * Call this in App() or another component that mounts exactly once.
 */
export function usePreloadAssets(): void {
  useEffect(() => {
    preloadAllAssets();
  }, []); // run once on mount
}
