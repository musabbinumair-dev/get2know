import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSession } from '../services/gameSessionContext';
import { useSession } from '../services/sessionContext';
import { triggerHaptic } from '../utils/haptics';

export interface ReactionParticle {
  id: string;
  emojiChar: string;
  x: number;
  drift: number;
  rot: number;
  size: number;
  duration: number;
  delay: number;
}

const REACTION_EMOJIS = [
  { id: 'smile', file: '/assets/reveal/emoji-smile.webp', alt: 'Smile', emoji: '😊' },
  { id: 'heart', file: '/assets/reveal/emoji-heart.webp', alt: 'Heart', emoji: '❤️' },
  { id: 'laugh', file: '/assets/reveal/emoji-laugh.webp', alt: 'Laugh', emoji: '😂' },
  { id: 'surprised', file: '/assets/reveal/emoji-surprised.webp', alt: 'Surprised', emoji: '😮' },
  { id: 'smirk', file: '/assets/reveal/emoji-smirk.webp', alt: 'Smirk', emoji: '😏' },
  { id: 'cry', file: '/assets/reveal/emoji-cry.webp', alt: 'Cry', emoji: '😭' },
];

export const FinalResultScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    mode,
    myScore,
    friendScore,
    totalRounds,
    matchesCount,
    streak,
    history,
    restartGame,
    exitGame,
  } = useGameSession();

  const { profile } = useSession();
  const [toastMessage, setToastMessage] = useState<string>('');
  const [particles, setParticles] = useState<ReactionParticle[]>([]);
  const [activeReaction, setActiveReaction] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_selected_reaction') || 'heart';
    }
    return 'heart';
  });
  const [heldEmojiId, setHeldEmojiId] = useState<string | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync background color with Reveal pastel pink #F5CCE2
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.backgroundColor = '#F5CCE2';
    document.documentElement.style.backgroundColor = '#F5CCE2';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // Player 1 (Me) details
  const myName = profile?.name && profile.name !== 'Player 1' ? profile.name : 'Alex';
  const myAvatarId = profile?.avatarId ?? 1;
  const p1AvatarSrc = `/assets/avatars/avatar-${myAvatarId}.png`;

  // Player 2 (Friend) details
  const friendData = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partner_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            name: parsed.name && parsed.name !== 'Alex' ? parsed.name : 'Sam',
            avatarId: parsed.avatarId ?? 2,
          };
        } catch {}
      }
    }
    return { name: 'Sam', avatarId: 2 };
  }, []);
  const p2AvatarSrc = `/assets/avatars/avatar-${friendData.avatarId}.png`;

  const isKnowMe = mode === 'Know Me';
  const effectiveTotalRounds = totalRounds > 0 ? totalRounds : Math.max(10, history.length);

  // Score & Outcome calculation
  const p1Score = myScore > 0 || history.length > 0 ? myScore : 80;
  const p2Score = friendScore > 0 || history.length > 0 ? friendScore : 65;
  const isTie = p1Score === p2Score;
  const isMeWinner = p1Score > p2Score;

  // Starburst text
  const starburstText = useMemo(() => {
    if (isKnowMe) {
      return { line1: 'In', line2: 'sync!' };
    }
    if (isTie) {
      return { line1: 'Tie!', line2: '' };
    }
    if (isMeWinner) {
      return { line1: 'You', line2: 'won!' };
    }
    return { line1: 'They', line2: 'won!' };
  }, [isKnowMe, isTie, isMeWinner]);

  // Sync Percentage for Know Me mode
  const syncPercentage = useMemo(() => {
    if (effectiveTotalRounds <= 0) return 80;
    const raw = Math.round((matchesCount / effectiveTotalRounds) * 100);
    return Math.min(100, Math.max(0, raw || 86));
  }, [matchesCount, effectiveTotalRounds]);

  // Dynamic correct count from real gameplay history
  const correctCount = useMemo(() => {
    if (history.length > 0) {
      return history.filter((h) => h.isCorrect).length;
    }
    return 7;
  }, [history]);

  // Best category calculation for Know Me
  const bestCategory = useMemo(() => {
    if (history.length > 0) {
      const catCount: Record<string, number> = {};
      history.forEach((h) => {
        const cat = (h as any).category || 'Food';
        if (h.isMatched || h.isCorrect) {
          catCount[cat] = (catCount[cat] || 0) + 1;
        }
      });
      const entries = Object.entries(catCount);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
      }
    }
    return 'Food';
  }, [history]);

  // Round by round chart bars - only completed rounds dynamically
  const roundBars = useMemo(() => {
    if (history.length > 0) {
      return history.map((h, i) => {
        const p1Correct = h.isCorrect ?? false;
        const p2Correct = isKnowMe
          ? (h.isMatched ?? false)
          : ((h as any).friendIsCorrect ?? (h.isCorrect ? i % 2 === 0 : true));
        return {
          round: h.round || i + 1,
          pH: p1Correct ? 34 : 10,
          bH: p2Correct ? 34 : 10,
        };
      });
    }
    // Fallback if accessed directly with empty history
    return [
      { round: 1, pH: 34, bH: 10 },
      { round: 2, pH: 10, bH: 34 },
      { round: 3, pH: 34, bH: 34 },
      { round: 4, pH: 34, bH: 10 },
      { round: 5, pH: 10, bH: 34 },
    ];
  }, [history, isKnowMe]);

  // Instagram-style floating reaction particles
  const spawnParticle = useCallback((emojiChar: string, originX?: number) => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
    const startX = originX !== undefined ? originX : screenWidth / 2 + (Math.random() - 0.5) * 80;
    const drift = (Math.random() - 0.5) * 120;
    const rot = (Math.random() - 0.5) * 45;
    const size = Math.floor(Math.random() * 16) + 32;
    const duration = 2.4 + Math.random() * 0.8;
    const delay = Math.random() * 80;

    const newParticle: ReactionParticle = {
      id: `p-${Date.now()}-${Math.random()}`,
      emojiChar,
      x: startX,
      drift,
      rot,
      size,
      duration,
      delay,
    };

    setParticles((prev) => [...prev.slice(-25), newParticle]);
  }, []);

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handlePointerDown = (e: React.PointerEvent, emojiId: string) => {
    triggerHaptic(15);
    setActiveReaction(emojiId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reveal_selected_reaction', emojiId);
      localStorage.setItem('gty_latest_reaction', emojiId);
    }
    const matched = REACTION_EMOJIS.find((r) => r.id === emojiId);
    const char = matched?.emoji || '❤️';
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    spawnParticle(char, centerX);
    setHeldEmojiId(emojiId);

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      triggerHaptic(10);
      spawnParticle(char, centerX);
    }, 200);
  };

  const handlePointerUp = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHeldEmojiId(null);
  };

  const handleRematch = () => {
    triggerHaptic(20);
    restartGame();
  };

  const handleSaveToMemoryWall = () => {
    triggerHaptic(30);
    const chosenReaction = activeReaction || 'heart';
    if (typeof window !== 'undefined') {
      try {
        const savedCardsStr = localStorage.getItem('game_memory_cards');
        const cards = savedCardsStr ? JSON.parse(savedCardsStr) : [];
        const newCard = {
          id: `card-${Date.now()}`,
          category: isKnowMe ? 'Know Me' : 'Trivia',
          color: isKnowMe ? 'pink' : 'yellow',
          cardBg: '#E0ECB5',
          date: 'TODAY',
          question: `Completed ${effectiveTotalRounds} rounds of ${isKnowMe ? 'Know Me' : 'Trivia'}!`,
          isMatched: true,
          matched: true,
          p1Name: myName,
          p1AvatarId: myAvatarId,
          p1Color: profile?.color || 'salmon',
          p1Answer: `${p1Score} pts`,
          p2Name: friendData.name,
          p2AvatarId: friendData.avatarId,
          p2Color: 'teal',
          p2Answer: `${p2Score} pts`,
          reactions: [
            {
              emoji: chosenReaction,
              count: 1,
            },
          ],
        };
        localStorage.setItem('game_memory_cards', JSON.stringify([newCard, ...cards]));
      } catch {}
    }
    setToastMessage('Saved to Memory Wall! ✨');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleBackHome = () => {
    triggerHaptic(10);
    exitGame();
    navigate('/home');
  };

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#F5CCE2] select-none font-['Nunito',sans-serif] overflow-hidden flex flex-col justify-between"
      style={{ backgroundColor: '#F5CCE2' }}
    >
      <style>{`
        @media (max-height: 720px) {
          .final-chart-section {
            display: none !important;
          }
          .final-player-blob-box {
            max-width: 130px !important;
          }
          .final-stat-box {
            max-width: 78px !important;
          }
        }
        @media (max-height: 640px) {
          .final-emoji-row-section {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating Instagram-style Particle Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] overflow-hidden select-none"
        aria-hidden="true"
      >
        {particles.map((p) => (
          <span
            key={p.id}
            onAnimationEnd={() => removeParticle(p.id)}
            className="ig-reaction-particle select-none pointer-events-none"
            style={
              {
                '--x': `${p.x}px`,
                '--drift': `${p.drift}px`,
                '--rot': `${p.rot}deg`,
                '--size': `${p.size}px`,
                '--dur': `${p.duration}s`,
                animationDelay: `${p.delay}ms`,
              } as React.CSSProperties
            }
          >
            {p.emojiChar}
          </span>
        ))}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1B1D20] text-white px-5 py-2.5 rounded-full font-black text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Fixed Viewport Corner Decorations (reused from Reveal) */}
      <img
        src="/assets/reveal/crescent-yellow.webp"
        alt=""
        className="fixed -top-1 -left-1 w-[42px] h-[46px] sm:w-[50px] sm:h-[54px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/assets/reveal/heart-pink-small.webp"
        alt=""
        className="fixed -top-1 -right-1 w-[46px] h-[44px] sm:w-[54px] sm:h-[52px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/assets/reveal/deco-bottom-left.webp"
        alt=""
        className="fixed -bottom-2 -left-2 w-[44px] h-[42px] sm:w-[50px] sm:h-[48px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/assets/reveal/cross-olive.webp"
        alt=""
        className="fixed -bottom-2 -right-2 w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Main Single-Screen Responsive Stage */}
      <div className="relative z-10 w-full max-w-[390px] mx-auto h-full flex flex-col justify-between items-center px-5 pt-3 pb-3 overflow-hidden">
        {/* 1. Shared TopBar: Back button on left, "Results" in center */}
        <div className="w-full h-[40px] flex items-center justify-between select-none z-20 flex-shrink-0">
          <button
            type="button"
            onClick={handleBackHome}
            aria-label="Back"
            className="w-[36px] h-[36px] rounded-full border-[1.6px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 active:scale-95 transition-all cursor-pointer focus:outline-none"
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
          <h1 className="text-[21px] sm:text-[23px] font-black text-[#17181B] leading-none tracking-tight">
            Results
          </h1>
          <div className="w-[36px]" />
        </div>

        {/* 2. Small Tag Pill: "Trivia · 10 rounds" (or "Know Me · 10 rounds") */}
        <div className="flex items-center justify-center my-0.5 z-10 flex-shrink-0">
          <div className="rounded-full bg-[#FED982] px-3.5 py-1 flex items-center justify-center shadow-2xs">
            <span className="font-extrabold text-[13px] sm:text-[14px] text-[#1B1D20] tracking-tight leading-none">
              {isKnowMe ? 'Know Me' : 'Trivia'} · {effectiveTotalRounds} rounds
            </span>
          </div>
        </div>

        {/* 3. Two Player Blobs (Pink + Blue) + Reveal Starburst in center */}
        <div className="relative w-full flex items-center justify-between my-0.5 z-10 flex-shrink-0">
          {/* Left Player: Pink Blob (Me) */}
          <div
            className={`final-player-blob-box relative w-[47%] max-w-[155px] aspect-[456/468] flex flex-col items-center justify-center p-2 transition-transform duration-200 ${
              !isTie && !isKnowMe && isMeWinner ? 'scale-105 z-15' : 'scale-100 z-10'
            }`}
          >
            <img
              src="/assets/reveal/card-blob-pink.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1">
              <img
                src={p1AvatarSrc}
                alt={myName}
                className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] object-contain mb-1 flex-shrink-0"
                draggable={false}
              />
              <span className="text-[14px] sm:text-[15px] font-black text-[#1B1D20] tracking-tight leading-tight truncate max-w-[110px]">
                {myName}
              </span>
              <div className="text-[17px] sm:text-[19px] font-black text-[#1B1D20] leading-none mt-0.5">
                {p1Score}
                <span className="text-[11px] font-bold text-[#1B1D20]/60 ml-0.5">pts</span>
              </div>
            </div>
          </div>

          {/* Center Starburst: "You won!" / "They won!" / "Tie!" (Know Me: "In sync!") */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] sm:w-[84px] aspect-square z-20 pointer-events-none select-none flex items-center justify-center">
            <img
              src="/assets/reveal/match-starburst.webp"
              alt=""
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 pt-0.5 text-[#1B1D20]">
              <span className="text-[12px] sm:text-[13px] font-black leading-[1.05] tracking-tight">
                {starburstText.line1}
              </span>
              {starburstText.line2 && (
                <span className="text-[12px] sm:text-[13px] font-black leading-[1.05] tracking-tight">
                  {starburstText.line2}
                </span>
              )}
            </div>
          </div>

          {/* Right Player: Blue Blob (Friend) */}
          <div
            className={`final-player-blob-box relative w-[47%] max-w-[155px] aspect-[456/468] flex flex-col items-center justify-center p-2 transition-transform duration-200 ${
              !isTie && !isKnowMe && !isMeWinner ? 'scale-105 z-15' : 'scale-100 z-10'
            }`}
          >
            <img
              src="/assets/reveal/card-blob-blue.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1">
              <img
                src={p2AvatarSrc}
                alt={friendData.name}
                className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] object-contain mb-1 flex-shrink-0"
                draggable={false}
              />
              <span className="text-[14px] sm:text-[15px] font-black text-[#1B1D20] tracking-tight leading-tight truncate max-w-[110px]">
                {friendData.name}
              </span>
              <div className="text-[17px] sm:text-[19px] font-black text-[#1B1D20] leading-none mt-0.5">
                {p2Score}
                <span className="text-[11px] font-bold text-[#1B1D20]/60 ml-0.5">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Score Block styled like Scores sync score */}
        <div className="w-full flex flex-col items-center select-none my-0.5 z-10 flex-shrink-0">
          <p className="text-[12px] sm:text-[13px] font-bold text-[#17181B]/55 tracking-tight leading-none mb-0.5">
            {isKnowMe ? 'Sync score' : 'Final score'}
          </p>
          <div className="flex items-center justify-center">
            <span className="text-[32px] sm:text-[38px] font-black text-[#17181B] leading-none tracking-[-0.03em] select-none">
              {isKnowMe ? `${syncPercentage}%` : `${p1Score} - ${p2Score}`}
            </span>
          </div>
          <p className="text-[12px] sm:text-[13px] font-semibold text-[#17181B]/55 tracking-tight text-center leading-none mt-0.5">
            {isKnowMe
              ? `You matched ${matchesCount} of ${effectiveTotalRounds}`
              : 'Great game, you two'}
          </p>
        </div>

        {/* 5. Three Stat Blobs using Scores shapes (starburst, drop, cross) */}
        <div className="w-full max-w-[340px] mx-auto grid grid-cols-3 gap-2 my-0.5 z-10 flex-shrink-0">
          {/* Stat 1: Trivia -> Correct (7/10) | Know Me -> Matches */}
          <div className="flex flex-col items-center">
            <div className="final-stat-box relative w-full aspect-square max-w-[86px] sm:max-w-[92px] flex items-center justify-center">
              <img
                src="/assets/scores/stat-teardrop-blue-matches.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />
              <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none pt-1">
                <span className="text-[20px] sm:text-[23px] font-black text-[#17181B] leading-none tracking-tight">
                  {isKnowMe ? matchesCount : `${correctCount}/${effectiveTotalRounds}`}
                </span>
              </div>
            </div>
            <span className="text-[11.5px] sm:text-[12.5px] font-bold text-[#17181B]/55 mt-0.5 tracking-tight leading-none text-center">
              {isKnowMe ? 'Matches' : 'Correct'}
            </span>
          </div>

          {/* Stat 2: Trivia -> Streak | Know Me -> Best category */}
          <div className="flex flex-col items-center">
            <div className="final-stat-box relative w-full aspect-square max-w-[86px] sm:max-w-[92px] flex items-center justify-center">
              <img
                src={
                  isKnowMe
                    ? '/assets/scores/stat-cross-olive-guess-wins.webp'
                    : '/assets/scores/stat-starburst-yellow-streak.webp'
                }
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />
              <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none">
                <span className="text-[18px] sm:text-[22px] font-black text-[#17181B] leading-none tracking-tight truncate max-w-[68px] text-center">
                  {isKnowMe ? bestCategory : streak || 12}
                </span>
                {!isKnowMe && (
                  <span className="text-[10px] font-extrabold text-[#17181B] leading-none mt-0.5">
                    days
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11.5px] sm:text-[12.5px] font-bold text-[#17181B]/55 mt-0.5 tracking-tight leading-none text-center">
              {isKnowMe ? 'Best category' : 'Streak'}
            </span>
          </div>

          {/* Stat 3: Trivia -> Streak Badge | Know Me -> Streak */}
          <div className="flex flex-col items-center">
            <div className="final-stat-box relative w-full aspect-square max-w-[86px] sm:max-w-[92px] flex items-center justify-center">
              <img
                src={
                  isKnowMe
                    ? '/assets/scores/stat-starburst-yellow-streak.webp'
                    : '/assets/scores/stat-cross-olive-guess-wins.webp'
                }
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />
              <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none">
                <span className="text-[19px] sm:text-[22px] font-black text-[#17181B] leading-none tracking-tight">
                  {isKnowMe ? streak || 12 : p1Score > 0 ? '+15' : '0'}
                </span>
                {isKnowMe && (
                  <span className="text-[10px] font-extrabold text-[#17181B] leading-none mt-0.5">
                    days
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11.5px] sm:text-[12.5px] font-bold text-[#17181B]/55 mt-0.5 tracking-tight leading-none text-center">
              {isKnowMe ? 'Streak' : 'Points/win'}
            </span>
          </div>
        </div>

        {/* 6. Chart "Round by round" (Auto-hidden on short screens) */}
        <div className="final-chart-section w-full max-w-[340px] mx-auto my-0.5 z-10 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] sm:text-[16px] font-black text-[#17181B] tracking-tight leading-none">
              Round by round
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#FCA0D1]" />
                <span className="text-[10.5px] font-bold text-[#17181B]/70">{myName}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#8EAFFD]" />
                <span className="text-[10.5px] font-bold text-[#17181B]/70">
                  {friendData.name}
                </span>
              </div>
            </div>
          </div>

          {/* Bar Pairs */}
          <div className="w-full flex items-end justify-between px-1 h-[48px] sm:h-[54px] border-b border-[#17181B]/10 pb-0.5">
            {roundBars.map((b) => (
              <div key={b.round} className="flex flex-col items-center gap-0.5">
                <div className="flex items-end gap-1">
                  <div
                    style={{ height: `${b.pH}px` }}
                    className="w-[8px] sm:w-[9px] bg-[#FCA0D1] rounded-full transition-all"
                  />
                  <div
                    style={{ height: `${b.bH}px` }}
                    className="w-[8px] sm:w-[9px] bg-[#8EAFFD] rounded-full transition-all"
                  />
                </div>
                <span className="text-[9.5px] font-bold text-[#17181B]/50 tracking-wider">
                  R{b.round}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Emoji Reaction Row from Reveal */}
        <div
          className="final-emoji-row-section w-full flex items-center justify-between px-1 my-0.5 z-10 relative flex-shrink-0"
          onContextMenu={(e) => e.preventDefault()}
        >
          {REACTION_EMOJIS.map((emoji) => {
            const isSelected = activeReaction === emoji.id;
            const isHeld = heldEmojiId === emoji.id;

            return (
              <div key={emoji.id} className="relative flex items-center justify-center">
                <button
                  type="button"
                  onPointerDown={(e) => handlePointerDown(e, emoji.id)}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => e.preventDefault()}
                  aria-label={emoji.alt}
                  aria-pressed={isSelected}
                  className={`w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out focus:outline-none p-0 bg-transparent select-none touch-manipulation ${
                    isSelected
                      ? 'border-[#1B1D20] bg-white/40'
                      : 'border-[#1B1D20]/45 hover:border-[#1B1D20]/75'
                  } ${isHeld ? 'scale-[0.92]' : isSelected ? 'scale-105' : 'scale-100 hover:scale-105'}`}
                >
                  <img
                    src={emoji.file}
                    alt={emoji.alt}
                    className={`w-[23px] h-[23px] sm:w-[25px] sm:h-[25px] object-contain pointer-events-none select-none transition-transform duration-150 ${
                      isSelected ? 'scale-110' : ''
                    }`}
                    draggable={false}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* 8. Action Buttons: Black pill "Rematch", Black pill with bookmark icon "Save to memory wall", Underlined link "Back to home" */}
        <div className="w-full flex flex-col gap-2 pt-1 z-10 flex-shrink-0">
          {/* Button 1: Rematch */}
          <button
            type="button"
            onClick={handleRematch}
            className="btn-press w-full h-[46px] sm:h-[50px] rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-extrabold text-[15.5px] sm:text-[16.5px] tracking-tight flex items-center justify-center cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform"
          >
            <span>Rematch</span>
          </button>

          {/* Button 2: Save to memory wall */}
          <button
            type="button"
            onClick={handleSaveToMemoryWall}
            className="btn-press w-full h-[46px] sm:h-[50px] rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-extrabold text-[15.5px] sm:text-[16.5px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Save to memory wall</span>
          </button>

          {/* Link: Back to home */}
          <button
            type="button"
            onClick={handleBackHome}
            className="text-[13.5px] sm:text-[14px] font-bold underline text-[#17181B]/70 hover:text-[#17181B] active:opacity-75 transition-colors cursor-pointer text-center py-0.5"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
