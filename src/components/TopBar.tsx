import React from 'react';

interface TopBarProps {
  streak?: number;
  onSettingsClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  streak = 12,
  onSettingsClick,
}) => {
  return (
    <div className="relative w-full max-w-[390px] mx-auto h-[44px] flex items-center justify-between px-7 sm:px-8 select-none z-20 flex-shrink-0">
      {/* Left: Duo People Silhouette (2 silhouettes + 4 yellow sparks) */}
      <div className="relative flex items-center justify-center w-[44px] h-[44px]">
        {/* 4 Yellow Sparks around the duo */}
        {/* Top-Left spark */}
        <div className="absolute top-[8px] left-[2px] w-[6px] h-[3px] bg-[#FED868] rounded-full rotate-[-45deg] pointer-events-none" />
        {/* Bottom-Left spark */}
        <div className="absolute bottom-[10px] left-[2px] w-[6px] h-[3px] bg-[#FED868] rounded-full rotate-[45deg] pointer-events-none" />
        {/* Top-Right spark */}
        <div className="absolute top-[8px] right-[2px] w-[6px] h-[3px] bg-[#FED868] rounded-full rotate-[45deg] pointer-events-none" />
        {/* Bottom-Right spark */}
        <div className="absolute bottom-[10px] right-[2px] w-[6px] h-[3px] bg-[#FED868] rounded-full rotate-[-45deg] pointer-events-none" />

        {/* Two Solid Black People Silhouettes */}
        <svg
          width="26"
          height="22"
          viewBox="0 0 28 24"
          fill="#1A1C22"
          className="pointer-events-none select-none"
        >
          {/* Person 1 (left) */}
          <circle cx="9" cy="7" r="4.5" />
          <path d="M1 20.5C1 16.5 4.5 14 9 14C13.5 14 17 16.5 17 20.5V22H1V20.5Z" />
          {/* Person 2 (right) */}
          <circle cx="19" cy="7" r="4.5" />
          <path d="M11 20.5C11 16.5 14.5 14 19 14C23.5 14 27 16.5 27 20.5V22H11V20.5Z" />
        </svg>
      </div>

      {/* Center: Streak Pill (68x33) with streak-flame (16x21) + streak number */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[70px] h-[34px] rounded-full bg-[#1A1C22] flex items-center justify-center gap-[5px] select-none pointer-events-none">
        <span className="text-[16px] leading-none select-none">🔥</span>
        <span className="font-extrabold text-white text-[16.5px] leading-none tracking-[-0.02em] select-none">
          {streak}
        </span>
      </div>

      {/* Right: Settings Gear Button (44x44 matching back button) */}
      <button
        type="button"
        onClick={onSettingsClick}
        aria-label="Settings"
        className="btn-press w-[44px] h-[44px] rounded-full border-[1.8px] border-dashed border-[#1B1D20] flex items-center justify-center bg-transparent hover:bg-[#1B1D20]/5 transition-colors cursor-pointer focus:outline-none"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1B1D20"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
};
