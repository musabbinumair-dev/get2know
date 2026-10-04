import React from 'react';

interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  timer?: number;
  showTimer?: boolean;
  onExit?: () => void;
  className?: string;
  theme?: 'blue' | 'yellow' | 'cream' | 'light';
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentRound = 1,
  totalRounds = 10,
  timer = 15,
  showTimer = true,
  onExit,
  className = '',
}) => {
  const isUrgent = timer <= 5 && timer > 0;
  const isExpired = timer === 0;

  return (
    <div
      className={`relative w-full max-w-[390px] mx-auto h-[48px] flex items-center justify-between px-5 select-none z-30 flex-shrink-0 ${className}`}
    >
      {/* Left: Back / Exit circle button */}
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit Game"
        className="w-[36px] h-[36px] rounded-full border-[1.6px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 active:scale-95 transition-all cursor-pointer focus:outline-none"
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

      {/* Center: Round Counter Pill ("1 / 10") */}
      <div
        className="h-[32px] px-4 rounded-full bg-[#17181B] text-white flex items-center justify-center gap-1.5 shadow-sm font-['Nunito',sans-serif] tracking-tight"
      >
        <span className="text-[12px] font-bold text-white/60 uppercase tracking-wider">Round</span>
        <span className="text-[15px] font-black text-white">
          {currentRound} <span className="text-white/40 font-semibold">/</span> {totalRounds}
        </span>
      </div>

      {/* Right: Timer Chip (⏱ 15s) */}
      {showTimer ? (
        <div
          className={`h-[34px] min-w-[68px] px-2.5 rounded-full flex items-center justify-center gap-1.5 shadow-sm font-['Nunito',sans-serif] transition-colors ${
            isExpired
              ? 'bg-[#E13B3B] text-white'
              : isUrgent
              ? 'bg-[#FF4D4D] text-white animate-pulse'
              : 'bg-[#FAF6EA] text-[#17181B] border-[1.5px] border-[#17181B]'
          }`}
          title={`${timer} seconds remaining`}
        >
          {/* Clock Icon */}
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
          <span className="text-[14px] font-black leading-none">{timer}s</span>
        </div>
      ) : (
        <div className="w-[36px]" />
      )}
    </div>
  );
};
