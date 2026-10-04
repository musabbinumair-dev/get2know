import React, { useState, useEffect, useRef } from 'react';
import { BottomNav, NavTab } from '../components/BottomNav';
import { QuestionData, getAvatarFaceSrc } from '../data/gameData';
import { useGameSession } from '../services/gameSessionContext';
import { GameHeader } from '../components/GameHeader';
import { TriviaQuestion } from '../data/gameQuestions';

export interface SpecBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX?: number;
  centerY?: number;
}

export const layoutSpec: Record<string, SpecBox> = {
  stage: { x: 0, y: 0, width: 390, height: 844 },
  backButton: { x: 22, y: 30, width: 35, height: 35 },
  title: { x: 155, y: 31, width: 80, height: 28, centerX: 195, centerY: 45 },

  // Date row columns (MON 12 - SAT 17) + selected SUN 18 pill
  monLabel: { x: 31, y: 80, width: 32, height: 14, centerX: 47, centerY: 87 },
  monNum: { x: 31, y: 94, width: 32, height: 20, centerX: 47, centerY: 104 },
  tueLabel: { x: 80, y: 80, width: 32, height: 14, centerX: 96, centerY: 87 },
  tueNum: { x: 80, y: 94, width: 32, height: 20, centerX: 96, centerY: 104 },
  wedLabel: { x: 128, y: 80, width: 32, height: 14, centerX: 144, centerY: 87 },
  wedNum: { x: 128, y: 94, width: 32, height: 20, centerX: 144, centerY: 104 },
  thuLabel: { x: 177, y: 80, width: 32, height: 14, centerX: 193, centerY: 87 },
  thuNum: { x: 177, y: 94, width: 32, height: 20, centerX: 193, centerY: 104 },
  friLabel: { x: 226, y: 80, width: 32, height: 14, centerX: 242, centerY: 87 },
  friNum: { x: 226, y: 94, width: 32, height: 20, centerX: 242, centerY: 104 },
  satLabel: { x: 274, y: 80, width: 32, height: 14, centerX: 290, centerY: 87 },
  satNum: { x: 274, y: 94, width: 32, height: 20, centerX: 290, centerY: 104 },
  sunPill: { x: 320, y: 76, width: 43, height: 43 },
  sunLabel: { x: 325.5, y: 80, width: 32, height: 14, centerX: 341.5, centerY: 87 },
  sunNum: { x: 325.5, y: 94, width: 32, height: 20, centerX: 341.5, centerY: 104 },

  // Question
  question: { x: 24, y: 132, width: 342, height: 130 },

  // Cards & Avatars
  cardBlobPink: { x: 22, y: 268, width: 152, height: 156 },
  cardBlobBlue: { x: 216, y: 268, width: 152, height: 156 },
  matchStarburst: { x: 151, y: 288, width: 88, height: 92 },
  player1Avatar: { x: 65, y: 282, width: 50, height: 53 },
  player2Avatar: { x: 267, y: 282, width: 50, height: 53 },

  // Card text & answers
  player1Label: { x: 35, y: 334, width: 120, height: 16, centerX: 95, centerY: 342 },
  player2Label: { x: 232, y: 334, width: 120, height: 16, centerX: 292, centerY: 342 },
  matchBadgeText: { x: 151, y: 311, width: 88, height: 46, centerX: 195, centerY: 334 },

  // Middle status / score & decorations
  crescentYellow: { x: 60, y: 442, width: 44, height: 47 },
  starburstBlue: { x: 285, y: 438, width: 49, height: 54 },
  crossOlive: { x: 295, y: 500, width: 41, height: 42 },
  heartPinkSmall: { x: 48, y: 506, width: 41, height: 37 },
  syncScoreLabel: { x: 120, y: 430, width: 150, height: 20, centerX: 195, centerY: 440 },
  syncScoreValue: { x: 60, y: 454, width: 270, height: 55 },
  syncCaption: { x: 40, y: 524, width: 310, height: 22, centerX: 195, centerY: 535 },

  // 6 Reaction emoji circles (45x45 centered at y 585)
  emojiCircle0: { x: 29.5, y: 564, width: 45, height: 45, centerX: 52, centerY: 586.5 },
  emojiCircle1: { x: 86.5, y: 564, width: 45, height: 45, centerX: 109, centerY: 586.5 },
  emojiCircle2: { x: 143.5, y: 564, width: 45, height: 45, centerX: 166, centerY: 586.5 },
  emojiCircle3: { x: 200.5, y: 564, width: 45, height: 45, centerX: 223, centerY: 586.5 },
  emojiCircle4: { x: 258.5, y: 564, width: 45, height: 45, centerX: 281, centerY: 586.5 },
  emojiCircle5: { x: 315.5, y: 564, width: 45, height: 45, centerX: 338, centerY: 586.5 },

  // 6 Reaction emoji PNGs (23x23)
  emojiImg0: { x: 40.5, y: 575, width: 23, height: 23, centerX: 52, centerY: 586.5 },
  emojiImg1: { x: 97.5, y: 575, width: 23, height: 23, centerX: 109, centerY: 586.5 },
  emojiImg2: { x: 154.5, y: 575, width: 23, height: 23, centerX: 166, centerY: 586.5 },
  emojiImg3: { x: 211.5, y: 575, width: 23, height: 23, centerX: 223, centerY: 586.5 },
  emojiImg4: { x: 269.5, y: 575, width: 23, height: 23, centerX: 281, centerY: 586.5 },
  emojiImg5: { x: 326.5, y: 575, width: 23, height: 23, centerX: 338, centerY: 586.5 },

  // Action pills
  saveButton: { x: 31, y: 636, width: 328, height: 40 },
  nextQuestionPill: { x: 31, y: 686, width: 328, height: 42 },

  // Bottom corner decorations (behind tab bar)
  decoBottomLeft: { x: -6, y: 738, width: 48, height: 43 },
  decoBottomRight: { x: 352, y: 738, width: 42, height: 38 },

  // Shared BottomNav
  bottomNav: { x: 6.5, y: 776, width: 377, height: 60 },
};

const DATE_DAYS = [
  { key: 'mon', day: 'MON', num: '12', labelSpec: layoutSpec.monLabel, numSpec: layoutSpec.monNum },
  { key: 'tue', day: 'TUE', num: '13', labelSpec: layoutSpec.tueLabel, numSpec: layoutSpec.tueNum },
  { key: 'wed', day: 'WED', num: '14', labelSpec: layoutSpec.wedLabel, numSpec: layoutSpec.wedNum },
  { key: 'thu', day: 'THU', num: '15', labelSpec: layoutSpec.thuLabel, numSpec: layoutSpec.thuNum },
  { key: 'fri', day: 'FRI', num: '16', labelSpec: layoutSpec.friLabel, numSpec: layoutSpec.friNum },
  { key: 'sat', day: 'SAT', num: '17', labelSpec: layoutSpec.satLabel, numSpec: layoutSpec.satNum },
] as const;

const REACTION_EMOJIS = [
  { id: 'smile', file: '/assets/reveal/emoji-smile.png', label: 'Smile' },
  { id: 'heart', file: '/assets/reveal/emoji-heart.png', label: 'Heart' },
  { id: 'laugh', file: '/assets/reveal/emoji-laugh.png', label: 'Laugh' },
  { id: 'surprised', file: '/assets/reveal/emoji-surprised.png', label: 'Surprised' },
  { id: 'smirk', file: '/assets/reveal/emoji-smirk.png', label: 'Smirk' },
  { id: 'cry', file: '/assets/reveal/emoji-cry.png', label: 'Cry' },
] as const;

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
}

function formatBlobAnswer(answer: string, maxLength = 36): {
  text: string;
  isTruncated: boolean;
  fontSize: string;
  lineHeight: string;
} {
  const trimmed = (answer || '').trim();
  const isTruncated = trimmed.length > maxLength;
  const displayText = isTruncated ? trimmed.slice(0, maxLength).trim() + '…' : trimmed;

  let fontSize = '17px';
  let lineHeight = '20px';
  if (displayText.length > 28) {
    fontSize = '12px';
    lineHeight = '14.5px';
  } else if (displayText.length > 16) {
    fontSize = '14px';
    lineHeight = '16.5px';
  }

  return { text: displayText, isTruncated, fontSize, lineHeight };
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  player1Name = 'Player 1',
  player1AvatarId = 1,
  player1Color: _p1Color = 'salmon',
  player2Name = 'Player 2',
  player2AvatarId = 2,
  player2Color: _p2Color = 'teal',
  questionData,
  player1Answer = 'Anchovies on pizza.',
  player2Answer = 'Anchovies on pizza.',
  syncScore = 74,
  isMatched,
  selectedReaction: controlledReaction,
  onSelectReaction,
  onSaveToMemoryWall,
  onNextQuestion,
  onBack,
  onNavigateTab,
}) => {
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  const stageRef = useRef<HTMLDivElement | null>(null);

  // Scale = viewportWidth / 390
  const [scale, setScale] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.min(1.15, window.innerWidth / 390) : 1
  );

  const [internalReaction, setInternalReaction] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_selected_reaction');
    }
    return null;
  });
  const [bouncingEmojiId, setBouncingEmojiId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavTab>('today');

  // Modal state to inspect full answer
  const [inspectingPlayer, setInspectingPlayer] = useState<{
    name: string;
    avatarId: number;
    answer: string;
    blobBg: string;
  } | null>(null);

  const activeReaction =
    controlledReaction !== undefined ? controlledReaction : internalReaction;

  // Determine game mode specific details
  const isTriviaRound = isInGame && gameSession.currentRoundType === 'trivia';
  const isKnowMeRound = isInGame && gameSession.currentRoundType === 'know-me';

  // Resolved titles
  const p1Title = isTriviaRound
    ? 'Your Pick'
    : (player1Name && player1Name !== 'Player 1' ? player1Name : 'You');

  const p2Title = isTriviaRound
    ? 'Correct Answer'
    : (player2Name && player2Name !== 'Player 2' ? player2Name : 'Alex');

  // Resolved answers
  const resolvedP1Answer = isTriviaRound
    ? (gameSession.myGuess || 'No guess')
    : isInGame
    ? (gameSession.myAnswer || player1Answer)
    : player1Answer;

  const resolvedP2Answer = isTriviaRound
    ? (((gameSession.currentQuestion as TriviaQuestion)?.options?.find(
        (o) => o.id === (gameSession.currentQuestion as TriviaQuestion).correctOptionId
      )?.text) || 'Correct Answer')
    : isInGame
    ? (gameSession.friendAnswer || player2Answer)
    : player2Answer;

  const isSuccess = isTriviaRound
    ? gameSession.isCorrect
    : isKnowMeRound
    ? gameSession.isMatched
    : (isMatched !== undefined
      ? isMatched
      : player1Answer.trim().toLowerCase() === player2Answer.trim().toLowerCase());

  const p1Formatted = formatBlobAnswer(resolvedP1Answer);
  const p2Formatted = formatBlobAnswer(resolvedP2Answer);

  const rawQuestion = isInGame
    ? gameSession.currentQuestion.question
    : questionData?.question || "What’s the worst food you’ve ever tried?";

  const questionLines = isInGame
    ? (gameSession.currentQuestion.questionLines || [gameSession.currentQuestion.question])
    : (questionData?.questionLines || [
        "What’s the worst",
        "food you’ve ever",
        "tried?",
      ]);

  useEffect(() => {
    const handleResize = () => {
      setScale(Math.min(1.15, window.innerWidth / 390));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEmojiClick = (emojiId: string) => {
    setInternalReaction(emojiId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reveal_selected_reaction', emojiId);
    }
    onSelectReaction?.(emojiId);
    setBouncingEmojiId(emojiId);
    setTimeout(() => {
      setBouncingEmojiId((prev) => (prev === emojiId ? null : prev));
    }, 260);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reveal_saved_to_memory_wall', 'true');
    }
    onSaveToMemoryWall?.();
    setToastMessage('Saved to Memory Wall! ✨');
    setTimeout(() => {
      setToastMessage('');
    }, 2200);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    onNavigateTab?.(tab);
  };

  const boxStyle = (spec: SpecBox): React.CSSProperties => ({
    position: 'absolute',
    left: `${spec.x}px`,
    top: `${spec.y}px`,
    width: `${spec.width}px`,
    height: `${spec.height}px`,
  });

  const imgStyle = (spec: SpecBox): React.CSSProperties => ({
    ...boxStyle(spec),
    objectFit: 'contain',
    padding: 0,
  });

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#F5CCE2] select-none flex justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Fixed 390x844 stage scaled by viewportWidth / 390 */}
      <div
        ref={stageRef}
        data-spec="stage"
        className="relative bg-[#F5CCE2] overflow-hidden select-none font-nunito"
        style={{
          width: '390px',
          height: '844px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          flexShrink: 0,
        }}
      >
        {/* Toast notification for "Save to memory wall" */}
        {toastMessage && (
          <div className="absolute top-[74px] left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
            <div className="bg-[#1B1D20] text-white px-5 py-2.5 rounded-full font-black text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* ---------------- HEADER (GAME HEADER IN-GAME OR STANDARD TOP BAR) ---------------- */}
        {isInGame ? (
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: 0,
              width: '390px',
              zIndex: 40,
            }}
          >
            <GameHeader
              currentRound={gameSession.currentRound}
              totalRounds={gameSession.totalRounds}
              showTimer={false}
              onExit={gameSession.exitGame}
            />
          </div>
        ) : (
          <>
            {/* Back button: dashed circle 35px at x 22, y 30 */}
            <button
              type="button"
              data-spec="backButton"
              onClick={onBack}
              aria-label="Back"
              className="btn-press flex items-center justify-center rounded-full bg-transparent cursor-pointer focus:outline-none z-20 p-0"
              style={boxStyle(layoutSpec.backButton)}
            >
              <svg
                width="35"
                height="35"
                viewBox="0 0 35 35"
                className="absolute inset-0 pointer-events-none"
              >
                <circle
                  cx="17.5"
                  cy="17.5"
                  r="16.5"
                  fill="none"
                  stroke="rgba(27, 29, 32, 0.55)"
                  strokeWidth="1.3"
                  strokeDasharray="3.6 3.2"
                />
              </svg>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1B1D20"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
              >
                <path d="M19 12H5" />
                <path d="M11 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Title "Reveal": centered at x 195, y 45, Nunito 900, about 22px */}
            <h1
              data-spec="title"
              className="m-0 flex items-center justify-center font-black text-[#1B1D20] select-none z-20"
              style={{
                ...boxStyle(layoutSpec.title),
                fontSize: '22px',
                lineHeight: '28px',
                letterSpacing: '-0.02em',
              }}
            >
              Reveal
            </h1>

            {/* ---------------- DATE ROW ---------------- */}
            {DATE_DAYS.map((col) => (
              <React.Fragment key={col.key}>
                <div
                  data-spec={`${col.key}Label`}
                  className="flex items-center justify-center font-bold select-none z-10"
                  style={{
                    ...boxStyle(col.labelSpec),
                    fontSize: '11px',
                    lineHeight: '14px',
                    letterSpacing: '0.02em',
                    color: 'rgba(27, 29, 32, 0.56)',
                  }}
                >
                  {col.day}
                </div>
                <div
                  data-spec={`${col.key}Num`}
                  className="flex items-center justify-center font-bold select-none z-10"
                  style={{
                    ...boxStyle(col.numSpec),
                    fontSize: '17px',
                    lineHeight: '20px',
                    color: 'rgba(27, 29, 32, 0.72)',
                  }}
                >
                  {col.num}
                </div>
              </React.Fragment>
            ))}

            {/* SUN 18 selected black pill: 43x43 at x 320, y 76 */}
            <div
              data-spec="sunPill"
              className="rounded-full bg-[#1B1D20] select-none z-10"
              style={boxStyle(layoutSpec.sunPill)}
            />
            <div
              data-spec="sunLabel"
              className="flex items-center justify-center font-bold text-white select-none z-20"
              style={{
                ...boxStyle(layoutSpec.sunLabel),
                fontSize: '11px',
                lineHeight: '14px',
                letterSpacing: '0.02em',
              }}
            >
              SUN
            </div>
            <div
              data-spec="sunNum"
              className="flex items-center justify-center font-bold text-white select-none z-20"
              style={{
                ...boxStyle(layoutSpec.sunNum),
                fontSize: '17px',
                lineHeight: '20px',
              }}
            >
              18
            </div>
          </>
        )}

        {/* ---------------- QUESTION TITLE / PROMPT ---------------- */}
        <div
          data-spec="question"
          className="font-black text-[#1B1D20] select-none z-10 flex flex-col justify-center px-1"
          style={{
            ...boxStyle(layoutSpec.question),
          }}
        >
          {questionLines.length > 1 ? (
            <div className="flex flex-col gap-0 leading-[1.08] tracking-[-0.03em] font-black text-[30px] sm:text-[34px]">
              {questionLines.map((line, idx) => (
                <div key={idx} className="truncate">{line}</div>
              ))}
            </div>
          ) : (
            <div
              className={`font-black tracking-[-0.03em] leading-[1.12] break-words line-clamp-3 ${
                rawQuestion.length > 45 ? 'text-[24px]' : 'text-[28px]'
              }`}
            >
              {rawQuestion}
            </div>
          )}
        </div>

        {/* ---------------- CARDS & AVATARS ---------------- */}
        {/* Left Card (Pink Blob): Clickable to inspect full answer */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: p1Title,
              avatarId: player1AvatarId,
              answer: resolvedP1Answer,
              blobBg: '#FCA0D1',
            })
          }
          className="cursor-pointer active:scale-[0.98] transition-transform"
          title="Click to view full answer"
        >
          <img
            data-spec="cardBlobPink"
            src="/assets/reveal/card-blob-pink.png"
            alt=""
            style={imgStyle(layoutSpec.cardBlobPink)}
            className="pointer-events-none select-none z-10"
            draggable={false}
          />
        </div>

        {/* Right Card (Blue Blob): Clickable to inspect full answer */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: p2Title,
              avatarId: isTriviaRound ? 4 : player2AvatarId,
              answer: resolvedP2Answer,
              blobBg: '#8EAFFD',
            })
          }
          className="cursor-pointer active:scale-[0.98] transition-transform"
          title="Click to view full answer"
        >
          <img
            data-spec="cardBlobBlue"
            src="/assets/reveal/card-blob-blue.png"
            alt=""
            style={imgStyle(layoutSpec.cardBlobBlue)}
            className="pointer-events-none select-none z-10"
            draggable={false}
          />
        </div>

        {/* Left Card Avatar: Player 1 avatar */}
        <img
          data-spec="player1Avatar"
          src={getAvatarFaceSrc(player1AvatarId)}
          alt={p1Title}
          style={imgStyle(layoutSpec.player1Avatar)}
          className="pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* Right Card Avatar: Trivia target icon or Player 2 Avatar */}
        {isTriviaRound ? (
          <div
            style={boxStyle(layoutSpec.player2Avatar)}
            className="flex items-center justify-center rounded-full bg-[#1B1D20] text-white text-[24px] shadow-md pointer-events-none select-none z-20"
          >
            <span>🎯</span>
          </div>
        ) : (
          <img
            data-spec="player2Avatar"
            src={getAvatarFaceSrc(player2AvatarId)}
            alt={p2Title}
            style={imgStyle(layoutSpec.player2Avatar)}
            className="pointer-events-none select-none z-20"
            draggable={false}
          />
        )}

        {/* Card Header Labels: e.g. "Your Pick" / "Correct Answer" or player names */}
        <div
          data-spec="player1Label"
          className="flex items-center justify-center font-bold select-none z-20 text-center px-1"
          style={{
            ...boxStyle(layoutSpec.player1Label),
            fontSize: '11px',
            lineHeight: '13px',
            color: 'rgba(27, 29, 32, 0.65)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <span className="truncate">{p1Title}</span>
        </div>

        <div
          data-spec="player2Label"
          className="flex items-center justify-center font-bold select-none z-20 text-center px-1"
          style={{
            ...boxStyle(layoutSpec.player2Label),
            fontSize: '11px',
            lineHeight: '13px',
            color: 'rgba(27, 29, 32, 0.65)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <span className="truncate">{p2Title}</span>
        </div>

        {/* Left Card Answer */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: p1Title,
              avatarId: player1AvatarId,
              answer: resolvedP1Answer,
              blobBg: '#FCA0D1',
            })
          }
          className="absolute z-20 flex items-center justify-center text-center px-2 cursor-pointer select-none"
          style={{
            left: '26px',
            top: '352px',
            width: '144px',
            height: '62px',
          }}
          title="Click to view full answer"
        >
          <p
            className="font-extrabold text-[#1B1D20] text-center line-clamp-2 overflow-hidden text-ellipsis m-0"
            style={{
              fontSize: p1Formatted.fontSize,
              lineHeight: p1Formatted.lineHeight,
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
            }}
          >
            “{p1Formatted.text}”
          </p>
        </div>

        {/* Right Card Answer */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: p2Title,
              avatarId: isTriviaRound ? 4 : player2AvatarId,
              answer: resolvedP2Answer,
              blobBg: '#8EAFFD',
            })
          }
          className="absolute z-20 flex items-center justify-center text-center px-2 cursor-pointer select-none"
          style={{
            left: '220px',
            top: '352px',
            width: '144px',
            height: '62px',
          }}
          title="Click to view full answer"
        >
          <p
            className="font-extrabold text-[#1B1D20] text-center line-clamp-2 overflow-hidden text-ellipsis m-0"
            style={{
              fontSize: p2Formatted.fontSize,
              lineHeight: p2Formatted.lineHeight,
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
            }}
          >
            “{p2Formatted.text}”
          </p>
        </div>

        {/* ---------------- MATCH / RESULT STARBURST BADGE ---------------- */}
        <img
          data-spec="matchStarburst"
          src="/assets/reveal/match-starburst.png"
          alt=""
          style={{
            ...imgStyle(layoutSpec.matchStarburst),
            filter: isSuccess ? undefined : 'grayscale(1) brightness(0.92)',
          }}
          className="pointer-events-none select-none z-30"
          draggable={false}
        />

        {/* Match badge text */}
        <div
          data-spec="matchBadgeText"
          className="flex flex-col items-center justify-center text-center text-[#1B1D20] select-none z-30 pointer-events-none"
          style={boxStyle(layoutSpec.matchBadgeText)}
        >
          {isTriviaRound ? (
            isSuccess ? (
              <>
                <span className="font-black text-[11px] leading-[12px] tracking-[-0.015em] text-[#0A5C36]">
                  CORRECT!
                </span>
                <span className="font-black text-[16px] leading-[17px] tracking-[-0.02em] mt-[1px]">
                  +10 pts
                </span>
              </>
            ) : (
              <>
                <span className="font-black text-[11px] leading-[12px] tracking-[-0.015em] text-[#8B0000]">
                  WRONG!
                </span>
                <span className="font-black text-[14px] leading-[16px] tracking-[-0.02em] mt-[1px]">
                  +0 pts
                </span>
              </>
            )
          ) : isSuccess ? (
            <>
              <span className="font-extrabold text-[11px] leading-[12px] tracking-[-0.015em]">
                You
              </span>
              <span className="font-extrabold text-[11px] leading-[12px] tracking-[-0.015em]">
                matched!
              </span>
              <span className="font-black text-[16px] leading-[17px] tracking-[-0.02em] mt-[1px]">
                +{isKnowMeRound ? 15 : 10}
              </span>
            </>
          ) : (
            <>
              <span className="font-extrabold text-[10px] leading-[11px] tracking-[-0.01em]">
                Not quite
              </span>
              <span className="font-extrabold text-[10px] leading-[11px] tracking-[-0.01em]">
                matched 😭
              </span>
              <span className="font-black text-[14px] leading-[16px] tracking-[-0.02em] mt-[1px]">
                +0
              </span>
            </>
          )}
        </div>

        {/* ---------------- MIDDLE SECTION: SCORE / SYNC ---------------- */}
        {/* crescent-yellow: 44x47 */}
        <img
          data-spec="crescentYellow"
          src="/assets/reveal/crescent-yellow.png"
          alt=""
          style={imgStyle(layoutSpec.crescentYellow)}
          className="pointer-events-none select-none z-10 opacity-70"
          draggable={false}
        />

        {/* starburst-blue: 49x54 */}
        <img
          data-spec="starburstBlue"
          src="/assets/reveal/starburst-blue.png"
          alt=""
          style={imgStyle(layoutSpec.starburstBlue)}
          className="pointer-events-none select-none z-10 opacity-70"
          draggable={false}
        />

        {/* cross-olive: 41x42 */}
        <img
          data-spec="crossOlive"
          src="/assets/reveal/cross-olive.png"
          alt=""
          style={imgStyle(layoutSpec.crossOlive)}
          className="pointer-events-none select-none z-10 opacity-60"
          draggable={false}
        />

        {/* heart-pink-small: 41x37 */}
        <img
          data-spec="heartPinkSmall"
          src="/assets/reveal/heart-pink-small.png"
          alt=""
          style={imgStyle(layoutSpec.heartPinkSmall)}
          className="pointer-events-none select-none z-10 opacity-60"
          draggable={false}
        />

        {/* Header Label */}
        <div
          data-spec="syncScoreLabel"
          className="flex items-center justify-center font-extrabold select-none z-20 text-center uppercase tracking-wider"
          style={{
            ...boxStyle(layoutSpec.syncScoreLabel),
            fontSize: '13px',
            lineHeight: '16px',
            color: 'rgba(27, 29, 32, 0.65)',
          }}
        >
          {isTriviaRound
            ? `Game Standings (Round ${gameSession.currentRound}/${gameSession.totalRounds})`
            : isKnowMeRound
            ? `Duo Sync (Round ${gameSession.currentRound}/${gameSession.totalRounds})`
            : 'Duo Sync score'}
        </div>

        {/* Main Value Display */}
        {isTriviaRound ? (
          <div
            data-spec="syncScoreValue"
            className="flex items-center justify-center gap-2 select-none z-20"
            style={boxStyle(layoutSpec.syncScoreValue)}
          >
            <div className="bg-[#1B1D20] text-white px-3 py-1.5 rounded-full font-black text-[15px] flex items-center gap-1.5 shadow-md">
              <span>You:</span>
              <span className="text-[#FFD214]">{gameSession.myScore} pts</span>
            </div>
            <span className="font-black text-[14px] text-[#1B1D20]/40">vs</span>
            <div className="bg-[#1B1D20]/10 border border-[#1B1D20]/20 text-[#1B1D20] px-3 py-1.5 rounded-full font-black text-[15px] flex items-center gap-1.5">
              <span>{player2Name}:</span>
              <span>{gameSession.friendScore} pts</span>
            </div>
          </div>
        ) : (
          <div
            data-spec="syncScoreValue"
            className="flex items-center justify-center font-black text-[#1B1D20] select-none z-20 whitespace-nowrap"
            style={{
              ...boxStyle(layoutSpec.syncScoreValue),
              fontSize: '56px',
              lineHeight: '52px',
              letterSpacing: '-0.03em',
            }}
          >
            {isKnowMeRound
              ? `${gameSession.matchesCount > 0 ? Math.min(100, Math.round((gameSession.matchesCount / gameSession.currentRound) * 100)) : (isSuccess ? 100 : 50)}%`
              : `${syncScore}%`}
          </div>
        )}

        {/* Subtitle / Caption */}
        <div
          data-spec="syncCaption"
          className="flex items-center justify-center font-bold select-none z-20 text-center px-4"
          style={{
            ...boxStyle(layoutSpec.syncCaption),
            fontSize: '13px',
            lineHeight: '17px',
            color: 'rgba(27, 29, 32, 0.7)',
          }}
        >
          {isTriviaRound ? (
            gameSession.myScore > gameSession.friendScore ? (
              <span className="text-[#0A5C36] font-black">👑 You’re in the lead by {gameSession.myScore - gameSession.friendScore} pts!</span>
            ) : gameSession.myScore === gameSession.friendScore ? (
              <span>⚔️ Tied match! Next round is crucial!</span>
            ) : (
              <span className="text-[#B33900] font-black">🔥 {player2Name} leads by {gameSession.friendScore - gameSession.myScore} pts — catch up!</span>
            )
          ) : isSuccess ? (
            <span>Mind readers! You know each other so well ✨</span>
          ) : (
            <span>Different answers make conversations fun 💕</span>
          )}
        </div>

        {/* ---------------- REACTION EMOJIS ---------------- */}
        {REACTION_EMOJIS.map((emoji, index) => {
          const circleSpec = layoutSpec[`emojiCircle${index}`];
          const emojiImgSpec = layoutSpec[`emojiImg${index}`];
          const isSelected = activeReaction === emoji.id;
          const isBouncing = bouncingEmojiId === emoji.id;

          return (
            <React.Fragment key={emoji.id}>
              <button
                type="button"
                data-spec={`emojiCircle${index}`}
                onClick={() => handleEmojiClick(emoji.id)}
                aria-label={emoji.label}
                aria-pressed={isSelected}
                style={boxStyle(circleSpec)}
                className={`rounded-full bg-transparent p-0 flex items-center justify-center cursor-pointer focus:outline-none z-20 ${
                  isBouncing ? 'animate-avatar-bounce' : ''
                }`}
              >
                <svg
                  width="45"
                  height="45"
                  viewBox="0 0 45 45"
                  className="absolute inset-0 pointer-events-none"
                >
                  <circle
                    cx="22.5"
                    cy="22.5"
                    r="21.5"
                    fill="none"
                    stroke={isSelected ? '#1B1D20' : 'rgba(27, 29, 32, 0.6)'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeDasharray={isSelected ? undefined : '4.2 3.6'}
                  />
                </svg>
              </button>
              <img
                data-spec={`emojiImg${index}`}
                src={emoji.file}
                alt={emoji.label}
                style={imgStyle(emojiImgSpec)}
                className={`pointer-events-none select-none z-20 ${
                  isBouncing ? 'animate-avatar-bounce' : ''
                }`}
                draggable={false}
              />
            </React.Fragment>
          );
        })}

        {/* ---------------- ACTION BUTTONS ---------------- */}
        {/* "Save to memory wall" */}
        <button
          type="button"
          data-spec="saveButton"
          onClick={handleSave}
          style={boxStyle(layoutSpec.saveButton)}
          className="btn-press rounded-full bg-[#1B1D20] text-white font-bold text-[17px] tracking-[-0.015em] flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none z-20 p-0 shadow-md active:scale-[0.98]"
        >
          <svg
            width="17"
            height="19"
            viewBox="0 0 18 20"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M15 18l-6-4-6 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14z" />
          </svg>
          <span className="leading-none">Save to memory wall</span>
        </button>

        {/* "Next question" / "See final results" */}
        <button
          type="button"
          data-spec="nextQuestionPill"
          onClick={isInGame ? () => gameSession.nextRound() : onNextQuestion}
          disabled={!isInGame && !onNextQuestion}
          style={boxStyle(layoutSpec.nextQuestionPill)}
          className={`rounded-full font-black text-[18px] tracking-[-0.015em] flex items-center justify-center focus:outline-none z-20 p-0 shadow-lg ${
            isInGame || onNextQuestion
              ? 'bg-[#1B1D20] text-white hover:bg-[#2A2D32] cursor-pointer btn-press active:scale-[0.98]'
              : 'bg-[#D2C7D3] text-[#7D7580] cursor-default'
          }`}
        >
          <span className="leading-none">
            {isInGame
              ? gameSession.currentRound < gameSession.totalRounds
                ? `Next question (${gameSession.currentRound + 1}/${gameSession.totalRounds}) ➔`
                : 'See final results 🏆 ➔'
              : onNextQuestion
              ? 'Next question ✨'
              : 'Next question tomorrow'}
          </span>
        </button>

        {/* ---------------- BOTTOM DECORATIONS ---------------- */}
        <img
          data-spec="decoBottomLeft"
          src="/assets/reveal/deco-bottom-left.png"
          alt=""
          style={imgStyle(layoutSpec.decoBottomLeft)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        <img
          data-spec="decoBottomRight"
          src="/assets/reveal/deco-bottom-right.png"
          alt=""
          style={imgStyle(layoutSpec.decoBottomRight)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* ---------------- SHARED BOTTOM NAV (HIDDEN DURING ACTIVE GAME) ---------------- */}
        {!isInGame && (
          <div
            data-spec="bottomNav"
            style={boxStyle(layoutSpec.bottomNav)}
            className="z-30 pointer-events-auto"
          >
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        )}

        {/* ---------------- FULL ANSWER INSPECTION MODAL ---------------- */}
        {inspectingPlayer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1D20]/60 backdrop-blur-xs select-auto"
            onClick={() => setInspectingPlayer(null)}
          >
            <div
              className="relative w-full max-w-[320px] bg-[#FAF6EB] rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center animate-pop border-2 border-[#1B1D20]/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Avatar on Color Blob */}
              <div
                className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center mb-3 shadow-inner"
                style={{ backgroundColor: inspectingPlayer.blobBg }}
              >
                <img
                  src={getAvatarFaceSrc(inspectingPlayer.avatarId)}
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
                className="mt-5 w-full h-[46px] rounded-full bg-[#1B1D20] hover:bg-[#2A2D32] text-white font-bold text-[16px] tracking-tight cursor-pointer btn-press"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
