import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NavTab } from '../components/BottomNav';
import { QuestionData } from '../data/gameData';
import { useGameSession } from '../services/gameSessionContext';
import { useSession } from '../services/sessionContext';
import { TriviaQuestion } from '../data/gameQuestions';
import { TopBar } from '../components/TopBar';
import { triggerHaptic } from '../utils/haptics';
import { playCorrectSound, playTapSound } from '../lib/soundEffects';

export interface RevealScreenProps {
  player1Name?: string;
  player1AvatarId?: number;
  player1Color?: string;
  player2Name?: string;
  player2AvatarId?: number;
  player2Color?: string;
  questionData?: QuestionData;
  player1Answer?: string;
  player2Answer?: string;
  syncScore?: number;
  isMatched?: boolean;
  selectedReaction?: string | null;
  onSelectReaction?: (reactionId: string) => void;
  onSaveToMemoryWall?: () => void;
  onNextQuestion?: () => void;
  onBack?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onOpenSettings?: () => void;
  onOpenFriendProfile?: () => void;
  mode?: 'trivia' | 'know-me';
}

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

const EMOJI_MAP: Record<string, string> = {
  smile: '😊',
  heart: '❤️',
  laugh: '😂',
  surprised: '😮',
  smirk: '😏',
  cry: '😭',
};

const REACTION_EMOJIS = [
  { id: 'smile', file: '/assets/reveal/emoji-smile.webp', alt: 'Smile', emoji: '😊' },
  { id: 'heart', file: '/assets/reveal/emoji-heart.webp', alt: 'Heart', emoji: '❤️' },
  { id: 'laugh', file: '/assets/reveal/emoji-laugh.webp', alt: 'Laugh', emoji: '😂' },
  { id: 'surprised', file: '/assets/reveal/emoji-surprised.webp', alt: 'Surprised', emoji: '😮' },
  { id: 'smirk', file: '/assets/reveal/emoji-smirk.webp', alt: 'Smirk', emoji: '😏' },
  { id: 'cry', file: '/assets/reveal/emoji-cry.webp', alt: 'Cry', emoji: '😭' },
];

export const RevealScreen: React.FC<RevealScreenProps> = ({
  player1Name = 'Player 1',
  player1AvatarId: _p1AvatarId = 1,
  player2Name = 'Player 2',
  player2AvatarId: _p2AvatarId = 2,
  questionData,
  player1Answer = 'Anchovies on pizza.',
  player2Answer = 'Anchovies on pizza.',
  syncScore = 74,
  isMatched,
  selectedReaction: controlledReaction,
  onSelectReaction,
  onSaveToMemoryWall,
  onNextQuestion,
  onBack: _onBack,
  onOpenSettings,
  onOpenFriendProfile,
  mode: propMode,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useSession();
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  const currentRound = isInGame ? gameSession.currentRound : 1;
  const totalRounds = isInGame ? gameSession.totalRounds : 10;

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      navigate('/profile');
    }
  };

  const handleOpenFriendProfile = () => {
    if (onOpenFriendProfile) {
      onOpenFriendProfile();
    } else {
      navigate('/friend');
    }
  };

  // Sync background color to pastel pink and ensure scrolling
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.backgroundColor = '#F5CCE2';
    document.documentElement.style.backgroundColor = '#F5CCE2';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const [internalReaction, setInternalReaction] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_selected_reaction');
    }
    return null;
  });
  const [particles, setParticles] = useState<ReactionParticle[]>([]);
  const [heldEmojiId, setHeldEmojiId] = useState<string | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdCounterRef = useRef<number>(0);
  const activeOriginXRef = useRef<number | undefined>(undefined);
  const activeEmojiIdRef = useRef<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const spawnParticles = useCallback((emojiId: string, count: number, originX?: number) => {
    const emojiChar = EMOJI_MAP[emojiId] || '❤️';
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;

    setParticles((prev) => {
      const MAX_PARTICLES = 60;
      const available = MAX_PARTICLES - prev.length;
      if (available <= 0) return prev;

      const actualCount = Math.min(count, available);
      const newItems: ReactionParticle[] = [];

      for (let i = 0; i < actualCount; i++) {
        // Random size 28-76px
        const size = Math.round(28 + Math.random() * (76 - 28));
        // Random start tilt -35° to +35°
        const rot = Math.round((Math.random() * 70 - 35) * 10) / 10;
        // Horizontal sine drift
        const drift = Math.round((Math.random() * 160 - 80) * 10) / 10;
        // Random duration 2.2-3.6s
        const duration = Math.round((2.2 + Math.random() * 1.4) * 100) / 100;
        // Random delay 0-150ms
        const delay = Math.round(Math.random() * 150);

        // Spawn at bottom of screen across full width, plus a few near pressed button
        let x: number;
        const spawnNearButton = originX !== undefined && i % 3 === 0;
        if (spawnNearButton) {
          const offset = (Math.random() - 0.5) * 90;
          x = Math.max(8, Math.min(screenWidth - size - 8, originX - size / 2 + offset));
        } else {
          const minX = 8;
          const maxX = Math.max(minX, screenWidth - size - 8);
          x = Math.round(minX + Math.random() * (maxX - minX));
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${i}`;

        // Safety fallback timer to ensure cleanup if animationend does not fire
        setTimeout(() => {
          setParticles((current) => current.filter((p) => p.id !== id));
        }, (duration + 0.5) * 1000 + delay);

        newItems.push({
          id,
          emojiChar,
          x,
          drift,
          rot,
          size,
          duration,
          delay,
        });
      }

      return [...prev, ...newItems];
    });
  }, []);

  const stopHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHeldEmojiId(null);
    activeEmojiIdRef.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, emojiId: string) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      playTapSound();
      setInternalReaction(emojiId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('reveal_selected_reaction', emojiId);
        localStorage.setItem('gty_latest_reaction', emojiId);
      }
      onSelectReaction?.(emojiId);

      setHeldEmojiId(emojiId);
      activeEmojiIdRef.current = emojiId;

      const rect = e.currentTarget.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      activeOriginXRef.current = originX;

      triggerHaptic(8);

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        spawnParticles(emojiId, 4, originX);
        return;
      }

      // Tap burst of ~8 copies
      spawnParticles(emojiId, 8, originX);

      // Continuous hold spawning (every ~70ms) until release
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      holdCounterRef.current = 0;
      holdIntervalRef.current = setInterval(() => {
        holdCounterRef.current += 1;
        spawnParticles(emojiId, 1, activeOriginXRef.current);

        if (holdCounterRef.current % 4 === 0) {
          triggerHaptic(8);
        }
      }, 70);
    },
    [onSelectReaction, spawnParticles]
  );

  const handlePointerUp = useCallback(() => {
    stopHold();
  }, [stopHold]);

  // Global pointerup/pointercancel listener to release hold even if pointer leaves window
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (activeEmojiIdRef.current) {
        stopHold();
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
      stopHold();
    };
  }, [stopHold]);

  // Reveal victory sound
  useEffect(() => {
    const timer = setTimeout(() => {
      playCorrectSound();
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Inspect full answer modal
  const [inspectingPlayer, setInspectingPlayer] = useState<{
    name: string;
    avatarSrc: string;
    answer: string;
    blobBg: string;
  } | null>(null);

  const activeReaction =
    controlledReaction !== undefined ? controlledReaction : internalReaction;

  // Determine game mode: Trivia vs Know Me
  // Default to trivia if requested via prop, query param, or active game mode
  const paramMode = searchParams.get('mode');
  const isTriviaRound =
    propMode === 'trivia' ||
    paramMode === 'trivia' ||
    (paramMode !== 'know-me' &&
      propMode !== 'know-me' &&
      (isInGame
        ? gameSession.currentRoundType === 'trivia' || gameSession.mode === 'Trivia'
        : (questionData as any)?.type === 'trivia' ||
          localStorage.getItem('gty_active_mode') === 'trivia' ||
          localStorage.getItem('gty_reveal_mode') === 'trivia' ||
          true)); // Default to trivia reveal to match the primary target screen

  // Clean up timers on screen/mode change
  useEffect(() => {
    stopHold();
  }, [isTriviaRound, stopHold]);

  const isKnowMeRound = !isTriviaRound;

  // User Profile
  const currentUsername =
    session.profile?.name ||
    session.user?.displayName ||
    (player1Name && player1Name !== 'Player 1' && player1Name !== 'Your Pick' ? player1Name : '') ||
    (typeof window !== 'undefined'
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem('gty_profile') || '{}').name;
          } catch {
            return null;
          }
        })()
      : null) ||
    'Musab';

  const partnerUsername =
    player2Name && player2Name !== 'Player 2'
      ? player2Name
      : (typeof window !== 'undefined'
          ? (() => {
              try {
                return JSON.parse(localStorage.getItem('partner_profile') || '{}').name;
              } catch {
                return null;
              }
            })()
          : null) || 'Alex';

  const p1LabelText = currentUsername;
  const p2LabelText = isTriviaRound ? partnerUsername : partnerUsername;

  const p1AvatarSrc = session.profile?.avatarId
    ? `/assets/avatars/avatar-${session.profile.avatarId}.png`
    : _p1AvatarId
    ? `/assets/avatars/avatar-${_p1AvatarId}.png`
    : '/assets/avatars/avatar-1.png';

  const p2AvatarSrc = _p2AvatarId
    ? `/assets/avatars/avatar-${_p2AvatarId}.png`
    : '/assets/avatars/avatar-2.png';

  // Trivia-specific or Know-Me specific content
  const triviaCategory =
    (gameSession.currentQuestion as TriviaQuestion)?.category ||
    questionData?.category ||
    'Food';

  const rawQuestion = isTriviaRound
    ? isInGame
      ? gameSession.currentQuestion?.question || 'Which country invented sushi?'
      : questionData?.question || 'Which country invented sushi?'
    : isInGame
    ? gameSession.currentQuestion?.question || 'What’s the worst food you’ve ever tried?'
    : questionData?.question || 'What’s the worst food you’ve ever tried?';

  // Trivia correct answer
  const correctTriviaAnswer =
    (gameSession.currentQuestion as TriviaQuestion)?.options?.find(
      (o) => o.id === (gameSession.currentQuestion as TriviaQuestion).correctOptionId
    )?.text || 'Japan';

  const getCorrectAnswerFontSizeMobile = (text: string) => {
    const len = text.length;
    if (len > 30) return 'text-[15px] sm:text-[17px]';
    if (len > 20) return 'text-[18px] sm:text-[21px]';
    if (len > 12) return 'text-[22px] sm:text-[25px]';
    if (len > 7) return 'text-[27px] sm:text-[31px]';
    return 'text-[32px] sm:text-[36px]';
  };

  // Player answers for Trivia
  const p1TriviaAnswer = isInGame
    ? gameSession.myGuess || 'Japan'
    : (typeof window !== 'undefined' && localStorage.getItem('trivia_player1_guess')) ||
      (player1Answer !== 'Anchovies on pizza.' ? player1Answer : 'Japan');

  const p2TriviaAnswer = isInGame
    ? gameSession.friendAnswer || 'China'
    : player2Answer !== 'Anchovies on pizza.'
    ? player2Answer
    : 'China';

  // Player answers for Know Me
  const resolvedP1Answer = isTriviaRound ? p1TriviaAnswer : (isInGame ? gameSession.myAnswer || player1Answer : player1Answer);
  const resolvedP2Answer = isTriviaRound ? p2TriviaAnswer : (isInGame ? gameSession.friendAnswer || player2Answer : player2Answer);

  // Correctness logic for Trivia
  const p1IsCorrect = isTriviaRound
    ? isInGame
      ? gameSession.isCorrect
      : p1TriviaAnswer.trim().toLowerCase() === correctTriviaAnswer.trim().toLowerCase()
    : false;

  const p2IsCorrect = isTriviaRound
    ? isInGame
      ? gameSession.isMatched // Friend got it right in trivia logic
      : p2TriviaAnswer.trim().toLowerCase() === correctTriviaAnswer.trim().toLowerCase()
    : false;

  // Know-Me match logic
  const isSuccess = isTriviaRound
    ? p1IsCorrect
    : isKnowMeRound
    ? gameSession.isMatched
    : isMatched !== undefined
    ? isMatched
    : resolvedP1Answer.trim().toLowerCase() === resolvedP2Answer.trim().toLowerCase();

  // Center starburst text logic per prompt:
  // "You got it!", "They got it!", "Both right!" or "Nobody 😭"
  let triviaBurstText = 'You got it!';
  if (p1IsCorrect && p2IsCorrect) {
    triviaBurstText = 'Both right!';
  } else if (p1IsCorrect && !p2IsCorrect) {
    triviaBurstText = 'You got it!';
  } else if (!p1IsCorrect && p2IsCorrect) {
    triviaBurstText = 'They got it!';
  } else {
    triviaBurstText = 'Nobody 😭';
  }

  // Scores
  const p1Score = isInGame && gameSession.myScore > 0 ? gameSession.myScore : 80;
  const p2Score = isInGame && gameSession.friendScore > 0 ? gameSession.friendScore : 65;
  const winnerText =
    p1Score > p2Score ? 'You won 🎉' : p2Score > p1Score ? 'They won 👏' : 'Tied game! 🤝';



  const handleSave = () => {
    const chosenReaction = activeReaction || localStorage.getItem('reveal_selected_reaction') || 'heart';
    if (typeof window !== 'undefined') {
      localStorage.setItem('reveal_saved_to_memory_wall', 'true');
      localStorage.setItem('reveal_selected_reaction', chosenReaction);
      localStorage.setItem('gty_latest_reaction', chosenReaction);

      // Create or update card in game_memory_cards to reflect exact reaction dynamically
      try {
        const existingCardsStr = localStorage.getItem('game_memory_cards');
        const existingCards = existingCardsStr ? JSON.parse(existingCardsStr) : [];
        const cardToSave = {
          id: `card-${Date.now()}`,
          category: isTriviaRound ? 'Food' : 'funny',
          color: isTriviaRound ? 'yellow' : 'pink',
          cardBg: isSuccess ? '#E0ECB5' : '#F7E7CD',
          date: 'TODAY',
          question: rawQuestion,
          isMatched: isSuccess,
          matched: isSuccess,
          p1Name: p1LabelText,
          p1AvatarId: session.profile?.avatarId || _p1AvatarId || 1,
          p1Color: session.profile?.color || 'salmon',
          p1Answer: resolvedP1Answer,
          p2Name: p2LabelText,
          p2AvatarId: _p2AvatarId || 2,
          p2Color: 'teal',
          p2Answer: resolvedP2Answer,
          reactions: chosenReaction
            ? [
                {
                  emoji: chosenReaction,
                  count: 1,
                },
              ]
            : undefined,
        };
        const updated = [cardToSave, ...existingCards.filter((c: any) => c.question !== rawQuestion)];
        localStorage.setItem('game_memory_cards', JSON.stringify(updated));
      } catch {}
    }
    onSaveToMemoryWall?.();
    setToastMessage('Saved to Memory Wall! ✨');
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const handleNextClick = () => {
    if (isInGame) {
      gameSession.nextRound();
    } else if (onNextQuestion) {
      onNextQuestion();
    } else {
      navigate('/home');
    }
  };

  return (
    <div
      id="reveal-scroll-viewport"
      className="relative w-full min-h-[100dvh] bg-[#F5CCE2] select-none font-['Nunito',sans-serif] overflow-x-hidden"
      style={{
        backgroundColor: '#F5CCE2',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1B1D20] text-white px-5 py-2.5 rounded-full font-black text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Instagram-style Full-screen Floating Reaction Overlay */}
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

      {/* =========================================================================
          TRIVIA REVEAL SCREEN (MOBILE FIRST: < 768px)
         ========================================================================= */}
      {isTriviaRound && (
        <div className="md:hidden relative w-full min-h-[100dvh] max-w-[390px] mx-auto flex flex-col justify-start items-center select-none">
          {/* 1. TOP BAR: Exact same top bar component from Homepage & Waiting page (with Rounds pill instead of streak) */}
          <TopBar
            mode="rounds"
            currentRound={currentRound}
            totalRounds={totalRounds}
            onOpenSettings={handleOpenSettings}
            onOpenFriendProfile={handleOpenFriendProfile}
            className="w-full absolute top-0 left-0"
          />

          <div className="w-full px-5 flex-1 flex flex-col items-center justify-start pt-[56px] pb-12 relative z-10">

          {/* 2. CATEGORY PILL: "Trivia · Food" */}
          <div className="w-full flex justify-center mb-3 z-10">
            <div className="rounded-full bg-[#FED982] px-4 py-1.5 flex items-center justify-center shadow-2xs">
              <span className="font-extrabold text-[15px] sm:text-[16px] text-[#1B1D20] tracking-tight leading-none">
                Trivia · {triviaCategory}
              </span>
            </div>
          </div>

          {/* 3. QUESTION: Huge bold headline */}
          <div className="w-full text-center mb-4 px-2 z-10">
            <h2 className="font-black text-[34px] sm:text-[38px] leading-[1.08] text-[#1B1D20] tracking-[-0.03em] m-0 break-words">
              {rawQuestion}
            </h2>
          </div>

          {/* 4. CORRECT ANSWER BLOCK: Green Blob + Sparkles, Check Badge, "Correct answer", responsive text */}
          <div className="relative w-[286px] sm:w-[316px] aspect-[548/326] mx-auto mb-5 flex items-center justify-center z-10">
            {/* Green blob with sparkles image */}
            <img
              src="/assets/correct-answer-blob-sparkles.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              draggable={false}
            />

            {/* Content overlay centered directly over the green blob */}
            <div
              className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none w-[72%] max-w-[225px] h-full overflow-hidden"
              style={{
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '8px',
                paddingRight: '8px',
                boxSizing: 'border-box',
              }}
            >
              {/* White Circular Badge with Green Checkmark */}
              <div className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center shadow-xs mb-1 flex-shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#48B358"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Small "Correct answer" text */}
              <span className="text-[13px] sm:text-[14px] font-extrabold text-[#1B1D20]/80 tracking-tight leading-none mb-1 flex-shrink-0">
                Correct answer
              </span>

              {/* Responsive Bold Answer Text fitting safely within the blob */}
              <span
                className={`font-black text-[#1B1D20] tracking-[-0.03em] leading-[1.12] text-center break-words w-full select-none ${getCorrectAnswerFontSizeMobile(correctTriviaAnswer)}`}
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxHeight: '74px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {correctTriviaAnswer}
              </span>
            </div>
          </div>

          {/* 5. PLAYER BLOBS & CENTER STARBURST ("You got it!") */}
          <div className="relative w-full flex items-center justify-between mb-5 px-1 z-10">
            {/* Left Player: Pink Blob (Musab) */}
            <div
              onClick={() =>
                setInspectingPlayer({
                  name: p1LabelText,
                  avatarSrc: p1AvatarSrc,
                  answer: p1TriviaAnswer,
                  blobBg: '#FCA0D1',
                })
              }
              className="relative w-[48%] max-w-[172px] aspect-[456/468] flex flex-col items-center justify-center p-2.5 cursor-pointer active:scale-[0.98] transition-transform z-10"
              title="Click to view full answer"
            >
              <img
                src="/assets/reveal/card-blob-pink.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />

              <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1 pt-1 pb-1">
                <img
                  src={p1AvatarSrc}
                  alt={p1LabelText}
                  className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] object-contain mb-1 flex-shrink-0"
                  draggable={false}
                />
                <span className="text-[15px] font-black text-[#1B1D20] tracking-tight leading-tight mb-0.5 truncate max-w-[124px]">
                  {p1LabelText}
                </span>
                <span className="text-[13px] font-bold text-[#1B1D20]/60 tracking-tight leading-tight mb-1 truncate max-w-[128px]">
                  {p1TriviaAnswer}
                </span>

                {/* Score Pill: Green check +15 or Gray cross +0 */}
                {p1IsCorrect ? (
                  <div className="rounded-full bg-[#FED982] px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#48B358] flex items-center justify-center text-white flex-shrink-0">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="font-black text-[14px] text-[#1B1D20] leading-none">
                      +15
                    </span>
                  </div>
                ) : (
                  <div className="rounded-full bg-[#DDE3EC] px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#757D8A] flex items-center justify-center text-white flex-shrink-0">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <span className="font-black text-[14px] text-[#1B1D20] leading-none">
                      +0
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Center Starburst: "You got it!" / "Both right!" / "They got it!" / "Nobody 😭" */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88px] h-[90px] z-20 pointer-events-none select-none flex items-center justify-center filter drop-shadow-xs">
              <img
                src="/assets/reveal/match-starburst.webp"
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 pt-1 text-[#1B1D20]">
                {triviaBurstText === 'You got it!' ? (
                  <>
                    <span className="text-[12.5px] font-black leading-[1.05] tracking-tight">
                      You
                    </span>
                    <span className="text-[12.5px] font-black leading-[1.05] tracking-tight">
                      got it!
                    </span>
                  </>
                ) : triviaBurstText === 'Both right!' ? (
                  <>
                    <span className="text-[12.5px] font-black leading-[1.05] tracking-tight">
                      Both
                    </span>
                    <span className="text-[12.5px] font-black leading-[1.05] tracking-tight">
                      right!
                    </span>
                  </>
                ) : triviaBurstText === 'They got it!' ? (
                  <>
                    <span className="text-[12.5px] font-black leading-[1.05] tracking-tight">
                      They
                    </span>
                    <span className="text-[12.5px] font-black leading-[1.05] tracking-tight">
                      got it!
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11.5px] font-black leading-[1.05] tracking-tight">
                      Nobody
                    </span>
                    <span className="text-[13px] font-black leading-[1.05] tracking-tight">
                      😭
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Player: Blue Blob (Alex) */}
            <div
              onClick={() =>
                setInspectingPlayer({
                  name: p2LabelText,
                  avatarSrc: p2AvatarSrc,
                  answer: p2TriviaAnswer,
                  blobBg: '#8EAFFD',
                })
              }
              className="relative w-[48%] max-w-[172px] aspect-[456/468] flex flex-col items-center justify-center p-2.5 cursor-pointer active:scale-[0.98] transition-transform z-10"
              title="Click to view full answer"
            >
              <img
                src="/assets/reveal/card-blob-blue.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />

              <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1 pt-1 pb-1">
                <img
                  src={p2AvatarSrc}
                  alt={p2LabelText}
                  className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] object-contain mb-1 flex-shrink-0"
                  draggable={false}
                />
                <span className="text-[15px] font-black text-[#1B1D20] tracking-tight leading-tight mb-0.5 truncate max-w-[124px]">
                  {p2LabelText}
                </span>
                <span className="text-[13px] font-bold text-[#1B1D20]/60 tracking-tight leading-tight mb-1 truncate max-w-[128px]">
                  {p2TriviaAnswer}
                </span>

                {/* Score Pill: Green check +15 or Soft gray cross +0 */}
                {p2IsCorrect ? (
                  <div className="rounded-full bg-[#FED982] px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#48B358] flex items-center justify-center text-white flex-shrink-0">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="font-black text-[14px] text-[#1B1D20] leading-none">
                      +15
                    </span>
                  </div>
                ) : (
                  <div className="rounded-full bg-[#DDE3EC] px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#757D8A] flex items-center justify-center text-white flex-shrink-0">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <span className="font-black text-[14px] text-[#1B1D20] leading-none">
                      +0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. SCORE SECTION: "Score", "80 - 65", "You won 🎉" */}
          <div className="relative w-full flex flex-col items-center mb-5 select-none z-10">
            <span className="text-[14px] font-bold text-[#1B1D20]/60 tracking-tight leading-none mb-1">
              Score
            </span>
            <span className="font-black text-[62px] sm:text-[68px] leading-none text-[#1B1D20] tracking-[-0.03em] my-1">
              {p1Score} - {p2Score}
            </span>
            <span className="text-[16px] font-extrabold text-[#1B1D20] tracking-tight leading-none mt-1">
              {winnerText}
            </span>

            {/* Orbiting decorations */}
            {/* Yellow Crescent Moon on middle-left */}
            <img
              src="/assets/reveal/crescent-yellow.webp"
              alt=""
              className="absolute -left-2 top-[14px] w-[46px] h-[52px] object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            {/* Blue Starburst on middle-right */}
            <img
              src="/assets/reveal/starburst-blue.webp"
              alt=""
              className="absolute -right-2 top-[8px] w-[50px] h-[54px] object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
            {/* Olive Green Cross on lower-right */}
            <img
              src="/assets/reveal/cross-olive.webp"
              alt=""
              className="absolute right-0 bottom-[-16px] w-[42px] h-[44px] object-contain pointer-events-none select-none z-0"
              draggable={false}
            />
          </div>

          {/* 7. EMOJI REACTION ROW: 6 Dashed Circles with Instagram-style Floating & Tilted Reaction Animations */}
          <div
            className="w-full flex items-center justify-between mb-5 px-1 z-10 relative"
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePointerDown(
                          {
                            currentTarget: e.currentTarget,
                            pointerType: 'mouse',
                            button: 0,
                            preventDefault: () => {},
                          } as any,
                          emoji.id
                        );
                        setTimeout(handlePointerUp, 150);
                      }
                    }}
                    aria-label={emoji.alt}
                    aria-pressed={isSelected}
                    style={{
                      touchAction: 'manipulation',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                    }}
                    className={`w-[44px] h-[44px] rounded-full border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out focus:outline-none p-0 bg-transparent select-none touch-manipulation ${
                      isSelected
                        ? 'border-[#1B1D20] bg-white/40'
                        : 'border-[#1B1D20]/45 hover:border-[#1B1D20]/75'
                    } ${isHeld ? 'scale-[0.92]' : isSelected ? 'scale-105' : 'scale-100 hover:scale-105'}`}
                  >
                    <img
                      src={emoji.file}
                      alt={emoji.alt}
                      className={`w-[25px] h-[25px] object-contain pointer-events-none select-none transition-transform duration-150 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      draggable={false}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 8. ACTION BUTTONS: Match mockup buttons (Black Save button + Soft lilac Next question tomorrow) */}
          <div className="w-full flex flex-col gap-3 mb-6 relative z-10">
            {/* Button 1: Save to Memory Wall (Black pill with white bookmark icon) */}
            <button
              type="button"
              onClick={handleSave}
              className="btn-press w-full h-[52px] sm:h-[54px] rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-extrabold text-[16.5px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform"
            >
              <svg
                width="17"
                height="17"
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

            {/* Button 2: Next question ✨ (Soft lilac-gray pill with muted text) */}
            <button
              type="button"
              onClick={handleNextClick}
              className="btn-press w-full h-[52px] sm:h-[54px] rounded-full bg-[#D5C7D7] hover:bg-[#C9B9CB] text-[#7A7380] font-extrabold text-[16.5px] tracking-tight flex items-center justify-center cursor-pointer focus:outline-none active:scale-[0.98] transition-transform"
            >
              <span>
                {isInGame
                  ? gameSession.currentRound < gameSession.totalRounds
                    ? `Next question (${gameSession.currentRound + 1}/${gameSession.totalRounds}) ✨`
                    : 'See final results 🏆 ✨'
                  : 'Next question ✨'}
              </span>
            </button>
          </div>

          {/* Bottom Peripheral Decorations */}
          <img
            src="/assets/reveal/heart-pink-small.webp"
            alt=""
            className="absolute -left-2 bottom-6 w-[48px] h-[46px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <img
            src="/assets/reveal/crescent-yellow.webp"
            alt=""
            className="absolute -right-2 bottom-2 w-[44px] h-[48px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <img
            src="/assets/reveal/deco-bottom-left.webp"
            alt=""
            className="absolute left-4 -bottom-4 w-[46px] h-[44px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          </div>
        </div>
      )}

      {/* =========================================================================
          TRIVIA REVEAL SCREEN (DESKTOP & TABLET: 768px and up, 2-COLUMN LAYOUT)
         ========================================================================= */}
      {isTriviaRound && (
        <div
          className="hidden md:flex flex-col items-center justify-center relative w-full h-[100dvh] overflow-hidden select-none font-['Nunito',sans-serif] bg-[#F5CCE2]"
          style={{
            ['--u' as any]: 'min(calc(100vw / 1586), calc(100dvh / 992))',
          }}
        >
          {/* VIEWPORT FIXED DECORATIONS */}
          {/* Top-Right Cropped Pink Heart */}
          <img
            src="/assets/reveal/heart-pink-small.webp"
            alt=""
            className="fixed top-0 right-0 pointer-events-none select-none z-0"
            style={{
              width: 'calc(140 * var(--u))',
              height: 'calc(135 * var(--u))',
            }}
            draggable={false}
          />

          {/* Left Yellow Moon */}
          <img
            src="/assets/reveal/crescent-yellow.webp"
            alt=""
            className="fixed pointer-events-none select-none z-0"
            style={{
              left: 'calc(30 * var(--u))',
              top: 'calc(450 * var(--u))',
              width: 'calc(90 * var(--u))',
              height: 'calc(105 * var(--u))',
            }}
            draggable={false}
          />

          {/* Right Blue Starburst */}
          <img
            src="/assets/reveal/starburst-blue.webp"
            alt=""
            className="fixed pointer-events-none select-none z-0"
            style={{
              right: 'calc(35 * var(--u))',
              top: 'calc(440 * var(--u))',
              width: 'calc(100 * var(--u))',
              height: 'calc(110 * var(--u))',
            }}
            draggable={false}
          />

          {/* Bottom-Left Pink Heart */}
          <img
            src="/assets/reveal/heart-pink-small.webp"
            alt=""
            className="fixed pointer-events-none select-none z-0"
            style={{
              left: 'calc(20 * var(--u))',
              bottom: 'calc(30 * var(--u))',
              width: 'calc(110 * var(--u))',
              height: 'calc(105 * var(--u))',
            }}
            draggable={false}
          />

          {/* Bottom-Right Olive Cross */}
          <img
            src="/assets/reveal/cross-olive.webp"
            alt=""
            className="fixed pointer-events-none select-none z-0"
            style={{
              right: 'calc(60 * var(--u))',
              bottom: 'calc(100 * var(--u))',
              width: 'calc(80 * var(--u))',
              height: 'calc(85 * var(--u))',
            }}
            draggable={false}
          />

          {/* Bottom-Right Yellow Moon */}
          <img
            src="/assets/reveal/crescent-yellow.webp"
            alt=""
            className="fixed pointer-events-none select-none z-0"
            style={{
              right: 'calc(25 * var(--u))',
              bottom: 'calc(30 * var(--u))',
              width: 'calc(85 * var(--u))',
              height: 'calc(95 * var(--u))',
            }}
            draggable={false}
          />

          {/* 1586 x 992 DESIGN CANVAS (Matching Homepage Structure & Locked Page) */}
          <div
            className="relative flex flex-col justify-between items-center z-10 flex-shrink-0"
            style={{
              width: 'calc(1586 * var(--u))',
              height: 'calc(992 * var(--u))',
            }}
          >
            {/* DESKTOP TOP BAR: Matches locked page topbar exactly (same position, same sizes, round pill in center) */}
            {/* Left: Duo Logo (center x=265, center y=75) */}
            <button
              type="button"
              onClick={handleOpenFriendProfile}
              aria-label="Friend Profile"
              className="btn-press absolute cursor-pointer flex items-center justify-center p-0 outline-none transition-transform active:scale-95 z-20"
              style={{
                left: 'calc(265 * var(--u))',
                top: 'calc(75 * var(--u))',
                transform: 'translate(-50%, -50%)',
                width: 'calc(116 * var(--u))',
                height: 'calc(46 * var(--u))',
              }}
            >
              <img
                src="/logo-duo-sparks.webp"
                alt="Duo"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </button>

            {/* Center: Round Pill - Same position, size, shape as locked page streak pill (center x=793, 146w x 66h, rounded-full) */}
            <div
              className="absolute rounded-full bg-[#191D21] flex flex-col items-center justify-center shadow-sm pointer-events-none z-20"
              style={{
                left: 'calc(793 * var(--u))',
                top: 'calc(75 * var(--u))',
                transform: 'translate(-50%, -50%)',
                width: 'calc(146 * var(--u))',
                height: 'calc(66 * var(--u))',
                borderRadius: 'calc(33 * var(--u))',
              }}
            >
              <span
                className="font-bold text-white/60 uppercase tracking-widest text-center"
                style={{ fontSize: 'calc(11 * var(--u))', lineHeight: 1 }}
              >
                ROUND
              </span>
              <span
                className="font-black text-white leading-none tracking-tight text-center"
                style={{ fontSize: 'calc(23 * var(--u))', marginTop: 'calc(2 * var(--u))' }}
              >
                {currentRound} <span className="text-white/40 font-normal">/</span> {totalRounds}
              </span>
            </div>

            {/* Right: Settings icon (center x=1363, 78 diameter) */}
            <button
              type="button"
              onClick={handleOpenSettings}
              aria-label="Settings"
              className="btn-press absolute rounded-full flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
              style={{
                left: 'calc(1363 * var(--u))',
                top: 'calc(75 * var(--u))',
                transform: 'translate(-50%, -50%)',
                width: 'calc(78 * var(--u))',
                height: 'calc(78 * var(--u))',
                border: 'calc(3.5 * var(--u)) dashed #17181B',
              }}
            >
              <svg
                style={{ width: 'calc(38 * var(--u))', height: 'calc(38 * var(--u))' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            {/* MAIN STAGE CONTENT (Centered vertically between top bar and bottom) */}
            <div
              className="flex-1 flex flex-col items-center justify-center w-full"
              style={{ marginTop: 'calc(130 * var(--u))' }}
            >
              <div
                className="flex items-center justify-between"
                style={{
                  width: 'calc(1430 * var(--u))',
                  gap: 'calc(70 * var(--u))',
                }}
              >
              {/* LEFT COLUMN: tag, question, correct answer block, score */}
              <div
                className="flex flex-col items-start justify-center"
                style={{ width: 'calc(680 * var(--u))' }}
              >
                {/* Yellow Pill Tag */}
                <div
                  className="rounded-full bg-[#FED982] flex items-center justify-center shadow-2xs"
                  style={{
                    paddingLeft: 'calc(22 * var(--u))',
                    paddingRight: 'calc(22 * var(--u))',
                    paddingTop: 'calc(8 * var(--u))',
                    paddingBottom: 'calc(8 * var(--u))',
                    marginBottom: 'calc(16 * var(--u))',
                  }}
                >
                  <span
                    className="font-extrabold text-[#1B1D20] tracking-tight leading-none"
                    style={{ fontSize: 'calc(22 * var(--u))' }}
                  >
                    Trivia · {triviaCategory}
                  </span>
                </div>

                {/* Huge Bold Question */}
                <h2
                  className="font-black text-[#1B1D20] tracking-[-0.03em] leading-[1.08] m-0 text-left"
                  style={{
                    fontSize: 'calc(48 * var(--u))',
                    marginBottom: 'calc(20 * var(--u))',
                  }}
                >
                  {rawQuestion}
                </h2>

                {/* Correct Answer Block */}
                <div
                  className="relative aspect-[548/326] flex items-center justify-center"
                  style={{
                    width: 'calc(440 * var(--u))',
                    marginBottom: 'calc(24 * var(--u))',
                  }}
                >
                  <img
                    src="/assets/correct-answer-blob-sparkles.webp"
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                    draggable={false}
                  />

                  <div
                    className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none h-full overflow-hidden"
                    style={{
                      width: '72%',
                      maxWidth: 'calc(316 * var(--u))',
                      paddingLeft: 'calc(max(16 * var(--u), 8px))',
                      paddingRight: 'calc(max(16 * var(--u), 8px))',
                      paddingTop: 'calc(max(10 * var(--u), 6px))',
                      paddingBottom: 'calc(max(10 * var(--u), 6px))',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      className="rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0"
                      style={{
                        width: 'calc(46 * var(--u))',
                        height: 'calc(46 * var(--u))',
                        marginBottom: 'calc(6 * var(--u))',
                      }}
                    >
                      <svg
                        style={{
                          width: 'calc(24 * var(--u))',
                          height: 'calc(24 * var(--u))',
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#48B358"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <span
                      className="font-extrabold text-[#1B1D20]/80 tracking-tight leading-none flex-shrink-0"
                      style={{
                        fontSize: 'calc(18 * var(--u))',
                        marginBottom: 'calc(4 * var(--u))',
                      }}
                    >
                      Correct answer
                    </span>

                    <span
                      className="font-black text-[#1B1D20] tracking-[-0.03em] leading-[1.12] text-center break-words w-full"
                      style={{
                        fontSize: correctTriviaAnswer.length > 30
                          ? 'calc(24 * var(--u))'
                          : correctTriviaAnswer.length > 20
                          ? 'calc(28 * var(--u))'
                          : correctTriviaAnswer.length > 12
                          ? 'calc(36 * var(--u))'
                          : correctTriviaAnswer.length > 7
                          ? 'calc(42 * var(--u))'
                          : 'calc(50 * var(--u))',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxHeight: 'calc(110 * var(--u))',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {correctTriviaAnswer}
                    </span>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="flex flex-col items-start select-none">
                  <span
                    className="font-bold text-[#1B1D20]/60 tracking-tight leading-none"
                    style={{ fontSize: 'calc(20 * var(--u))' }}
                  >
                    Score
                  </span>
                  <span
                    className="font-black text-[#1B1D20] tracking-[-0.03em] leading-none"
                    style={{
                      fontSize: 'calc(78 * var(--u))',
                      marginTop: 'calc(4 * var(--u))',
                      marginBottom: 'calc(4 * var(--u))',
                    }}
                  >
                    {p1Score} - {p2Score}
                  </span>
                  <span
                    className="font-extrabold text-[#1B1D20] tracking-tight leading-none"
                    style={{ fontSize: 'calc(24 * var(--u))' }}
                  >
                    {winnerText}
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: player blobs, emoji row, buttons */}
              <div
                className="flex flex-col items-center justify-center"
                style={{ width: 'calc(680 * var(--u))' }}
              >
                {/* Two Player Blobs with Starburst in Center */}
                <div
                  className="relative w-full flex items-center justify-between"
                  style={{ marginBottom: 'calc(32 * var(--u))' }}
                >
                  {/* Left Player (Musab) */}
                  <div
                    className="relative aspect-[456/468] flex flex-col items-center justify-center z-10"
                    style={{
                      width: 'calc(300 * var(--u))',
                      padding: 'calc(16 * var(--u))',
                    }}
                  >
                    <img
                      src="/assets/reveal/card-blob-pink.webp"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                      draggable={false}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none">
                      <img
                        src={p1AvatarSrc}
                        alt={p1LabelText}
                        className="object-contain flex-shrink-0"
                        style={{
                          width: 'calc(78 * var(--u))',
                          height: 'calc(78 * var(--u))',
                          marginBottom: 'calc(8 * var(--u))',
                        }}
                        draggable={false}
                      />
                      <span
                        className="font-black text-[#1B1D20] tracking-tight leading-tight truncate max-w-full"
                        style={{
                          fontSize: 'calc(24 * var(--u))',
                          marginBottom: 'calc(4 * var(--u))',
                        }}
                      >
                        {p1LabelText}
                      </span>
                      <span
                        className="font-bold text-[#1B1D20]/60 tracking-tight leading-tight truncate max-w-full"
                        style={{
                          fontSize: 'calc(20 * var(--u))',
                          marginBottom: 'calc(12 * var(--u))',
                        }}
                      >
                        {p1TriviaAnswer}
                      </span>

                      {p1IsCorrect ? (
                        <div
                          className="rounded-full bg-[#FED982] flex items-center shadow-2xs"
                          style={{
                            paddingLeft: 'calc(16 * var(--u))',
                            paddingRight: 'calc(16 * var(--u))',
                            paddingTop: 'calc(6 * var(--u))',
                            paddingBottom: 'calc(6 * var(--u))',
                            gap: 'calc(8 * var(--u))',
                          }}
                        >
                          <div
                            className="rounded-full bg-[#48B358] flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              width: 'calc(26 * var(--u))',
                              height: 'calc(26 * var(--u))',
                            }}
                          >
                            <svg
                              style={{
                                width: 'calc(15 * var(--u))',
                                height: 'calc(15 * var(--u))',
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span
                            className="font-black text-[#1B1D20] leading-none"
                            style={{ fontSize: 'calc(20 * var(--u))' }}
                          >
                            +15
                          </span>
                        </div>
                      ) : (
                        <div
                          className="rounded-full bg-[#DDE3EC] flex items-center shadow-2xs"
                          style={{
                            paddingLeft: 'calc(16 * var(--u))',
                            paddingRight: 'calc(16 * var(--u))',
                            paddingTop: 'calc(6 * var(--u))',
                            paddingBottom: 'calc(6 * var(--u))',
                            gap: 'calc(8 * var(--u))',
                          }}
                        >
                          <div
                            className="rounded-full bg-[#757D8A] flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              width: 'calc(26 * var(--u))',
                              height: 'calc(26 * var(--u))',
                            }}
                          >
                            <svg
                              style={{
                                width: 'calc(15 * var(--u))',
                                height: 'calc(15 * var(--u))',
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </div>
                          <span
                            className="font-black text-[#1B1D20] leading-none"
                            style={{ fontSize: 'calc(20 * var(--u))' }}
                          >
                            +0
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Starburst */}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex items-center justify-center filter drop-shadow-xs"
                    style={{
                      width: 'calc(140 * var(--u))',
                      height: 'calc(144 * var(--u))',
                    }}
                  >
                    <img
                      src="/assets/reveal/match-starburst.webp"
                      alt=""
                      className="w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1 text-[#1B1D20]">
                      <span
                        className="font-black leading-[1.08] tracking-tight"
                        style={{ fontSize: 'calc(19 * var(--u))' }}
                      >
                        {triviaBurstText}
                      </span>
                    </div>
                  </div>

                  {/* Right Player (Alex) */}
                  <div
                    className="relative aspect-[456/468] flex flex-col items-center justify-center z-10"
                    style={{
                      width: 'calc(300 * var(--u))',
                      padding: 'calc(16 * var(--u))',
                    }}
                  >
                    <img
                      src="/assets/reveal/card-blob-blue.webp"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                      draggable={false}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none">
                      <img
                        src={p2AvatarSrc}
                        alt={p2LabelText}
                        className="object-contain flex-shrink-0"
                        style={{
                          width: 'calc(78 * var(--u))',
                          height: 'calc(78 * var(--u))',
                          marginBottom: 'calc(8 * var(--u))',
                        }}
                        draggable={false}
                      />
                      <span
                        className="font-black text-[#1B1D20] tracking-tight leading-tight truncate max-w-full"
                        style={{
                          fontSize: 'calc(24 * var(--u))',
                          marginBottom: 'calc(4 * var(--u))',
                        }}
                      >
                        {p2LabelText}
                      </span>
                      <span
                        className="font-bold text-[#1B1D20]/60 tracking-tight leading-tight truncate max-w-full"
                        style={{
                          fontSize: 'calc(20 * var(--u))',
                          marginBottom: 'calc(12 * var(--u))',
                        }}
                      >
                        {p2TriviaAnswer}
                      </span>

                      {p2IsCorrect ? (
                        <div
                          className="rounded-full bg-[#FED982] flex items-center shadow-2xs"
                          style={{
                            paddingLeft: 'calc(16 * var(--u))',
                            paddingRight: 'calc(16 * var(--u))',
                            paddingTop: 'calc(6 * var(--u))',
                            paddingBottom: 'calc(6 * var(--u))',
                            gap: 'calc(8 * var(--u))',
                          }}
                        >
                          <div
                            className="rounded-full bg-[#48B358] flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              width: 'calc(26 * var(--u))',
                              height: 'calc(26 * var(--u))',
                            }}
                          >
                            <svg
                              style={{
                                width: 'calc(15 * var(--u))',
                                height: 'calc(15 * var(--u))',
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span
                            className="font-black text-[#1B1D20] leading-none"
                            style={{ fontSize: 'calc(20 * var(--u))' }}
                          >
                            +15
                          </span>
                        </div>
                      ) : (
                        <div
                          className="rounded-full bg-[#DDE3EC] flex items-center shadow-2xs"
                          style={{
                            paddingLeft: 'calc(16 * var(--u))',
                            paddingRight: 'calc(16 * var(--u))',
                            paddingTop: 'calc(6 * var(--u))',
                            paddingBottom: 'calc(6 * var(--u))',
                            gap: 'calc(8 * var(--u))',
                          }}
                        >
                          <div
                            className="rounded-full bg-[#757D8A] flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              width: 'calc(26 * var(--u))',
                              height: 'calc(26 * var(--u))',
                            }}
                          >
                            <svg
                              style={{
                                width: 'calc(15 * var(--u))',
                                height: 'calc(15 * var(--u))',
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </div>
                          <span
                            className="font-black text-[#1B1D20] leading-none"
                            style={{ fontSize: 'calc(20 * var(--u))' }}
                          >
                            +0
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reaction Emoji Row: With Instagram-style Floating & Tilted Reaction Animations */}
                <div
                  className="w-full flex items-center justify-between relative"
                  style={{ marginBottom: 'calc(32 * var(--u))' }}
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handlePointerDown(
                                {
                                  currentTarget: e.currentTarget,
                                  pointerType: 'mouse',
                                  button: 0,
                                  preventDefault: () => {},
                                } as any,
                                emoji.id
                              );
                              setTimeout(handlePointerUp, 150);
                            }
                          }}
                          aria-label={emoji.alt}
                          aria-pressed={isSelected}
                          className={`rounded-full border-dashed flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out focus:outline-none p-0 bg-transparent select-none touch-manipulation ${
                            isSelected
                              ? 'border-[#1B1D20] bg-white/40'
                              : 'border-[#1B1D20]/45 hover:border-[#1B1D20]/75'
                          } ${isHeld ? 'scale-[0.92]' : isSelected ? 'scale-105' : 'scale-100 hover:scale-105'}`}
                          style={{
                            width: 'calc(68 * var(--u))',
                            height: 'calc(68 * var(--u))',
                            borderWidth: 'calc(2 * var(--u))',
                            touchAction: 'manipulation',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none',
                          }}
                        >
                          <img
                            src={emoji.file}
                            alt={emoji.alt}
                            className={`object-contain pointer-events-none select-none transition-transform duration-150 ${
                              isSelected ? 'scale-110' : ''
                            }`}
                            style={{
                              width: 'calc(38 * var(--u))',
                              height: 'calc(38 * var(--u))',
                            }}
                            draggable={false}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div
                  className="w-full flex flex-col"
                  style={{ gap: 'calc(16 * var(--u))' }}
                >
                  <button
                    type="button"
                    onClick={handleSave}
                    className="btn-press w-full rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-extrabold tracking-tight flex items-center justify-center cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform"
                    style={{
                      height: 'calc(74 * var(--u))',
                      fontSize: 'calc(24 * var(--u))',
                      gap: 'calc(12 * var(--u))',
                    }}
                  >
                    <svg
                      style={{
                        width: 'calc(24 * var(--u))',
                        height: 'calc(24 * var(--u))',
                      }}
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

                  <button
                    type="button"
                    onClick={handleNextClick}
                    className="btn-press w-full rounded-full bg-[#D5C7D7] hover:bg-[#C9B9CB] text-[#7A7380] font-extrabold tracking-tight flex items-center justify-center cursor-pointer focus:outline-none active:scale-[0.98] transition-transform"
                    style={{
                      height: 'calc(74 * var(--u))',
                      fontSize: 'calc(24 * var(--u))',
                    }}
                  >
                    <span>
                      {isInGame
                        ? gameSession.currentRound < gameSession.totalRounds
                          ? `Next question (${gameSession.currentRound + 1}/${gameSession.totalRounds}) ✨`
                          : 'See final results 🏆 ✨'
                        : 'Next question ✨'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          KNOW ME REVEAL SCREEN (Existing screen preserved, DAYS STRIP REMOVED)
         ========================================================================= */}
      {isKnowMeRound && (
        <div className="relative w-full min-h-[100dvh] max-w-[390px] mx-auto flex flex-col justify-start items-center select-none">
          {/* 1. TOP BAR: Exact same top bar component from Homepage & Waiting page (with Rounds pill instead of streak) */}
          <TopBar
            mode="rounds"
            currentRound={currentRound}
            totalRounds={totalRounds}
            onOpenSettings={handleOpenSettings}
            onOpenFriendProfile={handleOpenFriendProfile}
            className="w-full absolute top-0 left-0"
          />

          <div className="w-full px-5 flex-1 flex flex-col items-center justify-start pt-[56px] pb-14 relative z-10">

          {/* Note: DAYS/TIMELINE STRIP (MON 12 - SUN 18) DELETED PER EXPLICIT INSTRUCTION */}

          {/* 2. QUESTION HEADLINE */}
          <div className="mb-6 px-1 select-none">
            <h2 className="font-black text-[30px] sm:text-[34px] leading-[1.1] text-[#1B1D20] tracking-[-0.03em] m-0 break-words">
              {rawQuestion}
            </h2>
          </div>

          {/* 3. PLAYER ANSWER BLOBS & MATCH STARBURST */}
          <div className="relative w-full flex items-center justify-between mb-8 select-none">
            {/* Left Card: Pink Organic Blob */}
            <div
              onClick={() =>
                setInspectingPlayer({
                  name: p1LabelText,
                  avatarSrc: p1AvatarSrc,
                  answer: resolvedP1Answer,
                  blobBg: '#FCA0D1',
                })
              }
              className="relative w-[48%] max-w-[172px] aspect-[456/468] flex flex-col items-center justify-center p-3 cursor-pointer active:scale-[0.98] transition-transform z-10"
              title="Click to view full answer"
            >
              <img
                src="/assets/reveal/card-blob-pink.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />

              <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1 pt-1 pb-1">
                <img
                  src={p1AvatarSrc}
                  alt={p1LabelText}
                  className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] object-contain mb-1 flex-shrink-0"
                  draggable={false}
                />
                <span className="text-[11.5px] font-bold text-[#1B1D20]/60 tracking-tight leading-none mb-1 flex-shrink-0 max-w-[124px] truncate">
                  {p1LabelText}
                </span>
                <p className="font-black text-[15px] sm:text-[16.5px] leading-[1.12] text-[#1B1D20] tracking-tight m-0 line-clamp-2 break-words max-w-[128px]">
                  {resolvedP1Answer}
                </p>
              </div>
            </div>

            {/* Center Starburst: Matched / Not Matched */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92px] h-[94px] z-20 pointer-events-none select-none flex items-center justify-center filter drop-shadow-md">
              <img
                src={
                  isSuccess
                    ? '/assets/reveal/match-starburst.webp'
                    : '/assets/reveal/match-starburst-black.webp'
                }
                alt={isSuccess ? 'Matched Starburst' : 'Not Matched Starburst'}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-center pt-1 ${
                  isSuccess ? 'text-[#1B1D20]' : 'text-white'
                }`}
              >
                <span className="text-[11.5px] font-black leading-[1.05] tracking-tight">
                  {isSuccess ? 'You' : 'No'}
                </span>
                <span className="text-[11.5px] font-black leading-[1.05] tracking-tight">
                  {isSuccess ? 'matched!' : 'match!'}
                </span>
                <span
                  className={`text-[15px] font-black leading-none mt-0.5 ${
                    isSuccess ? 'text-[#1B1D20]' : 'text-white'
                  }`}
                >
                  {isSuccess ? '+15' : '+0'}
                </span>
              </div>
            </div>

            {/* Right Card: Blue Organic Blob */}
            <div
              onClick={() =>
                setInspectingPlayer({
                  name: p2LabelText,
                  avatarSrc: p2AvatarSrc,
                  answer: resolvedP2Answer,
                  blobBg: '#8EAFFD',
                })
              }
              className="relative w-[48%] max-w-[172px] aspect-[456/468] flex flex-col items-center justify-center p-3 cursor-pointer active:scale-[0.98] transition-transform z-10"
              title="Click to view full answer"
            >
              <img
                src="/assets/reveal/card-blob-blue.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />

              <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1 pt-1 pb-1">
                <img
                  src={p2AvatarSrc}
                  alt={p2LabelText}
                  className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] object-contain mb-1 flex-shrink-0"
                  draggable={false}
                />
                <span className="text-[11.5px] font-bold text-[#1B1D20]/60 tracking-tight leading-none mb-1 flex-shrink-0 max-w-[124px] truncate">
                  {p2LabelText}
                </span>
                <p className="font-black text-[15px] sm:text-[16.5px] leading-[1.12] text-[#1B1D20] tracking-tight m-0 line-clamp-2 break-words max-w-[128px]">
                  {resolvedP2Answer}
                </p>
              </div>
            </div>
          </div>

          {/* 4. MIDDLE SYNC SCORE SECTION & 4 ORBITING DECORATIONS */}
          <div className="relative w-full flex flex-col items-center mb-7 py-2">
            <span className="text-[14px] font-bold text-[#1B1D20]/60 tracking-tight mb-0.5">
              Sync score
            </span>
            <span className="font-black text-[74px] sm:text-[78px] leading-none text-[#1B1D20] tracking-[-0.04em] my-1">
              {syncScore}%
            </span>

            <img
              src="/assets/reveal/crescent-yellow.webp"
              alt=""
              className="absolute left-[12%] sm:left-[14%] top-[12px] w-[42px] h-[46px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />
            <img
              src="/assets/reveal/heart-pink-small.webp"
              alt=""
              className="absolute left-[8%] sm:left-[10%] bottom-[20px] w-[38px] h-[35px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />
            <img
              src="/assets/reveal/starburst-blue.webp"
              alt=""
              className="absolute right-[12%] sm:right-[14%] top-[8px] w-[46px] h-[50px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />
            <img
              src="/assets/reveal/cross-olive.webp"
              alt=""
              className="absolute right-[10%] sm:right-[12%] bottom-[16px] w-[40px] h-[42px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />

            <p className="text-[14px] sm:text-[14.5px] font-bold text-[#1B1D20]/70 tracking-tight m-0 mt-1">
              you know each other better today
            </p>
          </div>

          {/* 5. REACTION EMOJIS ROW: With Instagram-style Floating & Tilted Reaction Animations */}
          <div
            className="w-full flex items-center justify-between mb-7 px-1 relative"
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePointerDown(
                          {
                            currentTarget: e.currentTarget,
                            pointerType: 'mouse',
                            button: 0,
                            preventDefault: () => {},
                          } as any,
                          emoji.id
                        );
                        setTimeout(handlePointerUp, 150);
                      }
                    }}
                    aria-label={emoji.alt}
                    aria-pressed={isSelected}
                    style={{
                      touchAction: 'manipulation',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none',
                    }}
                    className={`w-[44px] h-[44px] rounded-full border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-transform duration-150 ease-out focus:outline-none p-0 bg-transparent select-none touch-manipulation ${
                      isSelected
                        ? 'border-[#1B1D20] bg-white/40'
                        : 'border-[#1B1D20]/45 hover:border-[#1B1D20]/75'
                    } ${isHeld ? 'scale-[0.92]' : isSelected ? 'scale-105' : 'scale-100 hover:scale-105'}`}
                  >
                    <img
                      src={emoji.file}
                      alt={emoji.alt}
                      className={`w-[25px] h-[25px] object-contain pointer-events-none select-none transition-transform duration-150 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      draggable={false}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 6. ACTION BUTTONS: Match mockup buttons */}
          <div className="w-full flex flex-col gap-3 mb-6 relative z-10">
            <button
              type="button"
              onClick={handleSave}
              className="btn-press w-full h-[52px] sm:h-[54px] rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-extrabold text-[16.5px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform"
            >
              <svg
                width="17"
                height="17"
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

            <button
              type="button"
              onClick={handleNextClick}
              className="btn-press w-full h-[52px] sm:h-[54px] rounded-full bg-[#D5C7D7] hover:bg-[#C9B9CB] text-[#7A7380] font-extrabold text-[16.5px] tracking-tight flex items-center justify-center cursor-pointer focus:outline-none active:scale-[0.98] transition-transform"
            >
              <span>
                {isInGame
                  ? gameSession.currentRound < gameSession.totalRounds
                    ? `Next question (${gameSession.currentRound + 1}/${gameSession.totalRounds}) ✨`
                    : 'See final results 🏆 ✨'
                  : 'Next question ✨'}
              </span>
            </button>
          </div>

          {/* Bottom Corner Decorations */}
          <img
            src="/assets/reveal/deco-bottom-left.webp"
            alt=""
            className="absolute -left-[10px] bottom-[10px] w-[54px] h-[50px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          <img
            src="/assets/reveal/deco-bottom-right.webp"
            alt=""
            className="absolute -right-[8px] bottom-[8px] w-[50px] h-[48px] object-contain pointer-events-none select-none z-0"
            draggable={false}
          />
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL ANSWER INSPECTION MODAL (When clicking on blob answer)
         ========================================================================= */}
      {inspectingPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1D20]/60 backdrop-blur-xs select-auto"
          onClick={() => setInspectingPlayer(null)}
        >
          <div
            className="relative w-full max-w-[320px] bg-[#FAF6EB] rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center animate-pop border-2 border-[#1B1D20]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center mb-3 shadow-inner"
              style={{ backgroundColor: inspectingPlayer.blobBg }}
            >
              <img
                src={inspectingPlayer.avatarSrc}
                alt={inspectingPlayer.name}
                className="w-[54px] h-[54px] object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>

            <span className="text-[13px] font-bold text-[#1B1D20]/60 uppercase tracking-wider">
              {inspectingPlayer.name}’s answer
            </span>

            <h3 className="mt-2 text-[20px] sm:text-[22px] font-black text-[#1B1D20] leading-snug tracking-tight break-words max-h-[220px] overflow-y-auto px-1">
              “{inspectingPlayer.answer}”
            </h3>

            <button
              type="button"
              onClick={() => setInspectingPlayer(null)}
              className="mt-5 w-full h-[46px] rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-bold text-[16px] tracking-tight cursor-pointer btn-press"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
