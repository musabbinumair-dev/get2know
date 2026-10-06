import React from 'react';
import { LoaderTheme } from '../lib/preload';

export interface AppLoaderProps {
  /** Background theme variant matching the page destination */
  theme?: LoaderTheme;
  /** Explicit background color hex matching the destination page */
  bg?: string;
  /** Whether the loader has entered the 'taking longer' state */
  isTakingLonger?: boolean;
  /** Custom subtext message override */
  message?: string;
  /** Callback when user clicks 'Try again' button */
  onRetry?: () => void;
  /** Additional custom class names */
  className?: string;
  /** Whether the loader is currently fading out */
  isFadingOut?: boolean;
  /** Fullscreen fixed overlay (true) or container-relative (false) */
  fullScreen?: boolean;
}

export const THEME_DOT_CONFIGS: Record<
  LoaderTheme,
  {
    defaultBg: string;
    dots: [string, string, string]; // [dot1 (pink/alt), dot2 (blue/alt), dot3 (yellow/alt)]
  }
> = {
  cream: {
    defaultBg: '#F8F1E1',
    dots: ['#F9A6D2', '#9DBDFD', '#FEDF6B'],
  },
  blue: {
    defaultBg: '#96B9FC',
    dots: ['#F9A6D2', '#F6EFDD', '#FEDF6B'], // blue dot replaced with cream
  },
  pink: {
    defaultBg: '#F7C8E2',
    dots: ['#F6EFDD', '#9DBDFD', '#FEDF6B'], // pink dot replaced with cream
  },
  yellow: {
    defaultBg: '#FEE36F',
    dots: ['#F9A6D2', '#9DBDFD', '#F6EFDD'], // yellow dot replaced with cream
  },
  olive: {
    defaultBg: '#9BAE6F',
    dots: ['#F9A6D2', '#9DBDFD', '#FEDF6B'],
  },
};

export const AppLoader: React.FC<AppLoaderProps> = ({
  theme = 'cream',
  bg,
  isTakingLonger = false,
  message,
  onRetry,
  className = '',
  isFadingOut = false,
  fullScreen = true,
}) => {
  const dotConfig = THEME_DOT_CONFIGS[theme] || THEME_DOT_CONFIGS.cream;
  const resolvedBg = bg || dotConfig.defaultBg;
  const dotColors = dotConfig.dots;

  const defaultSubtext = isTakingLonger ? 'Still working on it…' : 'Getting things ready…';
  const displaySubtext = message || defaultSubtext;

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[99999] w-full h-full min-h-[100dvh]'
    : 'relative w-full h-full min-h-[360px]';

  return (
    <div
      style={{
        backgroundColor: resolvedBg,
        position: fullScreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      className={`${containerClasses} flex flex-col items-center justify-center text-center select-none overflow-hidden font-['Nunito',sans-serif] transition-opacity duration-200 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      } ${className}`}
    >
      {/* Centered Composition: Calm, lots of empty space, zero corner decorations */}
      <div className="flex flex-col items-center justify-center text-center w-full max-w-[390px] md:max-w-[480px] mx-auto px-6 my-auto">
        
        {/* Dashed Circle (104px mobile, 130px desktop) with 3 bouncing dots inside */}
        <div className="relative w-[104px] h-[104px] md:w-[130px] md:h-[130px] flex items-center justify-center">
          
          {/* Dashed Circle Outline: 1.5px ink, rotates 360deg every 8s (motion disabled if prefers-reduced-motion) */}
          <svg
            className="absolute inset-0 w-full h-full animate-[loaderRingSpin_8s_linear_infinite] motion-reduce:animate-none pointer-events-none"
            viewBox="0 0 104 104"
            fill="none"
          >
            <circle
              cx="52"
              cy="52"
              r="50"
              stroke="#17181B"
              strokeWidth="1.5"
              strokeDasharray="5.5 4.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Three bouncing dots: 16px mobile, 20px desktop */}
          <div className="flex items-center justify-center gap-[10px] md:gap-[13px] z-10">
            {/* Dot 1 (Starts slightly up) */}
            <div
              className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] rounded-full animate-[dotWaveBounce_900ms_ease-in-out_infinite] motion-reduce:animate-none"
              style={{
                backgroundColor: dotColors[0],
                animationDelay: '0ms',
              }}
            />
            {/* Dot 2 (Center) */}
            <div
              className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] rounded-full animate-[dotWaveBounce_900ms_ease-in-out_infinite] motion-reduce:animate-none"
              style={{
                backgroundColor: dotColors[1],
                animationDelay: '150ms',
              }}
            />
            {/* Dot 3 (Starts slightly down) */}
            <div
              className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] rounded-full animate-[dotWaveBounce_900ms_ease-in-out_infinite] motion-reduce:animate-none"
              style={{
                backgroundColor: dotColors[2],
                animationDelay: '300ms',
              }}
            />
          </div>
        </div>

        {/* Wordmark (28px gap under ring, Nunito 900, 28px mobile, 38px desktop, ink #17181B) */}
        <h1 className="mt-[28px] md:mt-[34px] text-[28px] md:text-[38px] font-[900] text-[#17181B] tracking-[-0.02em] leading-tight text-center">
          Get-to-Know-You
        </h1>

        {/* Gray Line (8px gap under wordmark, Nunito 700, 15px mobile, 18px desktop, ink at 55%) */}
        <p className="mt-[8px] md:mt-[10px] text-[15px] md:text-[18px] font-[700] text-[#17181B]/55 tracking-[-0.01em] text-center">
          {displaySubtext}
        </p>

        {/* 'Taking longer' button: 32px under gray line, Nunito 800, 18px, ~140px wide, 44px tall, black pill */}
        {isTakingLonger && (
          <button
            type="button"
            onClick={onRetry || (() => window.location.reload())}
            className="mt-[32px] md:mt-[38px] w-[140px] md:w-[160px] h-[44px] md:h-[50px] rounded-full bg-[#17181B] text-white font-[800] text-[18px] md:text-[20px] tracking-[-0.01em] flex items-center justify-center cursor-pointer transition-transform active:scale-95 focus:outline-none"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default AppLoader;
