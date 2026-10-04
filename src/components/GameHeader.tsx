import React from 'react';

export interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  timer?: number;
  showTimer?: boolean;
  showBack?: boolean;
  onExit?: () => void;
  showLogo?: boolean;
  onLogoClick?: () => void;
  showSettings?: boolean;
  onOpenSettings?: () => void;
  rightElement?: React.ReactNode;
  isTimerActive?: boolean;
  timerOff?: boolean;
  roundPillPosition?: 'center' | 'right';
  className?: string;
  theme?: 'blue' | 'yellow' | 'cream' | 'light';
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentRound = 1,
  totalRounds = 10,
  timer = 15,
  showTimer = true,
  showBack = false,
  onExit,
  showLogo = true,
  onLogoClick,
  showSettings = false,
  onOpenSettings,
  rightElement,
  isTimerActive,
  timerOff,
  roundPillPosition = 'center',
  className = '',
}) => {
  // Check if timer is configured as "Off" in settings or props
  const isSettingOff = (() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('gty_game_settings');
        if (s) {
          const parsed = JSON.parse(s);
          if (parsed.timer === 'Off') return true;
        }
      } catch {}
    }
    return false;
  })();

  const isTimerOff =
    timerOff === true ||
    timer < 0 ||
    isSettingOff ||
    (isTimerActive === false && timer === 0);

  const isUrgent = !isTimerOff && timer <= 5 && timer > 0;
  const isExpired = !isTimerOff && timer === 0;

  const roundPill = (
    <div className="h-[34px] px-4 rounded-full bg-[#17181B] text-white flex items-center justify-center gap-1.5 shadow-sm font-['Nunito',sans-serif] tracking-tight select-none">
      <span className="text-[12px] font-bold text-white/60 uppercase tracking-wider">Round</span>
      <span className="text-[15px] font-black text-white">
        {currentRound} <span className="text-white/40 font-semibold">/</span> {totalRounds}
      </span>
    </div>
  );

  return (
    <div
      className={`relative w-full max-w-[390px] mx-auto h-[48px] flex items-center justify-between px-5 select-none z-30 flex-shrink-0 ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Left Slot: Back button OR Exact Duo Logo from Home page */}
      <div className="min-w-[58px] h-[42px] flex items-center justify-start flex-shrink-0">
        {showBack ? (
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit Game"
            className="w-[36px] h-[36px] sm:w-[38px] sm:h-[38px] rounded-full border-[1.6px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 active:scale-95 transition-all cursor-pointer focus:outline-none"
            title="Leave Game"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#17181B"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : showLogo ? (
          <div
            onClick={onLogoClick}
            className={`flex items-center justify-center ${onLogoClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
          >
            <img
              src="/logo-duo-sparks.webp"
              alt="Duo"
              className="w-[58px] h-[23px] object-contain pointer-events-none select-none"
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-[58px] h-[42px]" />
        )}
      </div>

      {/* Center Slot: Round Counter Pill (when roundPillPosition is 'center') */}
      {roundPillPosition === 'center' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
          <div className="pointer-events-auto">
            {roundPill}
          </div>
        </div>
      )}

      {/* Right Slot: Round Counter Pill (when roundPillPosition is 'right'), Settings Gear, Timer Chip, or rightElement */}
      <div className="min-w-[58px] h-[42px] flex items-center justify-end flex-shrink-0">
        {roundPillPosition === 'right' ? (
          roundPill
        ) : rightElement ? (
          rightElement
        ) : showSettings ? (
          /* Exact Settings Gear Icon & Button from Scores Screen */
          <button
            type="button"
            onClick={onOpenSettings}
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        ) : showTimer ? (
          /* Timer Chip with exact Google Login bg color #EBE2CD from Welcome Screen and Timer Icon (always present, including Off) */
          <div
            className={`h-[34px] min-w-[64px] px-2.5 rounded-full flex items-center justify-center gap-1.5 shadow-xs font-['Nunito',sans-serif] transition-colors select-none ${
              isTimerOff
                ? 'bg-[#EBE2CD] text-[#17181B]'
                : isExpired
                ? 'bg-[#E13B3B] text-white'
                : isUrgent
                ? 'bg-[#FF4D4D] text-white animate-pulse'
                : 'bg-[#EBE2CD] text-[#17181B]'
            }`}
            title={isTimerOff ? 'No time limit (Timer Off)' : `${timer} seconds remaining`}
          >
            {/* Clock / Timer Icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isUrgent ? 'animate-spin' : ''}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[14px] font-black leading-none tracking-tight">
              {isTimerOff ? 'Off' : `${timer}s`}
            </span>
          </div>
        ) : (
          <div className="w-[58px] h-[42px]" />
        )}
      </div>
    </div>
  );
};
