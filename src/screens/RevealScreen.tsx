import React, { useState, useEffect, useRef } from 'react';
import { BottomNav, NavTab } from '../components/BottomNav';
import { QuestionData, getAvatarFaceSrc } from '../data/gameData';

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

  // Question (x 24 to 352, top y 140, 3 lines * 43.5px = 130.5px)
  question: { x: 24, y: 140, width: 328, height: 130.5 },

  // Cards & Avatars
  cardBlobPink: { x: 22, y: 275, width: 152, height: 156 },
  cardBlobBlue: { x: 224, y: 274, width: 149, height: 146 },
  matchStarburst: { x: 152, y: 295, width: 88, height: 92 },
  player1Avatar: { x: 65, y: 293, width: 50, height: 53 },
  player2Avatar: { x: 271, y: 293, width: 50, height: 53 },

  // Card text & answers
  player1Label: { x: 60, y: 344, width: 60, height: 14, centerX: 90, centerY: 351 },
  player2Label: { x: 267, y: 344, width: 60, height: 14, centerX: 297, centerY: 351 },
  player1AnswerLine1: { x: 35, y: 370, width: 120, height: 22, centerX: 95, centerY: 381 },
  player1AnswerLine2: { x: 35, y: 392, width: 120, height: 22, centerX: 95, centerY: 403 },
  player2AnswerLine1: { x: 237, y: 370, width: 120, height: 22, centerX: 297, centerY: 381 },
  player2AnswerLine2: { x: 237, y: 392, width: 120, height: 22, centerX: 297, centerY: 403 },
  matchBadgeText: { x: 151, y: 318, width: 88, height: 46, centerX: 195, centerY: 341 },

  // Sync score & decorations around it
  crescentYellow: { x: 69, y: 458, width: 44, height: 47 },
  starburstBlue: { x: 269, y: 451, width: 49, height: 54 },
  crossOlive: { x: 291, y: 503, width: 41, height: 42 },
  heartPinkSmall: { x: 53, y: 512, width: 41, height: 37 },
  syncScoreLabel: { x: 145, y: 440, width: 100, height: 20, centerX: 195, centerY: 450 },
  syncScoreValue: { x: 131, y: 471, width: 130, height: 51 },
  syncCaption: { x: 99.5, y: 539, width: 191, height: 18, centerX: 195, centerY: 548 },

  // 6 Reaction emoji circles (45x45 centered at y 601, x: 52, 109, 166, 223, 281, 338)
  emojiCircle0: { x: 29.5, y: 578.5, width: 45, height: 45, centerX: 52, centerY: 601 },
  emojiCircle1: { x: 86.5, y: 578.5, width: 45, height: 45, centerX: 109, centerY: 601 },
  emojiCircle2: { x: 143.5, y: 578.5, width: 45, height: 45, centerX: 166, centerY: 601 },
  emojiCircle3: { x: 200.5, y: 578.5, width: 45, height: 45, centerX: 223, centerY: 601 },
  emojiCircle4: { x: 258.5, y: 578.5, width: 45, height: 45, centerX: 281, centerY: 601 },
  emojiCircle5: { x: 315.5, y: 578.5, width: 45, height: 45, centerX: 338, centerY: 601 },

  // 6 Reaction emoji PNGs (23x23 centered at y 601, x: 52, 109, 166, 223, 281, 338)
  emojiImg0: { x: 40.5, y: 589.5, width: 23, height: 23, centerX: 52, centerY: 601 },
  emojiImg1: { x: 97.5, y: 589.5, width: 23, height: 23, centerX: 109, centerY: 601 },
  emojiImg2: { x: 154.5, y: 589.5, width: 23, height: 23, centerX: 166, centerY: 601 },
  emojiImg3: { x: 211.5, y: 589.5, width: 23, height: 23, centerX: 223, centerY: 601 },
  emojiImg4: { x: 269.5, y: 589.5, width: 23, height: 23, centerX: 281, centerY: 601 },
  emojiImg5: { x: 326.5, y: 589.5, width: 23, height: 23, centerX: 338, centerY: 601 },

  // Action pills
  saveButton: { x: 31, y: 646, width: 328, height: 40 },
  nextQuestionPill: { x: 31, y: 694, width: 328, height: 40 },

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
  const trimmed = answer.trim();
  const isTruncated = trimmed.length > maxLength;
  const displayText = isTruncated ? trimmed.slice(0, maxLength).trim() + '....' : trimmed;

  let fontSize = '18px';
  let lineHeight = '21px';
  if (displayText.length > 28) {
    fontSize = '12px';
    lineHeight = '14.5px';
  } else if (displayText.length > 16) {
    fontSize = '14.5px';
    lineHeight = '17px';
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
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Scale = viewportWidth / 390 only
  const [scale, setScale] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth / 390 : 1
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

  const answersMatch =
    isMatched !== undefined
      ? isMatched
      : player1Answer.trim().toLowerCase() === player2Answer.trim().toLowerCase();

  const p1Formatted = formatBlobAnswer(player1Answer);
  const p2Formatted = formatBlobAnswer(player2Answer);

  const questionLines = questionData?.questionLines || [
    "What’s the worst",
    "food you’ve ever",
    "tried?",
  ];

  useEffect(() => {
    const handleResize = () => {
      setScale(window.innerWidth / 390);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dev-mode self-check: measure every element with getBoundingClientRect and log any > 2px off
  useEffect(() => {
    const isDev =
      typeof window !== 'undefined' &&
      ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV ?? true);
    if (!isDev) return;
    const timer = setTimeout(() => {
      const stageEl = stageRef.current;
      if (!stageEl) return;
      const stageRect = stageEl.getBoundingClientRect();
      const currentScale = stageRect.width / 390 || 1;
      const diffs: string[] = [];

      for (const [key, spec] of Object.entries(layoutSpec)) {
        const el =
          key === 'stage'
            ? stageEl
            : (stageEl.querySelector(`[data-spec="${key}"]`) as HTMLElement | null);
        if (!el) {
          diffs.push(`[layoutSpec] Missing element for key "${key}"`);
          continue;
        }
        const rect = el.getBoundingClientRect();
        const x = (rect.left - stageRect.left) / currentScale;
        const y = (rect.top - stageRect.top) / currentScale;
        const width = rect.width / currentScale;
        const height = rect.height / currentScale;

        const dx = Math.abs(x - spec.x);
        const dy = Math.abs(y - spec.y);
        const dw = Math.abs(width - spec.width);
        const dh = Math.abs(height - spec.height);

        if (dx > 2 || dy > 2 || dw > 2 || dh > 2) {
          diffs.push(
            `${key}: expected (${spec.x}, ${spec.y}, ${spec.width}x${spec.height}), got (${x.toFixed(
              1
            )}, ${y.toFixed(1)}, ${width.toFixed(1)}x${height.toFixed(1)})`
          );
        }
      }

      if (diffs.length > 0) {
        console.warn('[RevealScreen layoutSpec] Elements > 2px off:\n' + diffs.join('\n'));
      } else {
        console.log('[RevealScreen layoutSpec] All elements within 2px of layoutSpec.');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [scale]);

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
    setToastMessage('Saved!');
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#F5CCE2] select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Fixed 390x844 stage scaled by viewportWidth / 390 */}
      <div
        ref={stageRef}
        data-spec="stage"
        className="relative bg-[#F5CCE2] overflow-hidden select-none font-nunito"
        style={{
          width: '390px',
          height: '844px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Toast notification for "Save to memory wall" */}
        {toastMessage && (
          <div className="absolute top-[74px] left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
            <div className="bg-[#1B1D20] text-white px-5 py-2 rounded-full font-bold text-[14px] flex items-center gap-2 whitespace-nowrap">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* ---------------- HEADER ---------------- */}
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

        {/* ---------------- QUESTION ---------------- */}
        <div
          data-spec="question"
          className="font-black text-[#1B1D20] select-none z-10 whitespace-nowrap"
          style={{
            ...boxStyle(layoutSpec.question),
            fontSize: '36px',
            lineHeight: '40px',
            letterSpacing: '-0.03em',
          }}
        >
          {questionLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>

        {/* ---------------- CARDS & AVATARS ---------------- */}
        {/* card-blob-pink: 152x156 at x 22, y 275 - Clickable to inspect full answer */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: player1Name,
              avatarId: player1AvatarId,
              answer: player1Answer,
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

        {/* card-blob-blue: 149x146 at x 224, y 274 - Clickable to inspect full answer */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: player2Name,
              avatarId: player2AvatarId,
              answer: player2Answer,
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

        {/* Player 1 avatar: 50x53 at x 65, y 293 (on the pink card) */}
        <img
          data-spec="player1Avatar"
          src={getAvatarFaceSrc(player1AvatarId)}
          alt={player1Name}
          style={imgStyle(layoutSpec.player1Avatar)}
          className="pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* Player 2 avatar: 50x53 at x 271, y 293 (on the blue card) */}
        <img
          data-spec="player2Avatar"
          src={getAvatarFaceSrc(player2AvatarId)}
          alt={player2Name}
          style={imgStyle(layoutSpec.player2Avatar)}
          className="pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* Card text: "Player 1" at (90, 349) and "Player 2" at (297, 349), Nunito 600, 11px, muted */}
        <div
          data-spec="player1Label"
          className="flex items-center justify-center font-semibold select-none z-20 whitespace-nowrap"
          style={{
            ...boxStyle(layoutSpec.player1Label),
            fontSize: '11px',
            lineHeight: '14px',
            color: 'rgba(27, 29, 32, 0.56)',
          }}
        >
          {player1Name}
        </div>

        <div
          data-spec="player2Label"
          className="flex items-center justify-center font-semibold select-none z-20 whitespace-nowrap"
          style={{
            ...boxStyle(layoutSpec.player2Label),
            fontSize: '11px',
            lineHeight: '14px',
            color: 'rgba(27, 29, 32, 0.56)',
          }}
        >
          {player2Name}
        </div>

        {/* Left Card Answer: Perfectly contained inside pink blob, max 2 lines, truncated with '....' */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: player1Name,
              avatarId: player1AvatarId,
              answer: player1Answer,
              blobBg: '#FCA0D1',
            })
          }
          className="absolute z-20 flex items-center justify-center text-center px-1 cursor-pointer select-none"
          style={{
            left: '26px',
            top: '366px',
            width: '144px',
            height: '56px',
          }}
          title="Click to view full answer"
        >
          <p
            className="font-extrabold text-[#1B1D20] text-center line-clamp-2 overflow-hidden text-ellipsis"
            style={{
              fontSize: p1Formatted.fontSize,
              lineHeight: p1Formatted.lineHeight,
              letterSpacing: '-0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {p1Formatted.text}
          </p>
        </div>

        {/* Right Card Answer: Perfectly contained inside blue blob, max 2 lines, truncated with '....' */}
        <div
          onClick={() =>
            setInspectingPlayer({
              name: player2Name,
              avatarId: player2AvatarId,
              answer: player2Answer,
              blobBg: '#8EAFFD',
            })
          }
          className="absolute z-20 flex items-center justify-center text-center px-1 cursor-pointer select-none"
          style={{
            left: '228px',
            top: '366px',
            width: '141px',
            height: '56px',
          }}
          title="Click to view full answer"
        >
          <p
            className="font-extrabold text-[#1B1D20] text-center line-clamp-2 overflow-hidden text-ellipsis"
            style={{
              fontSize: p2Formatted.fontSize,
              lineHeight: p2Formatted.lineHeight,
              letterSpacing: '-0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {p2Formatted.text}
          </p>
        </div>

        {/* match-starburst: 88x92 at x 152, y 295, drawn above both cards */}
        <img
          data-spec="matchStarburst"
          src="/assets/reveal/match-starburst.png"
          alt=""
          style={{
            ...imgStyle(layoutSpec.matchStarburst),
            filter: answersMatch ? undefined : 'grayscale(1) brightness(0.92)',
          }}
          className="pointer-events-none select-none z-30"
          draggable={false}
        />

        {/* Match badge text on match-starburst: centered at (195, 341) */}
        <div
          data-spec="matchBadgeText"
          className="flex flex-col items-center justify-center text-center text-[#1B1D20] select-none z-30 pointer-events-none"
          style={boxStyle(layoutSpec.matchBadgeText)}
        >
          {answersMatch ? (
            <>
              <span className="font-extrabold text-[12px] leading-[13.5px] tracking-[-0.015em]">
                You
              </span>
              <span className="font-extrabold text-[12px] leading-[13.5px] tracking-[-0.015em]">
                matched!
              </span>
              <span className="font-black text-[16.5px] leading-[18px] tracking-[-0.02em] mt-[1px]">
                +10
              </span>
            </>
          ) : (
            <>
              <span className="font-extrabold text-[10px] leading-[11.5px] tracking-[-0.01em]">
                Not even
              </span>
              <span className="font-extrabold text-[10px] leading-[11.5px] tracking-[-0.01em]">
                close 😭
              </span>
              <span className="font-black text-[14px] leading-[16px] tracking-[-0.02em] mt-[1px]">
                +0
              </span>
            </>
          )}
        </div>

        {/* ---------------- SYNC SCORE & DECORATIONS ---------------- */}
        {/* crescent-yellow: 44x47 at x 69, y 458 */}
        <img
          data-spec="crescentYellow"
          src="/assets/reveal/crescent-yellow.png"
          alt=""
          style={imgStyle(layoutSpec.crescentYellow)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* starburst-blue: 49x54 at x 269, y 451 */}
        <img
          data-spec="starburstBlue"
          src="/assets/reveal/starburst-blue.png"
          alt=""
          style={imgStyle(layoutSpec.starburstBlue)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* cross-olive: 41x42 at x 291, y 503 */}
        <img
          data-spec="crossOlive"
          src="/assets/reveal/cross-olive.png"
          alt=""
          style={imgStyle(layoutSpec.crossOlive)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* heart-pink-small: 41x37 at x 53, y 512 */}
        <img
          data-spec="heartPinkSmall"
          src="/assets/reveal/heart-pink-small.png"
          alt=""
          style={imgStyle(layoutSpec.heartPinkSmall)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* "Sync score": centered at (195, 450), Nunito 600, 15px, muted */}
        <div
          data-spec="syncScoreLabel"
          className="flex items-center justify-center font-semibold select-none z-20 whitespace-nowrap"
          style={{
            ...boxStyle(layoutSpec.syncScoreLabel),
            fontSize: '15px',
            lineHeight: '20px',
            letterSpacing: '-0.01em',
            color: 'rgba(27, 29, 32, 0.56)',
          }}
        >
          Sync score
        </div>

        {/* "74%": spans x 131 to 261 (130px wide), y 471 to 522, Nunito 900, ink */}
        <div
          data-spec="syncScoreValue"
          className="flex items-center justify-center font-black text-[#1B1D20] select-none z-20 whitespace-nowrap"
          style={{
            ...boxStyle(layoutSpec.syncScoreValue),
            fontSize: '72px',
            lineHeight: '51px',
            letterSpacing: '-0.03em',
          }}
        >
          {syncScore}%
        </div>

        {/* Caption "you know each other better today": centered at (195, 548), ~191px wide, Nunito 600, 13px, muted */}
        <div
          data-spec="syncCaption"
          className="flex items-center justify-center font-semibold select-none z-20 whitespace-nowrap"
          style={{
            ...boxStyle(layoutSpec.syncCaption),
            fontSize: '13px',
            lineHeight: '18px',
            letterSpacing: '-0.01em',
            color: 'rgba(27, 29, 32, 0.56)',
          }}
        >
          you know each other better today
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
                    strokeWidth={isSelected ? '2' : '1.5'}
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
        {/* "Save to memory wall": black pill x 31, y 646, 328x40, white Nunito 700 18px, with bookmark icon on left */}
        <button
          type="button"
          data-spec="saveButton"
          onClick={handleSave}
          style={boxStyle(layoutSpec.saveButton)}
          className="btn-press rounded-full bg-[#1B1D20] text-white font-bold text-[18px] tracking-[-0.015em] flex items-center justify-center gap-3 cursor-pointer focus:outline-none z-20 p-0"
        >
          <svg
            width="17"
            height="19"
            viewBox="0 0 18 20"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M15 18l-6-4-6 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14z" />
          </svg>
          <span className="leading-none">Save to memory wall</span>
        </button>

        {/* "Next question": pill x 31, y 694, 328x40 */}
        <button
          type="button"
          data-spec="nextQuestionPill"
          onClick={onNextQuestion}
          disabled={!onNextQuestion}
          style={boxStyle(layoutSpec.nextQuestionPill)}
          className={`rounded-full font-bold text-[18px] tracking-[-0.015em] flex items-center justify-center focus:outline-none z-20 p-0 ${
            onNextQuestion
              ? 'bg-[#1B1D20] text-white hover:bg-[#2A2D32] cursor-pointer btn-press'
              : 'bg-[#D2C7D3] text-[#7D7580] cursor-default'
          }`}
        >
          <span className="leading-none">{onNextQuestion ? 'Next question ✨' : 'Next question tomorrow'}</span>
        </button>

        {/* ---------------- BOTTOM DECORATIONS (BEHIND TAB BAR) ---------------- */}
        {/* deco-bottom-left: 48x43 at x -6, y 738 */}
        <img
          data-spec="decoBottomLeft"
          src="/assets/reveal/deco-bottom-left.png"
          alt=""
          style={imgStyle(layoutSpec.decoBottomLeft)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* deco-bottom-right: 42x38 at x 352, y 738 */}
        <img
          data-spec="decoBottomRight"
          src="/assets/reveal/deco-bottom-right.png"
          alt=""
          style={imgStyle(layoutSpec.decoBottomRight)}
          className="pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* ---------------- SHARED BOTTOM NAV ---------------- */}
        <div
          data-spec="bottomNav"
          style={boxStyle(layoutSpec.bottomNav)}
          className="z-30 pointer-events-auto"
        >
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

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
