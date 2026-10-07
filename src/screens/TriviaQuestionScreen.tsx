import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSession } from '../services/gameSessionContext';
import { useSession } from '../services/sessionContext';
import { TriviaQuestion } from '../data/gameQuestions';
import { getBlobConfig } from '../lib/blobs';
import { getAvatarFaceImageSrc, getBlobImageSrc } from '../components/ProfileAvatar';

export interface TriviaQuestionScreenProps {
  onBack?: () => void;
  onLockAnswer?: (optionId: string, optionText: string) => void;
}

export const TriviaQuestionScreen: React.FC<TriviaQuestionScreenProps> = ({
  onBack,
  onLockAnswer,
}) => {
  const navigate = useNavigate();
  const gameSession = useGameSession();
  const session = useSession();
  const isInGame = gameSession.isActive;

  // Background color sync (Sage green #B3BF8A)
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#B3BF8A';
    document.documentElement.style.backgroundColor = '#B3BF8A';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Timer countdown fallback if not in game
  const [localTimer, setLocalTimer] = useState<number>(12);
  useEffect(() => {
    if (isInGame) return;
    const interval = setInterval(() => {
      setLocalTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isInGame]);

  const currentTimer = isInGame
    ? (gameSession.timer >= 0 ? gameSession.timer : 12)
    : localTimer;

  // Question data
  const currentRound = isInGame ? gameSession.currentRound : 3;
  const totalRounds = isInGame ? gameSession.totalRounds : 10;
  const activeTriviaQ = isInGame && gameSession.currentQuestion?.type === 'trivia'
    ? (gameSession.currentQuestion as TriviaQuestion)
    : null;

  const rawQuestion = activeTriviaQ?.question || 'Which country invented sushi?';
  const questionLines = activeTriviaQ?.questionLines || ['Which country', 'invented sushi?'];
  const category = activeTriviaQ?.category || 'Food';

  // Player profiles & dynamic avatars
  const p1Name = session.profile?.name && session.profile.name !== 'Player 1'
    ? session.profile.name
    : 'Musab';
  const p1AvatarId = session.profile?.avatarId || 1;
  const p1Color = session.profile?.color || 'pink';
  const p1Score = isInGame ? gameSession.myScore || 45 : 45;

  const p2Name = (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('partner_profile') || '{}');
        if (saved.name) return saved.name;
      } catch {}
    }
    return 'Alex';
  })();
  const p2AvatarId = (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('partner_profile') || '{}');
        if (saved.avatarId) return saved.avatarId;
      } catch {}
    }
    return 2;
  })();
  const p2Color = (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('partner_profile') || '{}');
        if (saved.color) return saved.color;
      } catch {}
    }
    return 'blue';
  })();
  const p2Score = isInGame ? gameSession.friendScore || 30 : 30;

  const p1BlobConfig = getBlobConfig(p1Color, p1AvatarId);
  const p2BlobConfig = getBlobConfig(p2Color, p2AvatarId);

  // Options configuration matching the 4 pills in mockup
  const rawOptions = activeTriviaQ?.options || [
    { id: 'pink' as const, text: 'Japan' },
    { id: 'yellow' as const, text: 'China' },
    { id: 'cream' as const, text: 'Korea' },
    { id: 'green' as const, text: 'Thailand' },
  ];

  // Default selected is the first option ('pink') like in mockup
  const [selectedOptionId, setSelectedOptionId] = useState<string>('pink');

  const answerPills = [
    {
      letter: 'A',
      colorBg: '#FD99C9',
      badgeBg: '#F384B9',
      h: 124,
      y: 907,
      id: rawOptions[0]?.id || 'pink',
      text: rawOptions[0]?.text || 'Japan',
    },
    {
      letter: 'B',
      colorBg: '#8CBEFD',
      badgeBg: '#79AEF1',
      h: 123,
      y: 1057,
      id: rawOptions[1]?.id || 'yellow',
      text: rawOptions[1]?.text || 'China',
    },
    {
      letter: 'C',
      colorBg: '#FDD75A',
      badgeBg: '#ECC748',
      h: 125,
      y: 1206,
      id: rawOptions[2]?.id || 'cream',
      text: rawOptions[2]?.text || 'Korea',
    },
    {
      letter: 'D',
      colorBg: '#F8F3E6',
      badgeBg: '#E8DFCB',
      h: 125,
      y: 1357,
      id: rawOptions[3]?.id || 'green',
      text: rawOptions[3]?.text || 'Thailand',
    },
  ];

  // Options configuration for Compact Phone View (940 x 1672)
  const compactAnswerPills = [
    {
      letter: 'A',
      colorBg: '#FD99C9',
      badgeBg: '#F384B9',
      x: 90,
      w: 760,
      y: 838,
      h: 107,
      id: rawOptions[0]?.id || 'pink',
      text: rawOptions[0]?.text || 'Japan',
    },
    {
      letter: 'B',
      colorBg: '#8CBEFD',
      badgeBg: '#79AEF1',
      x: 92,
      w: 756,
      y: 974,
      h: 102,
      id: rawOptions[1]?.id || 'yellow',
      text: rawOptions[1]?.text || 'China',
    },
    {
      letter: 'C',
      colorBg: '#FDD75A',
      badgeBg: '#ECC748',
      x: 92,
      w: 756,
      y: 1106,
      h: 103,
      id: rawOptions[2]?.id || 'cream',
      text: rawOptions[2]?.text || 'Korea',
    },
    {
      letter: 'D',
      colorBg: '#F6F0E2',
      badgeBg: '#E8DFCB',
      x: 97,
      w: 746,
      y: 1239,
      h: 102,
      id: rawOptions[3]?.id || 'green',
      text: rawOptions[3]?.text || 'Thailand',
    },
  ];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (isInGame) {
      gameSession.exitGame();
    } else {
      navigate('/home');
    }
  };

  const handleLockIn = () => {
    const chosenPill = answerPills.find((p) => p.id === selectedOptionId) || answerPills[0];
    if (onLockAnswer) {
      onLockAnswer(chosenPill.id, chosenPill.text);
    } else if (isInGame) {
      gameSession.submitGuess(chosenPill.id as any, chosenPill.text);
    } else {
      navigate('/reveal');
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-[#B3BF8A] font-['Nunito',sans-serif] select-none">
      {/* =========================================================================
          TALL / NORMAL VIEWPORT LAYOUT (841 x 1870)
          Active for mobile aspect ratio >= 1.9 & height >= 760px, tablet, desktop
         ========================================================================= */}
      <div
        className="trivia-tall-stage w-full min-h-[100dvh] items-center justify-center overflow-hidden"
        style={{
          ['--u' as any]: 'min(calc(100vw / 841), calc(100dvh / 1870))',
        }}
      >
        {/* Exact 841 x 1870 Stage Canvas */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            width: 'calc(841 * var(--u))',
            height: 'calc(1870 * var(--u))',
            backgroundColor: '#B3BF8A',
          }}
        >
        {/* =========================================================================
            8. CORNER DECORATIONS (behind content, never overlapping text)
           ========================================================================= */}
        {/* Top-Left Heart: x=0 to 105, y=0 to 140 */}
        <img
          src="/assets/heart-pink-top-left.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 0,
            top: 0,
            width: 'calc(105 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />

        {/* Top-Right Star: x=730 to 841, y=0 to 125 */}
        <img
          src="/assets/star-blue-top-right.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 'calc(730 * var(--u))',
            top: 0,
            width: 'calc(111 * var(--u))',
            height: 'calc(125 * var(--u))',
          }}
          draggable={false}
        />

        {/* Bottom-Left Moon: x=0 to 122, y=1710 to 1858 */}
        <img
          src="/assets/moon-yellow-bottom-left.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 0,
            top: 'calc(1710 * var(--u))',
            width: 'calc(122 * var(--u))',
            height: 'calc(148 * var(--u))',
          }}
          draggable={false}
        />

        {/* Bottom-Right Heart: x=700 to 841, y=1718 to 1870 */}
        <img
          src="/assets/heart-pink-bottom-right.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 'calc(700 * var(--u))',
            top: 'calc(1718 * var(--u))',
            width: 'calc(141 * var(--u))',
            height: 'calc(152 * var(--u))',
          }}
          draggable={false}
        />

        {/* =========================================================================
            1. TOP ROW, center y=165:
               - Back button: dashed circle, 92 diameter, left x=68
               - Pill "QUESTION 3 / 10": x=262 to 578 (316w), 70h, near-black #1A1B22
               - Timer: circle 116 diameter at right x=660 to 776, cream, dashed dark ring
           ========================================================================= */}
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="absolute flex items-center justify-center cursor-pointer transition-transform active:scale-90 z-20 p-0 focus:outline-none"
          style={{
            left: 'calc(68 * var(--u))',
            top: 'calc(119 * var(--u))',
            width: 'calc(92 * var(--u))',
            height: 'calc(92 * var(--u))',
            borderRadius: 'calc(9999px)',
            border: 'calc(3 * var(--u)) dashed #1A1B22',
            backgroundColor: 'transparent',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="stroke-current text-[#1A1B22]"
            style={{
              width: 'calc(42 * var(--u))',
              height: 'calc(42 * var(--u))',
              strokeWidth: 2.8,
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Question Counter Pill */}
        <div
          className="absolute flex items-center justify-center z-20 select-none"
          style={{
            left: 'calc(262 * var(--u))',
            top: 'calc(130 * var(--u))',
            width: 'calc(316 * var(--u))',
            height: 'calc(70 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#1A1B22',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(30 * var(--u))',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: 'calc(1.2 * var(--u))',
            textTransform: 'uppercase',
          }}
        >
          {`QUESTION ${currentRound} / ${totalRounds}`}
        </div>

        {/* Timer Circle */}
        <div
          className="absolute flex items-center justify-center z-20 select-none"
          style={{
            left: 'calc(660 * var(--u))',
            top: 'calc(107 * var(--u))',
            width: 'calc(116 * var(--u))',
            height: 'calc(116 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#F8F3E6',
            border: 'calc(3.5 * var(--u)) dashed #1A1B22',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(44 * var(--u))',
            fontWeight: 800,
            color: '#1A1B22',
          }}
        >
          {currentTimer}
        </div>

        {/* =========================================================================
            2. SCORE PILLS, y=258 to 386 (128h), two pills:
               - Left x=70 to 405, right x=437 to 771 (each ~335w), cream #F8F3E6
               - Avatar blob 110 diameter at left inside, name font 30 weight 800 near-black,
                 score below font 36 weight 800 gray #6B6B6B
           ========================================================================= */}
        {/* Left Pill (Me / Player 1) */}
        <div
          className="absolute flex items-center z-20 select-none"
          style={{
            left: 'calc(70 * var(--u))',
            top: 'calc(258 * var(--u))',
            width: 'calc(335 * var(--u))',
            height: 'calc(128 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#F8F3E6',
            paddingLeft: 'calc(10 * var(--u))',
            paddingRight: 'calc(20 * var(--u))',
            gap: 'calc(18 * var(--u))',
          }}
        >
          {/* Dynamic Avatar Blob */}
          <div
            className="relative rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 'calc(110 * var(--u))',
              height: 'calc(110 * var(--u))',
            }}
          >
            <img
              src={getBlobImageSrc(p1Color, p1AvatarId)}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div
              className="relative z-10 flex items-center justify-center pointer-events-none select-none"
              style={{
                width: `${p1BlobConfig.avatarScale * 100}%`,
                height: `${p1BlobConfig.avatarScale * 100}%`,
                transform: `translate(${p1BlobConfig.offsetX}px, ${p1BlobConfig.offsetY}px)`,
              }}
            >
              <img
                src={getAvatarFaceImageSrc(p1AvatarId)}
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Name & Score Column */}
          <div className="flex flex-col justify-center items-start overflow-hidden">
            <span
              className="truncate w-full"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(30 * var(--u))',
                fontWeight: 800,
                color: '#1A1B22',
                lineHeight: 1.15,
              }}
            >
              {p1Name}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(36 * var(--u))',
                fontWeight: 800,
                color: '#6B6B6B',
                lineHeight: 1.15,
              }}
            >
              {p1Score}
            </span>
          </div>
        </div>

        {/* Right Pill (Partner / Player 2) */}
        <div
          className="absolute flex items-center z-20 select-none"
          style={{
            left: 'calc(437 * var(--u))',
            top: 'calc(258 * var(--u))',
            width: 'calc(334 * var(--u))',
            height: 'calc(128 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#F8F3E6',
            paddingLeft: 'calc(10 * var(--u))',
            paddingRight: 'calc(20 * var(--u))',
            gap: 'calc(18 * var(--u))',
          }}
        >
          {/* Dynamic Avatar Blob */}
          <div
            className="relative rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 'calc(110 * var(--u))',
              height: 'calc(110 * var(--u))',
            }}
          >
            <img
              src={getBlobImageSrc(p2Color, p2AvatarId)}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div
              className="relative z-10 flex items-center justify-center pointer-events-none select-none"
              style={{
                width: `${p2BlobConfig.avatarScale * 100}%`,
                height: `${p2BlobConfig.avatarScale * 100}%`,
                transform: `translate(${p2BlobConfig.offsetX}px, ${p2BlobConfig.offsetY}px)`,
              }}
            >
              <img
                src={getAvatarFaceImageSrc(p2AvatarId)}
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Name & Score Column */}
          <div className="flex flex-col justify-center items-start overflow-hidden">
            <span
              className="truncate w-full"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(30 * var(--u))',
                fontWeight: 800,
                color: '#1A1B22',
                lineHeight: 1.15,
              }}
            >
              {p2Name}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(36 * var(--u))',
                fontWeight: 800,
                color: '#6B6B6B',
                lineHeight: 1.15,
              }}
            >
              {p2Score}
            </span>
          </div>
        </div>

        {/* =========================================================================
            3. TAG "Trivia · Food": x=295 to 545 (250w), y=428 to 498 (70h), yellow #FDD84B
           ========================================================================= */}
        <div
          className="absolute flex items-center justify-center z-20 select-none"
          style={{
            left: 'calc(295 * var(--u))',
            top: 'calc(428 * var(--u))',
            width: 'calc(250 * var(--u))',
            height: 'calc(70 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#FDD84B',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(30 * var(--u))',
            fontWeight: 800,
            color: '#1A1B22',
          }}
        >
          {`Trivia · ${category}`}
        </div>

        {/* =========================================================================
            4. QUESTION CARD: question-card-blob.webp spans x=105 to 765 (660w), y=538 to 860 (322h)
               - lightbulb-blob.webp: x=100 to 222, y=497 to 610 (~122w)
               - question-sparkles-left.webp: x=32 to 100, y=625 to 810
               - question-sparkles-right.webp: x=752 to 822, y=580 to 795
               - Question text centered, 2 lines, font 80, weight 900
           ========================================================================= */}
        {/* Left Sparkles */}
        <img
          src="/assets/question-sparkles-left.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10 object-contain"
          style={{
            left: 'calc(32 * var(--u))',
            top: 'calc(625 * var(--u))',
            width: 'calc(68 * var(--u))',
            height: 'calc(185 * var(--u))',
          }}
          draggable={false}
        />

        {/* Right Sparkles */}
        <img
          src="/assets/question-sparkles-right.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10 object-contain"
          style={{
            left: 'calc(752 * var(--u))',
            top: 'calc(580 * var(--u))',
            width: 'calc(70 * var(--u))',
            height: 'calc(215 * var(--u))',
          }}
          draggable={false}
        />

        {/* Lightbulb Blob (overlapping top-left of the card) */}
        <img
          src="/assets/lightbulb-blob.webp"
          alt=""
          className="absolute pointer-events-none select-none z-30 object-contain"
          style={{
            left: 'calc(100 * var(--u))',
            top: 'calc(497 * var(--u))',
            width: 'calc(122 * var(--u))',
            height: 'calc(113 * var(--u))',
          }}
          draggable={false}
        />

        {/* Question Card Container */}
        <div
          className="absolute z-20 flex items-center justify-center"
          style={{
            left: 'calc(105 * var(--u))',
            top: 'calc(538 * var(--u))',
            width: 'calc(660 * var(--u))',
            height: 'calc(322 * var(--u))',
          }}
        >
          {/* Card Blob Background */}
          <img
            src="/assets/question-card-blob.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
            draggable={false}
          />

          {/* Live Question Text */}
          <div
            className="relative z-10 flex items-center justify-center text-center w-full"
            style={{
              paddingLeft: 'calc(45 * var(--u))',
              paddingRight: 'calc(45 * var(--u))',
            }}
          >
            <h1
              className="m-0 text-center select-none"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: rawQuestion.length > 50 ? 'calc(62 * var(--u))' : 'calc(80 * var(--u))',
                fontWeight: 900,
                color: '#1A1B22',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                whiteSpace: 'pre-line',
              }}
            >
              {rawQuestion.length <= 50 && questionLines.length >= 2
                ? questionLines.join('\n')
                : rawQuestion}
            </h1>
          </div>
        </div>

        {/* =========================================================================
            5. ANSWER PILLS (4, stacked), each x=70 to 770 (700w), full pill radius:
               - A pink #FD99C9: y=907 to 1031 (124h), SELECTED: 6 black outline #1A1B22, check badge
               - B blue #8CBEFD: y=1057 to 1180 (123h)
               - C yellow #FDD75A: y=1206 to 1331 (125h)
               - D cream #F8F3E6: y=1357 to 1482 (125h)
               - Letter badge on left: circle 88 diameter, left padding 38
               - Answer text starts at x=236, font 46, weight 800, near-black
           ========================================================================= */}
        {answerPills.map((pill) => {
          const isSelected = selectedOptionId === pill.id;

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedOptionId(pill.id)}
              className="absolute flex items-center cursor-pointer transition-transform duration-100 active:scale-[0.98] select-none p-0 focus:outline-none z-20"
              style={{
                left: 'calc(70 * var(--u))',
                top: `calc(${pill.y} * var(--u))`,
                width: 'calc(700 * var(--u))',
                height: `calc(${pill.h} * var(--u))`,
                borderRadius: 'calc(9999px)',
                backgroundColor: pill.colorBg,
                boxShadow: isSelected ? '0 0 0 calc(6 * var(--u)) #1A1B22' : 'none',
              }}
            >
              {/* Letter Badge (A, B, C, D): 88 diameter, left padding 38 */}
              <div
                className="absolute flex items-center justify-center select-none"
                style={{
                  left: 'calc(38 * var(--u))',
                  width: 'calc(88 * var(--u))',
                  height: 'calc(88 * var(--u))',
                  borderRadius: 'calc(9999px)',
                  backgroundColor: pill.badgeBg,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 'calc(44 * var(--u))',
                    fontWeight: 900,
                    color: '#1A1B22',
                    lineHeight: 1,
                  }}
                >
                  {pill.letter}
                </span>
              </div>

              {/* Answer Text (Starts at design x=236 -> inside pill left: 236 - 70 = 166) */}
              <span
                className="absolute truncate"
                style={{
                  left: 'calc(166 * var(--u))',
                  maxWidth: isSelected ? 'calc(430 * var(--u))' : 'calc(490 * var(--u))',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 'calc(46 * var(--u))',
                  fontWeight: 800,
                  color: '#1A1B22',
                  lineHeight: 1,
                  textAlign: 'left',
                }}
              >
                {pill.text}
              </span>

              {/* Checkmark Badge (when selected): 56 diameter at right, right padding 32 */}
              {isSelected && (
                <div
                  className="absolute flex items-center justify-center select-none"
                  style={{
                    right: 'calc(32 * var(--u))',
                    width: 'calc(56 * var(--u))',
                    height: 'calc(56 * var(--u))',
                    borderRadius: 'calc(9999px)',
                    backgroundColor: '#1A1B22',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="stroke-current text-white"
                    style={{
                      width: 'calc(32 * var(--u))',
                      height: 'calc(32 * var(--u))',
                      strokeWidth: 3.5,
                      fill: 'none',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {/* =========================================================================
            6. HINT "Pick one. Be quick!": centered, y=1540, font 26, weight 700, gray #6E7058
           ========================================================================= */}
        <div
          className="absolute w-full flex items-center justify-center z-20 select-none text-center"
          style={{
            top: 'calc(1524 * var(--u))',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(26 * var(--u))',
            fontWeight: 700,
            color: '#6E7058',
          }}
        >
          Pick one. Be quick!
        </div>

        {/* =========================================================================
            7. BUTTON "Lock in answer": x=75 to 766 (691w), y=1615 to 1715 (100h)
               - full pill, near-black #1A1B22, text white font 36, weight 800, centered
           ========================================================================= */}
        <button
          type="button"
          onClick={handleLockIn}
          className="absolute flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98] select-none p-0 focus:outline-none z-20"
          style={{
            left: 'calc(75 * var(--u))',
            top: 'calc(1615 * var(--u))',
            width: 'calc(691 * var(--u))',
            height: 'calc(100 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#1A1B22',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(36 * var(--u))',
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          Lock in answer
        </button>
      </div>
    </div>

    {/* =========================================================================
        COMPACT / SHORT MOBILE VIEWPORT LAYOUT (940 x 1672)
        Active for mobile (<768px) with aspect ratio < 1.9 OR height < 760px
       ========================================================================= */}
    <div
      className="trivia-compact-stage w-full min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{
        ['--u' as any]: 'min(calc(100vw / 940), calc(100dvh / 1672))',
      }}
    >
      {/* Exact 940 x 1672 Stage Canvas */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          width: 'calc(940 * var(--u))',
          height: 'calc(1672 * var(--u))',
          backgroundColor: '#B3BF8A',
        }}
      >
        {/* =========================================================================
            8. CORNER DECORATIONS (behind content, never overlapping text)
           ========================================================================= */}
        {/* Top-Left Heart: x=0 to 105, y=0 to 140 */}
        <img
          src="/assets/heart-pink-top-left.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 0,
            top: 0,
            width: 'calc(105 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />

        {/* Top-Right Star: x=825 to 940, y=0 to 125 */}
        <img
          src="/assets/star-blue-top-right.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 'calc(825 * var(--u))',
            top: 0,
            width: 'calc(115 * var(--u))',
            height: 'calc(125 * var(--u))',
          }}
          draggable={false}
        />

        {/* Bottom-Left Green Cross: x=40, y=1545 */}
        <img
          src="/assets/cross-green.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 'calc(40 * var(--u))',
            top: 'calc(1545 * var(--u))',
            width: 'calc(85 * var(--u))',
            height: 'calc(82 * var(--u))',
          }}
          draggable={false}
        />

        {/* Bottom-Left Moon: x=0 to 110, y=1545 to 1672 */}
        <img
          src="/assets/moon-yellow-bottom-left.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 0,
            top: 'calc(1545 * var(--u))',
            width: 'calc(110 * var(--u))',
            height: 'calc(127 * var(--u))',
          }}
          draggable={false}
        />

        {/* Bottom-Right Heart: x=795 to 940, y=1525 to 1672 */}
        <img
          src="/assets/heart-pink-bottom-right.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0 object-contain"
          style={{
            left: 'calc(795 * var(--u))',
            top: 'calc(1525 * var(--u))',
            width: 'calc(145 * var(--u))',
            height: 'calc(147 * var(--u))',
          }}
          draggable={false}
        />

        {/* =========================================================================
            1. TOP ROW, center y=155:
               - Back button: dashed circle, 88 diameter, x=92 to 180, arrow icon
               - Pill "QUESTION 3 / 10": x=322 to 617 (295w), y=122 to 186 (64h), near-black #1A1B22
               - Timer: circle 100 diameter, x=752 to 852, y=108 to 208, cream, dashed dark ring
           ========================================================================= */}
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="absolute flex items-center justify-center cursor-pointer transition-transform active:scale-90 z-20 p-0 focus:outline-none"
          style={{
            left: 'calc(92 * var(--u))',
            top: 'calc(111 * var(--u))',
            width: 'calc(88 * var(--u))',
            height: 'calc(88 * var(--u))',
            borderRadius: 'calc(9999px)',
            border: 'calc(3 * var(--u)) dashed #1A1B22',
            backgroundColor: 'transparent',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="stroke-current text-[#1A1B22]"
            style={{
              width: 'calc(40 * var(--u))',
              height: 'calc(40 * var(--u))',
              strokeWidth: 2.8,
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Question Counter Pill */}
        <div
          className="absolute flex items-center justify-center z-20 select-none"
          style={{
            left: 'calc(322 * var(--u))',
            top: 'calc(122 * var(--u))',
            width: 'calc(295 * var(--u))',
            height: 'calc(64 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#1A1B22',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(27 * var(--u))',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: 'calc(1.1 * var(--u))',
            textTransform: 'uppercase',
          }}
        >
          {`QUESTION ${currentRound} / ${totalRounds}`}
        </div>

        {/* Timer Circle */}
        <div
          className="absolute flex items-center justify-center z-20 select-none"
          style={{
            left: 'calc(752 * var(--u))',
            top: 'calc(108 * var(--u))',
            width: 'calc(100 * var(--u))',
            height: 'calc(100 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#F8F3E6',
            border: 'calc(3.5 * var(--u)) dashed #1A1B22',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(40 * var(--u))',
            fontWeight: 800,
            color: '#1A1B22',
          }}
        >
          {currentTimer}
        </div>

        {/* =========================================================================
            2. SCORE PILLS, y=246 to 383 (137h):
               - Left x=88 to 458 (370w), right x=482 to 853 (371w), cream #F6F0E2, full pill
               - Avatar blob 122 diameter, left padding 24
               - Name font 31, weight 800, near-black. Score below, font 38, weight 800, gray #6B6B6B
               - Text left x=252 (inside left pill: 252 - 88 = 164)
           ========================================================================= */}
        {/* Left Pill (Me / Player 1) */}
        <div
          className="absolute flex items-center z-20 select-none"
          style={{
            left: 'calc(88 * var(--u))',
            top: 'calc(246 * var(--u))',
            width: 'calc(370 * var(--u))',
            height: 'calc(137 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#F6F0E2',
            paddingLeft: 'calc(24 * var(--u))',
          }}
        >
          {/* Dynamic Avatar Blob */}
          <div
            className="relative rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 'calc(122 * var(--u))',
              height: 'calc(122 * var(--u))',
            }}
          >
            <img
              src={getBlobImageSrc(p1Color, p1AvatarId)}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div
              className="relative z-10 flex items-center justify-center pointer-events-none select-none"
              style={{
                width: `${p1BlobConfig.avatarScale * 100}%`,
                height: `${p1BlobConfig.avatarScale * 100}%`,
                transform: `translate(${p1BlobConfig.offsetX}px, ${p1BlobConfig.offsetY}px)`,
              }}
            >
              <img
                src={getAvatarFaceImageSrc(p1AvatarId)}
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Name & Score Column: Text left x=252 => inside left pill: 252 - 88 = 164 */}
          <div
            className="absolute flex flex-col justify-center items-start overflow-hidden"
            style={{
              left: 'calc(164 * var(--u))',
              right: 'calc(20 * var(--u))',
            }}
          >
            <span
              className="truncate w-full"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(31 * var(--u))',
                fontWeight: 800,
                color: '#1A1B22',
                lineHeight: 1.15,
              }}
            >
              {p1Name}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(38 * var(--u))',
                fontWeight: 800,
                color: '#6B6B6B',
                lineHeight: 1.15,
              }}
            >
              {p1Score}
            </span>
          </div>
        </div>

        {/* Right Pill (Partner / Player 2) */}
        <div
          className="absolute flex items-center z-20 select-none"
          style={{
            left: 'calc(482 * var(--u))',
            top: 'calc(246 * var(--u))',
            width: 'calc(371 * var(--u))',
            height: 'calc(137 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#F6F0E2',
            paddingLeft: 'calc(24 * var(--u))',
          }}
        >
          {/* Dynamic Avatar Blob */}
          <div
            className="relative rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 'calc(122 * var(--u))',
              height: 'calc(122 * var(--u))',
            }}
          >
            <img
              src={getBlobImageSrc(p2Color, p2AvatarId)}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div
              className="relative z-10 flex items-center justify-center pointer-events-none select-none"
              style={{
                width: `${p2BlobConfig.avatarScale * 100}%`,
                height: `${p2BlobConfig.avatarScale * 100}%`,
                transform: `translate(${p2BlobConfig.offsetX}px, ${p2BlobConfig.offsetY}px)`,
              }}
            >
              <img
                src={getAvatarFaceImageSrc(p2AvatarId)}
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Name & Score Column: Text left inside right pill: 164 */}
          <div
            className="absolute flex flex-col justify-center items-start overflow-hidden"
            style={{
              left: 'calc(164 * var(--u))',
              right: 'calc(20 * var(--u))',
            }}
          >
            <span
              className="truncate w-full"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(31 * var(--u))',
                fontWeight: 800,
                color: '#1A1B22',
                lineHeight: 1.15,
              }}
            >
              {p2Name}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'calc(38 * var(--u))',
                fontWeight: 800,
                color: '#6B6B6B',
                lineHeight: 1.15,
              }}
            >
              {p2Score}
            </span>
          </div>
        </div>

        {/* =========================================================================
            3. TAG "Trivia · Food": x=333 to 606 (273w), y=414 to 491 (77h), yellow #FDD84B
           ========================================================================= */}
        <div
          className="absolute flex items-center justify-center z-20 select-none"
          style={{
            left: 'calc(333 * var(--u))',
            top: 'calc(414 * var(--u))',
            width: 'calc(273 * var(--u))',
            height: 'calc(77 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#FDD84B',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(31 * var(--u))',
            fontWeight: 800,
            color: '#1A1B22',
          }}
        >
          {`Trivia · ${category}`}
        </div>

        {/* =========================================================================
            4. QUESTION CARD: question-card-blob.webp spans x=145 to 810 (665w), y=535 to 782 (247h)
               - lightbulb-blob.webp: x=133 to 230 (~97w), y=495 to 583
               - question-sparkles-left.webp: x=88 to 142, y=612 to 745
               - question-sparkles-right.webp: x=818 to 868, y=598 to 727
               - Question text centered, 2 lines, font 72, weight 900
           ========================================================================= */}
        {/* Left Sparkles */}
        <img
          src="/assets/question-sparkles-left.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10 object-contain"
          style={{
            left: 'calc(88 * var(--u))',
            top: 'calc(612 * var(--u))',
            width: 'calc(54 * var(--u))',
            height: 'calc(133 * var(--u))',
          }}
          draggable={false}
        />

        {/* Right Sparkles */}
        <img
          src="/assets/question-sparkles-right.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10 object-contain"
          style={{
            left: 'calc(818 * var(--u))',
            top: 'calc(598 * var(--u))',
            width: 'calc(50 * var(--u))',
            height: 'calc(129 * var(--u))',
          }}
          draggable={false}
        />

        {/* Lightbulb Blob (overlapping top-left of the card) */}
        <img
          src="/assets/lightbulb-blob.webp"
          alt=""
          className="absolute pointer-events-none select-none z-30 object-contain"
          style={{
            left: 'calc(133 * var(--u))',
            top: 'calc(495 * var(--u))',
            width: 'calc(97 * var(--u))',
            height: 'calc(88 * var(--u))',
          }}
          draggable={false}
        />

        {/* Question Card Container */}
        <div
          className="absolute z-20 flex items-center justify-center"
          style={{
            left: 'calc(145 * var(--u))',
            top: 'calc(535 * var(--u))',
            width: 'calc(665 * var(--u))',
            height: 'calc(247 * var(--u))',
          }}
        >
          {/* Card Blob Background */}
          <img
            src="/assets/question-card-blob.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
            draggable={false}
          />

          {/* Live Question Text */}
          <div
            className="relative z-10 flex items-center justify-center text-center w-full"
            style={{
              paddingLeft: 'calc(40 * var(--u))',
              paddingRight: 'calc(40 * var(--u))',
            }}
          >
            <h1
              className="m-0 text-center select-none"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: rawQuestion.length > 50 ? 'calc(56 * var(--u))' : 'calc(72 * var(--u))',
                fontWeight: 900,
                color: '#1A1B22',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                whiteSpace: 'pre-line',
              }}
            >
              {rawQuestion.length <= 50 && questionLines.length >= 2
                ? questionLines.join('\n')
                : rawQuestion}
            </h1>
          </div>
        </div>

        {/* =========================================================================
            5. ANSWER PILLS (4, stacked):
               - A pink #FD99C9: x=90 to 850 (760w), y=838 to 945 (107h). SELECTED: 6 black outline, check badge 46d
               - B blue #8CBEFD: x=92 to 848 (756w), y=974 to 1076 (102h)
               - C yellow #FDD75A: x=92 to 848 (756w), y=1106 to 1209 (103h)
               - D cream #F6F0E2: x=97 to 843 (746w), y=1239 to 1341 (102h)
               - Gap between pills ~30
               - Letter badge: circle 80 diameter, left padding 38, letter font 38, weight 900
               - Answer text starts at x=252, font 42, weight 800, near-black
           ========================================================================= */}
        {compactAnswerPills.map((pill) => {
          const isSelected = selectedOptionId === pill.id;

          return (
            <button
              key={`compact-${pill.id}`}
              type="button"
              onClick={() => setSelectedOptionId(pill.id)}
              className="absolute flex items-center cursor-pointer transition-transform duration-100 active:scale-[0.98] select-none p-0 focus:outline-none z-20"
              style={{
                left: `calc(${pill.x} * var(--u))`,
                top: `calc(${pill.y} * var(--u))`,
                width: `calc(${pill.w} * var(--u))`,
                height: `calc(${pill.h} * var(--u))`,
                borderRadius: 'calc(9999px)',
                backgroundColor: pill.colorBg,
                boxShadow: isSelected ? '0 0 0 calc(6 * var(--u)) #1A1B22' : 'none',
              }}
            >
              {/* Letter Badge (circle 80 diameter, left padding 38) */}
              <div
                className="absolute flex items-center justify-center select-none"
                style={{
                  left: 'calc(38 * var(--u))',
                  width: 'calc(80 * var(--u))',
                  height: 'calc(80 * var(--u))',
                  borderRadius: 'calc(9999px)',
                  backgroundColor: pill.badgeBg,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 'calc(38 * var(--u))',
                    fontWeight: 900,
                    color: '#1A1B22',
                    lineHeight: 1,
                  }}
                >
                  {pill.letter}
                </span>
              </div>

              {/* Answer Text (Starts at design x=252 => inside pill: 252 - pill.x) */}
              <span
                className="absolute truncate"
                style={{
                  left: `calc(${(252 - pill.x)} * var(--u))`,
                  maxWidth: isSelected ? 'calc(470 * var(--u))' : 'calc(520 * var(--u))',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 'calc(42 * var(--u))',
                  fontWeight: 800,
                  color: '#1A1B22',
                  lineHeight: 1,
                  textAlign: 'left',
                }}
              >
                {pill.text}
              </span>

              {/* Checkmark Badge (when selected): 46 diameter at right (right padding 34) */}
              {isSelected && (
                <div
                  className="absolute flex items-center justify-center select-none"
                  style={{
                    right: 'calc(34 * var(--u))',
                    width: 'calc(46 * var(--u))',
                    height: 'calc(46 * var(--u))',
                    borderRadius: 'calc(9999px)',
                    backgroundColor: '#1A1B22',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="stroke-current text-white"
                    style={{
                      width: 'calc(28 * var(--u))',
                      height: 'calc(28 * var(--u))',
                      strokeWidth: 3.5,
                      fill: 'none',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {/* =========================================================================
            6. HINT "Pick one. Be quick!": centered, y=1384, font 26, weight 700, gray #6E7058
           ========================================================================= */}
        <div
          className="absolute w-full flex items-center justify-center z-20 select-none text-center"
          style={{
            top: 'calc(1384 * var(--u))',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(26 * var(--u))',
            fontWeight: 700,
            color: '#6E7058',
          }}
        >
          Pick one. Be quick!
        </div>

        {/* =========================================================================
            7. BUTTON "Lock in answer": x=90 to 850 (760w), y=1440 to 1538 (98h)
               - full pill, near-black, text white font 34, weight 800, centered
           ========================================================================= */}
        <button
          type="button"
          onClick={handleLockIn}
          className="absolute flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98] select-none p-0 focus:outline-none z-20"
          style={{
            left: 'calc(90 * var(--u))',
            top: 'calc(1440 * var(--u))',
            width: 'calc(760 * var(--u))',
            height: 'calc(98 * var(--u))',
            borderRadius: 'calc(9999px)',
            backgroundColor: '#1A1B22',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 'calc(34 * var(--u))',
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          Lock in answer
        </button>
      </div>
    </div>
  </div>
  );
};
