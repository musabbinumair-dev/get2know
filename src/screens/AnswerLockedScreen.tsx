import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSession } from '../services/gameSessionContext';
import { GameHeader } from '../components/GameHeader';
import { NavTab } from '../components/BottomNav';

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
  onOpenSettings: _onOpenSettings,
  onPlayer2Answered,
}) => {
  const navigate = useNavigate();
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  const currentRound = isInGame ? gameSession.currentRound : 1;
  const totalRounds = isInGame ? gameSession.totalRounds : 10;

  const [toastMessage, setToastMessage] = useState<string>('');
  const [nudgeCooldown, setNudgeCooldown] = useState<number>(0);
  const [friendStatus, setFriendStatus] = useState<string>('Answering...');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  const simulationTimers = useRef<NodeJS.Timeout[]>([]);

  // Cleanup simulation timers on unmount
  useEffect(() => {
    return () => {
      simulationTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Set background color on mount
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FAF6EA';
    document.documentElement.style.backgroundColor = '#FAF6EA';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Manual simulation for partner response (not automatic)
  const handleSimulatePartnerAnswer = () => {
    if (isSimulating || isAnswerLocked) return;
    setIsSimulating(true);
    setFriendStatus(`${resolvedFriendName} is answering...`);
    setToastMessage(`Simulating ${resolvedFriendName}'s response...`);

    // Step 1: Partner locks in their answer
    const t1 = setTimeout(() => {
      setIsAnswerLocked(true);
      setFriendStatus('Answer locked in! 🎉');
      setToastMessage(`🎉 ${resolvedFriendName} locked in their answer!`);

      // Step 2: Transition to the next screen after celebrating lock-in
      const t2 = setTimeout(() => {
        if (isInGame) {
          gameSession.advanceFromWaiting();
        } else if (onPlayer2Answered) {
          onPlayer2Answered();
        } else {
          navigate('/guess');
        }
      }, 1400);
      simulationTimers.current.push(t2);
    }, 1200);

    simulationTimers.current.push(t1);
  };

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

  const handleEditClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('today_answer_locked', 'false');
    }
    if (isInGame) {
      navigate('/today-question');
    } else if (onEditAnswer) {
      onEditAnswer();
    }
  };

  const resolvedFriendName =
    friendName && friendName !== 'Player 2'
      ? friendName
      : 'Player 2';

  return (
    <div
      className="relative w-full min-h-[100dvh] bg-[#FAF6EA] flex flex-col justify-between items-center pt-4 pb-8 select-none font-['Nunito',sans-serif] overflow-y-auto overflow-x-hidden"
      style={{
        backgroundColor: '#FAF6EA',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1B1D20] text-white px-5 py-2.5 rounded-full font-black text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ---------------- 1. TOP BAR (UNIFIED GAME HEADER - LOGO ON LEFT, ROUNDS PILL ON RIGHT) ---------------- */}
      <GameHeader
        showLogo={true}
        roundPillPosition="right"
        currentRound={currentRound}
        totalRounds={totalRounds}
        showTimer={false}
        showBack={false}
        className="mb-2"
      />

      {/* ---------------- 2. MAIN CENTER BODY ---------------- */}
      <div className="w-full max-w-[390px] px-5 flex-1 flex flex-col items-center justify-center relative z-10 py-1">
        {/* Upper Hero Lock Cluster with 3 Static Orbiting Decorations */}
        <div className="relative w-full max-w-[340px] h-[190px] sm:h-[210px] flex items-center justify-center">
          {/* Pink Heart: Top-Left (Static, no animation) */}
          <img
            src="/assets/waiting/heart-pink.webp"
            alt=""
            className="absolute left-[20px] sm:left-[26px] top-[14px] w-[58px] sm:w-[64px] h-[52px] sm:h-[58px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />

          {/* Blue Starburst: Top-Right (Static, no animation) */}
          <img
            src="/assets/waiting/starburst-blue.png"
            alt=""
            className="absolute right-[22px] sm:right-[28px] top-[10px] w-[62px] sm:w-[68px] h-[61px] sm:h-[67px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />

          {/* Olive Cross: Bottom-Right (Static, no animation) */}
          <img
            src="/assets/waiting/cross-olive.webp"
            alt=""
            className="absolute right-[26px] sm:right-[32px] bottom-[12px] w-[52px] sm:w-[58px] h-[49px] sm:h-[55px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />

          {/* Lock Hero (Yellow Blob with Padlock & Sunburst Rays) */}
          <img
            src="/assets/waiting/lock-hero.webp"
            alt="Answer locked"
            className="relative z-10 w-[184px] sm:w-[200px] h-auto object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mt-2 sm:mt-3 mb-2 flex flex-col items-center">
          <h1 className="text-[34px] sm:text-[38px] font-black text-[#1B1D20] tracking-[-0.035em] leading-tight m-0 select-none">
            Answer locked in
          </h1>
          <p className="mt-1.5 text-[17px] sm:text-[18px] font-bold text-[#1B1D20]/60 tracking-tight m-0 select-none">
            {friendStatus !== 'Answering...'
              ? friendStatus
              : `Waiting for ${resolvedFriendName}...`}
          </p>
        </div>

        {/* Waiting Avatar Ring (Static, no animation) */}
        <div className="relative w-[156px] sm:w-[172px] aspect-[462/423] flex items-center justify-center my-3 sm:my-4 select-none pointer-events-none">
          <img
            src="/assets/waiting/waiting-avatar-ring.webp"
            alt={resolvedFriendName}
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* ---------------- 3. ACTION BUTTONS & FOOTNOTE ---------------- */}
        <div className="w-full max-w-[342px] flex flex-col items-center gap-2.5 mt-3 sm:mt-5 z-20">
          {/* Little simulate link above Nudge button */}
          <button
            type="button"
            onClick={handleSimulatePartnerAnswer}
            disabled={isSimulating || isAnswerLocked}
            className="text-[12px] font-bold text-[#1B1D20]/45 hover:text-[#1B1D20] underline underline-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none bg-transparent border-none p-0"
          >
            {isSimulating
              ? isAnswerLocked
                ? 'Answer locked in! Advancing...'
                : `${resolvedFriendName} is answering...`
              : isAnswerLocked
              ? 'Answer locked in! 🎉'
              : `⚡ Simulate ${resolvedFriendName} answered`}
          </button>

          {/* Button 1: "Nudge them 👋" */}
          <button
            type="button"
            onClick={handleNudge}
            disabled={nudgeCooldown > 0 || isSimulating}
            className="w-full h-[54px] sm:h-[56px] rounded-full bg-[#1B1D20] hover:bg-[#2B2E33] active:scale-[0.98] transition-all text-white font-black text-[18px] sm:text-[19px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-sm focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
          >
            <span>{nudgeCooldown > 0 ? `Nudged (${nudgeCooldown}s)` : 'Nudge them'}</span>
            <span className="text-[20px] leading-none">👋</span>
          </button>

          {/* Button 2: "Edit answer" */}
          <button
            type="button"
            onClick={handleEditClick}
            disabled={isSimulating}
            className="w-full h-[54px] sm:h-[56px] rounded-full bg-[#FAF3DF] hover:bg-[#F2E8CD] active:scale-[0.98] transition-all text-[#1B1D20] font-black text-[18px] sm:text-[19px] tracking-tight flex items-center justify-center shadow-xs border border-[#1B1D20]/5 cursor-pointer focus:outline-none"
          >
            Edit answer
          </button>

          {/* Footnote Caption */}
          <p className="mt-0.5 text-[13.5px] sm:text-[14px] font-bold text-[#1B1D20]/50 tracking-tight text-center m-0 select-none">
            We’ll tell you when they answer.
          </p>
        </div>
      </div>

      {/* ---------------- 4. BOTTOM CORNER DECORATIONS (STATIC) ---------------- */}
      {/* Bottom-Left Yellow Crescent */}
      <img
        src="/assets/waiting/crescent-yellow.webp"
        alt=""
        className="absolute left-[2px] bottom-[16px] w-[70px] sm:w-[78px] h-[82px] sm:h-[90px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Bottom-Right Pink Heart */}
      <img
        src="/assets/waiting/heart-pink-right.webp"
        alt=""
        className="absolute -right-[6px] bottom-[20px] w-[74px] sm:w-[82px] h-[66px] sm:h-[74px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
    </div>
  );
};
