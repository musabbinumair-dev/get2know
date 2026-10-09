import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameSession } from '../services/gameSessionContext';
import { useSession } from '../services/sessionContext';
import { KNOW_ME_QUESTIONS, KnowMeQuestion } from '../data/gameQuestions';
import { triggerHaptic } from '../utils/haptics';
import { playTapSound, playLockInSound } from '../lib/soundEffects';

export interface GuessTileConfig {
  id: 'pink' | 'yellow' | 'cream' | 'green';
  num: 1 | 2 | 3 | 4;
  text: string;
  defaultBlob: string;
  selectedBlob: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KnowMeGuessScreenProps {
  onBack?: () => void;
  onLockAnswer?: (optionId: string, optionText: string) => void;
  initialQuestion?: KnowMeQuestion;
}

const BASE_TILES: GuessTileConfig[] = [
  {
    id: 'pink',
    num: 1,
    text: 'Fried crickets',
    defaultBlob: '/assets/guess/answer-blob-1-pink.webp',
    selectedBlob: '/assets/guess/answer-blob-1-selected.webp',
    x: 65,
    y: 688,
    w: 345,
    h: 277,
  },
  {
    id: 'yellow',
    num: 2,
    text: 'Raw oysters',
    defaultBlob: '/assets/guess/answer-blob-2-yellow.webp',
    selectedBlob: '/assets/guess/answer-blob-2-selected.webp',
    x: 445,
    y: 688,
    w: 345,
    h: 277,
  },
  {
    id: 'cream',
    num: 3,
    text: 'Anchovies on pizza',
    defaultBlob: '/assets/guess/answer-blob-3-cream.webp',
    selectedBlob: '/assets/guess/answer-blob-3-selected.webp',
    x: 70,
    y: 985,
    w: 362,
    h: 275,
  },
  {
    id: 'green',
    num: 4,
    text: 'Durian',
    defaultBlob: '/assets/guess/answer-blob-4-green.webp',
    selectedBlob: '/assets/guess/answer-blob-4-selected.webp',
    x: 468,
    y: 995,
    w: 310,
    h: 265,
  },
];

export const KnowMeGuessScreen: React.FC<KnowMeGuessScreenProps> = ({
  onBack,
  onLockAnswer,
  initialQuestion,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameSession = useGameSession();
  const session = useSession();
  const isInGame = gameSession.isActive;

  // Background color sync: Cornflower / sky blue (#96B9FC)
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#96B9FC';
    document.documentElement.style.backgroundColor = '#96B9FC';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Determine active question data
  const currentKnowMeQ: KnowMeQuestion = (() => {
    if (initialQuestion) return initialQuestion;
    if (isInGame && gameSession.currentQuestion?.type === 'know-me') {
      return gameSession.currentQuestion as KnowMeQuestion;
    }
    return KNOW_ME_QUESTIONS[0];
  })();

  // Map options from question data or default
  const tiles: GuessTileConfig[] = BASE_TILES.map((base) => {
    if (isInGame && gameSession.currentKnowMeOptions) {
      const opt = gameSession.currentKnowMeOptions.find((o) => o.id === base.id);
      return {
        ...base,
        text: opt ? opt.text : base.text,
      };
    }
    const matched = currentKnowMeQ.guessOptions?.find((o) => o.id === base.id);
    return {
      ...base,
      text: matched ? matched.text : base.text,
    };
  });

  // Default selected option is 'cream' matching the mockup design
  const [selectedOptionId, setSelectedOptionId] = useState<'pink' | 'yellow' | 'cream' | 'green'>('cream');

  // Streak counter from session stats or fallback to 12 (mockup exact value)
  const streakCount = session.history?.stats?.streak ?? 12;

  const handleSelectOption = (id: 'pink' | 'yellow' | 'cream' | 'green') => {
    triggerHaptic(15);
    playTapSound();
    setSelectedOptionId(id);
  };

  const handleBack = () => {
    triggerHaptic(10);
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleLockGuess = () => {
    triggerHaptic(25);
    playLockInSound();
    const chosen = tiles.find((t) => t.id === selectedOptionId) || tiles[2];

    if (isInGame) {
      gameSession.submitGuess(chosen.id, chosen.text);
    } else if (onLockAnswer) {
      onLockAnswer(chosen.id, chosen.text);
    } else {
      navigate('/reveal');
    }
  };

  // Auto-lock when timer ends in Guess phase
  useEffect(() => {
    if (isInGame && gameSession.isTimerActive && gameSession.timer === 0 && !gameSession.isMyGuessLocked) {
      handleLockGuess();
    }
  }, [isInGame, gameSession.isTimerActive, gameSession.timer, gameSession.isMyGuessLocked]);

  const isForceTall = searchParams.get('layout') === 'tall';

  return (
    <div
      className="relative w-full min-h-[100dvh] bg-[#96B9FC] text-[#17181B] font-['Nunito',sans-serif] select-none overflow-x-hidden overflow-y-auto"
      style={{
        backgroundColor: '#96B9FC',
      }}
    >
      {/* ── 4. FIXED DECORATIONS LAYER AT PAGE ROOT (INSET 0, OVERFLOW HIDDEN, NO POINTER EVENTS, Z-0) ── */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {/* Moon (existing full asset): left -3.3vw, top 21.7vw, width 14vw. Sits above label, never over text */}
        <img
          src="/assets/guess/moon-yellow-top-left.webp"
          alt=""
          className="absolute object-contain pointer-events-none select-none"
          style={{
            left: '-3.3vw',
            top: '21.7vw',
            width: '14vw',
            height: 'auto',
          }}
          draggable={false}
        />

        {/* Heart (existing full asset): right -3vw, top 23.5vw, width 16.4vw */}
        <img
          src="/assets/guess/heart-pink-top-right.webp"
          alt=""
          className="absolute object-contain pointer-events-none select-none"
          style={{
            right: '-3vw',
            top: '23.5vw',
            width: '16.4vw',
            height: 'auto',
          }}
          draggable={false}
        />

        {/* Faded star: left 2.1vw, bottom 23vw, width 17.6vw */}
        <img
          src="/assets/guess/star-blue-faded-bottom-left.webp"
          alt=""
          className="absolute object-contain pointer-events-none select-none"
          style={{
            left: '2.1vw',
            bottom: '23vw',
            width: '17.6vw',
            height: 'auto',
          }}
          draggable={false}
        />

        {/* Green cross: right 1.6vw, bottom 23vw, width 14.7vw */}
        <img
          src="/assets/guess/cross-green-bottom-right.webp"
          alt=""
          className="absolute object-contain pointer-events-none select-none"
          style={{
            right: '1.6vw',
            bottom: '23vw',
            width: '14.7vw',
            height: 'auto',
          }}
          draggable={false}
        />
      </div>

      {/* ── 3. STAGE CANVAS (852 x 1846 with --u: calc(100vw / 852)) ── */}
      <div
        className="relative mx-auto z-10"
        style={{
          // --u calculates viewport unit proportional to 852 canvas width
          // If ?layout=tall is set or on mobile devices, use direct 100vw / 852
          ['--u' as any]: isForceTall
            ? 'calc(100vw / 852)'
            : 'calc(min(100vw, 480px) / 852)',
          width: 'calc(852 * var(--u))',
          height: 'calc(1846 * var(--u))',
          minHeight: '100dvh',
        }}
      >
        {/* ── TOP ROW CENTER Y=104 ── */}
        {/* Back Button: 77 circle, x=48, center y=104 */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="absolute flex items-center justify-center rounded-full bg-transparent p-0 cursor-pointer border-dashed border-[#17181B]"
          style={{
            left: 'calc(48 * var(--u))',
            top: 'calc((104 - 77 / 2) * var(--u))',
            width: 'calc(77 * var(--u))',
            height: 'calc(77 * var(--u))',
            borderWidth: 'calc(3 * var(--u))',
          }}
        >
          <svg
            fill="none"
            stroke="#17181B"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            style={{
              width: 'calc(36 * var(--u))',
              height: 'calc(36 * var(--u))',
              strokeWidth: 2.5,
            }}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* "Guess" Centered: font 54 weight 900, center y=104 */}
        <h1
          className="absolute m-0 text-[#17181B] pointer-events-none select-none tracking-tight font-black leading-none"
          style={{
            left: '50%',
            top: 'calc(104 * var(--u))',
            transform: 'translate(-50%, -50%)',
            fontSize: 'calc(54 * var(--u))',
            fontWeight: 900,
          }}
        >
          Guess
        </h1>

        {/* Streak Pill: x=665, 145x70, center y=104 */}
        <div
          className="absolute flex items-center justify-center rounded-full bg-[#17181B] text-[#FAF6EA] select-none"
          style={{
            left: 'calc(665 * var(--u))',
            top: 'calc((104 - 70 / 2) * var(--u))',
            width: 'calc(145 * var(--u))',
            height: 'calc(70 * var(--u))',
            gap: 'calc(10 * var(--u))',
            paddingLeft: 'calc(8 * var(--u))',
            paddingRight: 'calc(8 * var(--u))',
          }}
        >
          <img
            src="/assets/guess/icon-flame.webp"
            alt=""
            className="object-contain pointer-events-none"
            style={{
              width: 'calc(32 * var(--u))',
              height: 'calc(38 * var(--u))',
            }}
            draggable={false}
          />
          <span
            className="font-black leading-none text-white"
            style={{
              fontSize: 'calc(30 * var(--u))',
              fontWeight: 900,
            }}
          >
            {streakCount}
          </span>
        </div>

        {/* ── LABEL "Guess their answer": x=78, y=295, font 32 weight 700, color #5D6FA0 ── */}
        <div
          className="absolute pointer-events-none select-none tracking-tight"
          style={{
            left: 'calc(78 * var(--u))',
            top: 'calc(295 * var(--u))',
            fontSize: 'calc(32 * var(--u))',
            fontWeight: 700,
            color: '#5D6FA0',
          }}
        >
          Guess their answer
        </div>

        {/* ── HEADING: x=68, y=365, width 720, font 88 weight 900, line-height 1.06 ── */}
        {/* Wrap exactly to 3 lines: "What's the worst / food you've ever / tried?" */}
        <h2
          className="absolute m-0 text-[#17181B] pointer-events-none select-none tracking-tight font-black"
          style={{
            left: 'calc(68 * var(--u))',
            top: 'calc(365 * var(--u))',
            width: 'calc(720 * var(--u))',
            fontSize: 'calc(88 * var(--u))',
            fontWeight: 900,
            lineHeight: 1.06,
          }}
        >
          {currentKnowMeQ.id === 'k1' ? (
            <>
              What’s the worst
              <br />
              food you’ve ever
              <br />
              tried?
            </>
          ) : (
            currentKnowMeQ.question
          )}
        </h2>

        {/* ── 2. BURST: points-burst.webp SEPARATE ABSOLUTE ELEMENT at x=668 y=607 w=160 h=160 ── */}
        {/* No filter, outline, shadow or background. Text "+15" / "if right" live on top */}
        <div
          className="absolute pointer-events-none select-none flex items-center justify-center z-20"
          style={{
            left: 'calc(668 * var(--u))',
            top: 'calc(607 * var(--u))',
            width: 'calc(160 * var(--u))',
            height: 'calc(160 * var(--u))',
          }}
        >
          <img
            src="/assets/guess/points-burst.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
          <div
            className="relative z-10 flex flex-col items-center justify-center text-center text-[#17181B]"
            style={{
              marginTop: 'calc(-2 * var(--u))',
            }}
          >
            <span
              className="leading-none tracking-tight"
              style={{
                fontSize: 'calc(32 * var(--u))',
                fontWeight: 900,
              }}
            >
              +15
            </span>
            <span
              className="leading-tight tracking-tight"
              style={{
                fontSize: 'calc(23 * var(--u))',
                fontWeight: 800,
              }}
            >
              if right
            </span>
          </div>
        </div>

        {/* ── 1. TILES: NO SCALE ANIMATIONS, NO OUTLINE/BORDER/DROP-SHADOW/FILTER ── */}
        {/* Selecting = swap tile image to answer-blob-N-selected.webp (same size, same position) + black check badge top-right */}
        {tiles.map((tile) => {
          const isSelected = selectedOptionId === tile.id;
          const blobSrc = isSelected ? tile.selectedBlob : tile.defaultBlob;
          const isLongText = tile.text.length > 15;

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => handleSelectOption(tile.id)}
              className="absolute p-0 m-0 bg-transparent border-0 outline-none cursor-pointer select-none"
              style={{
                left: `calc(${tile.x} * var(--u))`,
                top: `calc(${tile.y} * var(--u))`,
                width: `calc(${tile.w} * var(--u))`,
                height: `calc(${tile.h} * var(--u))`,
              }}
              aria-pressed={isSelected}
            >
              {/* Tile Blob Image: identical dimensions, zero layout shift, zero filters/outlines/shadows */}
              <img
                src={blobSrc}
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none block"
                draggable={false}
              />

              {/* Black Check Badge top-right of the tile when selected */}
              {isSelected && (
                <div
                  className="absolute rounded-full bg-[#17181B] flex items-center justify-center pointer-events-none select-none"
                  style={{
                    top: 'calc(14 * var(--u))',
                    right: 'calc(18 * var(--u))',
                    width: 'calc(44 * var(--u))',
                    height: 'calc(44 * var(--u))',
                  }}
                >
                  <svg
                    fill="none"
                    stroke="#FFFFFF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 16 16"
                    style={{
                      width: 'calc(24 * var(--u))',
                      height: 'calc(24 * var(--u))',
                      strokeWidth: 2.5,
                    }}
                  >
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                </div>
              )}

              {/* Tile text: centered, font 40 weight 800, max 2 lines (padding 45 so it wraps), auto-shrink to 28 before 3rd line */}
              <span
                className="absolute inset-0 flex items-center justify-center text-center text-[#17181B] pointer-events-none select-none tracking-tight"
                style={{
                  padding: 'calc(45 * var(--u))',
                  fontSize: isLongText ? 'calc(28 * var(--u))' : 'calc(40 * var(--u))',
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {tile.text}
              </span>
            </button>
          );
        })}

        {/* ── HINT: y=1324 centered, font 30 weight 600, color #5D6FA0 ── */}
        <div
          className="absolute left-0 w-full text-center pointer-events-none select-none tracking-tight"
          style={{
            top: 'calc(1324 * var(--u))',
            fontSize: 'calc(30 * var(--u))',
            fontWeight: 600,
            color: '#5D6FA0',
          }}
        >
          Only one is what they really said.
        </div>

        {/* ── BUTTON: x=97 y=1378 w=660 h=95 full pill, text font 38 weight 800 ── */}
        <button
          type="button"
          onClick={handleLockGuess}
          className="absolute rounded-full bg-[#17181B] text-white flex items-center justify-center p-0 m-0 border-0 cursor-pointer select-none tracking-tight"
          style={{
            left: 'calc(97 * var(--u))',
            top: 'calc(1378 * var(--u))',
            width: 'calc(660 * var(--u))',
            height: 'calc(95 * var(--u))',
            fontSize: 'calc(38 * var(--u))',
            fontWeight: 800,
          }}
        >
          Lock my guess
        </button>
      </div>
    </div>
  );
};

export default KnowMeGuessScreen;
