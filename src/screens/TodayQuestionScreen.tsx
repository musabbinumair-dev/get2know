import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { BottomNav, NavTab } from '../components/BottomNav';
import { TopBar } from '../components/TopBar';
import { UserProfile } from './CreateProfileScreen';
import { QuestionData, getAvatarBlobSrc, getAvatarFaceSrc } from '../data/gameData';

interface TodayQuestionScreenProps {
  userProfile?: UserProfile;
  questionData?: QuestionData;
  streak?: number;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onLockInSuccess?: (answer: string) => void;
  onShuffleQuestion?: () => void;
}

export const TodayQuestionScreen: React.FC<TodayQuestionScreenProps> = ({
  userProfile = { avatarId: 1, name: 'Player 1', color: 'salmon' },
  questionData,
  streak = 12,
  onOpenSettings,
  onNavigateTab,
  onLockInSuccess,
  onShuffleQuestion,
}) => {
  const currentQuestionText =
    questionData?.question || "What’s a fear you’d never tell anyone?";

  const [answer, setAnswer] = useState<string>(() => {
    return localStorage.getItem('today_answer') || questionData?.player1DefaultAnswer || '';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('today_answer_locked') === 'true';
  });
  const [showLockedToast, setShowLockedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('today');

  const maxChars = 200;

  // Update answer when question changes if not already locked
  useEffect(() => {
    if (!isLocked && questionData) {
      const saved = localStorage.getItem(`today_answer_${questionData.id}`);
      if (saved) {
        setAnswer(saved);
      } else {
        setAnswer(questionData.player1DefaultAnswer || '');
      }
    }
  }, [questionData?.id, isLocked]);

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
    if (questionData) {
      localStorage.setItem(`today_answer_${questionData.id}`, answer);
    }
    setShowLockedToast(true);
    setTimeout(() => {
      onLockInSuccess?.(answer);
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
          {/* Unified Top Bar: Duo Icon | Streak | Settings Gear */}
          <TopBar streak={streak} onSettingsClick={onOpenSettings} />

          <div className="px-7 sm:px-8">
            {/* Question Heading Section */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[17.5px] sm:text-[18.5px] font-bold text-[#4E5244] tracking-tight">
                  Today’s question {questionData?.category ? `· ${questionData.category}` : ''}
                </h2>
                {onShuffleQuestion && (
                  <button
                    type="button"
                    onClick={onShuffleQuestion}
                    className="text-[13px] font-extrabold text-[#1A1C22]/70 hover:text-[#1A1C22] flex items-center gap-1 cursor-pointer bg-white/40 px-2.5 py-1 rounded-full active:scale-95 transition-all shadow-none"
                  >
                    <span>🎲</span> Shuffle
                  </button>
                )}
              </div>
              <h1 className="mt-2 text-[32px] sm:text-[38px] font-black text-[#1A1C22] leading-[1.1] tracking-[-0.035em]">
                {currentQuestionText}
              </h1>
            </div>

            {/* Cream Textarea Card (rounded ~34px, comfortable padding) */}
            <div className="mt-5 relative w-full max-w-[342px] mx-auto bg-[#FAF6EB] rounded-[34px] p-6 flex flex-col justify-between min-h-[178px]">
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

            {/* Privacy Note with Dynamic Avatar and Lock Badge */}
            <div className="mt-4 flex items-center gap-3.5 w-full max-w-[342px] mx-auto px-1">
              <div
                onClick={onOpenSettings}
                className="relative w-[54px] h-[54px] flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <img
                  src={getAvatarBlobSrc(userProfile.avatarId, userProfile.color)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <img
                  src={getAvatarFaceSrc(userProfile.avatarId)}
                  alt={userProfile.name || 'You'}
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
              <p className="text-[15px] font-bold text-[#4E5244] leading-[1.25]">
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
