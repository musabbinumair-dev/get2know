import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { GameHeader } from '../components/GameHeader';
import { BottomNav, NavTab } from '../components/BottomNav';
import { useGameSession } from '../services/gameSessionContext';

interface AnswerLockedScreenProps {
  friendName?: string;
  onEditAnswer?: () => void;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onPlayer2Answered?: () => void;
}

export const AnswerLockedScreen: React.FC<AnswerLockedScreenProps> = ({
  friendName = 'Player 2',
  onEditAnswer,
  onOpenSettings,
  onNavigateTab,
  onPlayer2Answered,
}) => {
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  const [toastMessage, setToastMessage] = useState<string>('');
  const [nudgeCooldown, setNudgeCooldown] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [friendStatus, setFriendStatus] = useState<string>('Answering...');

  // Auto-advance in game after friend simulates response
  useEffect(() => {
    if (isInGame) {
      const timer1 = setTimeout(() => {
        setFriendStatus('Answer locked in! 🎉');
      }, 900);

      const timer2 = setTimeout(() => {
        gameSession.advanceFromWaiting();
      }, 1600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isInGame, gameSession]);

  // Cooldown countdown effect for Nudge button
  useEffect(() => {
    if (nudgeCooldown <= 0) return;
    const timer = setInterval(() => {
      setNudgeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [nudgeCooldown]);

  const handleNudge = () => {
    if (nudgeCooldown > 0) return;
    setToastMessage('Nudge sent 👋');
    setNudgeCooldown(30);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    onNavigateTab?.(tab);
  };

  const handleEditClick = () => {
    if (onEditAnswer) {
      localStorage.setItem('today_answer_locked', 'false');
      onEditAnswer();
    }
  };

  return (
    <Screen bg="#F6F1E2" className="h-[100dvh] sm:h-[844px]">
      {/* Simulate friend answered button (standalone mode) */}
      {!isInGame && onPlayer2Answered && (
        <button
          type="button"
          onClick={onPlayer2Answered}
          className="absolute top-1 right-2 text-[9px] leading-none font-bold text-[#1C1F23]/25 hover:text-[#1C1F23]/70 bg-transparent hover:bg-[#1C1F23]/5 px-1.5 py-0.5 rounded transition-colors cursor-pointer z-40 focus:outline-none"
        >
          Simulate friend answered
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-[74px] left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1C1F23] text-white px-5 py-2 rounded-full font-bold text-[14px] shadow-lg flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ---------------- BOTTOM DECORATIVE CORNER PNGs ---------------- */}
      <img
        src="/assets/waiting/crescent-yellow.png"
        alt=""
        className="absolute left-[3px] bottom-[80px] w-[61px] h-[71px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/assets/waiting/heart-pink-right.png"
        alt=""
        className="absolute -right-[8px] bottom-[76px] w-[66px] h-[59px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* ---------------- MAIN RESPONSIVE CONTENT ---------------- */}
      <div className={`relative z-10 flex flex-col justify-between h-full overflow-y-auto overflow-x-hidden ${isInGame ? 'pt-4 pb-6' : 'pt-9 pb-[84px]'} select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
        {/* Top Bar: GameHeader when in game */}
        {isInGame ? (
          <GameHeader
            currentRound={gameSession.currentRound}
            totalRounds={gameSession.totalRounds}
            showTimer={false}
            onExit={gameSession.exitGame}
          />
        ) : (
          <TopBar streak={12} onSettingsClick={onOpenSettings} />
        )}

        {/* Responsive Main Body */}
        <div className="flex-1 flex flex-col justify-between items-center w-full max-w-[390px] mx-auto px-6 py-2">
          {/* Upper Hero Cluster: lock-hero + heart-pink + starburst-blue + cross-olive */}
          <div className="relative w-full h-[160px] sm:h-[175px] flex items-center justify-center flex-shrink-0">
            <img
              src="/assets/waiting/heart-pink.png"
              alt=""
              className="absolute left-[4px] top-[14px] w-[58px] sm:w-[65px] h-[52px] sm:h-[58px] object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            <img
              src="/assets/waiting/starburst-blue.png"
              alt=""
              className="absolute right-[4px] top-0 w-[62px] sm:w-[69px] h-[61px] sm:h-[68px] object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            <img
              src="/assets/waiting/cross-olive.png"
              alt=""
              className="absolute right-[8px] bottom-[4px] w-[54px] sm:w-[60px] h-[51px] sm:h-[57px] object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            <img
              src="/assets/waiting/lock-hero.png"
              alt="Answer locked"
              className="relative z-10 w-[168px] sm:w-[190px] h-[126px] sm:h-[142px] object-contain pointer-events-none select-none mt-2"
              draggable={false}
            />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center flex-shrink-0">
            <h1 className="text-[34px] sm:text-[38px] font-black text-[#1C1F23] leading-[1.08] tracking-[-0.035em]">
              Answer locked in
            </h1>
            <p className="mt-1.5 text-[16.5px] sm:text-[18px] font-bold text-[#67696E] tracking-[-0.015em]">
              {isInGame ? friendStatus : `Waiting for ${friendName}...`}
            </p>
          </div>

          {/* Waiting Avatar + Pulse Ring */}
          <div className="flex items-center justify-center flex-shrink-0 my-1">
            <img
              src="/assets/waiting/waiting-avatar-ring.png"
              alt={friendName}
              className="w-[136px] sm:w-[154px] h-[125px] sm:h-[141px] object-contain pointer-events-none select-none animate-pulse-gentle"
              draggable={false}
            />
          </div>

          {/* Action Buttons & Footnote */}
          <div className="w-full max-w-[298px] sm:max-w-[316px] mx-auto flex flex-col items-center gap-2.5 flex-shrink-0">
            {!isInGame ? (
              <>
                <button
                  type="button"
                  onClick={handleNudge}
                  disabled={nudgeCooldown > 0}
                  className={`btn-press w-full h-[48px] rounded-full font-extrabold text-[17.5px] sm:text-[18px] tracking-[-0.015em] text-white flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none ${
                    nudgeCooldown > 0
                      ? 'bg-[#1C1F23]/80 cursor-not-allowed'
                      : 'bg-[#1C1F23] hover:bg-[#2A2C34]'
                  }`}
                >
                  <span>{nudgeCooldown > 0 ? `Nudged (${nudgeCooldown}s)` : 'Nudge them'}</span>
                  <span className="text-[19px] leading-none">👋</span>
                </button>

                <button
                  type="button"
                  onClick={handleEditClick}
                  className="btn-press w-full h-[48px] rounded-full font-extrabold text-[17.5px] sm:text-[18px] tracking-[-0.015em] bg-[#FBF8EE] text-[#1C1F23] hover:bg-[#F3EFE0] transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
                >
                  Edit answer
                </button>
              </>
            ) : (
              <div className="w-full py-2 flex items-center justify-center gap-2 text-[#1C1F23]/70 font-bold text-[14px]">
                <div className="w-2 h-2 rounded-full bg-[#1C1F23] animate-ping" />
                <span>Syncing game state...</span>
              </div>
            )}

            <p className="mt-1 text-[13px] sm:text-[13.5px] font-semibold text-[#7E8085] text-center tracking-[-0.01em]">
              {isInGame ? 'Ready for the reveal in a moment!' : 'We’ll tell you when they answer.'}
            </p>
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
