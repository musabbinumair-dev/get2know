import React from 'react';

interface TopBarProps {
  streak?: number;
  onSettingsClick?: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  streak = 12,
  onSettingsClick,
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[390px] mx-auto h-[44px] flex items-center justify-between px-6 sm:px-7 select-none z-20 flex-shrink-0 ${className}`}>
      {/* Left: Duo Logo Asset */}
      <div className="flex items-center justify-center h-[44px]">
        <img
          src="/assets/waiting/logo-duo.webp"
          alt="Get-to-Know-You"
          className="w-[58px] h-[22px] object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Center: Streak Pill (68x33) with authentic streak-flame asset + streak number */}
      <div className="absolute left-1/2 -translate-x-1/2 h-[34px] px-3.5 rounded-full bg-[#1B1D20] flex items-center justify-center gap-1.5 select-none pointer-events-none shadow-sm">
        <img
          src="/assets/waiting/streak-flame.webp"
          alt=""
          className="w-[14px] h-[19px] object-contain select-none pointer-events-none"
          draggable={false}
        />
        <span className="font-black text-white text-[16.5px] leading-none tracking-[-0.02em] select-none">
          {streak}
        </span>
      </div>

      {/* Right: Settings Gear Button (44x44 matching circular button style) */}
      <button
        type="button"
        onClick={onSettingsClick}
        aria-label="Settings"
        className="btn-press w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full border-[1.8px] border-dashed border-[#1B1D20] flex items-center justify-center bg-transparent hover:bg-[#1B1D20]/5 transition-colors cursor-pointer focus:outline-none"
      >
        <svg
          width="19"
          height="19"
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
