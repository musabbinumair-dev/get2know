import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { BottomNav, NavTab } from '../components/BottomNav';
import { QuestionData } from '../data/gameData';

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
  'drop-shadow(3px 0 0 #17181B) drop-shadow(-3px 0 0 #17181B) drop-shadow(0 3px 0 #17181B) drop-shadow(0 -3px 0 #17181B)';

export const GuessScreen: React.FC<GuessScreenProps> = ({
  questionData,
  realAnswer: _realAnswer = 'Anchovies on pizza.',
  streak = 12,
  onLockGuess,
  onBack,
  onNavigateTab,
}) => {
  // Default selected is the first option or cream
  const defaultSelected = questionData?.correctOptionId || 'cream';
  const [selectedId, setSelectedId] = useState<OptionId | null>(defaultSelected);
  const [isDebug, setIsDebug] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  // Update selection when question changes
  useEffect(() => {
    if (questionData?.correctOptionId) {
      setSelectedId(questionData.correctOptionId);
    }
  }, [questionData?.id]);

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
  const labelCenterY = labelTop + 10;
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
  const starburstTextCenterY = row1Top - 3; // base 311

  // Blob Row 2
  const row2Top = row1Top + 126 + gapD; // base 449
  const creamY = row2Top;     // base 449
  const greenY = row2Top + 7; // base 456

  // Option labels center Y
  const pinkLabelCenterY = row1Top + 66;    // base 381
  const yellowLabelCenterY = row1Top + 67;  // base 381
  const creamLabelCenterY = row2Top + 65;   // base 514
  const greenLabelCenterY = row2Top + 60;   // base 516

  // Hint "Only one is what they really said."
  const hintTop = row2Top + 130 + gapE; // base 600
  const hintBottom = hintTop + 20;

  // Lock Button
  const buttonTop = hintBottom + gapF; // base 636

  // Bottom Nav
  const navTop = stageHeight - gapH - 59; // base 763 (844 - 22 - 59)

  // Check badge coords for currently selected blob tailored to each blob's visual contour
  const getCheckBadgeCoords = (id: OptionId | null) => {
    if (id === 'pink') {
      return { cx: 31 + 156 - 32, cy: pinkY + 22 };
    }
    if (id === 'yellow') {
      return { cx: 204 + 157 - 35, cy: yellowY + 24 };
    }
    if (id === 'cream') {
      return { cx: 31 + 168 - 35, cy: creamY + 22 }; // center (164, 471) at base
    }
    if (id === 'green') {
      return { cx: 213 + 142 - 32, cy: greenY + 22 };
    }
    return null;
  };

  const checkBadgeCoords = getCheckBadgeCoords(selectedId);

  const handleSelect = (id: OptionId) => {
    setSelectedId(id);
  };

  const handleLock = () => {
    if (!selectedId) return;
    const correctId = questionData?.correctOptionId || 'cream';
    const isCorrect = selectedId === correctId;
    const selectedOption = questionData?.guessOptions?.find((o) => o.id === selectedId);
    onLockGuess?.(selectedOption?.text || selectedId, isCorrect);
  };

  const questionLines = questionData?.questionLines || [
    "What’s the worst",
    "food you’ve ever",
    "tried?",
  ];

  const pinkText = questionData?.guessOptions?.find((o) => o.id === 'pink')?.text || 'Fried crickets';
  const yellowText = questionData?.guessOptions?.find((o) => o.id === 'yellow')?.text || 'Raw oysters';
  const creamText = questionData?.guessOptions?.find((o) => o.id === 'cream')?.text || 'Anchovies on pizza';
  const greenText = questionData?.guessOptions?.find((o) => o.id === 'green')?.text || 'Durian';

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
        {/* ---------------- 9. DECORATIONS (PNG ASSETS, NEVER CSS) ---------------- */}

        {/* deco-moon-yellow: visible part spans x 0 to 43 and y 85 to 141 (top = labelCenterY - 57) */}
        <div
          style={{
            position: 'absolute',
            left: '-24px',
            top: `${labelCenterY - 57}px`,
            width: '67px',
            height: '56px',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          <img
            src="/assets/guess/deco-moon-yellow.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-heart-pink: x 337, y 92, w 53, cropped by right edge (top = labelCenterY - 50) */}
        <div
          style={{
            position: 'absolute',
            left: '337px',
            top: `${labelCenterY - 50}px`,
            width: '53px',
            height: '48px',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          <img
            src="/assets/guess/deco-heart-pink.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-star-blue: x 8, w 68, bottom edge 9px above nav top (z-index 5, behind button & nav) */}
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: `${navTop - 9 - 68}px`,
            width: '68px',
            height: '68px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <img
            src="/assets/guess/deco-star-blue.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* deco-cross-olive: x 326, w 57 (right edge at 383), bottom edge 10px above nav top (z-index 5) */}
        <div
          style={{
            position: 'absolute',
            left: '326px',
            top: `${navTop - 10 - 57}px`,
            width: '57px',
            height: '57px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <img
            src="/assets/guess/deco-cross-olive.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* ---------------- 5. HEADER (SIDE PADDING STRICTLY CONTROLLED) ---------------- */}

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
            src="/assets/guess/icon-flame.png"
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

        {/* ---------------- 4. QUESTION TEXT & LABELS ---------------- */}

        {/* Label "Guess their answer": x 36, Nunito 600, 16px, ink 55% */}
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
          Guess their answer
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

        {/* Pink Blob: x 31, y 315, w 156 */}
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
            src="/assets/guess/answer-blob-pink.png"
            alt={pinkText}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'pink' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
        </div>

        {/* Yellow Blob: x 204, y 314, w 157 (right edge at 361) */}
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
            src="/assets/guess/answer-blob-yellow.png"
            alt={yellowText}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'yellow' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
        </div>

        {/* Cream Blob: x 31, y 449, w 168 */}
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
            src="/assets/guess/answer-blob-cream.png"
            alt={creamText}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'cream' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
        </div>

        {/* Green Blob: x 213, y 456, w 142 (right edge at 355) */}
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
            src="/assets/guess/answer-blob-green.png"
            alt={greenText}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: selectedId === 'green' ? BLOB_OUTLINE_FILTER : 'none',
              transition: 'filter 0.12s ease',
            }}
            draggable={false}
          />
        </div>

        {/* ---------------- OPTION LABELS (NUNITO 800 19PX, CENTERED ON EACH BLOB) ---------------- */}

        {/* Option 1 (Pink) center (108, 381) */}
        <div
          style={{
            position: 'absolute',
            left: '108px',
            top: `${pinkLabelCenterY}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: '21px',
            color: '#17181B',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            pointerEvents: 'none',
            zIndex: 15,
            width: '124px',
          }}
        >
          {pinkText}
        </div>

        {/* Option 2 (Yellow) center (281, 381) */}
        <div
          style={{
            position: 'absolute',
            left: '281px',
            top: `${yellowLabelCenterY}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: '21px',
            color: '#17181B',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            pointerEvents: 'none',
            zIndex: 15,
            width: '124px',
          }}
        >
          {yellowText}
        </div>

        {/* Option 3 (Cream) center (116, 514) */}
        <div
          style={{
            position: 'absolute',
            left: '116px',
            top: `${creamLabelCenterY}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: '21px',
            color: '#17181B',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            pointerEvents: 'none',
            zIndex: 15,
            width: '130px',
          }}
        >
          {creamText}
        </div>

        {/* Option 4 (Green) center (284, 516) */}
        <div
          style={{
            position: 'absolute',
            left: '284px',
            top: `${greenLabelCenterY}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: '21px',
            color: '#17181B',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            pointerEvents: 'none',
            zIndex: 15,
            width: '120px',
          }}
        >
          {greenText}
        </div>

        {/* ---------------- 1. STARBURST "+15 if right" (SIBLING, NO DUPLICATE SHADOW) ---------------- */}
        {/* Starburst: x 307, y 279, w 71. Text center (342, 311). Straight, NO rotation */}
        <div
          style={{
            position: 'absolute',
            left: '307px',
            top: `${starburstY}px`,
            width: '71px',
            height: '71px',
            pointerEvents: 'none',
            zIndex: 25,
          }}
        >
          <img
            src="/assets/guess/badge-starburst-yellow.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* Starburst text center (342, 311) */}
        <div
          style={{
            position: 'absolute',
            left: '342px',
            top: `${starburstTextCenterY}px`,
            transform: 'translate(-50%, -50%)',
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
            +15
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

        {/* ---------------- 3. CHECK BADGE (SIBLING, RENDERS ABOVE STARBURST) ---------------- */}
        {/* 21px ink circle, white check, 35px in from blob right edge & 22px down from top */}
        {checkBadgeCoords && (
          <div
            style={{
              position: 'absolute',
              left: `${checkBadgeCoords.cx - 10.5}px`,
              top: `${checkBadgeCoords.cy - 10.5}px`,
              width: '21px',
              height: '21px',
              borderRadius: '9999px',
              backgroundColor: '#17181B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 35, // Above starburst!
              pointerEvents: 'none',
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* ---------------- HINT & LOCK BUTTON ---------------- */}

        {/* Hint "Only one is what they really said.": centered x 195, Nunito 500, 15px, ink 55%, ~209px wide */}
        <div
          style={{
            position: 'absolute',
            left: '195px',
            top: `${hintTop}px`,
            transform: 'translateX(-50%)',
            width: '209px',
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
          Only one is what they really said.
        </div>

        {/* Lock Button: x 44, w 302, h 44, #17181B, white Nunito 700 18px */}
        <button
          type="button"
          onClick={handleLock}
          disabled={!selectedId}
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
          }}
        >
          Lock my guess
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

      {/* ---------------- 7. BOTTOM NAV (FIXED & IDENTICAL TO OTHER SCREENS) ---------------- */}
      <div className="absolute bottom-0 left-0 right-0 pb-1 z-30 pointer-events-auto flex justify-center">
        <BottomNav
          activeTab="guess"
          onTabChange={onNavigateTab}
          className="mb-1"
        />
      </div>
    </Screen>
  );
};
