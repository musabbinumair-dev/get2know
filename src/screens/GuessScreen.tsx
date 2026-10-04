import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../components/Screen';
import { BottomNav, NavTab } from '../components/BottomNav';
import { QuestionData } from '../data/gameData';
import { useGameSession } from '../services/gameSessionContext';
import { GameHeader } from '../components/GameHeader';
import { TriviaQuestion, KnowMeQuestion } from '../data/gameQuestions';

export type OptionId = 'pink' | 'yellow' | 'cream' | 'green';

interface GuessScreenProps {
  questionData?: QuestionData;
  realAnswer?: string;
  streak?: number;
  onLockGuess?: (guess: string, isCorrect: boolean) => void;
  onBack?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

const BLOB_OUTLINE_FILTER =
  'drop-shadow(2.5px 0 0 #17181B) drop-shadow(-2.5px 0 0 #17181B) drop-shadow(0 2.5px 0 #17181B) drop-shadow(0 -2.5px 0 #17181B)';

export const GuessScreen: React.FC<GuessScreenProps> = ({
  questionData,
  realAnswer: _realAnswer = 'Anchovies on pizza.',
  streak = 12,
  onLockGuess,
  onBack,
  onNavigateTab,
}) => {
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  // Default selected is the first option or cream
  const defaultSelected = questionData?.correctOptionId || 'cream';
  const [selectedId, setSelectedId] = useState<OptionId | null>(defaultSelected);
  const [isDebug, setIsDebug] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  // Update selection when question changes
  useEffect(() => {
    if (isInGame && gameSession.currentQuestion) {
      setSelectedId(null);
    } else if (questionData?.correctOptionId) {
      setSelectedId(questionData.correctOptionId);
    }
  }, [isInGame, gameSession.currentRound, questionData?.id]);

  // Viewport tracking for Stage 390 system (capped at 1.0 inside Screen container)
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth, 390) : 390,
    height: typeof window !== 'undefined' ? (window.innerWidth >= 640 ? 844 : window.innerHeight) : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth, 390);
      const h = window.innerWidth >= 640 ? 844 : window.innerHeight;
      setViewport({ width: w, height: h });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
      setIsOverlay(params.get('overlay') === '1');
    }
  }, []);

  // Sync background
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

  // ---------------- STAGE 390 SCALING CALCULATIONS ----------------
  // Scale by width capped at 1.0 so desktop bottom nav and layout match other screens exactly
  const scale = Math.min(1.0, viewport.width / 390);
  const stageHeight = viewport.height / scale; // Height in design pixels (844 base, 677 on 360x625)

  // Vertical Gaps Calculation (Section 8)
  // Shortage (844 - stageHeight) distributed in proportion to (design - min)
  // Total shrinkable deltas = 44 + 4 + 18 + 9 + 13 + 8 + 71 + 12 = 179 px
  const shortage = Math.max(0, 844 - stageHeight);
  const t = Math.min(1, shortage / 179);

  const gapA = 66 - (66 - 22) * t; // top bar bottom to label top (66 -> 22)
  const gapB = 8 - (8 - 4) * t;    // label bottom to question top (8 -> 4)
  const gapC = 30 - (30 - 12) * t; // question bottom to blob row 1 (30 -> 12)
  const gapD = 9 - (9 - 0) * t;    // row 1 to row 2 (9 -> 0)
  const gapE = 21 - (21 - 8) * t;  // row 2 to hint (21 -> 8)
  const gapF = 16 - (16 - 8) * t;  // hint to button (16 -> 8)
  const gapH = 22 - (22 - 10) * t; // nav bottom margin (22 -> 10)

  // Fixed header geometry
  const topBarBottom = 66; // y: 31 + h: 35

  // Label "Guess their answer"
  const labelTop = topBarBottom + gapA;
  const labelBottom = labelTop + 20;

  // Question "What's the worst..."
  const questionTop = labelBottom + gapB;
  const questionHeight = 124.6; // 43.3 line pitch * 2 + 38 font size
  const questionBottom = questionTop + questionHeight;

  // Blob Row 1
  const row1Top = questionBottom + gapC;
  const pinkY = row1Top + 1;  // base 315
  const yellowY = row1Top;    // base 314

  // Starburst Badge ("+15 if right")
  const starburstY = row1Top - 35; // base 279

  // Blob Row 2
  const row2Top = row1Top + 126 + gapD; // base 449
  const creamY = row2Top;     // base 449
  const greenY = row2Top + 7; // base 456

  // Hint "Only one is what they really said."
  const hintTop = row2Top + 130 + gapE; // base 600
  const hintBottom = hintTop + 20;

  // Lock Button
  const buttonTop = hintBottom + gapF; // base 636

  // Bottom Nav
  const navTop = stageHeight - gapH - 59; // base 763 (844 - 22 - 59)

  const handleSelect = (id: OptionId) => {
    setSelectedId(id);
  };

  const [isLocking, setIsLocking] = useState(false);

  // Determine question lines and option texts based on in-game vs standalone
  let questionLines = questionData?.questionLines || [
    "What’s the worst",
    "food you’ve ever",
    "tried?",
  ];
  let pinkText = questionData?.guessOptions?.find((o) => o.id === 'pink')?.text || 'Fried crickets';
  let yellowText = questionData?.guessOptions?.find((o) => o.id === 'yellow')?.text || 'Raw oysters';
  let creamText = questionData?.guessOptions?.find((o) => o.id === 'cream')?.text || 'Anchovies on pizza';
  let greenText = questionData?.guessOptions?.find((o) => o.id === 'green')?.text || 'Durian';

  if (isInGame && gameSession.currentQuestion) {
    if (gameSession.currentRoundType === 'trivia') {
      const tQ = gameSession.currentQuestion as TriviaQuestion;
      questionLines = tQ.questionLines || [tQ.question];
      pinkText = tQ.options?.find((o) => o.id === 'pink')?.text || 'A';
      yellowText = tQ.options?.find((o) => o.id === 'yellow')?.text || 'B';
      creamText = tQ.options?.find((o) => o.id === 'cream')?.text || 'C';
      greenText = tQ.options?.find((o) => o.id === 'green')?.text || 'D';
    } else {
      const kQ = gameSession.currentQuestion as KnowMeQuestion;
      questionLines = kQ.questionLines || [kQ.question];
      pinkText = kQ.guessOptions?.find((o) => o.id === 'pink')?.text || 'A';
      yellowText = kQ.guessOptions?.find((o) => o.id === 'yellow')?.text || 'B';
      creamText = kQ.guessOptions?.find((o) => o.id === 'cream')?.text || 'C';
      greenText = kQ.guessOptions?.find((o) => o.id === 'green')?.text || 'D';
    }
  }

  const handleLock = async (overrideId?: OptionId) => {
    const chosenId = overrideId || selectedId || 'cream';
    if (isLocking) return;
    setIsLocking(true);
    await new Promise((r) => setTimeout(r, 300));

    const selectedText =
      chosenId === 'pink'
        ? pinkText
        : chosenId === 'yellow'
        ? yellowText
        : chosenId === 'cream'
        ? creamText
        : greenText;

    if (isInGame) {
      gameSession.submitGuess(chosenId, selectedText);
    } else {
      const correctId = questionData?.correctOptionId || 'cream';
      const isCorrect = chosenId === correctId;
      onLockGuess?.(selectedText, isCorrect);
    }
    setIsLocking(false);
  };

  // Auto-submit when timer expires
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (isInGame && gameSession.timer === 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleLock();
    }
  }, [isInGame, gameSession.timer]);

  useEffect(() => {
    hasAutoSubmitted.current = false;
  }, [gameSession.currentRound]);

  return (
    <Screen bg="#96B9FC" className="h-[100dvh] sm:h-[844px]">
      {/* ---------------- STAGE CONTAINER ---------------- */}
      <div
        style={{
          position: 'relative',
          width: '390px',
          height: `${stageHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          margin: '0 auto',
          overflow: 'visible',
          flexShrink: 0,
        }}
      >
        {/* ---------------- 9. DECORATIONS (WEBP ASSETS, MATCHING MOCKUP EXACTLY) ---------------- */}

        {/* deco-moon-yellow: Upper-left, peeking from left edge next to back button and question */}
        <div
          style={{
            position: 'absolute',
            left: '-22px',
            top: '84px',
            width: '84px',
            height: '84px',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          <img
            src="/assets/guess/deco-moon-yellow.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-heart-pink: Upper-right, peeking from right edge below streak pill */}
        <div
          style={{
            position: 'absolute',
            left: '332px',
            top: '94px',
            width: '88px',
            height: '88px',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          <img
            src="/assets/guess/deco-heart-pink.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-star-blue: Lower-left, below lock button and above bottom nav */}
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: `${buttonTop + 48}px`,
            width: '78px',
            height: '78px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <img
            src="/assets/guess/deco-star-blue.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-cross-olive: Lower-right, below lock button and above bottom nav */}
        <div
          style={{
            position: 'absolute',
            left: '322px',
            top: `${buttonTop + 52}px`,
            width: '68px',
            height: '68px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <img
            src="/assets/guess/deco-cross-olive.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ---------------- 5. HEADER: GAME HEADER IN-GAME OR STANDARD TOP BAR ---------------- */}
        {isInGame ? (
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: 0,
              width: '390px',
              zIndex: 30,
            }}
          >
            <GameHeader
              currentRound={gameSession.currentRound}
              totalRounds={gameSession.totalRounds}
              timer={gameSession.timer}
              showTimer={true}
              onExit={gameSession.exitGame}
            />
          </div>
        ) : (
          <>
            {/* Back button: dashed 1.5px circle, 35px, at x 22, y 31 */}
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="btn-press cursor-pointer focus:outline-none"
              style={{
                position: 'absolute',
                left: '22px',
                top: '31px',
                width: '35px',
                height: '35px',
                borderRadius: '9999px',
                border: '1.5px dashed #17181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                zIndex: 20,
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M11 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Title "Guess": absolutely centered on x 195, Nunito 900 26px */}
            <h1
              style={{
                position: 'absolute',
                left: '195px',
                top: '34px',
                transform: 'translateX(-50%)',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '26px',
                lineHeight: 1,
                color: '#17181B',
                letterSpacing: '-0.025em',
                margin: 0,
                zIndex: 20,
              }}
            >
              Guess
            </h1>

            {/* Streak pill: x 304, y 32, 67x32, right edge at 371 */}
            <div
              style={{
                position: 'absolute',
                left: '304px',
                top: '32px',
                width: '67px',
                height: '32px',
                backgroundColor: '#17181B',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                zIndex: 20,
                pointerEvents: 'none',
              }}
            >
              {/* Flame asset at x 319.5, y 38.5, w 16 */}
              <img
                src="/assets/guess/icon-flame.webp"
                alt=""
                style={{ width: '16px', height: 'auto', objectFit: 'contain' }}
                draggable={false}
              />
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '17px',
                  color: '#FFFFFF',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {streak}
              </span>
            </div>
          </>
        )}

        {/* ---------------- 4. QUESTION TEXT & LABELS ---------------- */}

        {/* Label "Guess their answer" / "Trivia question": x 36, Nunito 600, 16px, ink 55% */}
        <span
          style={{
            position: 'absolute',
            left: '36px',
            top: `${labelTop}px`,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '20px',
            color: 'rgba(23, 24, 27, 0.55)',
            letterSpacing: '-0.01em',
            zIndex: 10,
          }}
        >
          {isInGame && gameSession.currentRoundType === 'trivia'
            ? 'Trivia question'
            : 'Guess their answer'}
        </span>

        {/* Forced 3 lines, Nunito 900, line pitch 43.3px, left x 30, spans 330px (x 30 to 360) */}
        <h2
          style={{
            position: 'absolute',
            left: '30px',
            top: `${questionTop}px`,
            width: '330px',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: '34px',
            lineHeight: '40px',
            letterSpacing: '-0.03em',
            color: '#17181B',
            margin: 0,
            zIndex: 10,
            whiteSpace: 'pre-line',
          }}
        >
          {questionLines.join('\n')}
        </h2>

        {/* ---------------- 2. BLOBS (SIBLINGS, NOT CONTAINING STARBURST OR CHECK) ---------------- */}

        {/* Pink Blob (Left Column): x 31, y 315, w 156, check badge on top right */}
        <div
          onClick={() => handleSelect('pink')}
          style={{
            position: 'absolute',
            left: '31px',
            top: `${pinkY}px`,
            width: '156px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <img
            src="/assets/guess/answer-blob-pink.webp"
            alt={pinkText}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'pink' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
          {selectedId === 'pink' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                width: '22px',
                height: '22px',
                borderRadius: '9999px',
                backgroundColor: '#17181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {/* Centered & Responsive Text inside Blob */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 16px',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: pinkText.length > 22 ? '14px' : pinkText.length > 15 ? '16px' : '18px',
                lineHeight: '1.2',
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {pinkText}
            </span>
          </div>
        </div>

        {/* Yellow Blob (Right Column): x 204, y 314, w 157, check badge on top left */}
        <div
          onClick={() => handleSelect('yellow')}
          style={{
            position: 'absolute',
            left: '204px',
            top: `${yellowY}px`,
            width: '157px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <img
            src="/assets/guess/answer-blob-yellow.webp"
            alt={yellowText}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'yellow' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
          {selectedId === 'yellow' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '16px',
                width: '22px',
                height: '22px',
                borderRadius: '9999px',
                backgroundColor: '#17181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {/* Centered & Responsive Text inside Blob */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 16px',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: yellowText.length > 22 ? '14px' : yellowText.length > 15 ? '16px' : '18px',
                lineHeight: '1.2',
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {yellowText}
            </span>
          </div>
        </div>

        {/* Cream Blob (Left Column): x 31, y 449, w 168, check badge on top right */}
        <div
          onClick={() => handleSelect('cream')}
          style={{
            position: 'absolute',
            left: '31px',
            top: `${creamY}px`,
            width: '168px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <img
            src="/assets/guess/answer-blob-cream.webp"
            alt={creamText}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'cream' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
          {selectedId === 'cream' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                width: '22px',
                height: '22px',
                borderRadius: '9999px',
                backgroundColor: '#17181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {/* Centered & Responsive Text inside Blob */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 16px',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: creamText.length > 22 ? '14px' : creamText.length > 15 ? '16px' : '18px',
                lineHeight: '1.2',
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {creamText}
            </span>
          </div>
        </div>

        {/* Green Blob (Right Column): x 213, y 456, w 142, check badge on top left */}
        <div
          onClick={() => handleSelect('green')}
          style={{
            position: 'absolute',
            left: '213px',
            top: `${greenY}px`,
            width: '142px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <img
            src="/assets/guess/answer-blob-green.webp"
            alt={greenText}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'green' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
          {selectedId === 'green' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '16px',
                width: '22px',
                height: '22px',
                borderRadius: '9999px',
                backgroundColor: '#17181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          {/* Centered & Responsive Text inside Blob */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 16px',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: greenText.length > 22 ? '14px' : greenText.length > 15 ? '16px' : '18px',
                lineHeight: '1.2',
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {greenText}
            </span>
          </div>
        </div>

        {/* ---------------- 1. STARBURST "+15 if right" (WEBP, TILTED TO MATCH MOCKUP) ---------------- */}
        <div
          style={{
            position: 'absolute',
            left: '305px',
            top: `${starburstY}px`,
            width: '74px',
            height: '74px',
            transform: 'rotate(10deg)',
            transformOrigin: 'center center',
            pointerEvents: 'none',
            zIndex: 25,
          }}
        >
          <img
            src="/assets/guess/badge-starburst-yellow.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 26,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '16px',
                lineHeight: '17px',
                color: '#17181B',
                letterSpacing: '-0.02em',
              }}
            >
              {isInGame && gameSession.currentRoundType === 'trivia' ? '+10' : '+15'}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: '11px',
                lineHeight: '12px',
                color: '#17181B',
                letterSpacing: '-0.01em',
              }}
            >
              if right
            </span>
          </div>
        </div>

        {/* ---------------- HINT & LOCK BUTTON ---------------- */}

        {/* Hint: centered in ONE SINGLE ROW */}
        <div
          style={{
            position: 'absolute',
            left: '195px',
            top: `${hintTop}px`,
            transform: 'translateX(-50%)',
            width: 'auto',
            whiteSpace: 'nowrap',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 500,
            fontSize: '15px',
            lineHeight: '18px',
            color: 'rgba(23, 24, 27, 0.55)',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            zIndex: 10,
          }}
        >
          {isInGame && gameSession.currentRoundType === 'trivia'
            ? 'Only one option is correct!'
            : 'Only one is what they really said.'}
        </div>

        {/* Lock Button: x 44, w 302, h 44, #17181B, white Nunito 700 18px */}
        <button
          type="button"
          onClick={() => handleLock()}
          disabled={!selectedId || isLocking}
          className="btn-press cursor-pointer focus:outline-none"
          style={{
            position: 'absolute',
            left: '44px',
            top: `${buttonTop}px`,
            width: '302px',
            height: '44px',
            backgroundColor: '#17181B',
            borderRadius: '9999px',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: 1,
            color: '#FFFFFF',
            letterSpacing: '-0.015em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            zIndex: 10,
            opacity: !selectedId || isLocking ? 0.75 : 1,
            cursor: !selectedId || isLocking ? 'not-allowed' : 'pointer',
          }}
        >
          {isLocking ? (
            <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Lock my guess'
          )}
        </button>

        {/* ---------------- 10. DEBUG & OVERLAY ---------------- */}
        {isOverlay && (
          <img
            src="/mockups/guess.png"
            alt="Mockup Overlay"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '390px',
              height: '844px',
              opacity: 0.5,
              pointerEvents: 'none',
              zIndex: 100,
            }}
          />
        )}

        {isDebug && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 99,
            }}
          >
            {/* Visual bounding boxes */}
            <div
              style={{
                position: 'absolute',
                left: '30px',
                top: `${questionTop}px`,
                width: '330px',
                height: `${questionHeight}px`,
                border: '1px dashed rgba(255,0,0,0.6)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '307px',
                top: `${starburstY}px`,
                width: '71px',
                height: '71px',
                border: '1px dashed rgba(0,255,0,0.6)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '44px',
                top: `${buttonTop}px`,
                width: '302px',
                height: '44px',
                border: '1px dashed rgba(0,0,255,0.6)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '7px',
                top: `${navTop}px`,
                width: '376px',
                height: '59px',
                border: '1px dashed rgba(255,255,0,0.6)',
              }}
            />
          </div>
        )}
      </div>

      {/* ---------------- 7. BOTTOM NAV (HIDDEN DURING GAMEPLAY) ---------------- */}
      {!isInGame && (
        <div className="absolute bottom-0 left-0 right-0 pb-1 z-30 pointer-events-auto flex justify-center">
          <BottomNav
            activeTab="guess"
            onTabChange={onNavigateTab}
            className="mb-1"
          />
        </div>
      )}
    </Screen>
  );
};
