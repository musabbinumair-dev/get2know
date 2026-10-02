import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { BottomNav, NavTab } from '../components/BottomNav';
import { TopBar } from '../components/TopBar';

interface TodayQuestionScreenProps {
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onLockInSuccess?: () => void;
}

export const TodayQuestionScreen: React.FC<TodayQuestionScreenProps> = ({
  onOpenSettings,
  onNavigateTab,
  onLockInSuccess,
}) => {
  const [answer, setAnswer] = useState<string>(() => {
    return localStorage.getItem('today_answer') || '';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('today_answer_locked') === 'true';
  });
  const [showLockedToast, setShowLockedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('today');

  const maxChars = 200;

  // Sync body & html background to bright warm yellow
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FEE273';
    document.documentElement.style.backgroundColor = '#FEE273';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    const text = e.target.value.slice(0, maxChars);
    setAnswer(text);
    localStorage.setItem('today_answer', text);
  };

  const handleLockIn = () => {
    if (!answer.trim()) return;
    setIsLocked(true);
    localStorage.setItem('today_answer_locked', 'true');
    setShowLockedToast(true);
    setTimeout(() => {
      onLockInSuccess?.();
    }, 450);
  };

  const handleUnlockForEdit = () => {
    setIsLocked(false);
    localStorage.setItem('today_answer_locked', 'false');
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    onNavigateTab?.(tab);
  };

  return (
    <Screen bg="#FEE273" className="h-[100dvh] sm:h-[844px]">
      {/* ---------------- DECORATIVE BACKGROUND BLOBS (MATCHING REFERENCE IMAGE) ---------------- */}

      {/* Top-Left: Pink Heart (below top bar left) */}
      <div
        className="absolute top-[102px] -left-[24px] pointer-events-none select-none z-0"
        style={{ width: '92px', height: '92px' }}
      >
        <img
          src="/assets/blobs/heart-pink-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-15deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Top-Right: Olive 4-Leaf Cross */}
      <div
        className="absolute top-[96px] right-[88px] pointer-events-none select-none z-0"
        style={{ width: '76px', height: '80px' }}
      >
        <img
          src="/assets/blobs/cross-olive-decorative.svg"
          alt=""
          className="w-full h-full object-contain rotate-[12deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Top-Right: Periwinkle Blue Starburst (peaking from right edge) */}
      <div
        className="absolute top-[128px] -right-[16px] pointer-events-none select-none z-0"
        style={{ width: '92px', height: '92px' }}
      >
        <img
          src="/assets/blobs/starburst-blue-join.svg"
          alt=""
          className="w-full h-full object-contain rotate-[10deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: Pink Heart (above bottom nav) */}
      <div
        className="absolute bottom-[98px] -left-[16px] pointer-events-none select-none z-0"
        style={{ width: '96px', height: '96px' }}
      >
        <img
          src="/assets/blobs/heart-pink-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-10deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Right: Periwinkle Blue Starburst (above bottom nav) */}
      <div
        className="absolute bottom-[108px] -right-[16px] pointer-events-none select-none z-0"
        style={{ width: '96px', height: '96px' }}
      >
        <img
          src="/assets/blobs/starburst-blue-join.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-5deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="relative z-10 flex flex-col justify-between h-full overflow-y-auto overflow-x-hidden pt-9 pb-[84px] select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div>
          {/* Unified Top Bar: Duo Icon | Streak 12 | Settings Gear */}
          <TopBar streak={12} onSettingsClick={onOpenSettings} />

          <div className="px-7 sm:px-8">
            {/* Question Heading Section */}
            <div className="mt-5">
              <h2 className="text-[17.5px] sm:text-[18.5px] font-bold text-[#4E5244] tracking-tight">
                Today’s question
              </h2>
              <h1 className="mt-2 text-[38px] sm:text-[42px] font-black text-[#1A1C22] leading-[1.08] tracking-[-0.035em]">
                What’s a fear you’d never tell anyone?
              </h1>
            </div>

            {/* Cream Textarea Card (rounded ~34px, comfortable padding) */}
            <div className="mt-6 relative w-full max-w-[342px] mx-auto bg-[#FAF6EB] rounded-[34px] p-6 flex flex-col justify-between min-h-[178px]">
              <textarea
                value={answer}
                onChange={handleTextChange}
                disabled={isLocked}
                placeholder="Type your answer..."
                rows={4}
                maxLength={maxChars}
                className={`w-full bg-transparent resize-none outline-none font-bold text-[17.5px] text-[#1A1C22] placeholder:text-[#1A1C22]/35 leading-relaxed ${
                  isLocked ? 'cursor-default opacity-85' : 'cursor-text'
                }`}
              />

              {/* Character Counter & Edit button */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#1A1C22]/5">
                {isLocked ? (
                  <button
                    type="button"
                    onClick={handleUnlockForEdit}
                    className="text-[12px] font-extrabold text-[#1A1C22]/60 hover:text-[#1A1C22] underline cursor-pointer"
                  >
                    Edit answer
                  </button>
                ) : (
                  <div />
                )}
                <span className="text-[13px] font-extrabold text-[#1A1C22]/40 tracking-tight">
                  {answer.length} / {maxChars}
                </span>
              </div>
            </div>

            {/* Privacy Note with Avatar and Lock Badge */}
            <div className="mt-4 flex items-center gap-3.5 w-full max-w-[342px] mx-auto px-1">
              {/* Avatar on Blue Blob with Lock Icon Badge */}
              <div className="relative w-[54px] h-[54px] flex items-center justify-center flex-shrink-0">
                <img
                  src="/file_00000000872c821185f1f972a55e71f3.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <img
                  src="/assets/avatars/avatar-1.png"
                  alt="You"
                  className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                  draggable={false}
                />
                {/* Black Lock Circle Badge on bottom right */}
                <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#1A1C22] flex items-center justify-center z-20">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>

              {/* Note text */}
              <p className="text-[15.5px] font-bold text-[#4E5244] leading-[1.25]">
                {isLocked
                  ? "Locked! They can't see it until you both answer."
                  : 'They can’t see it until you both answer.'}
              </p>
            </div>

            {/* Primary Action Button: Lock in my answer */}
            <div className="mt-5 w-full max-w-[342px] mx-auto">
              <PillButton
                variant="black"
                onClick={handleLockIn}
                disabled={!answer.trim()}
                className={`w-full h-[56px] text-[17.5px] font-bold tracking-tight shadow-none transition-all ${
                  isLocked
                    ? 'bg-[#1A1C22] opacity-90 cursor-default'
                    : answer.trim()
                    ? 'hover:bg-[#2A2C34] cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isLocked ? 'Answer locked! 🔒' : 'Lock in my answer'}
              </PillButton>
            </div>

            {/* Feedback message when locked */}
            {showLockedToast && (
              <p className="mt-2 text-center text-[13px] font-extrabold text-[#1A1C22]/80 animate-pop">
                Saved! Waiting for your friend’s answer ✨
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Dock */}
      <div className="absolute bottom-0 left-0 right-0 pb-1 z-30 pointer-events-auto">
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} className="mb-1" />
      </div>
    </Screen>
  );
};
