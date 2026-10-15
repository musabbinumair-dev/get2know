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

  // Responsive window dimensions
  const [windowDimensions, setWindowDimensions] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aspectRatio = windowDimensions.h / (windowDimensions.w || 1);
  // Use the tall mockup layout only when height/width >= 1.9 and height >= 760px
  const isTallLayout = aspectRatio >= 1.9 && windowDimensions.h >= 760;

  // Background sync
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

  // Player profiles
  const myName = profile?.name && profile.name !== 'Player 1' ? profile.name : 'Musab';
  const myAvatarId = profile?.avatarId ?? 1;
  const p1AvatarSrc = `/assets/avatars/avatar-${myAvatarId}.png`;

  const friendData = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partner_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            name: parsed.name && parsed.name !== 'Alex' ? parsed.name : 'Alex',
            avatarId: parsed.avatarId ?? 2,
          };
        } catch {}
      }
    }
    return { name: 'Alex', avatarId: 2 };
  }, []);
  const p2AvatarSrc = `/assets/avatars/avatar-${friendData.avatarId}.png`;

  const isKnowMe = mode === 'Know Me';

  // Scores
  const p1Score = myScore > 0 || history.length > 0 ? myScore : 80;
  const p2Score = friendScore > 0 || history.length > 0 ? friendScore : 65;
  const isTie = p1Score === p2Score;
  const isMeWinner = p1Score > p2Score;

  // Center burst text
  const burstText = useMemo(() => {
    if (isKnowMe) return { line1: 'In', line2: 'sync!' };
    if (isTie) return { line1: 'Tie!', line2: '' };
    if (isMeWinner) return { line1: 'You', line2: 'won!' };
    return { line1: 'They', line2: 'won!' };
  }, [isKnowMe, isTie, isMeWinner]);

  // Round by round bar chart data (show exactly the rounds actually played)
  const roundBars = useMemo(() => {
    const maxAllowed = totalRounds > 0 ? totalRounds : (history.length > 0 ? history.length : 10);

    if (history.length > 0) {
      // Deduplicate history by round number if any duplicates, and cap strictly at maxAllowed
      const uniqueMap = new Map<number, (typeof history)[0]>();
      history.forEach((h, idx) => {
        const roundNum = h.round || idx + 1;
        if (roundNum <= maxAllowed && !uniqueMap.has(roundNum) && uniqueMap.size < maxAllowed) {
          uniqueMap.set(roundNum, h);
        }
      });
      const entries = Array.from(uniqueMap.values()).slice(0, maxAllowed);

      return entries.map((h, i) => {
        const p1Correct = h.isCorrect ?? false;
        const p2Correct = isKnowMe
          ? (h.isMatched ?? false)
          : ((h as any).friendIsCorrect ?? (h.isCorrect ? i % 2 === 0 : true));
        return {
          round: i + 1, // Labels 1 to N, strictly sequential (1, 2, 3...)
          pH: p1Correct ? 94 : 44,
          bH: p2Correct ? 86 : 44,
        };
      });
    }

    // Default preview fallback if accessing page directly with no history
    const count = totalRounds > 0 ? Math.min(totalRounds, 10) : 10;
    const defaultBars = [
      { round: 1, pH: 92, bH: 58 },
      { round: 2, pH: 46, bH: 58 },
      { round: 3, pH: 92, bH: 82 },
      { round: 4, pH: 46, bH: 58 },
      { round: 5, pH: 92, bH: 82 },
      { round: 6, pH: 92, bH: 58 },
      { round: 7, pH: 96, bH: 88 },
      { round: 8, pH: 92, bH: 58 },
      { round: 9, pH: 92, bH: 82 },
      { round: 10, pH: 96, bH: 88 },
    ];
    return defaultBars.slice(0, count).map((b, i) => ({ ...b, round: i + 1 }));
  }, [history, isKnowMe, totalRounds]);

  const effectiveTotalRounds = totalRounds > 0 ? totalRounds : Math.max(roundBars.length, 5);

  // Sync Percentage for Know Me mode
  const syncPercentage = useMemo(() => {
    if (effectiveTotalRounds <= 0) return 86;
    const raw = Math.round((matchesCount / effectiveTotalRounds) * 100);
    return Math.min(100, Math.max(0, raw || 86));
  }, [matchesCount, effectiveTotalRounds]);

  // Correct rounds count
  const correctCount = useMemo(() => {
    if (history.length > 0) {
      return history.filter((h) => h.isCorrect).length;
    }
    return 7;
  }, [history]);

  // Best category for Know Me mode
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

  const showChart = isTallLayout && roundBars.length >= 2;
  const showEmojiRow = windowDimensions.h >= 620 && aspectRatio >= 1.55;

  // Design Canvas adjustments for non-tall screens
  const chartOffset = showChart ? 0 : 255;
  const emojiOffset = showEmojiRow ? 0 : 95;
  const designCanvasHeight = 1846 - chartOffset - emojiOffset;

  // Floating reactions
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

  // Determine pair positions across x=72 to 787
  const chartPairs = useMemo(() => {
    const n = roundBars.length;
    if (n === 0) return [];
    const pairWidth = 52; // 24 + 4 + 24
    const totalSpan = 715; // 787 - 72
    const gap = n > 1 ? (totalSpan - n * pairWidth) / (n - 1) : 0;
    return roundBars.map((b, idx) => {
      const leftX = 72 + idx * (pairWidth + gap);
      const centerX = leftX + pairWidth / 2;
      return {
        ...b,
        leftX,
        centerX,
      };
    });
  }, [roundBars]);

  // Stat values and font size calculation to guarantee no truncation
  const dropValue = isKnowMe ? (matchesCount || 7) : `${correctCount}/${effectiveTotalRounds}`;
  const crossValue = isKnowMe ? bestCategory : '3.2s';

  const getStatFontSize = (val: string | number) => {
    const len = String(val).length;
    if (len <= 2) return 'calc(54 * var(--u))';
    if (len === 3) return 'calc(44 * var(--u))';
    if (len === 4) return 'calc(38 * var(--u))'; // "3.2s", "7/10"
    if (len <= 6) return 'calc(30 * var(--u))';
    if (len <= 8) return 'calc(24 * var(--u))';
    return 'calc(20 * var(--u))';
  };

  // Player blob sizing (equal on tie)
  const leftBlobW = isTie ? 275 : isMeWinner ? 295 : 267;
  const leftBlobH = isTie ? 275 : isMeWinner ? 305 : 267;
  const rightBlobW = isTie ? 275 : !isMeWinner && !isTie ? 295 : 267;
  const rightBlobH = isTie ? 275 : !isMeWinner && !isTie ? 305 : 267;

  // ==========================================
  // COMPACT LAYOUT CALCULATIONS (940 x 1672)
  // ==========================================
  const showChartCompact = aspectRatio >= 1.6 && roundBars.length >= 2;
  const showEmojiRowCompact = aspectRatio >= 1.45 && windowDimensions.h >= 540;
  const chartOffsetCompact = showChartCompact ? 0 : 220;
  const emojiOffsetCompact = showEmojiRowCompact ? 0 : 90;
  const designCanvasHeightCompact = 1672 - chartOffsetCompact - emojiOffsetCompact;

  const compactChartPairs = useMemo(() => {
    const n = roundBars.length;
    if (n === 0) return [];
    const pairWidth = 48; // 22 + 4 + 22
    const totalSpan = 724; // 832 - 108
    const gap = n > 1 ? (totalSpan - n * pairWidth) / (n - 1) : 0;
    return roundBars.map((b, idx) => {
      const leftX = 108 + idx * (pairWidth + gap);
      const centerX = leftX + pairWidth / 2;
      return {
        ...b,
        leftX,
        centerX,
        compactPH: Math.round(b.pH * (94 / 115)),
        compactBH: Math.round(b.bH * (94 / 115)),
      };
    });
  }, [roundBars]);

  const getCompactStatFontSize = (val: string | number) => {
    const len = String(val).length;
    if (len <= 2) return 'calc(50 * var(--u))';
    if (len === 3) return 'calc(40 * var(--u))';
    if (len === 4) return 'calc(34 * var(--u))'; // "3.2s", "7/10"
    if (len <= 6) return 'calc(26 * var(--u))';
    if (len <= 8) return 'calc(22 * var(--u))';
    return 'calc(18 * var(--u))';
  };

  // Compact Player Blob Sizing
  const compactBlobLeftW = isTie ? 210 : isMeWinner ? 212 : 208;
  const compactBlobLeftH = isTie ? 220 : isMeWinner ? 230 : 208;
  const compactBlobLeftTop = isTie ? 310 : isMeWinner ? 300 : 315;

  const compactBlobRightW = isTie ? 210 : !isMeWinner && !isTie ? 212 : 208;
  const compactBlobRightH = isTie ? 220 : !isMeWinner && !isTie ? 230 : 208;
  const compactBlobRightTop = isTie ? 310 : !isMeWinner && !isTie ? 300 : 320;

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#F5CCE2] select-none font-['Nunito',sans-serif] overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#F5CCE2' }}
    >
      {/* 5. Fixed Corner Decorations (TALL layout) */}
      <div className="results-decorations-tall fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/assets/blobs/heart-pink.svg"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ top: '-1.5vw', left: '-1.5vw', width: '14vw' }}
          draggable={false}
        />
        <img
          src="/assets/blobs/starburst-blue.svg"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ top: '-1.5vw', right: '-1.5vw', width: '15vw' }}
          draggable={false}
        />
        <img
          src="/deco-crescent-yellow-bottom-right.webp"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ bottom: '-1.5vw', left: '-1.5vw', width: '14vw' }}
          draggable={false}
        />
        <img
          src="/deco-cross-olive-bottom-left.webp"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ bottom: '-1.5vw', right: '-1.5vw', width: '14vw' }}
          draggable={false}
        />
      </div>

      {/* Fixed Corner Decorations (COMPACT layout) */}
      <div className="results-decorations-compact fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/assets/blobs/heart-pink.svg"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ left: '0vw', top: '1vw', width: '10.5vw' }}
          draggable={false}
        />
        <img
          src="/assets/blobs/starburst-blue.svg"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ right: '0vw', top: '1.6vw', width: '15vw' }}
          draggable={false}
        />
        <img
          src="/deco-crescent-yellow-bottom-right.webp"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ left: '1.5vw', bottom: '4.5vw', width: '10.5vw' }}
          draggable={false}
        />
        <img
          src="/deco-cross-olive-bottom-left.webp"
          alt=""
          className="absolute pointer-events-none select-none object-contain"
          style={{ right: '1vw', bottom: '3.8vw', width: '11vw' }}
          draggable={false}
        />
      </div>

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

      {/* 852 x 1846 Proportional Stage Canvas (TALL layout) */}
      <div
        className="results-stage-tall relative z-10 select-none overflow-hidden flex-shrink-0"
        style={{
          ['--u' as any]: `min(calc(100vw / 852), calc(100dvh / ${designCanvasHeight}))`,
          width: 'calc(852 * var(--u))',
          height: `calc(${designCanvasHeight} * var(--u))`,
        }}
      >
        {/* TopBar (Back button + Results title) */}
        {/* Back button on left */}
        <button
          type="button"
          onClick={handleBackHome}
          aria-label="Back"
          className="btn-press absolute rounded-full border-[2.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 active:scale-95 transition-all cursor-pointer focus:outline-none z-30"
          style={{
            left: 'calc(65 * var(--u))',
            top: 'calc(100 * var(--u))',
            width: 'calc(78 * var(--u))',
            height: 'calc(78 * var(--u))',
          }}
        >
          <svg
            style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#17181B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Results title centered */}
        <h1
          className="absolute font-black text-[#17181B] leading-none tracking-tight text-center pointer-events-none"
          style={{
            left: '0',
            right: '0',
            top: 'calc(110 * var(--u))',
            fontSize: 'calc(58 * var(--u))',
          }}
        >
          Results
        </h1>

        {/* Tag Pill: "Trivia · 10 rounds" (x=302 to 550, y=187 to 228) */}
        <div
          className="absolute rounded-full flex items-center justify-center shadow-2xs pointer-events-none"
          style={{
            left: 'calc(302 * var(--u))',
            top: 'calc(187 * var(--u))',
            width: 'calc(248 * var(--u))',
            height: 'calc(41 * var(--u))',
            backgroundColor: '#FED982',
            borderRadius: 'calc(21 * var(--u))',
          }}
        >
          <span
            className="font-extrabold text-[#17181B] tracking-tight leading-none"
            style={{ fontSize: 'calc(24 * var(--u))' }}
          >
            {isKnowMe ? 'Know Me' : 'Trivia'} · {effectiveTotalRounds} rounds
          </span>
        </div>

        {/* Player Blobs & Winner Crown */}
        {/* Winner Crown on Winner's Blob (x=175 to 238, y=244 to 290) */}
        {!isTie && !isKnowMe && isMeWinner && (
          <img
            src="/assets/crown-yellow.webp"
            alt=""
            className="absolute pointer-events-none select-none z-25"
            style={{
              left: 'calc(175 * var(--u))',
              top: 'calc(244 * var(--u))',
              width: 'calc(63 * var(--u))',
              height: 'calc(46 * var(--u))',
            }}
            draggable={false}
          />
        )}
        {!isTie && !isKnowMe && !isMeWinner && (
          <img
            src="/assets/crown-yellow.webp"
            alt=""
            className="absolute pointer-events-none select-none z-25"
            style={{
              left: 'calc(615 * var(--u))',
              top: 'calc(244 * var(--u))',
              width: 'calc(63 * var(--u))',
              height: 'calc(46 * var(--u))',
            }}
            draggable={false}
          />
        )}

        {/* Left Blob (Pink): x=75 to 370, y=265 to 570 */}
        <div
          className="absolute flex flex-col items-center justify-center z-15"
          style={{
            left: 'calc(75 * var(--u))',
            top: 'calc(265 * var(--u))',
            width: `calc(${leftBlobW} * var(--u))`,
            height: `calc(${leftBlobH} * var(--u))`,
          }}
        >
          <img
            src="/assets/reveal/card-blob-pink.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none pt-2">
            <img
              src={p1AvatarSrc}
              alt={myName}
              className="object-contain mb-1 flex-shrink-0"
              style={{
                width: 'calc(146 * var(--u))',
                height: 'calc(146 * var(--u))',
                marginTop: 'calc(-10 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="font-black text-[#17181B] tracking-tight leading-none truncate max-w-[90%]"
              style={{
                fontSize: 'calc(36 * var(--u))',
                marginTop: 'calc(10 * var(--u))',
              }}
            >
              {myName}
            </span>
          </div>
        </div>

        {/* Center Burst: you-won-rays around it + you-won-burst (x=345 to 510, y=335 to 495) */}
        <div
          className="absolute pointer-events-none select-none z-10 flex items-center justify-center"
          style={{
            left: 'calc(287 * var(--u))',
            top: 'calc(275 * var(--u))',
            width: 'calc(280 * var(--u))',
            height: 'calc(280 * var(--u))',
          }}
        >
          <img
            src="/assets/you-won-rays.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        <div
          className="absolute pointer-events-none select-none z-20 flex items-center justify-center"
          style={{
            left: 'calc(345 * var(--u))',
            top: 'calc(335 * var(--u))',
            width: 'calc(165 * var(--u))',
            height: 'calc(160 * var(--u))',
          }}
        >
          <img
            src="/assets/you-won-burst.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 pt-1 text-[#17181B]">
            <span
              className="font-black leading-[1.05] tracking-tight"
              style={{ fontSize: 'calc(36 * var(--u))' }}
            >
              {burstText.line1}
            </span>
            {burstText.line2 && (
              <span
                className="font-black leading-[1.05] tracking-tight"
                style={{ fontSize: 'calc(36 * var(--u))' }}
              >
                {burstText.line2}
              </span>
            )}
          </div>
        </div>

        {/* Right Blob (Blue): x=515 to 782, y=298 to 565 */}
        <div
          className="absolute flex flex-col items-center justify-center z-15"
          style={{
            left: 'calc(515 * var(--u))',
            top: 'calc(298 * var(--u))',
            width: `calc(${rightBlobW} * var(--u))`,
            height: `calc(${rightBlobH} * var(--u))`,
          }}
        >
          <img
            src="/assets/reveal/card-blob-blue.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none pt-2">
            <img
              src={p2AvatarSrc}
              alt={friendData.name}
              className="object-contain mb-1 flex-shrink-0"
              style={{
                width: 'calc(138 * var(--u))',
                height: 'calc(138 * var(--u))',
                marginTop: 'calc(-8 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="font-black text-[#17181B] tracking-tight leading-none truncate max-w-[90%]"
              style={{
                fontSize: 'calc(36 * var(--u))',
                marginTop: 'calc(8 * var(--u))',
              }}
            >
              {friendData.name}
            </span>
          </div>
        </div>

        {/* 1. Final score block: Flex column with gap, line-height 1 on big score (never overlaps) */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: 'calc(595 * var(--u))',
            gap: 'calc(10 * var(--u))',
          }}
        >
          <div
            className="text-center font-bold text-[#7A757D]"
            style={{
              fontSize: 'calc(30 * var(--u))',
              lineHeight: 1,
            }}
          >
            {isKnowMe ? 'Sync score' : 'Final score'}
          </div>

          <div
            className="text-center font-black text-[#17181B] tracking-[-0.03em]"
            style={{
              fontSize: 'calc(136 * var(--u))',
              lineHeight: 1,
            }}
          >
            {isKnowMe ? `${syncPercentage}%` : `${p1Score} - ${p2Score}`}
          </div>

          <div
            className="text-center font-bold text-[#7A757D]"
            style={{
              fontSize: 'calc(29 * var(--u))',
              lineHeight: 1,
            }}
          >
            {isKnowMe
              ? `You matched ${matchesCount} of ${effectiveTotalRounds}`
              : 'Great game, you two'}
          </div>
        </div>

        {/* 2. Stats Blobs: nowrap, auto-shrink font so numbers never truncate or show "..." */}
        {/* Stat 1: Starburst (x=93 to 282, y=812 to 1000) */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: 'calc(93 * var(--u))',
            top: 'calc(812 * var(--u))',
            width: 'calc(189 * var(--u))',
            height: 'calc(188 * var(--u))',
          }}
        >
          <img
            src="/assets/stat-starburst-yellow.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center select-none pt-1">
            <span
              className="font-black text-[#17181B] leading-none tracking-tight whitespace-nowrap select-none overflow-visible"
              style={{ fontSize: getStatFontSize(streak || 13) }}
            >
              {streak || 13}
            </span>
          </div>
        </div>
        <div
          className="absolute text-center font-bold text-[#7A757D] pointer-events-none"
          style={{
            left: 'calc(93 * var(--u))',
            width: 'calc(189 * var(--u))',
            top: 'calc(1025 * var(--u))',
            fontSize: 'calc(26 * var(--u))',
            lineHeight: 1,
          }}
        >
          Streak
        </div>

        {/* Stat 2: Drop (x=347 to 505, y=815 to 995) */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: 'calc(347 * var(--u))',
            top: 'calc(815 * var(--u))',
            width: 'calc(158 * var(--u))',
            height: 'calc(180 * var(--u))',
          }}
        >
          <img
            src="/assets/stat-drop-blue.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center select-none pt-3">
            <span
              className="font-black text-[#17181B] leading-none tracking-tight whitespace-nowrap select-none overflow-visible"
              style={{ fontSize: getStatFontSize(dropValue) }}
            >
              {dropValue}
            </span>
          </div>
        </div>
        <div
          className="absolute text-center font-bold text-[#7A757D] pointer-events-none"
          style={{
            left: 'calc(331 * var(--u))',
            width: 'calc(190 * var(--u))',
            top: 'calc(1025 * var(--u))',
            fontSize: 'calc(26 * var(--u))',
            lineHeight: 1,
          }}
        >
          {isKnowMe ? 'Matches' : 'Correct'}
        </div>

        {/* Stat 3: Cross (x=573 to 757, y=818 to 998) */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: 'calc(573 * var(--u))',
            top: 'calc(818 * var(--u))',
            width: 'calc(184 * var(--u))',
            height: 'calc(180 * var(--u))',
          }}
        >
          <img
            src="/assets/stat-cross-green.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center select-none">
            <span
              className="font-black text-[#17181B] leading-none tracking-tight whitespace-nowrap select-none overflow-visible"
              style={{ fontSize: getStatFontSize(crossValue) }}
            >
              {crossValue}
            </span>
          </div>
        </div>
        <div
          className="absolute text-center font-bold text-[#7A757D] pointer-events-none"
          style={{
            left: 'calc(570 * var(--u))',
            width: 'calc(190 * var(--u))',
            top: 'calc(1025 * var(--u))',
            fontSize: 'calc(26 * var(--u))',
            lineHeight: 1,
          }}
        >
          {isKnowMe ? 'Best category' : 'Fastest'}
        </div>

        {/* 3. & 6. "Round by round" Bar Chart (Shown only when isTallLayout and >= 2 rounds) */}
        {showChart && (
          <>
            {/* Title: x=68, y=1100, font 44 weight 900 */}
            <h2
              className="absolute font-black text-[#17181B] tracking-tight leading-none"
              style={{
                left: 'calc(68 * var(--u))',
                top: 'calc(1100 * var(--u))',
                fontSize: 'calc(44 * var(--u))',
              }}
            >
              Round by round
            </h2>

            {/* Bars Area: y=1145 to 1260, pairs spread across x=72 to 787 */}
            {chartPairs.map((pair) => (
              <React.Fragment key={pair.round}>
                {/* Bar pair positioned at pair.leftX */}
                <div
                  className="absolute flex items-end justify-between"
                  style={{
                    left: `calc(${pair.leftX} * var(--u))`,
                    top: 'calc(1145 * var(--u))',
                    width: 'calc(52 * var(--u))',
                    height: 'calc(115 * var(--u))',
                  }}
                >
                  {/* Pink bar (Me) */}
                  <div
                    style={{
                      width: 'calc(24 * var(--u))',
                      height: `calc(${pair.pH} * var(--u))`,
                      backgroundColor: '#FCA0D1',
                      borderRadius: 'calc(12 * var(--u))',
                    }}
                  />
                  {/* Blue bar (Friend) */}
                  <div
                    style={{
                      width: 'calc(24 * var(--u))',
                      height: `calc(${pair.bH} * var(--u))`,
                      backgroundColor: '#8EAFFD',
                      borderRadius: 'calc(12 * var(--u))',
                    }}
                  />
                </div>

                {/* Round label at y=1280 font 22 gray */}
                <div
                  className="absolute text-center font-bold text-[#7A757D]"
                  style={{
                    left: `calc(${pair.centerX - 24} * var(--u))`,
                    width: 'calc(48 * var(--u))',
                    top: 'calc(1280 * var(--u))',
                    fontSize: 'calc(22 * var(--u))',
                    lineHeight: 1,
                  }}
                >
                  {pair.round}
                </div>
              </React.Fragment>
            ))}

            {/* Legend centered at y=1338: (pink dot name, blue dot name) font 24 */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
              style={{
                top: 'calc(1338 * var(--u))',
                gap: 'calc(36 * var(--u))',
              }}
            >
              <div
                className="flex items-center"
                style={{ gap: 'calc(10 * var(--u))' }}
              >
                <div
                  style={{
                    width: 'calc(18 * var(--u))',
                    height: 'calc(18 * var(--u))',
                    backgroundColor: '#FCA0D1',
                    borderRadius: '50%',
                  }}
                />
                <span
                  className="font-bold text-[#7A757D]"
                  style={{ fontSize: 'calc(24 * var(--u))' }}
                >
                  {myName}
                </span>
              </div>
              <div
                className="flex items-center"
                style={{ gap: 'calc(10 * var(--u))' }}
              >
                <div
                  style={{
                    width: 'calc(18 * var(--u))',
                    height: 'calc(18 * var(--u))',
                    backgroundColor: '#8EAFFD',
                    borderRadius: '50%',
                  }}
                />
                <span
                  className="font-bold text-[#7A757D]"
                  style={{ fontSize: 'calc(24 * var(--u))' }}
                >
                  {friendData.name}
                </span>
              </div>
            </div>
          </>
        )}

        {/* 4. Emoji Reaction Row: 6 dashed circles, evenly spread across full content width (x=70 to 782) */}
        {showEmojiRow && (
          <div
            className="absolute flex items-center justify-between z-20"
            style={{
              left: 'calc(70 * var(--u))',
              width: 'calc(712 * var(--u))',
              top: `calc(${1443 - chartOffset} * var(--u))`,
              transform: 'translateY(-50%)',
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {REACTION_EMOJIS.map((emoji) => {
              const isSelected = activeReaction === emoji.id;
              const isHeld = heldEmojiId === emoji.id;

              return (
                <button
                  key={emoji.id}
                  type="button"
                  onPointerDown={(e) => handlePointerDown(e, emoji.id)}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => e.preventDefault()}
                  aria-label={emoji.alt}
                  aria-pressed={isSelected}
                  className={`rounded-full border-[2.6px] border-dashed flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out focus:outline-none p-0 bg-transparent select-none touch-manipulation ${
                    isSelected
                      ? 'border-[#17181B] bg-white/40'
                      : 'border-[#17181B]/40 hover:border-[#17181B]/70'
                  } ${isHeld ? 'scale-[0.92]' : isSelected ? 'scale-105' : 'scale-100 hover:scale-105'}`}
                  style={{
                    width: 'calc(92 * var(--u))',
                    height: 'calc(92 * var(--u))',
                  }}
                >
                  <img
                    src={emoji.file}
                    alt={emoji.alt}
                    className={`object-contain pointer-events-none select-none transition-transform duration-150 ${
                      isSelected ? 'scale-110' : ''
                    }`}
                    style={{
                      width: 'calc(52 * var(--u))',
                      height: 'calc(52 * var(--u))',
                    }}
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {/* "Rematch" button (with refresh icon): x=70 to 782, y=1525 to 1605 */}
        <button
          type="button"
          onClick={handleRematch}
          className="btn-press absolute rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white flex items-center justify-center cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform z-20"
          style={{
            left: 'calc(70 * var(--u))',
            width: 'calc(712 * var(--u))',
            top: `calc(${1525 - chartOffset - emojiOffset} * var(--u))`,
            height: 'calc(80 * var(--u))',
            borderRadius: 'calc(40 * var(--u))',
            gap: 'calc(16 * var(--u))',
          }}
        >
          {/* Refresh icon */}
          <svg
            style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          <span
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: 'calc(36 * var(--u))' }}
          >
            Rematch
          </span>
        </button>

        {/* "Save to memory wall" (bookmark icon): y=1622 to 1703 */}
        <button
          type="button"
          onClick={handleSaveToMemoryWall}
          className="btn-press absolute rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white flex items-center justify-center cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform z-20"
          style={{
            left: 'calc(70 * var(--u))',
            width: 'calc(712 * var(--u))',
            top: `calc(${1622 - chartOffset - emojiOffset} * var(--u))`,
            height: 'calc(81 * var(--u))',
            borderRadius: 'calc(40.5 * var(--u))',
            gap: 'calc(16 * var(--u))',
          }}
        >
          {/* Bookmark icon */}
          <svg
            style={{ width: 'calc(30 * var(--u))', height: 'calc(30 * var(--u))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: 'calc(36 * var(--u))' }}
          >
            Save to memory wall
          </span>
        </button>

        {/* "Back to home" underlined link, centered y=1745, font 25 */}
        <button
          type="button"
          onClick={handleBackHome}
          className="absolute left-0 right-0 text-center font-bold underline text-[#7A757D] hover:text-[#17181B] active:opacity-75 transition-colors cursor-pointer z-20"
          style={{
            top: `calc(${1745 - chartOffset - emojiOffset} * var(--u))`,
            fontSize: 'calc(25 * var(--u))',
            lineHeight: 1,
          }}
        >
          Back to home
        </button>
      </div>

      {/* =========================================================================
          940 x 1672 Proportional Stage Canvas (COMPACT layout matching mockup)
         ========================================================================= */}
      <div
        className="results-stage-compact relative z-10 select-none overflow-hidden flex-shrink-0"
        style={{
          ['--u' as any]: `min(calc(100vw / 940), calc(100dvh / ${designCanvasHeightCompact}))`,
          width: 'calc(940 * var(--u))',
          height: `calc(${designCanvasHeightCompact} * var(--u))`,
        }}
      >
        {/* TopBar (Back button + Results title) - Shared TopBar, don't copy mockup bar */}
        <button
          type="button"
          onClick={handleBackHome}
          aria-label="Back"
          className="btn-press absolute rounded-full border-[2.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 active:scale-95 transition-all cursor-pointer focus:outline-none z-30"
          style={{
            left: 'calc(65 * var(--u))',
            top: 'calc(88 * var(--u))',
            width: 'calc(76 * var(--u))',
            height: 'calc(76 * var(--u))',
          }}
        >
          <svg
            style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#17181B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Results title centered */}
        <h1
          className="absolute font-black text-[#17181B] leading-none tracking-tight text-center pointer-events-none"
          style={{
            left: '0',
            right: '0',
            top: 'calc(98 * var(--u))',
            fontSize: 'calc(56 * var(--u))',
          }}
        >
          Results
        </h1>

        {/* Tag Pill: x=328 to 612, y=206 to 258, yellow, font 26 weight 800 */}
        <div
          className="absolute rounded-full flex items-center justify-center pointer-events-none"
          style={{
            left: 'calc(328 * var(--u))',
            top: 'calc(206 * var(--u))',
            width: 'calc(284 * var(--u))',
            height: 'calc(52 * var(--u))',
            backgroundColor: '#FEDB41',
          }}
        >
          <span
            className="font-extrabold text-[#17181B] tracking-tight leading-none"
            style={{ fontSize: 'calc(26 * var(--u))' }}
          >
            {isKnowMe ? 'Know Me' : 'Trivia'} · {effectiveTotalRounds} rounds
          </span>
        </div>

        {/* Winner Crown: x=218 to 272, y=280 to 324 */}
        {!isTie && !isKnowMe && isMeWinner && (
          <img
            src="/assets/crown-yellow.webp"
            alt=""
            className="absolute pointer-events-none select-none z-25"
            style={{
              left: 'calc(218 * var(--u))',
              top: 'calc(280 * var(--u))',
              width: 'calc(54 * var(--u))',
              height: 'calc(44 * var(--u))',
            }}
            draggable={false}
          />
        )}
        {!isTie && !isKnowMe && !isMeWinner && (
          <img
            src="/assets/crown-yellow.webp"
            alt=""
            className="absolute pointer-events-none select-none z-25"
            style={{
              left: 'calc(648 * var(--u))',
              top: 'calc(280 * var(--u))',
              width: 'calc(54 * var(--u))',
              height: 'calc(44 * var(--u))',
            }}
            draggable={false}
          />
        )}

        {/* Winner blob (pink): x=158 to 370, y=300 to 530 */}
        <div
          className="absolute flex flex-col items-center justify-center z-15"
          style={{
            left: 'calc(158 * var(--u))',
            top: `calc(${compactBlobLeftTop} * var(--u))`,
            width: `calc(${compactBlobLeftW} * var(--u))`,
            height: `calc(${compactBlobLeftH} * var(--u))`,
          }}
        >
          <img
            src="/assets/reveal/card-blob-pink.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none pt-1">
            <img
              src={p1AvatarSrc}
              alt={myName}
              className="object-contain flex-shrink-0"
              style={{
                width: 'calc(104 * var(--u))',
                height: 'calc(104 * var(--u))',
                marginTop: 'calc(-6 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="font-black text-[#17181B] tracking-tight leading-none truncate max-w-[90%]"
              style={{
                fontSize: 'calc(30 * var(--u))',
                marginTop: 'calc(8 * var(--u))',
              }}
            >
              {myName}
            </span>
          </div>
        </div>

        {/* Center Burst: you-won-burst x=390 to 545, y=343 to 492, you-won-rays around it x=385 to 555, y=315 to 515 */}
        <div
          className="absolute pointer-events-none select-none z-10 flex items-center justify-center"
          style={{
            left: 'calc(385 * var(--u))',
            top: 'calc(315 * var(--u))',
            width: 'calc(170 * var(--u))',
            height: 'calc(200 * var(--u))',
          }}
        >
          <img
            src="/assets/you-won-rays.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        <div
          className="absolute pointer-events-none select-none z-20 flex items-center justify-center"
          style={{
            left: 'calc(390 * var(--u))',
            top: 'calc(343 * var(--u))',
            width: 'calc(155 * var(--u))',
            height: 'calc(149 * var(--u))',
          }}
        >
          <img
            src="/assets/you-won-burst.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 pt-1 text-[#17181B]">
            <span
              className="font-black leading-[1.05] tracking-tight"
              style={{ fontSize: 'calc(34 * var(--u))' }}
            >
              {burstText.line1}
            </span>
            {burstText.line2 && (
              <span
                className="font-black leading-[1.05] tracking-tight"
                style={{ fontSize: 'calc(34 * var(--u))' }}
              >
                {burstText.line2}
              </span>
            )}
          </div>
        </div>

        {/* Loser blob (blue): x=570 to 778, y=320 to 528 */}
        <div
          className="absolute flex flex-col items-center justify-center z-15"
          style={{
            left: 'calc(570 * var(--u))',
            top: `calc(${compactBlobRightTop} * var(--u))`,
            width: `calc(${compactBlobRightW} * var(--u))`,
            height: `calc(${compactBlobRightH} * var(--u))`,
          }}
        >
          <img
            src="/assets/reveal/card-blob-blue.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none pt-1">
            <img
              src={p2AvatarSrc}
              alt={friendData.name}
              className="object-contain flex-shrink-0"
              style={{
                width: 'calc(100 * var(--u))',
                height: 'calc(100 * var(--u))',
                marginTop: 'calc(-4 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="font-black text-[#17181B] tracking-tight leading-none truncate max-w-[90%]"
              style={{
                fontSize: 'calc(30 * var(--u))',
                marginTop: 'calc(6 * var(--u))',
              }}
            >
              {friendData.name}
            </span>
          </div>
        </div>

        {/* Final score block: 'Final score' center y=567 font 26 gray, '80 - 65' center y=636 font 110, 'Great game, you two' center y=705 */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: 'calc(552 * var(--u))',
            gap: 'calc(8 * var(--u))',
          }}
        >
          <div
            className="text-center font-bold text-[#7A757D]"
            style={{
              fontSize: 'calc(26 * var(--u))',
              lineHeight: 1,
            }}
          >
            {isKnowMe ? 'Sync score' : 'Final score'}
          </div>

          <div
            className="text-center font-black text-[#17181B] tracking-[-0.03em]"
            style={{
              fontSize: 'calc(110 * var(--u))',
              lineHeight: 1,
            }}
          >
            {isKnowMe ? `${syncPercentage}%` : `${p1Score} - ${p2Score}`}
          </div>

          <div
            className="text-center font-bold text-[#7A757D]"
            style={{
              fontSize: 'calc(26 * var(--u))',
              lineHeight: 1,
            }}
          >
            {isKnowMe
              ? `You matched ${matchesCount} of ${effectiveTotalRounds}`
              : 'Great game, you two'}
          </div>
        </div>

        {/* Stats: starburst x=168 to 328, y=750 to 908. Drop x=405 to 541, y=750 to 902. Cross x=620 to 778, y=754 to 904. Labels center y=926 font 24 */}
        {/* Stat 1: Starburst */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: 'calc(168 * var(--u))',
            top: 'calc(750 * var(--u))',
            width: 'calc(160 * var(--u))',
            height: 'calc(158 * var(--u))',
          }}
        >
          <img
            src="/assets/stat-starburst-yellow.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center select-none pt-1">
            <span
              className="font-black text-[#17181B] leading-none tracking-tight whitespace-nowrap select-none overflow-visible"
              style={{ fontSize: getCompactStatFontSize(streak || 13) }}
            >
              {streak || 13}
            </span>
          </div>
        </div>
        <div
          className="absolute text-center font-bold text-[#7A757D] pointer-events-none"
          style={{
            left: 'calc(168 * var(--u))',
            width: 'calc(160 * var(--u))',
            top: 'calc(926 * var(--u))',
            fontSize: 'calc(24 * var(--u))',
            lineHeight: 1,
          }}
        >
          Streak
        </div>

        {/* Stat 2: Drop */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: 'calc(405 * var(--u))',
            top: 'calc(750 * var(--u))',
            width: 'calc(136 * var(--u))',
            height: 'calc(152 * var(--u))',
          }}
        >
          <img
            src="/assets/stat-drop-blue.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center select-none pt-2">
            <span
              className="font-black text-[#17181B] leading-none tracking-tight whitespace-nowrap select-none overflow-visible"
              style={{ fontSize: getCompactStatFontSize(dropValue) }}
            >
              {dropValue}
            </span>
          </div>
        </div>
        <div
          className="absolute text-center font-bold text-[#7A757D] pointer-events-none"
          style={{
            left: 'calc(398 * var(--u))',
            width: 'calc(150 * var(--u))',
            top: 'calc(926 * var(--u))',
            fontSize: 'calc(24 * var(--u))',
            lineHeight: 1,
          }}
        >
          {isKnowMe ? 'Matches' : 'Correct'}
        </div>

        {/* Stat 3: Cross */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: 'calc(620 * var(--u))',
            top: 'calc(754 * var(--u))',
            width: 'calc(158 * var(--u))',
            height: 'calc(150 * var(--u))',
          }}
        >
          <img
            src="/assets/stat-cross-green.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <div className="relative z-10 flex flex-col items-center justify-center select-none">
            <span
              className="font-black text-[#17181B] leading-none tracking-tight whitespace-nowrap select-none overflow-visible"
              style={{ fontSize: getCompactStatFontSize(crossValue) }}
            >
              {crossValue}
            </span>
          </div>
        </div>
        <div
          className="absolute text-center font-bold text-[#7A757D] pointer-events-none"
          style={{
            left: 'calc(619 * var(--u))',
            width: 'calc(160 * var(--u))',
            top: 'calc(926 * var(--u))',
            fontSize: 'calc(24 * var(--u))',
            lineHeight: 1,
          }}
        >
          {isKnowMe ? 'Best category' : 'Fastest'}
        </div>

        {/* "Round by round" Bar Chart (Compact) */}
        {showChartCompact && (
          <>
            <h2
              className="absolute font-black text-[#17181B] tracking-tight leading-none"
              style={{
                left: 'calc(102 * var(--u))',
                top: 'calc(1002 * var(--u))',
                fontSize: 'calc(42 * var(--u))',
              }}
            >
              Round by round
            </h2>

            {/* Bars Area: y=1043 to 1137, pairs spread across x=108 to 832 */}
            {compactChartPairs.map((pair) => (
              <React.Fragment key={pair.round}>
                <div
                  className="absolute flex items-end justify-between"
                  style={{
                    left: `calc(${pair.leftX} * var(--u))`,
                    top: 'calc(1043 * var(--u))',
                    width: 'calc(48 * var(--u))',
                    height: 'calc(94 * var(--u))',
                  }}
                >
                  {/* Pink bar (Me) */}
                  <div
                    style={{
                      width: 'calc(22 * var(--u))',
                      height: `calc(${pair.compactPH} * var(--u))`,
                      backgroundColor: '#FCA0D1',
                      borderRadius: 'calc(11 * var(--u))',
                    }}
                  />
                  {/* Blue bar (Friend) */}
                  <div
                    style={{
                      width: 'calc(22 * var(--u))',
                      height: `calc(${pair.compactBH} * var(--u))`,
                      backgroundColor: '#8EAFFD',
                      borderRadius: 'calc(11 * var(--u))',
                    }}
                  />
                </div>

                {/* Round label at y=1158 font 22 */}
                <div
                  className="absolute text-center font-bold text-[#7A757D]"
                  style={{
                    left: `calc(${pair.centerX - 24} * var(--u))`,
                    width: 'calc(48 * var(--u))',
                    top: 'calc(1158 * var(--u))',
                    fontSize: 'calc(22 * var(--u))',
                    lineHeight: 1,
                  }}
                >
                  {pair.round}
                </div>
              </React.Fragment>
            ))}

            {/* Legend centered at y=1208 font 22 */}
            <div
              className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
              style={{
                top: 'calc(1208 * var(--u))',
                gap: 'calc(36 * var(--u))',
              }}
            >
              <div
                className="flex items-center"
                style={{ gap: 'calc(10 * var(--u))' }}
              >
                <div
                  style={{
                    width: 'calc(16 * var(--u))',
                    height: 'calc(16 * var(--u))',
                    backgroundColor: '#FCA0D1',
                    borderRadius: '50%',
                  }}
                />
                <span
                  className="font-bold text-[#7A757D]"
                  style={{ fontSize: 'calc(22 * var(--u))' }}
                >
                  {myName}
                </span>
              </div>
              <div
                className="flex items-center"
                style={{ gap: 'calc(10 * var(--u))' }}
              >
                <div
                  style={{
                    width: 'calc(16 * var(--u))',
                    height: 'calc(16 * var(--u))',
                    backgroundColor: '#8EAFFD',
                    borderRadius: '50%',
                  }}
                />
                <span
                  className="font-bold text-[#7A757D]"
                  style={{ fontSize: 'calc(22 * var(--u))' }}
                >
                  {friendData.name}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Emoji reaction row: 6 dashed circles, 82 diameter, centered y=1300, spread x=119 to 823 */}
        {showEmojiRowCompact && (
          <div
            className="absolute flex items-center justify-between z-20"
            style={{
              left: 'calc(119 * var(--u))',
              width: 'calc(704 * var(--u))',
              top: `calc(${1300 - chartOffsetCompact} * var(--u))`,
              transform: 'translateY(-50%)',
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {REACTION_EMOJIS.map((emoji) => {
              const isSelected = activeReaction === emoji.id;
              const isHeld = heldEmojiId === emoji.id;

              return (
                <button
                  key={emoji.id}
                  type="button"
                  onPointerDown={(e) => handlePointerDown(e, emoji.id)}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`btn-press rounded-full border-[2.6px] border-dashed flex items-center justify-center transition-all select-none cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'border-[#17181B] bg-white/40 scale-105'
                      : 'border-[#17181B] bg-transparent hover:bg-white/20'
                  } ${isHeld ? 'scale-115' : ''}`}
                  style={{
                    width: 'calc(82 * var(--u))',
                    height: 'calc(82 * var(--u))',
                    fontSize: 'calc(40 * var(--u))',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'none',
                  }}
                  aria-label={emoji.alt}
                >
                  <span className="leading-none transform translate-y-[-1px] select-none pointer-events-none">
                    {emoji.emoji}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* "Rematch" (refresh icon): x=109 to 830, y=1372 to 1441, near-black pill, font 32 weight 800 */}
        <button
          type="button"
          onClick={handleRematch}
          className="btn-press absolute rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white flex items-center justify-center cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform z-20"
          style={{
            left: 'calc(109 * var(--u))',
            width: 'calc(721 * var(--u))',
            top: `calc(${1372 - chartOffsetCompact - emojiOffsetCompact} * var(--u))`,
            height: 'calc(69 * var(--u))',
            borderRadius: 'calc(34.5 * var(--u))',
            gap: 'calc(16 * var(--u))',
          }}
        >
          <svg
            style={{ width: 'calc(30 * var(--u))', height: 'calc(30 * var(--u))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          <span
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: 'calc(32 * var(--u))' }}
          >
            Rematch
          </span>
        </button>

        {/* "Save to memory wall" (bookmark icon): y=1459 to 1528 */}
        <button
          type="button"
          onClick={handleSaveToMemoryWall}
          className="btn-press absolute rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white flex items-center justify-center cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform z-20"
          style={{
            left: 'calc(109 * var(--u))',
            width: 'calc(721 * var(--u))',
            top: `calc(${1459 - chartOffsetCompact - emojiOffsetCompact} * var(--u))`,
            height: 'calc(69 * var(--u))',
            borderRadius: 'calc(34.5 * var(--u))',
            gap: 'calc(16 * var(--u))',
          }}
        >
          <svg
            style={{ width: 'calc(28 * var(--u))', height: 'calc(28 * var(--u))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: 'calc(32 * var(--u))' }}
          >
            Save to memory wall
          </span>
        </button>

        {/* "Back to home" underlined link, centered y=1569, font 24 */}
        <button
          type="button"
          onClick={handleBackHome}
          className="absolute left-0 right-0 text-center font-bold underline text-[#7A757D] hover:text-[#17181B] active:opacity-75 transition-colors cursor-pointer z-20"
          style={{
            top: `calc(${1569 - chartOffsetCompact - emojiOffsetCompact} * var(--u))`,
            fontSize: 'calc(24 * var(--u))',
            lineHeight: 1,
          }}
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

