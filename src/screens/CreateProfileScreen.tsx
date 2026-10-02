import React, { useState, useEffect } from 'react';
import { dimensions, typography } from '../styles/tokens';

export interface UserProfile {
  avatarId: number;
  name: string;
  color: 'pink' | 'blue';
}

interface CreateProfileScreenProps {
  initialProfile?: UserProfile;
  onBack: () => void;
  onContinue: (profile: UserProfile) => void;
}

// Blob centers and sizes measured from the 600×415 combined image.
// cx/cy are fractions of the image width/height.
// blobW/blobH are the blob pixel dimensions at the image's native size,
// also expressed as fractions so they scale with the rendered image size.
// pngW/pngH are the actual PNG canvas dimensions (may be 1px larger than the blob).
// borderColor is a dark shade of each blob's own color for the selection border.
const AVATAR_OPTIONS = [
  { id: 1, cxF: 0.1867, cyF: 0.2470, bwF: 174/600, bhF: 181/415, alt: 'Boy avatar',             borderColor: '#C85A4A' },
  { id: 2, cxF: 0.4933, cyF: 0.2458, bwF: 192/600, bhF: 182/415, alt: 'Girl with heart hairpin', borderColor: '#007A73' },
  { id: 3, cxF: 0.8175, cyF: 0.2566, bwF: 179/600, bhF: 191/415, alt: 'Boy with glasses',        borderColor: '#2D1A7A' },
  { id: 4, cxF: 0.1858, cyF: 0.7458, bwF: 175/600, bhF: 189/415, alt: 'Girl with bun',           borderColor: '#1A4A56' },
  { id: 5, cxF: 0.4942, cyF: 0.7470, bwF: 193/600, bhF: 192/415, alt: 'Boy with bucket hat',     borderColor: '#5A7A00' },
  { id: 6, cxF: 0.8183, cyF: 0.7590, bwF: 178/600, bhF: 182/415, alt: 'Girl with headphones',    borderColor: '#B07800' },
];

const COLOR_OPTIONS: Array<{
  id: 'pink' | 'blue';
  x: number;
  y: number;
  blob: string;
  label: string;
}> = [
  { id: 'pink', x: 98, y: 590, blob: '/assets/reveal/card-blob-pink.png', label: 'Pink' },
  { id: 'blue', x: 200, y: 590, blob: '/assets/reveal/card-blob-blue.png', label: 'Blue' },
];

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({
  initialProfile = { avatarId: 1, name: '', color: 'pink' },
  onBack,
  onContinue,
}) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(initialProfile.avatarId);
  const [name, setName] = useState<string>(initialProfile.name);
  const [selectedColor, setSelectedColor] = useState<'pink' | 'blue'>(initialProfile.color);

  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: dimensions.mobileWidth, height: dimensions.mobileHeight };
  });

  useEffect(() => {
    const updateSize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fill the full mobile screen width & height (100vw x 100dvh) with zero scrolling and no side gaps.
  // On large desktop screens (>= 640px), frame at mobile width.
  const isDesktop = viewport.width >= 640;
  const stageHeight = isDesktop ? Math.min(dimensions.mobileHeight, viewport.height) : viewport.height;
  const stageWidth = isDesktop
    ? Math.min(430, Math.round(stageHeight * (dimensions.mobileWidth / dimensions.mobileHeight)))
    : viewport.width;

  const scaleX = stageWidth / dimensions.mobileWidth;
  const scaleY = stageHeight / dimensions.mobileHeight;
  const s = Math.min(scaleX, scaleY);

  const handleContinue = () => {
    const finalName = name.trim() || 'Alex';
    const profile: UserProfile = {
      avatarId: selectedAvatarId,
      name: finalName,
      color: selectedColor,
    };
    onContinue(profile);
  };

  return (
    <div
      className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex items-center justify-center select-none"
      style={{
        backgroundColor: '#FDE16B',
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Responsive unscrollable mobile stage */}
      <div
        className="relative overflow-hidden select-none font-nunito"
        style={{
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
          backgroundColor: '#FDE16B',
        }}
      >
        {/* ---------------- DECORATIVE EDGE BLOBS ---------------- */}

        {/* Top-Right: Blue Starburst (bleeding off top-right edge) */}
        <img
          src="/assets/welcome/starburst-blue-right.png"
          alt=""
          draggable={false}
          className="pointer-events-none select-none z-0"
          style={{
            position: 'absolute',
            left: `${stageWidth - (390 - 331) * s}px`,
            top: `${-14 * scaleY}px`,
            width: `${60 * s}px`,
            height: 'auto',
          }}
        />

        {/* Bottom-Left: Blue Starburst (bleeding off bottom-left edge) */}
        <img
          src="/assets/welcome/starburst-blue-left.png"
          alt=""
          draggable={false}
          className="pointer-events-none select-none z-0"
          style={{
            position: 'absolute',
            left: `${-14 * s}px`,
            top: `${764 * scaleY}px`,
            width: `${84 * s}px`,
            height: 'auto',
          }}
        />

        {/* Bottom-Right: Pink Crescent (bleeding off bottom-right edge) */}
        <img
          src="/assets/blobs/crescent-pink-bottom-right.png"
          alt=""
          draggable={false}
          className="pointer-events-none select-none z-0"
          style={{
            position: 'absolute',
            left: `${stageWidth - (390 - 334) * s}px`,
            top: `${762 * scaleY}px`,
            width: `${68 * s}px`,
            height: 'auto',
          }}
        />

        {/* ---------------- TOP NAVIGATION ROW ---------------- */}

        {/* Dashed Circular Back Button: x 25, y 31, 35x35 */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to welcome"
          className="btn-press rounded-full flex items-center justify-center hover:bg-[#1B1D20]/5 transition-colors focus:outline-none cursor-pointer z-20"
          style={{
            position: 'absolute',
            left: `${25 * scaleX}px`,
            top: `${31 * scaleY}px`,
            width: `${35 * s}px`,
            height: `${35 * s}px`,
            border: `${Math.max(1.2, 1.5 * s)}px dashed rgba(27, 29, 32, 0.65)`,
          }}
        >
          <svg
            width={16 * s}
            height={16 * s}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1B1D20"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Step Dots: x 304, y 47 */}
        <div
          className="flex items-center z-20 pointer-events-none"
          style={{
            position: 'absolute',
            left: `${304 * scaleX}px`,
            top: `${47 * scaleY}px`,
            gap: `${7 * s}px`,
          }}
        >
          <div
            className="rounded-full bg-[#1B1D20]"
            style={{ width: `${9.5 * s}px`, height: `${9.5 * s}px` }}
          />
          <div
            className="rounded-full"
            style={{
              width: `${9.5 * s}px`,
              height: `${9.5 * s}px`,
              border: `${Math.max(1.2, 1.5 * s)}px dashed #1B1D20`,
            }}
          />
        </div>

        {/* ---------------- HEADING SECTION ---------------- */}

        {/* Title "Who are you?": x 33, y 102 */}
        <h1
          className="m-0 flex items-center whitespace-nowrap select-none z-20"
          style={{
            position: 'absolute',
            left: `${33 * scaleX}px`,
            top: `${102 * scaleY}px`,
            width: `${324 * scaleX}px`,
            height: `${46 * scaleY}px`,
            fontWeight: 900,
            fontSize: `${41 * s}px`,
            lineHeight: `${44 * s}px`,
            letterSpacing: '-0.025em',
            color: '#1B1D20',
          }}
        >
          Who are you?
        </h1>

        {/* Subtitle "Pick how your friend will see you.": x 38, y 158 */}
        <p
          className="m-0 flex items-center whitespace-nowrap select-none z-20"
          style={{
            position: 'absolute',
            left: `${38 * scaleX}px`,
            top: `${158 * scaleY}px`,
            width: `${314 * scaleX}px`,
            height: `${24 * scaleY}px`,
            fontWeight: 600,
            fontSize: `${17.2 * s}px`,
            lineHeight: `${22 * s}px`,
            letterSpacing: '-0.01em',
            color: '#5C5438',
          }}
        >
          Pick how your friend will see you.
        </p>

        {/* ---------------- 3x2 AVATAR PICKER GRID ---------------- */}
        {(() => {
          const imgNativeW = 600;
          const imgNativeH = 415;

          // The grid Y start (below subtitle) and the Y where "Your name" label starts.
          // We need the grid to fit in the space between these two points.
          const gridY     = 190 * scaleY;
          const nameLabelY = 461 * scaleY;
          const availH    = nameLabelY - gridY - 8 * scaleY; // 8px breathing room

          // Ideal grid width = full stage width; ideal height = aspect ratio.
          // Clamp so the grid never overflows into the name section.
          const idealGridW = stageWidth;
          const idealGridH = idealGridW * (imgNativeH / imgNativeW);
          const clampedGridH = Math.min(idealGridH, availH);
          // If height is the constraint, back-calculate the width to keep aspect ratio
          const gridW = clampedGridH < idealGridH
            ? clampedGridH * (imgNativeW / imgNativeH)
            : idealGridW;
          const gridH = clampedGridH;

          // Center the grid horizontally when it's narrower than stage
          const gridX = (stageWidth - gridW) / 2;

          const pxPerNative = gridW / imgNativeW;
          const avgBlobPx   = ((174 + 192 + 179 + 175 + 193 + 178) / 6) * pxPerNative;
          const faceSize    = avgBlobPx * 0.68;

          // Border: uniform scale from center — mask + div scale together, no offset math
          const borderScale = 1.06;

          return (
            <>
              {/* Combined blob sheet — visual background, non-interactive */}
              <img
                src="/assets/welcome/avatar-blobs-background.png"
                alt=""
                draggable={false}
                className="pointer-events-none select-none absolute"
                style={{
                  left: `${gridX}px`,
                  top:  `${gridY}px`,
                  width:  `${gridW}px`,
                  height: `${gridH}px`,
                  zIndex: 10,
                }}
              />

              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                const cx    = gridX + avatar.cxF * gridW;
                const cy    = gridY + avatar.cyF * gridH;
                const blobW = avatar.bwF * gridW;
                const blobH = avatar.bhF * gridH;
                const badge = Math.max(16, 18 * s);

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    aria-label={`Choose avatar ${avatar.id}`}
                    className="flex items-center justify-center focus:outline-none cursor-pointer select-none bg-transparent border-0 p-0 active:scale-95 transition-transform duration-150"
                    style={{
                      position: 'absolute',
                      left: `${cx - blobW / 2}px`,
                      top:  `${cy - blobH / 2}px`,
                      width:  `${blobW}px`,
                      height: `${blobH}px`,
                      zIndex: 20,
                      overflow: 'visible',
                    }}
                  >
                    {/* Layer 1 — border: same PNG scaled up from center, darkened.
                        Pure image transform — no mask, no CSS trickery, zero bugs. */}
                    {isSelected && (
                      <img
                        src={`/assets/blobs/avatar-blob-${avatar.id}.png`}
                        alt="" draggable={false} aria-hidden="true"
                        className="absolute pointer-events-none select-none"
                        style={{
                          width:  `${blobW}px`,
                          height: `${blobH}px`,
                          left: 0, top: 0,
                          transform:       `scale(${borderScale})`,
                          transformOrigin: 'center center',
                          filter:          `brightness(0) opacity(0.9)`,
                          zIndex: 1,
                        }}
                      />
                    )}

                    {/* Layer 2 — colored blob covers the dark center, leaving only
                        the scaled-out dark ring as the border */}
                    <img
                      src={`/assets/blobs/avatar-blob-${avatar.id}.png`}
                      alt="" draggable={false} aria-hidden="true"
                      className="absolute pointer-events-none select-none"
                      style={{ width: `${blobW}px`, height: `${blobH}px`, left: 0, top: 0, zIndex: 2 }}
                    />

                    <img
                      src={`/assets/avatars/avatar-${avatar.id}.png`}
                      alt={avatar.alt} draggable={false}
                      className="relative object-contain pointer-events-none select-none"
                      style={{ width: `${faceSize}px`, height: `${faceSize}px`, zIndex: 3 }}
                    />

                    {/* Layer 4 — check badge */}
                    {isSelected && (
                      <div
                        className="absolute rounded-full flex items-center justify-center text-white pointer-events-none"
                        style={{
                          width:  `${badge}px`,
                          height: `${badge}px`,
                          bottom: `${-badge * 0.15}px`,
                          right:  `${badge * 0.15}px`,
                          backgroundColor: avatar.borderColor,
                          zIndex: 4,
                        }}
                      >
                        <svg width={badge * 0.52} height={badge * 0.52} viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="3.5"
                          strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          );
        })()}

        {/* ── YOUR NAME ─────────────────────────────────────── */}
        <label
          htmlFor="user-name-input"
          className="flex items-center whitespace-nowrap select-none z-20"
          style={{
            position: 'absolute',
            left:   `${33 * scaleX}px`,
            top:    `${461 * scaleY}px`,
            height: `${22 * scaleY}px`,
            fontWeight: 700,
            fontSize:      `${16.5 * s}px`,
            lineHeight:    `${22 * s}px`,
            letterSpacing: '-0.01em',
            color: '#333024',
          }}
        >
          Your name
        </label>

        <input
          id="user-name-input"
          type="text"
          placeholder="Type your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          className="rounded-full bg-[#FAF5E6] text-[#1B1D20] placeholder-[#9E988B] focus:outline-none focus:ring-2 focus:ring-[#1B1D20]/15 border-0 z-20"
          style={{
            position: 'absolute',
            left:   `${33 * scaleX}px`,
            top:    `${490 * scaleY}px`,
            width:  `${325 * scaleX}px`,
            height: `${50 * s}px`,
            paddingLeft:  `${25 * scaleX}px`,
            paddingRight: `${25 * scaleX}px`,
            fontWeight: 600,
            fontSize: `${16.5 * s}px`,
          }}
        />

        {/* ── YOUR COLOR ────────────────────────────────────── */}
        <div
          className="flex items-center whitespace-nowrap select-none z-20"
          style={{
            position: 'absolute',
            left:   `${33 * scaleX}px`,
            top:    `${566 * scaleY}px`,
            height: `${22 * scaleY}px`,
            fontWeight: 700,
            fontSize:      `${16.5 * s}px`,
            lineHeight:    `${22 * s}px`,
            letterSpacing: '-0.01em',
            color: '#333024',
          }}
        >
          Your color
        </div>

        {/* Color swatches */}
        {COLOR_OPTIONS.map((colorOption) => {
          const isSelected = selectedColor === colorOption.id;
          const cSize   = 80 * s;
          const cCenter = (colorOption.x + 43.5) * scaleX;
          return (
            <button
              key={colorOption.id}
              type="button"
              onClick={() => setSelectedColor(colorOption.id)}
              aria-label={`Select ${colorOption.label} color`}
              className="flex items-center justify-center group focus:outline-none cursor-pointer select-none z-20 bg-transparent border-0 p-0"
              style={{
                position: 'absolute',
                left:   `${cCenter - cSize / 2}px`,
                top:    `${590 * scaleY}px`,
                width:  `${cSize}px`,
                height: `${cSize}px`,
                overflow: 'visible',
              }}
            >
              {/* Border outline — same mask+scale trick as avatar blobs */}
              {isSelected && (
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none select-none"
                  style={{
                    inset: 0,
                    backgroundColor: '#1B1D20',
                    WebkitMaskImage: `url(${colorOption.blob})`,
                    maskImage:       `url(${colorOption.blob})`,
                    WebkitMaskSize:   '100% 100%',
                    maskSize:         '100% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat:       'no-repeat',
                    transform:        'scale(1.08)',
                    transformOrigin:  'center center',
                    zIndex: 1,
                  }}
                />
              )}

              <img
                src={colorOption.blob}
                alt={colorOption.label}
                draggable={false}
                className="absolute pointer-events-none select-none transition-transform duration-150 group-active:scale-95"
                style={{ inset: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 2 }}
              />

              {isSelected && (
                <div
                  className="absolute bg-[#1B1D20] rounded-full flex items-center justify-center text-white pointer-events-none"
                  style={{
                    width:  `${18 * s}px`,
                    height: `${18 * s}px`,
                    bottom: `${-1 * s}px`,
                    right:  `${6 * s}px`,
                    zIndex: 3,
                  }}
                >
                  <svg width={9 * s} height={9 * s} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {/* ── CONTINUE ──────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleContinue}
          className="btn-press rounded-full flex items-center justify-center bg-[#191B20] text-white hover:bg-[#262930] transition-colors focus:outline-none cursor-pointer border-0 p-0 z-20"
          style={{
            position: 'absolute',
            left:   `${33 * scaleX}px`,
            top:    `${707 * scaleY}px`,
            width:  `${325 * scaleX}px`,
            height: `${48 * s}px`,
            fontWeight: 700,
            fontSize:      `${18 * s}px`,
            letterSpacing: '-0.01em',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
