import React from 'react';

export interface MemoryCardProps {
  id: string | number;
  date: string;
  question: string;
  p1Answer: string;
  p2Answer: string;
  p1AvatarId?: number;
  p1Color?: 'salmon' | 'teal' | 'pink' | 'blue' | string;
  p1Name?: string;
  p2AvatarId?: number;
  p2Color?: 'salmon' | 'teal' | 'pink' | 'blue' | string;
  p2Name?: string;
  color?: 'pink' | 'blue' | 'yellow' | 'olive' | string;
  cardBg?: string;
  deco?: 'moon' | 'star' | 'cross' | 'heart' | null;
  decoOffset?: { top?: number; right?: number; w?: number };
  matched?: boolean;
  isMatched?: boolean;
  category?: 'Food' | 'funny' | 'deep' | 'other' | string;
  reactions?: Array<{ emoji: string; count?: number }> | string | { emoji: string; count?: number };
  onClick?: () => void;
  className?: string;
  'data-spec'?: string;
}

const COLOR_MAP: Record<string, string> = {
  pink: '#FBBCDE',
  blue: '#9DBDFD',
  yellow: '#FEDF6B',
  olive: '#B5C68B',
};

export const resolveReactionInfo = (
  reactions?: MemoryCardProps['reactions']
): { char: string; imgSrc?: string; count: number } | null => {
  if (!reactions) return null;
  let rawEmoji = '';
  let count = 1;

  if (Array.isArray(reactions)) {
    if (reactions.length === 0) return null;
    const first = reactions[0];
    if (typeof first === 'string') {
      rawEmoji = first;
    } else if (typeof first === 'object' && first !== null) {
      rawEmoji = (first as any).emoji || (first as any).id || '';
      count = (first as any).count || 1;
    }
  } else if (typeof reactions === 'object' && reactions !== null) {
    rawEmoji = (reactions as any).emoji || (reactions as any).id || '';
    count = (reactions as any).count || 1;
  } else if (typeof reactions === 'string') {
    rawEmoji = reactions;
  }

  if (!rawEmoji) return null;

  const MAP: Record<string, { char: string; imgSrc?: string }> = {
    heart: { char: '❤️', imgSrc: '/assets/reveal/emoji-heart.webp' },
    love: { char: '❤️', imgSrc: '/assets/reveal/emoji-heart.webp' },
    smile: { char: '✨', imgSrc: '/assets/reveal/emoji-smile.webp' },
    sparkles: { char: '✨', imgSrc: '/assets/reveal/emoji-smile.webp' },
    laugh: { char: '😂', imgSrc: '/assets/reveal/emoji-laugh.webp' },
    surprised: { char: '😮', imgSrc: '/assets/reveal/emoji-surprised.webp' },
    wow: { char: '😮', imgSrc: '/assets/reveal/emoji-surprised.webp' },
    smirk: { char: '😏', imgSrc: '/assets/reveal/emoji-smirk.webp' },
    cry: { char: '😭', imgSrc: '/assets/reveal/emoji-cry.webp' },
    sad: { char: '😭', imgSrc: '/assets/reveal/emoji-cry.webp' },
    '❤️': { char: '❤️', imgSrc: '/assets/reveal/emoji-heart.webp' },
    '✨': { char: '✨', imgSrc: '/assets/reveal/emoji-smile.webp' },
    '😂': { char: '😂', imgSrc: '/assets/reveal/emoji-laugh.webp' },
    '😮': { char: '😮', imgSrc: '/assets/reveal/emoji-surprised.webp' },
    '😏': { char: '😏', imgSrc: '/assets/reveal/emoji-smirk.webp' },
    '😭': { char: '😭', imgSrc: '/assets/reveal/emoji-cry.webp' },
    '1': { char: '✨', imgSrc: '/assets/reveal/emoji-smile.webp' },
    '2': { char: '💀' },
    '3': { char: '😍' },
    '4': { char: '🔥' },
    '5': { char: '👀' },
  };

  const item = MAP[rawEmoji.toLowerCase()] || MAP[rawEmoji] || { char: rawEmoji };
  return {
    char: item.char,
    imgSrc: item.imgSrc,
    count,
  };
};

export const getAvatarBlobSrc = (avatarId: number = 1, color?: string): string => {
  if (color === 'salmon') return '/assets/blobs/color-blob-salmon.png';
  if (color === 'teal') return '/assets/blobs/color-blob-teal.png';
  if (color === 'blue') return '/assets/blobs/color-blob-blue.png';
  if (color === 'pink') return '/assets/blobs/color-blob-pink-root.png';
  const id = avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return `/assets/blobs/avatar-blob-${id}.png`;
};

export const getAvatarFaceSrc = (avatarId: number = 1): string => {
  const id = avatarId >= 1 && avatarId <= 6 ? avatarId : 1;
  return `/assets/avatars/avatar-${id}.png`;
};

export const MemoryCard: React.FC<MemoryCardProps> = ({
  id,
  date,
  question,
  p1Answer,
  p2Answer,
  p1AvatarId = 1,
  p1Color = 'salmon',
  p1Name = 'Player 1',
  p2AvatarId = 2,
  p2Color = 'teal',
  p2Name = 'Player 2',
  color,
  cardBg,
  deco: _deco,
  decoOffset,
  matched = false,
  reactions,
  onClick,
  className = '',
  'data-spec': dataSpec,
}) => {
  const bgColor = cardBg || (color && COLOR_MAP[color]) || '#FBBCDE';
  const reactionInfo = resolveReactionInfo(reactions);

  return (
    <div
      data-spec={dataSpec || `memory-card-${id}`}
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
      className={`relative w-full rounded-[16px] p-[12px] select-none flex flex-col justify-between overflow-hidden transition-transform duration-150 active:scale-[0.98] cursor-pointer shadow-sm ${className}`}
    >
      {/* ---------------- MATCHED SUN BADGE (TOP-RIGHT) ---------------- */}
      {matched && (
        <div
          className="absolute pointer-events-none select-none z-10"
          style={{
            top: `${decoOffset?.top ?? 6}px`,
            right: `${decoOffset?.right ?? 6}px`,
            width: `${decoOffset?.w ?? 40}px`,
            height: `${decoOffset?.w ?? 40}px`,
          }}
        >
          <img
            src="/assets/memorywall/badge-starburst-yellow.png"
            alt="Matched"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
          {/* Matched text on top of sun badge: Nunito 900 8.5px ink, rotated -8deg, centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '8.5px',
                fontWeight: 900,
                color: '#17181B',
                transform: 'rotate(-8deg)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Matched
            </span>
          </div>
        </div>
      )}

      {/* ---------------- CARD CONTENT (QUESTION NEVER OVERLAPS DECORATION) ---------------- */}
      <div className="relative z-0 flex flex-col flex-1">
        {/* Date Row with Reaction Badge */}
        <div className="flex items-center justify-between mb-1">
          {/* Date: Nunito 700 10px, ink at 55% */}
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              color: 'rgba(23, 24, 27, 0.55)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {date}
          </span>
        </div>

        {/* Question: Nunito 900 16px, line-height 19px, ink, wraps naturally up to 3 lines */}
        {/* Sized with right clearance so text NEVER overlays on the top-right decoration */}
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '16px',
            fontWeight: 900,
            lineHeight: '19px',
            letterSpacing: '-0.025em',
            color: '#17181B',
            marginBottom: '10px',
            paddingRight: matched ? '44px' : '0px',
            wordBreak: 'break-word',
          }}
        >
          {question}
        </h3>

        {/* Two Dynamic Answer Rows with pitch */}
        <div className="flex flex-col gap-2 mt-auto pt-1 relative">
          {/* Answer Row 1: Player 1 (User's chosen avatar & color blob) */}
          <div className="flex items-center gap-2 min-h-[35px]">
            <div className="relative w-[35px] h-[35px] flex items-center justify-center flex-shrink-0 select-none">
              <img
                src={getAvatarBlobSrc(p1AvatarId, p1Color)}
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <img
                src={getAvatarFaceSrc(p1AvatarId)}
                alt={p1Name}
                className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '8px',
                  fontWeight: 600,
                  color: 'rgba(23, 24, 27, 0.55)',
                  lineHeight: '10px',
                }}
              >
                {p1Name}
              </span>
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#17181B',
                  lineHeight: '13px',
                }}
                className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[96px]"
                title={p1Answer}
              >
                {p1Answer}
              </span>
            </div>
          </div>

          {/* Answer Row 2: Player 2 (Friend's avatar & color blob) */}
          <div className="flex items-center gap-2 min-h-[35px]">
            <div className="relative w-[35px] h-[35px] flex items-center justify-center flex-shrink-0 select-none">
              <img
                src={getAvatarBlobSrc(p2AvatarId, p2Color)}
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <img
                src={getAvatarFaceSrc(p2AvatarId)}
                alt={p2Name}
                className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '8px',
                  fontWeight: 600,
                  color: 'rgba(23, 24, 27, 0.55)',
                  lineHeight: '10px',
                }}
              >
                {p2Name}
              </span>
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#17181B',
                  lineHeight: '13px',
                }}
                className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[96px]"
                title={p2Answer}
              >
                {p2Answer}
              </span>
            </div>
          </div>

          {/* ---------------- INSTAGRAM-STYLE EMOJI REACTION BADGE (Pill attached to bottom right) ---------------- */}
          {reactionInfo && (
            <div
              className="absolute right-2.5 bottom-2.5 z-30 pointer-events-none select-none flex items-center shadow-md bg-white/95 backdrop-blur-xs rounded-full px-2 py-0.5 border border-[#17181B]/15"
              style={{
                gap: '3px',
              }}
              title="Reaction"
            >
              {reactionInfo.imgSrc ? (
                <img
                  src={reactionInfo.imgSrc}
                  alt={reactionInfo.char}
                  className="w-[18px] h-[18px] object-contain flex-shrink-0 -rotate-[8deg]"
                  draggable={false}
                />
              ) : (
                <span className="text-[15px] leading-none -rotate-[8deg] select-none">
                  {reactionInfo.char}
                </span>
              )}
              {reactionInfo.count > 1 && (
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#17181B',
                    lineHeight: 1,
                  }}
                >
                  {reactionInfo.count}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
