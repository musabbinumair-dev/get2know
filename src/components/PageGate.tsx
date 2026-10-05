import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageReady } from '../hooks/usePageReady';
import { AppLoader } from './AppLoader';
import { useSession } from '../services/sessionContext';
import { isRouteGated, getAllGatedRoutesAudit } from '../lib/preload';
import { PageVisibilityContext } from '../context/PageVisibilityContext';

interface PageGateProps {
  children: React.ReactNode;
}

export const PageGate: React.FC<PageGateProps> = ({ children }) => {
  const location = useLocation();
  const { profile } = useSession();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── 1. ROUTE GATING DEV CHECK (Requirement 1) ──
  useEffect(() => {
    const pathname = location.pathname;
    const gated = isRouteGated(pathname);
    if (!gated) {
      console.error(
        `[PageGate CRITICAL ERROR] Route "${pathname}" is NOT registered in ROUTE_CONFIGS! Every route must be gated.`
      );
    }
  }, [location.pathname]);

  // Log full audit table to console on startup
  useEffect(() => {
    const audit = getAllGatedRoutesAudit();
    console.groupCollapsed('[PageGate Route Audit] 100% Gated Routes Verification');
    console.table(audit);
    console.groupEnd();
  }, []);

  const { isReady, showLoader, isTakingLonger, config, retry } = usePageReady(
    location.pathname,
    { userProfile: profile },
    containerRef
  );

  const [loaderMounted, setLoaderMounted] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(false);
  const prevShowLoaderRef = useRef<boolean>(true);

  // On any route change, immediately show the loader for the destination page
  useEffect(() => {
    setLoaderMounted(true);
    setIsFadingOut(false);
    setIsPageVisible(false);
    prevShowLoaderRef.current = true;
  }, [location.pathname]);

  // ── 2. INITIAL HTML LOADER CLEANUP ──
  useEffect(() => {
    if (isReady && typeof document !== 'undefined') {
      const initLoader = document.getElementById('initial-page-loader');
      if (initLoader) {
        initLoader.style.opacity = '0';
        setTimeout(() => initLoader.remove(), 200);
      }
    }
  }, [isReady]);

  // ── 3. LOADER MOUNT & DYNAMIC FADE-OUT LIFECYCLE ──
  useEffect(() => {
    const wasShowing = prevShowLoaderRef.current;
    prevShowLoaderRef.current = showLoader;

    if (showLoader) {
      setLoaderMounted(true);
      setIsFadingOut(false);
      setIsPageVisible(false);
    } else if (wasShowing) {
      // All assets and DOM verified 100% loaded -> fade out over 200ms
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setLoaderMounted(false);
        setIsFadingOut(false);
        // Page is now 100% visible and timers (like countdown) safely start
        setIsPageVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  return (
    <PageVisibilityContext.Provider value={{ isPageVisible }}>
      {/* 
        The page tree: mounted with visibility: hidden while preloading,
        allowing the browser to construct DOM, measure layout/stage, and decode images.
        Only when isReady is true does visibility become visible.
      */}
      <div
        ref={containerRef}
        style={{
          visibility: isReady ? 'visible' : 'hidden',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
        className="w-full h-full min-h-screen"
        aria-hidden={!isReady}
      >
        {children}
      </div>

      {/* 
        Full-screen Gated Preloader:
        Highest z-index, matches destination background, blocks pointer events,
        and stays until all assets, fonts, and DOM layout are fully loaded and settled.
      */}
      {loaderMounted && (
        <AppLoader
          bg={config.bg}
          theme={config.theme}
          isTakingLonger={isTakingLonger}
          isFadingOut={isFadingOut}
          onRetry={retry}
        />
      )}
    </PageVisibilityContext.Provider>
  );
};
