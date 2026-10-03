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
  reactions?: Array<{ emoji: string; count: number }>;
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

const DEFAULT_DECO_OFFSETS: Record<'moon' | 'star' | 'cross' | 'heart', { top: number; right: number; w: number }> = {
  moon: { top: 18, right: 9, w: 30 },
  star: { top: 6, right: 7, w: 29 },
  cross: { top: 9, right: 8, w: 32 },
  heart: { top: 10, right: 12, w: 32 },
};

const DECO_SRC_MAP: Record<'moon' | 'star' | 'cross' | 'heart', string> = {
  moon: '/assets/memorywall/deco-moon-yellow.webp',
  star: '/assets/memorywall/deco-star-blue.webp',
  cross: '/assets/memorywall/deco-cross-olive.webp',
  heart: '/assets/memorywall/deco-heart-pink.webp',
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
  deco,
  decoOffset,
  matched = false,
  onClick,
  className = '',
  'data-spec': dataSpec,
}) => {
  const bgColor = cardBg || (color && COLOR_MAP[color]) || '#FBBCDE';

  return (
    <div
      data-spec={dataSpec || `memory-card-${id}`}
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
      className={`relative w-full rounded-[16px] p-[12px] select-none flex flex-col justify-between overflow-hidden transition-transform duration-150 active:scale-[0.98] cursor-pointer shadow-sm ${className}`}
    >
      {/* ---------------- DECORATION OR MATCHED BADGE (TOP-RIGHT) ---------------- */}
      {matched ? (
        <div
          className="absolute pointer-events-none select-none z-10"
          style={{
            top: `${decoOffset?.top ?? 8}px`,
            right: `${decoOffset?.right ?? 7}px`,
            width: `${decoOffset?.w ?? 44}px`,
            height: `${decoOffset?.w ?? 44}px`,
          }}
        >
          <img
            src="/assets/memorywall/badge-starburst-yellow.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
          {/* Matched text as code on top: Nunito 800 9px ink, rotated -8deg, centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '9px',
                fontWeight: 800,
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
      ) : deco && DECO_SRC_MAP[deco] ? (
        <div
          className="absolute pointer-events-none select-none z-10"
          style={{
            top: `${decoOffset?.top ?? DEFAULT_DECO_OFFSETS[deco].top}px`,
            right: `${decoOffset?.right ?? DEFAULT_DECO_OFFSETS[deco].right}px`,
            width: `${decoOffset?.w ?? DEFAULT_DECO_OFFSETS[deco].w}px`,
            height: 'auto',
          }}
        >
          <img
            src={DECO_SRC_MAP[deco]}
            alt=""
            className="w-full h-auto object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>
      ) : null}

      {/* ---------------- CARD CONTENT (QUESTION NEVER OVERLAPS DECORATION) ---------------- */}
      <div className="relative z-0 flex flex-col">
        {/* Date: Nunito 700 10px, ink at 55% */}
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: 'rgba(23, 24, 27, 0.55)',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            marginBottom: '4px',
          }}
        >
          {date}
        </span>

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
            paddingRight: matched ? '46px' : (deco ? '36px' : '0px'),
            wordBreak: 'break-word',
          }}
        >
          {question}
        </h3>

        {/* Two Dynamic Answer Rows with pitch */}
        <div className="flex flex-col gap-2 mt-auto pt-1">
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
                className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px]"
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
                className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px]"
                title={p2Answer}
              >
                {p2Answer}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
