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
    <div className="relative w-full max-w-[390px] mx-auto h-[36px] flex items-center justify-between px-[17px] select-none z-20 flex-shrink-0">
      {/* Left: logo-duo (57x27) */}
      <img
        src="/assets/waiting/logo-duo.png"
        alt="Duo"
        className="w-[57px] h-[27px] object-contain pointer-events-none select-none"
        draggable={false}
      />

      {/* Center: Streak Pill (68x33) with streak-flame (16x21) + streak number */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[68px] h-[33px] rounded-full bg-[#1C1F23] flex items-center justify-center gap-[4px] select-none pointer-events-none">
        <img
          src="/assets/waiting/streak-flame.png"
          alt=""
          className="w-[16px] h-[21px] object-contain pointer-events-none select-none"
          draggable={false}
        />
        <span className="font-extrabold text-white text-[16.5px] leading-none tracking-[-0.02em] select-none">
          {streak}
        </span>
      </div>

      {/* Right: Settings Gear Button (36x36) */}
      <button
        type="button"
        onClick={onSettingsClick}
        aria-label="Settings"
        className="btn-press w-[36px] h-[36px] rounded-full border-[1.5px] border-dashed border-[#1C1F23]/75 flex items-center justify-center bg-transparent hover:bg-[#1C1F23]/5 transition-colors cursor-pointer focus:outline-none"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1C1F23"
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
