import React, { useState } from 'react';

export type NavTab = 'home' | 'scores' | 'memory' | 'profile' | 'today' | 'guess';

interface BottomNavProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onPlusClick?: () => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab = 'home',
  onTabChange,
  onPlusClick,
  className = '',
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState<boolean>(false);

  const isHomeActive = activeTab === 'home' || activeTab === 'today';
  const isScoresActive = activeTab === 'scores';
  const isMemoryActive = activeTab === 'memory';
  const isProfileActive = activeTab === 'profile';

  const handlePlusClick = () => {
    if (onPlusClick) {
      onPlusClick();
    } else {
      setShowPlusMenu((prev) => !prev);
    }
  };

  return (
    <div className={`w-full max-w-[377px] mx-auto h-[60px] relative flex-shrink-0 z-30 select-none ${className}`}>
      {/* Quick Actions Sheet Modal if opened */}
      {showPlusMenu && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute bottom-[72px] left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-[#1C1F23] text-white p-4 rounded-[28px] shadow-2xl z-40 border border-white/10 animate-pop"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="font-extrabold text-[15px] text-[#FDD960]">
              Quick Actions
            </span>
            <button
              type="button"
              onClick={() => setShowPlusMenu(false)}
              className="text-white/60 hover:text-white text-[18px] leading-none px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPlusMenu(false);
                onTabChange?.('home');
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[16px] bg-white/5 hover:bg-white/10 text-left transition-colors cursor-pointer"
            >
              <span className="text-[17px]">🎮</span>
              <span className="text-[14px] font-bold">Start New Game</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPlusMenu(false);
                onTabChange?.('memory');
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[16px] bg-white/5 hover:bg-white/10 text-left transition-colors cursor-pointer"
            >
              <span className="text-[17px]">✨</span>
              <span className="text-[14px] font-bold">View Memory Wall</span>
            </button>
          </div>
        </div>
      )}

      {/* 50px Ink Notch Circle behind pink plus circle */}
      <div
        className="absolute rounded-full bg-[#1C1F23] pointer-events-none z-10"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          top: '-11px',
          width: '50px',
          height: '50px',
        }}
      />

      {/* Pink 43px "+" Circle centered in notch */}
      <button
        type="button"
        onClick={handlePlusClick}
        aria-label="Quick Actions"
        className="btn-press absolute rounded-full bg-[#F9A2CE] flex items-center justify-center text-[#1C1F23] shadow-none outline-none cursor-pointer z-20 transition-transform hover:scale-105 active:scale-95"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          top: '-7.5px',
          width: '43px',
          height: '43px',
        }}
      >
        {/* Plus Icon: 20x20 */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1C1F23"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Black Capsule Body: 377x60 rounded-full #1C1F23 */}
      <div className="w-full h-full bg-[#1C1F23] rounded-full flex items-center justify-between px-2 relative z-0">
        
        {/* Left Tabs (1st: Home, 2nd: Scores) */}
        <div className="flex items-center justify-around flex-1 h-full pr-5">
          {/* 1st Tab: Home */}
          <button
            type="button"
            onClick={() => onTabChange?.('home')}
            aria-label="Home"
            className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none py-1"
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isHomeActive ? '#FFFFFF' : '#A5A5AD'}
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V9.5z" />
                <polyline points="9 21 9 12 15 12 15 21" />
              </svg>
            </div>
            <span
              className={`text-[11px] font-bold leading-none mt-[3px] select-none ${
                isHomeActive ? 'text-white' : 'text-[#A5A5AD]'
              }`}
            >
              Home
            </span>
            <div className="h-[3px] mt-[3px] flex items-center justify-center w-full">
              <div
                className={`h-[3px] rounded-full transition-all ${
                  isHomeActive ? 'w-[21px] bg-[#FDD960]' : 'w-0 bg-transparent'
                }`}
              />
            </div>
          </button>

          {/* 2nd Tab: Scores */}
          <button
            type="button"
            onClick={() => onTabChange?.('scores')}
            aria-label="Scores"
            className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none py-1"
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isScoresActive ? '#FFFFFF' : '#A5A5AD'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
                <path d="M18 4H6v7a6 6 0 0 0 12 0V4z" />
              </svg>
            </div>
            <span
              className={`text-[11px] font-bold leading-none mt-[3px] select-none ${
                isScoresActive ? 'text-white' : 'text-[#A5A5AD]'
              }`}
            >
              Scores
            </span>
            <div className="h-[3px] mt-[3px] flex items-center justify-center w-full">
              <div
                className={`h-[3px] rounded-full transition-all ${
                  isScoresActive ? 'w-[21px] bg-[#FDD960]' : 'w-0 bg-transparent'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Center Clearance for Pink Button */}
        <div className="w-[46px] flex-shrink-0" />

        {/* Right Tabs (3rd: Memory, 4th: Profile) */}
        <div className="flex items-center justify-around flex-1 h-full pl-5">
          {/* 3rd Tab: Memory */}
          <button
            type="button"
            onClick={() => onTabChange?.('memory')}
            aria-label="Memory"
            className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none py-1"
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isMemoryActive ? '#FFFFFF' : '#A5A5AD'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill={isMemoryActive ? '#FFFFFF' : '#A5A5AD'} />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span
              className={`text-[11px] font-bold leading-none mt-[3px] select-none whitespace-nowrap ${
                isMemoryActive ? 'text-white' : 'text-[#A5A5AD]'
              }`}
            >
              Memory
            </span>
            <div className="h-[3px] mt-[3px] flex items-center justify-center w-full">
              <div
                className={`h-[3px] rounded-full transition-all ${
                  isMemoryActive ? 'w-[21px] bg-[#FDD960]' : 'w-0 bg-transparent'
                }`}
              />
            </div>
          </button>

          {/* 4th Tab: Profile */}
          <button
            type="button"
            onClick={() => onTabChange?.('profile')}
            aria-label="Profile"
            className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none py-1"
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isProfileActive ? '#FFFFFF' : '#A5A5AD'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span
              className={`text-[11px] font-bold leading-none mt-[3px] select-none whitespace-nowrap ${
                isProfileActive ? 'text-white' : 'text-[#A5A5AD]'
              }`}
            >
              Profile
            </span>
            <div className="h-[3px] mt-[3px] flex items-center justify-center w-full">
              <div
                className={`h-[3px] rounded-full transition-all ${
                  isProfileActive ? 'w-[21px] bg-[#FDD960]' : 'w-0 bg-transparent'
                }`}
              />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
