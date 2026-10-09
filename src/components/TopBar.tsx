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
      className={`relative w-full max-w-[390px] mx-auto h-[44px] px-6 sm:px-7 flex items-center justify-between select-none z-20 flex-shrink-0 ${className}`}
    >
      {/* Left: Duo Logo Asset (tappable -> Friend Profile) */}
      <button
        type="button"
        onClick={handleFriendProfile}
        aria-label="Friend Profile"
        className="btn-press cursor-pointer flex items-center justify-start p-0 outline-none transition-transform active:scale-95"
        style={{ width: '64px', height: '28px' }}
      >
        <img
          id="logo-duo"
          src="/logo-duo-sparks.webp"
          alt="Duo"
          className="w-full h-full object-contain object-left pointer-events-none select-none"
          draggable={false}
        />
      </button>

      {/* Center: Rounds Pill or Streak Pill */}
      {mode === 'rounds' ? (
        <div
          id="box-rounds-pill"
          className="h-[34px] px-3.5 rounded-full bg-[#191D21] flex items-center justify-center gap-1.5 shadow-sm pointer-events-none whitespace-nowrap"
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
          className="h-[34px] px-3.5 rounded-full bg-[#191D21] flex items-center justify-center gap-1.5 shadow-sm pointer-events-none"
        >
          <img
            src="/icon-flame.webp"
            alt=""
            className="w-[18px] h-[22px] object-contain pointer-events-none select-none"
            draggable={false}
          />
          <span className="text-white font-black text-[19px] leading-none tracking-tight">
            {streak}
          </span>
        </div>
      )}

      {/* Right: Settings Gear Button (Pristine 8-tooth gear SVG matching Scores & Memory Wall) */}
      <button
        type="button"
        id="box-settings-btn"
        onClick={handleSettings}
        aria-label="Settings"
        className="btn-press w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full border-[1.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none"
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
