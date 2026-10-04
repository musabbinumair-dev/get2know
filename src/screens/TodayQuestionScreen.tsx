import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { BottomNav, NavTab } from '../components/BottomNav';
import { TopBar } from '../components/TopBar';
import { GameHeader } from '../components/GameHeader';
import { UserProfile } from './CreateProfileScreen';
import { QuestionData } from '../data/gameData';
import { useGameSession } from '../services/gameSessionContext';

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
  userProfile: _userProfile = { avatarId: 1, name: 'Player 1', color: 'salmon' },
  questionData,
  streak = 12,
  onOpenSettings,
  onNavigateTab,
  onLockInSuccess,
  onShuffleQuestion,
}) => {
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  const currentQuestionText = isInGame
    ? gameSession.currentQuestion.question
    : questionData?.question || "What’s a fear you’d never tell anyone?";

  const [answer, setAnswer] = useState<string>(() => {
    return localStorage.getItem('today_answer') || questionData?.player1DefaultAnswer || '';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('today_answer_locked') === 'true';
  });
  const [showLockedToast, setShowLockedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const maxChars = 200;

  // Clear answer on new round in game
  useEffect(() => {
    if (isInGame) {
      setAnswer('');
      setIsLocked(false);
      setShowLockedToast(false);
    }
  }, [isInGame, gameSession.currentRound]);

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
    const finalAnswer = answer.trim() || 'My secret answer';
    setIsLocked(true);
    setShowLockedToast(true);

    if (isInGame) {
      setTimeout(() => {
        gameSession.submitAnswer(finalAnswer);
      }, 400);
    } else {
      localStorage.setItem('today_answer_locked', 'true');
      if (questionData) {
        localStorage.setItem(`today_answer_${questionData.id}`, finalAnswer);
      }
      setTimeout(() => {
        onLockInSuccess?.(finalAnswer);
      }, 450);
    }
  };

  // Auto-submit when timer expires in game
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (isInGame && gameSession.isTimerActive && gameSession.timer === 0 && !hasAutoSubmitted.current && !isLocked) {
      hasAutoSubmitted.current = true;
      handleLockIn();
    }
  }, [isInGame, gameSession.isTimerActive, gameSession.timer, isLocked]);

  useEffect(() => {
    hasAutoSubmitted.current = false;
  }, [gameSession.currentRound]);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    onNavigateTab?.(tab);
  };

  return (
    <Screen bg="#FEE273" className="h-[100dvh] sm:h-[844px]">
      {/* ---------------- DECORATIVE BACKGROUND BLOBS ---------------- */}
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

      <div
        className="absolute top-[64px] -right-[28px] pointer-events-none select-none z-0 opacity-75"
        style={{ width: '74px', height: '74px' }}
      >
        <img
          src="/assets/blobs/starburst-blue-join.svg"
          alt=""
          className="w-full h-full object-contain rotate-[10deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

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
      <div className={`relative z-10 flex flex-col justify-between h-full overflow-y-auto overflow-x-hidden ${isInGame ? 'pt-4 pb-6' : 'pt-9 pb-[84px]'} select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
        <div>
          {/* Top Bar: GameHeader when in game, else standard TopBar */}
          {isInGame ? (
            <GameHeader
              showLogo={true}
              roundPillPosition="center"
              currentRound={gameSession.currentRound}
              totalRounds={gameSession.totalRounds}
              timer={gameSession.timer}
              isTimerActive={gameSession.isTimerActive}
              showTimer={true}
              showBack={false}
              onExit={gameSession.exitGame}
            />
          ) : (
            <TopBar streak={streak} onSettingsClick={onOpenSettings} />
          )}

          <div className="px-7 sm:px-8 mt-2">
            {/* Question Heading Section */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-[17.5px] sm:text-[18.5px] font-bold text-[#4E5244] tracking-tight">
                  {isInGame ? 'Tell about yourself' : `Today’s question ${questionData?.category ? `· ${questionData.category}` : ''}`}
                </h2>
                {!isInGame && onShuffleQuestion && (
                  <button
                    type="button"
                    onClick={onShuffleQuestion}
                    className="text-[13px] font-extrabold text-[#1A1C22]/70 hover:text-[#1A1C22] flex items-center gap-1 cursor-pointer bg-white/40 px-2.5 py-1 rounded-full active:scale-95 transition-all shadow-none"
                  >
                    <span>🎲</span> Shuffle
                  </button>
                )}
              </div>
              {/* Responsive Question Heading */}
              {(() => {
                const qLen = currentQuestionText.length;
                const qHeadingFontClass =
                  qLen > 75
                    ? 'text-[20px] sm:text-[23px] leading-[1.2]'
                    : qLen > 48
                    ? 'text-[24px] sm:text-[28px] leading-[1.16]'
                    : 'text-[28px] sm:text-[34px] leading-[1.12]';
                return (
                  <h1 className={`mt-2 ${qHeadingFontClass} font-black text-[#1A1C22] tracking-[-0.03em] font-['Nunito',sans-serif] pr-3 sm:pr-4 break-words`}>
                    {currentQuestionText}
                  </h1>
                );
              })()}
            </div>

            {/* Cream Textarea Card */}
            <div className="mt-5 relative w-full max-w-[342px] mx-auto bg-[#FAF6EB] rounded-[34px] p-6 flex flex-col justify-between min-h-[178px] shadow-sm border border-[#1A1C22]/5">
              <textarea
                value={answer}
                onChange={handleTextChange}
                disabled={isLocked}
                placeholder="Type your answer..."
                rows={4}
                className="w-full bg-transparent resize-none border-none outline-none font-medium text-[19px] sm:text-[21px] text-[#1A1C22] placeholder:text-[#1A1C22]/30 leading-[1.3] font-['Nunito',sans-serif]"
                autoFocus={!isLocked}
              />

              {/* Character counter & lock status */}
              <div className="flex justify-between items-center text-[13px] font-bold text-[#1A1C22]/40 pt-2 border-t border-[#1A1C22]/10">
                <span>{answer.length}/{maxChars}</span>
                {answer.trim().length > 0 && !isLocked && (
                  <span className="text-[#1A1C22]/70 font-semibold">Ready to lock in</span>
                )}
              </div>
            </div>

            {/* Privacy info note */}
            <div className="mt-4 flex items-center justify-center gap-2.5 text-center max-w-[320px] mx-auto">
              <div className="w-[26px] h-[26px] rounded-full bg-[#FAF6EB] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A1C22"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-[14px] font-bold text-[#4E5244] leading-[1.25]">
                {isLocked
                  ? "Locked! Friend will guess your answer."
                  : 'Your friend will have to guess what you wrote.'}
              </p>
            </div>

            {/* Primary Action Button: Lock in my answer */}
            <div className="mt-5 w-full max-w-[342px] mx-auto">
              <PillButton
                variant="black"
                onClick={handleLockIn}
                disabled={!answer.trim() && !isInGame}
                className={`w-full h-[54px] text-[17.5px] font-black tracking-tight shadow-sm transition-all ${
                  isLocked
                    ? 'bg-[#1A1C22] opacity-90 cursor-default'
                    : answer.trim() || isInGame
                    ? 'hover:bg-[#2A2C34] cursor-pointer active:scale-98'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isLocked ? 'Answer locked! 🔒' : 'Lock in my answer'}
              </PillButton>
            </div>

            {/* Feedback message when locked */}
            {showLockedToast && (
              <p className="mt-2 text-center text-[13px] font-extrabold text-[#1A1C22]/80 animate-pop">
                Saved! Waiting for friend... ✨
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Dock (Hidden during gameplay) */}
      {!isInGame && (
        <div className="absolute bottom-0 left-0 right-0 pb-1 z-30 pointer-events-auto">
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} className="mb-1" />
        </div>
      )}
    </Screen>
  );
};
