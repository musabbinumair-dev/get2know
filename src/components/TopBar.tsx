import React from 'react';

export interface TopBarProps {
  mode?: 'streak' | 'rounds';
  streak?: number;
  currentRound?: number;
  totalRounds?: number;
  onSettingsClick?: () => void;
  onOpenSettings?: () => void;
  onLeftClick?: () => void;
  onOpenFriendProfile?: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode = 'streak',
  streak = 12,
  currentRound = 1,
  totalRounds = 10,
  onSettingsClick,
  onOpenSettings,
  onLeftClick,
  onOpenFriendProfile,
  className = '',
}) => {
  const handleSettings = onSettingsClick || onOpenSettings;
  const handleFriendProfile = onLeftClick || onOpenFriendProfile;

  return (
    <div
      className={`relative w-full max-w-[390px] mx-auto h-[68px] select-none z-20 flex-shrink-0 ${className}`}
    >
      {/* Left: Duo Logo Asset (tappable -> Friend Profile) */}
      <button
        type="button"
        onClick={handleFriendProfile}
        aria-label="Friend Profile"
        className="btn-press absolute top-[34px] left-[19.7px] w-[58.1px] h-[22.9px] cursor-pointer flex items-center justify-center p-0 z-20 outline-none transition-transform active:scale-95"
      >
        <img
          id="logo-duo"
          src="/logo-duo-sparks.webp"
          alt="Duo"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </button>

      {/* Center: Rounds Pill or Streak Pill */}
      {mode === 'rounds' ? (
        <div
          id="box-rounds-pill"
          className="absolute top-[29px] left-1/2 -translate-x-1/2 h-[33.3px] px-3.5 rounded-full bg-[#191D21] flex items-center justify-center gap-1.5 z-20 shadow-sm pointer-events-none whitespace-nowrap"
        >
          <span className="font-bold text-white/60 text-[13px] uppercase tracking-wider">
            Round
          </span>
          <span className="font-black text-white text-[16px] leading-none tracking-tight">
            {currentRound}{' '}
            <span className="text-white/40 font-normal">/</span>{' '}
            {totalRounds}
          </span>
        </div>
      ) : (
        <div
          id="box-streak-pill"
          className="absolute top-[29px] left-1/2 -translate-x-1/2 w-[70.8px] h-[33.3px] rounded-full bg-[#191D21] flex items-center justify-center z-20 shadow-sm pointer-events-none"
        >
          <div className="flex items-center gap-1.5 pl-0.5">
            <img
              src="/icon-flame.webp"
              alt=""
              className="w-[18.3px] h-[21.9px] object-contain pointer-events-none select-none"
              draggable={false}
            />
            <span className="text-white font-black text-[19px] leading-none tracking-tight">
              {streak}
            </span>
          </div>
        </div>
      )}

      {/* Right: Settings Gear Button (Pristine 8-tooth gear SVG) */}
      <button
        type="button"
        id="box-settings-btn"
        onClick={handleSettings}
        aria-label="Settings"
        className="btn-press absolute top-[28.5px] right-[19.7px] w-[38px] h-[38px] rounded-full border-[1.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#17181B"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
};
