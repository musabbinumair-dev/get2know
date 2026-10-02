import React, { useState, useEffect, useRef } from 'react';
import { PillButton } from '../components/PillButton';
import { colors, dimensions, typography } from '../styles/tokens';

export interface SpecBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX?: number;
  centerY?: number;
  anchor?: 'left' | 'right' | 'center';
}

export const layoutSpec: Record<string, SpecBox> = {
  stage: { x: 0, y: 0, width: 390, height: 844 },

  // Decorative PNGs & Hero Images (heights follow each PNG's natural aspect ratio)
  crescentYellowTop: { x: 10, y: 29, width: 71, height: 84.7, anchor: 'left' },
  heartPinkRight: { x: 311, y: 24, width: 79, height: 83.2, anchor: 'right' },
  starburstBlueRight: { x: 333, y: 144, width: 57, height: 75.2, anchor: 'right' },
  heroPair: { x: 26, y: 215, width: 343, height: 175.5, centerX: 197.5, anchor: 'center' },
  logoDuo: { x: 163, y: 71, width: 65, height: 23.5, centerX: 195.5, anchor: 'center' },
  starburstBlueLeft: { x: 3, y: 523, width: 75, height: 75, anchor: 'left' },
  crossOlive: { x: 304, y: 540, width: 67, height: 67, anchor: 'right' },
  heartPinkLeft: { x: 0, y: 640, width: 69, height: 63.4, anchor: 'left' },
  crescentYellowBottom: { x: 329, y: 654, width: 60, height: 71.6, anchor: 'right' },

  // Text & Button
  wordmark: { x: 129, y: 96, width: 132, height: 16, centerX: 195, centerY: 104, anchor: 'center' },
  title: { x: 27, y: 414, width: 341, height: 40, centerX: 197.5, centerY: 434, anchor: 'center' },
  tagline: { x: 66, y: 469, width: 258, height: 22, centerX: 195, centerY: 480, anchor: 'center' },
  getStartedButton: {
    x: 48,
    y: 713,
    width: 294,
    height: 53,
    centerX: 195,
    centerY: 739.5,
    anchor: 'center',
  },
  joinLine: { x: 120, y: 776, width: 150, height: 18, centerX: 195, centerY: 785, anchor: 'center' },
};

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onJoinCode?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onJoinCode,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: dimensions.mobileWidth, height: dimensions.mobileHeight };
  });

  useEffect(() => {
    const updateSize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // On mobile (< 640px), fill the full mobile screen (100vw x 100dvh) with zero scrolling.
  // On larger desktop viewports, constrain to a mobile frame that fits within 100dvh.
  const isDesktop = viewport.width >= 640;
  const stageHeight = isDesktop ? Math.min(dimensions.mobileHeight, viewport.height) : viewport.height;
  const stageWidth = isDesktop
    ? Math.min(430, Math.round(stageHeight * (dimensions.mobileWidth / dimensions.mobileHeight)))
    : viewport.width;

  const scaleX = stageWidth / dimensions.mobileWidth;
  const scaleY = stageHeight / dimensions.mobileHeight;
  const s = Math.min(scaleX, scaleY);

  // Dev-mode self-check: verify elements against layoutSpec
  useEffect(() => {
    const isDev =
      typeof window !== 'undefined' &&
      ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV ?? true);
    if (!isDev) return;

    const timer = setTimeout(() => {
      const stageEl = stageRef.current;
      if (!stageEl) return;
      const stageRect = stageEl.getBoundingClientRect();
      const sx = stageRect.width / dimensions.mobileWidth || 1;
      const sy = stageRect.height / dimensions.mobileHeight || 1;
      const su = Math.min(sx, sy);
      const diffs: string[] = [];

      for (const [key, spec] of Object.entries(layoutSpec)) {
        const el =
          key === 'stage'
            ? stageEl
            : (stageEl.querySelector(`[data-spec="${key}"]`) as HTMLElement | null);
        if (!el) {
          diffs.push(`[layoutSpec] Missing element for key "${key}"`);
          continue;
        }
        if (key === 'stage') continue;

        const rect = el.getBoundingClientRect();
        const actualY = (rect.top - stageRect.top) / sy;
        const actualW = rect.width / su;
        const actualH = rect.height / su;

        let expectedLeftPx = spec.x * sx;
        if (spec.anchor === 'left') {
          expectedLeftPx = spec.x * su;
        } else if (spec.anchor === 'right') {
          expectedLeftPx = stageRect.width - (dimensions.mobileWidth - spec.x) * su;
        } else {
          const cx = spec.centerX ?? spec.x + spec.width / 2;
          expectedLeftPx = stageRect.width / 2 + (cx - dimensions.mobileWidth / 2) * su - (spec.width * su) / 2;
        }
        const actualLeftPx = rect.left - stageRect.left;

        const dx = Math.abs(actualLeftPx - expectedLeftPx) / su;
        const dy = Math.abs(actualY - spec.y);
        const dw = Math.abs(actualW - spec.width);
        const dh = Math.abs(actualH - spec.height);

        if (dx > 2 || dy > 2 || dw > 2 || dh > 2) {
          diffs.push(
            `${key}: expected (${spec.x}, ${spec.y}, ${spec.width}x${spec.height}), off by (${dx.toFixed(
              1
            )}, ${dy.toFixed(1)}, ${dw.toFixed(1)}x${dh.toFixed(1)})`
          );
        }
      }

      if (diffs.length > 0) {
        console.warn('[WelcomeScreen layoutSpec] Elements > 2px off:\n' + diffs.join('\n'));
      } else {
        console.log('[WelcomeScreen layoutSpec] All elements within 2px of layoutSpec.');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [stageWidth, stageHeight]);

  const computeLeft = (spec: SpecBox): number => {
    if (spec.anchor === 'left') {
      return spec.x * s;
    }
    if (spec.anchor === 'right') {
      return stageWidth - (dimensions.mobileWidth - spec.x) * s;
    }
    const cx = spec.centerX ?? spec.x + spec.width / 2;
    return stageWidth / 2 + (cx - dimensions.mobileWidth / 2) * s - (spec.width * s) / 2;
  };

  const boxStyle = (spec: SpecBox): React.CSSProperties => ({
    position: 'absolute',
    left: `${computeLeft(spec)}px`,
    top: `${spec.y * scaleY}px`,
    width: `${spec.width * s}px`,
    height: `${spec.height * s}px`,
  });

  const imgStyle = (spec: SpecBox): React.CSSProperties => ({
    position: 'absolute',
    left: `${computeLeft(spec)}px`,
    top: `${spec.y * scaleY}px`,
    width: `${spec.width * s}px`,
    height: 'auto',
    maxWidth: 'none',
    display: 'block',
  });

  return (
    <div
      className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex items-center justify-center select-none"
      style={{
        backgroundColor: '#FAF6E9',
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Responsive unscrollable mobile stage */}
      <div
        ref={stageRef}
        data-spec="stage"
        className="relative overflow-hidden select-none font-nunito"
        style={{
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
          backgroundColor: '#FAF6E9',
        }}
      >
        {/* ---------------- DECORATIVE & HERO PNG ASSETS ---------------- */}

        {/* crescent-yellow-top: x 10, y 29, width 71 */}
        <img
          data-spec="crescentYellowTop"
          src="/assets/welcome/crescent-yellow-top.png"
          alt=""
          style={imgStyle(layoutSpec.crescentYellowTop)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* heart-pink-right: x 311, y 24, width 79 (runs off the right edge) */}
        <img
          data-spec="heartPinkRight"
          src="/assets/welcome/heart-pink-right.png"
          alt=""
          style={imgStyle(layoutSpec.heartPinkRight)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* logo-duo: x 163, y 71, width 65 */}
        <img
          data-spec="logoDuo"
          src="/assets/welcome/logo-duo.png"
          alt="Get-to-Know-You logo"
          style={imgStyle(layoutSpec.logoDuo)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* starburst-blue-right: x 333, y 144, width 57 (runs off the right edge) */}
        <img
          data-spec="starburstBlueRight"
          src="/assets/welcome/starburst-blue-right.png"
          alt=""
          style={imgStyle(layoutSpec.starburstBlueRight)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* hero-pair: x 26, y 215, width 343 */}
        <img
          data-spec="heroPair"
          src="/assets/welcome/hero-pair.png"
          alt="Two friends"
          style={imgStyle(layoutSpec.heroPair)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* starburst-blue-left: x 3, y 523, width 75 */}
        <img
          data-spec="starburstBlueLeft"
          src="/assets/welcome/starburst-blue-left.png"
          alt=""
          style={imgStyle(layoutSpec.starburstBlueLeft)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* cross-olive: x 304, y 540, width 67 */}
        <img
          data-spec="crossOlive"
          src="/assets/welcome/cross-olive.png"
          alt=""
          style={imgStyle(layoutSpec.crossOlive)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* heart-pink-left: x 0, y 640, width 69 (runs off the left edge) */}
        <img
          data-spec="heartPinkLeft"
          src="/assets/welcome/heart-pink-left.png"
          alt=""
          style={imgStyle(layoutSpec.heartPinkLeft)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* crescent-yellow-bottom: x 329, y 654, width 60 (runs off the right edge) */}
        <img
          data-spec="crescentYellowBottom"
          src="/assets/welcome/crescent-yellow-bottom.png"
          alt=""
          style={imgStyle(layoutSpec.crescentYellowBottom)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* ---------------- TEXT AND BUTTON ---------------- */}

        {/* Wordmark "Get-to-Know-You": centered at x 195, y 104 to 112, Nunito 800, about 15px, ink #1B1D20 */}
        <div
          data-spec="wordmark"
          className="flex items-center justify-center whitespace-nowrap select-none z-20"
          style={{
            ...boxStyle(layoutSpec.wordmark),
            fontWeight: typography.weights.question,
            fontSize: `${15.2 * s}px`,
            lineHeight: `${16 * s}px`,
            letterSpacing: '-0.02em',
            color: '#1B1D20',
          }}
        >
          Get-to-Know-You
        </div>

        {/* Title "Get-to-Know-You": x 27 to 368 (341px wide), y 414 to 454, Nunito 900, ink, one line */}
        <h1
          data-spec="title"
          className="m-0 flex items-center justify-center whitespace-nowrap select-none z-20"
          style={{
            ...boxStyle(layoutSpec.title),
            fontWeight: typography.weights.hero,
            fontSize: `${42.5 * s}px`,
            lineHeight: `${40 * s}px`,
            letterSpacing: '-0.028em',
            color: '#1B1D20',
          }}
        >
          Get-to-Know-You
        </h1>

        {/* Tagline "Two friends. One question a day.": x 66 to 324, vertical center y 480, Nunito 600, about 19px, muted gray */}
        <p
          data-spec="tagline"
          className="m-0 flex items-center justify-center whitespace-nowrap select-none z-20"
          style={{
            ...boxStyle(layoutSpec.tagline),
            fontWeight: typography.weights.label,
            fontSize: `${18.5 * s}px`,
            lineHeight: `${22 * s}px`,
            letterSpacing: '-0.015em',
            color: '#75767C',
          }}
        >
          Two friends. One question a day.
        </p>

        {/* Button "Get started": black pill x 48, y 713, 294x53, white Nunito 700 text, about 19px */}
        <PillButton
          data-spec="getStartedButton"
          variant="black"
          onClick={onGetStarted}
          style={{
            ...boxStyle(layoutSpec.getStartedButton),
            fontWeight: typography.weights.button,
            fontSize: `${19 * s}px`,
            letterSpacing: '-0.015em',
            backgroundColor: '#191B20',
            color: '#FFFFFF',
          }}
          className="p-0 z-20 cursor-pointer focus:outline-none"
        >
          Get started
        </PillButton>

        {/* "Already have a code? Join": centered at x 195, y 785, Nunito 500, 13px, muted, with "Join" underlined */}
        <div
          data-spec="joinLine"
          className="flex items-center justify-center whitespace-nowrap select-none z-20"
          style={{
            ...boxStyle(layoutSpec.joinLine),
            fontWeight: typography.weights.tiny,
            fontSize: `${13 * s}px`,
            lineHeight: `${18 * s}px`,
            letterSpacing: '-0.01em',
            color: colors.mutedGray,
          }}
        >
          <span>Already have a code?&nbsp;</span>
          <button
            type="button"
            onClick={onJoinCode}
            style={{
              fontSize: `${13 * s}px`,
              lineHeight: `${18 * s}px`,
              color: colors.mutedGray,
            }}
            className="bg-transparent border-0 p-0 m-0 font-medium underline underline-offset-[2px] cursor-pointer focus:outline-none hover:text-[#1B1D20] transition-colors"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
