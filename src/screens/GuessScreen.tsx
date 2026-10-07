import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../components/Screen';
import { NavTab } from '../components/BottomNav';
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
  streak: _streak = 12,
  onLockGuess,
  onBack: _onBack,
  onNavigateTab: _onNavigateTab,
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
  // Scale by width capped at 1.0 so desktop container and layout match 390px base
  const scale = Math.min(1.0, viewport.width / 390);
  const stageHeight = viewport.height / scale; // Height in design pixels (844 base)

  // Vertical space distribution with NO bottom bar (extra vertical headroom)
  // Shortage distributed gracefully when viewport is less than 844px
  const shortage = Math.max(0, 844 - stageHeight);
  const t = Math.min(1, shortage / 180);

  const handleSelect = (id: OptionId) => {
    setSelectedId(id);
  };

  const [isLocking, setIsLocking] = useState(false);

  // Determine question text, lines, and option texts based on in-game vs standalone
  let rawQuestionText = questionData?.question || "What’s the worst food you’ve ever tried?";
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
    rawQuestionText = gameSession.currentQuestion.question;
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

  const qLen = rawQuestionText.length;
  // Increased question text size & bold weight 900, responsive across screen heights
  let qFontSize = Math.round(34 - 4 * t);
  let qLineHeight = Math.round(40 - 4 * t);
  if (qLen > 70) {
    qFontSize = Math.round(24 - 3 * t);
    qLineHeight = Math.round(30 - 3 * t);
  } else if (qLen > 45) {
    qFontSize = Math.round(29 - 4 * t);
    qLineHeight = Math.round(35 - 4 * t);
  }

  // Estimated lines & bounded question height
  const estLines = qLen > 65 ? 3 : qLen > 35 ? 2.5 : 2;
  const maxAllowedQHeight = t > 0.5 ? 96 : 124;
  const questionHeight = Math.min(maxAllowedQHeight, Math.ceil(estLines * qLineHeight));

  const gapA = 26 - 12 * t; // top bar bottom to label top (26 -> 14)
  const gapB = 8 - 3 * t;   // label bottom to question top (8 -> 5)
  const gapC = 28 - 10 * t; // question bottom to blob row 1 (28 -> 18)
  const gapD = 12 - 6 * t;  // row 1 to row 2 (12 -> 6)
  const gapF = 60 - 20 * t;  // row 2 bottom to lock button (60 -> 40)

  // Fixed header geometry
  const topBarBottom = 66; // y: 31 + h: 35

  // Label "Guess their answer"
  const labelTop = topBarBottom + gapA;
  const labelBottom = labelTop + 20;

  // Question "What's the worst..."
  const questionTop = labelBottom + gapB;
  const questionBottom = questionTop + questionHeight;

  // Blob Row 1
  const row1Top = Math.max(280 - 40 * t, questionBottom + gapC);
  const pinkY = row1Top;
  const yellowY = row1Top;

  // Starburst Badge ("+15 if right")
  const starburstY = row1Top - 34;

  // Blob Row 2
  const row2Top = row1Top + 138 + gapD;
  const creamY = row2Top;
  const greenY = row2Top + 6;

  // Bottom edge of Row 2 blobs (for vertical centering of hint text below blobs)
  const row2Bottom = row2Top + 152;

  // Lock Button
  const buttonTop = row2Bottom + gapF;

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
    if (isInGame && gameSession.isTimerActive && gameSession.timer === 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleLock();
    }
  }, [isInGame, gameSession.isTimerActive, gameSession.timer]);

  useEffect(() => {
    hasAutoSubmitted.current = false;
  }, [gameSession.currentRound]);

  return (
    <Screen bg="#96B9FC" className="h-full min-h-[100dvh]">
      {/* ---------------- STAGE CONTAINER ---------------- */}
      <div
        className="md:hidden"
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

        {/* deco-moon-yellow: Upper-left, safely on edge away from question */}
        <div
          style={{
            position: 'absolute',
            left: '-34px',
            top: `${86 - 8 * t}px`,
            width: '68px',
            height: '68px',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.85,
          }}
        >
          <img
            src="/assets/guess/deco-moon-yellow.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-heart-pink: Upper-right, safely on edge away from question */}
        <div
          style={{
            position: 'absolute',
            left: '352px',
            top: `${88 - 8 * t}px`,
            width: '66px',
            height: '66px',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.85,
          }}
        >
          <img
            src="/assets/guess/deco-heart-pink.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-star-blue: Lower-left, moved downwards into bottom space */}
        <div
          style={{
            position: 'absolute',
            left: '14px',
            top: `${buttonTop + 60}px`,
            width: '76px',
            height: '76px',
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

        {/* deco-cross-olive: Lower-right, moved downwards into bottom space */}
        <div
          style={{
            position: 'absolute',
            left: '318px',
            top: `${buttonTop + 64}px`,
            width: '66px',
            height: '66px',
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

        {/* ---------------- 5. HEADER: UNIFIED GAME HEADER ACROSS ALL GAME PAGES ---------------- */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: 0,
            width: '390px',
            zIndex: 30,
          }}
        >
          <GameHeader
            showLogo={true}
            roundPillPosition="center"
            currentRound={isInGame ? gameSession.currentRound : 1}
            totalRounds={isInGame ? gameSession.totalRounds : 10}
            timer={isInGame ? gameSession.timer : 20}
            isTimerActive={isInGame ? gameSession.isTimerActive : undefined}
            showTimer={true}
            showBack={false}
            onExit={isInGame ? gameSession.exitGame : _onBack}
          />
        </div>

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
          {`Question ${String(isInGame ? gameSession.currentRound : 1).padStart(2, '0')}`}
        </span>

        {/* Question Text (Increased size & bold weight 900, zero overlay on decorations) */}
        <h2
          style={{
            position: 'absolute',
            left: '36px',
            top: `${questionTop}px`,
            width: '314px',
            maxHeight: `${questionHeight + 8}px`,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${qFontSize}px`,
            lineHeight: `${qLineHeight}px`,
            letterSpacing: '-0.025em',
            color: '#17181B',
            margin: 0,
            zIndex: 10,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {qLen > 50 ? rawQuestionText : questionLines.join('\n')}
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
            height: '156px',
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
              height: '100%',
              objectFit: 'contain',
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
          {/* Centered & Responsive Text inside Blob (Vertically & Horizontally) */}
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
                lineHeight: 1.25,
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                textAlign: 'center',
                display: 'inline-block',
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
            height: '126px',
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
              height: '100%',
              objectFit: 'contain',
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
          {/* Centered & Responsive Text inside Blob (Vertically & Horizontally) */}
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
                lineHeight: 1.25,
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                textAlign: 'center',
                display: 'inline-block',
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
            height: '168px',
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
              height: '100%',
              objectFit: 'contain',
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
          {/* Centered & Responsive Text inside Blob (Vertically & Horizontally) */}
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
                lineHeight: 1.25,
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                textAlign: 'center',
                display: 'inline-block',
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
            height: '142px',
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
              height: '100%',
              objectFit: 'contain',
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
          {/* Centered & Responsive Text inside Blob (Vertically & Horizontally) */}
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
                lineHeight: 1.25,
                color: '#17181B',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
                textAlign: 'center',
                display: 'inline-block',
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

        {/* Hint text under the guess blobs - Centered Vertically & Horizontally */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '390px',
            top: `${row2Bottom}px`,
            height: `${Math.max(30, buttonTop - row2Bottom)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 20px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              lineHeight: '18px',
              color: 'rgba(23, 24, 27, 0.55)',
              letterSpacing: '-0.01em',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {isInGame && gameSession.currentRoundType === 'trivia'
              ? 'Only one option is correct!'
              : 'Only one is what they really said.'}
          </span>
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
                left: '36px',
                top: `${questionTop}px`,
                width: '314px',
                height: `${questionHeight}px`,
                border: '1px dashed rgba(255,0,0,0.6)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '305px',
                top: `${starburstY}px`,
                width: '74px',
                height: '74px',
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
          </div>
        )}
      </div>

      {/* =========================================================================
          TABLET & DESKTOP LAYOUT (768px and up: Responsive --u Scale min(vw, dvh))
         ========================================================================= */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative w-full h-[100dvh] overflow-hidden select-none font-['Nunito']"
        style={{
          ['--u' as any]: 'min(calc(100vw / 1586), calc(100dvh / 992))',
          backgroundColor: '#96B9FC',
        }}
      >
        {/* VIEWPORT FIXED DECORATIONS */}
        <img
          src="/assets/guess/deco-moon-yellow.webp"
          alt=""
          className="fixed top-0 left-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(100 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/guess/deco-heart-pink.webp"
          alt=""
          className="fixed top-0 right-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(80 * var(--u))',
            height: 'calc(150 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/guess/deco-star-blue.webp"
          alt=""
          className="fixed object-contain pointer-events-none select-none z-10"
          style={{
            left: 'calc(12 * var(--u))',
            bottom: 'calc(24 * var(--u))',
            width: 'calc(105 * var(--u))',
            height: 'calc(110 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/guess/deco-cross-olive.webp"
          alt=""
          className="fixed object-contain pointer-events-none select-none z-10"
          style={{
            right: 'calc(25 * var(--u))',
            bottom: 'calc(35 * var(--u))',
            width: 'calc(80 * var(--u))',
            height: 'calc(107 * var(--u))',
          }}
          draggable={false}
        />

        {/* 1586 x 992 DESIGN CANVAS */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: 'calc(1586 * var(--u))',
            height: 'calc(992 * var(--u))',
          }}
        >
          {/* HEADER: Back Button at left x=112, center y=75 */}
          <button
            type="button"
            onClick={_onBack}
            aria-label="Back"
            className="btn-press absolute rounded-full flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(78 * var(--u))',
              height: 'calc(78 * var(--u))',
              border: 'calc(3.5 * var(--u)) dashed #17181B',
            }}
          >
            <svg
              style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#17181B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Center Round Indicator */}
          <div
            className="absolute rounded-full bg-[#191D21] flex items-center justify-center shadow-sm pointer-events-none z-20"
            style={{
              left: 'calc(793 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              height: 'calc(54 * var(--u))',
              paddingLeft: 'calc(28 * var(--u))',
              paddingRight: 'calc(28 * var(--u))',
              borderRadius: 'calc(27 * var(--u))',
            }}
          >
            <span
              className="text-white font-extrabold tracking-tight"
              style={{ fontSize: 'calc(26 * var(--u))' }}
            >
              {isInGame ? `Round ${gameSession.currentRound} of ${gameSession.totalRounds}` : 'Guess Round'}
            </span>
          </div>

          {/* LEFT COLUMN: x=112 to 770 (658w) */}
          <p
            className="absolute font-bold text-[#17181B]/60 tracking-tight leading-none m-0 z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(166 * var(--u))',
              fontSize: 'calc(34 * var(--u))',
            }}
          >
            Guess their answer
          </p>

          <h1
            className="absolute font-black text-[#17181B] tracking-[-0.03em] leading-[1.12] m-0 z-20 break-words"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(212 * var(--u))',
              width: 'calc(658 * var(--u))',
              fontSize: 'calc(78 * var(--u))',
            }}
          >
            {rawQuestionText}
          </h1>

          {/* Starburst badge + hint card */}
          <div
            className="absolute shadow-sm overflow-hidden z-20 flex items-center"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(520 * var(--u))',
              width: 'calc(658 * var(--u))',
              height: 'calc(160 * var(--u))',
              borderRadius: 'calc(36 * var(--u))',
              backgroundColor: '#FAF4E3',
              padding: 'calc(24 * var(--u)) calc(32 * var(--u))',
              gap: 'calc(20 * var(--u))',
            }}
          >
            <img
              src="/assets/guess/badge-starburst-yellow.webp"
              alt=""
              style={{ width: 'calc(90 * var(--u))', height: 'calc(90 * var(--u))' }}
              className="object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-black text-[#17181B]" style={{ fontSize: 'calc(30 * var(--u))' }}>
                +15 points if you match!
              </span>
              <span className="font-bold text-[#17181B]/60 mt-1" style={{ fontSize: 'calc(24 * var(--u))' }}>
                Pick the choice you think your partner locked in.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: x=825 to 1500 (675w, 55 gap) */}
          <h2
            className="absolute font-black text-[#17181B] tracking-tight pointer-events-none select-none m-0 z-20"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(212 * var(--u))',
              fontSize: 'calc(54 * var(--u))',
              lineHeight: 1,
            }}
          >
            Select an option
          </h2>

          {/* 2x2 Answer Blobs Grid */}
          <div
            className="absolute z-20 grid grid-cols-2"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(280 * var(--u))',
              width: 'calc(675 * var(--u))',
              gap: 'calc(20 * var(--u))',
            }}
          >
            {[
              {
                id: 'pink' as OptionId,
                text: pinkText,
                defaultSrc: '/assets/guess/answer-blob-pink.webp',
                selectedSrc: '/assets/guess/answer-blob-pink-selected.webp',
              },
              {
                id: 'yellow' as OptionId,
                text: yellowText,
                defaultSrc: '/assets/guess/answer-blob-yellow.webp',
                selectedSrc: '/assets/guess/answer-blob-yellow-selected.webp',
              },
              {
                id: 'cream' as OptionId,
                text: creamText,
                defaultSrc: '/assets/guess/answer-blob-cream.webp',
                selectedSrc: '/assets/guess/answer-blob-cream-selected.webp',
              },
              {
                id: 'green' as OptionId,
                text: greenText,
                defaultSrc: '/assets/guess/answer-blob-green.webp',
                selectedSrc: '/assets/guess/answer-blob-green-selected.webp',
              },
            ].map((opt) => {
              const isSelected = selectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className="btn-press relative flex items-center justify-center p-0 border-none bg-transparent cursor-pointer outline-none transition-transform active:scale-95 group"
                  style={{
                    width: 'calc(325 * var(--u))',
                    height: 'calc(200 * var(--u))',
                  }}
                >
                  <img
                    src={isSelected ? opt.selectedSrc : opt.defaultSrc}
                    alt=""
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
                    draggable={false}
                  />
                  <span
                    className="absolute font-black text-center text-[#17181B] tracking-tight pointer-events-none select-none px-6"
                    style={{
                      fontSize: 'calc(26 * var(--u))',
                      lineHeight: 1.15,
                      maxWidth: 'calc(270 * var(--u))',
                    }}
                  >
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lock in Guess Button: Black pill button, 675w x 80h, font 38, radius 40 */}
          <button
            type="button"
            onClick={() => handleLock()}
            disabled={!selectedId || isLocking}
            className={`btn-press absolute bg-[#1A1E22] text-white font-extrabold tracking-tight flex items-center justify-center cursor-pointer shadow-sm outline-none transition-all z-30 ${
              !selectedId || isLocking ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95 active:scale-98'
            }`}
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(740 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(80 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              fontSize: 'calc(38 * var(--u))',
            }}
          >
            {isLocking ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Lock my guess'
            )}
          </button>
        </div>
      </div>
    </Screen>
  );
};
