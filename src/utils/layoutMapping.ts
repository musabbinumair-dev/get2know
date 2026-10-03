import { useState, useEffect } from 'react';

export interface LayoutMetrics {
  vw: number;
  vh: number;
  colW: number;
  colLeft: number;
  sx: number;
  sy: number;
  u: number;
}

/**
 * Computes responsive scaling according to the design specification:
 * - vw = viewport width, vh = viewport height (visualViewport minus safe area).
 * - sx = min(vw, 430) / 390     (horizontal: fills full screen width, no side gaps)
 * - sy = vh / 844               (vertical)
 * - u  = min(sx, sy)            (uniform size factor)
 * - App column centered if vw > 430.
 */
export function getLayoutMetrics(): LayoutMetrics {
  if (typeof window === 'undefined') {
    return {
      vw: 390,
      vh: 844,
      colW: 390,
      colLeft: 0,
      sx: 1,
      sy: 1,
      u: 1,
    };
  }

  const vv = window.visualViewport;
  const vw = vv ? vv.width : window.innerWidth;
  const vh = vv ? vv.height : window.innerHeight;

  const colW = Math.min(vw, 430);
  const colLeft = Math.max(0, (vw - colW) / 2);
  const sx = colW / 390;
  const sy = vh / 844;
  const u = Math.min(sx, sy);

  return {
    vw,
    vh,
    colW,
    colLeft,
    sx,
    sy,
    u,
  };
}

export function useLayoutMapping(): LayoutMetrics {
  const [metrics, setMetrics] = useState<LayoutMetrics>(getLayoutMetrics);

  useEffect(() => {
    const handleResize = () => {
      setMetrics(getLayoutMetrics());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return metrics;
}
