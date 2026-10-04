import React, { useState, useEffect, useRef } from 'react';
import { gameStore } from '../store';

interface GameSettingsScreenProps {
  onBack: () => void;
  onGoToLobby?: () => void;
}

interface DebugItem {
  id: string;
  type: 'box' | 'text';
  expected: { x: number; y: number; w?: number; h?: number; fontSize?: number };
  measured: { x: number; y: number; w?: number; h?: number; fontSize?: number };
  isOff: boolean;
}

export const GameSettingsScreen: React.FC<GameSettingsScreenProps> = ({ onBack, onGoToLobby }) => {
  // 1) Viewport tracking
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive rule (exact)
  // s = min(viewportWidth, 430) / 390
  // k = max(1, viewportHeight / (844 * s))
  const s = Math.min(viewport.w, 430) / 390;
  const k = Math.max(1, viewport.h / (844 * s));
  const PH = 844 * s * k;

  // Sync background and ensure html/body allow vertical scrolling on compact screens
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.backgroundColor = '#F6EFDD';
    document.body.style.backgroundColor = '#F6EFDD';
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Debug flag
  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  // State
  const [selectedMode, setSelectedMode] = useState<'know-me' | 'trivia' | 'mixed'>('trivia');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Food', 'Movies', 'Music']);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [timer, setTimer] = useState<'10s' | '20s' | '30s' | 'Off'>('20s');
  const [rounds, setRounds] = useState<5 | 10 | 15>(10);
  const [speedBonus, setSpeedBonus] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Category chip animation
  const [animatingChip, setAnimatingChip] = useState<string | null>(null);

  const toggleCategory = (catName: string) => {
    if (!selectedCategories.includes(catName)) {
      setAnimatingChip(catName);
      setTimeout(() => setAnimatingChip(null), 240);
    }
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleCreateGame = () => {
    gameStore.updateGameSettings({
      mode: selectedMode,
      categories: selectedCategories,
      difficulty,
      timerSeconds: timer === 'Off' ? null : parseInt(timer, 10),
      rounds,
      speedBonus,
      sound: soundEffects,
    });
    if (onGoToLobby) {
      onGoToLobby();
    } else {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToastMessage('Lobby coming soon');
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }
  };

  // Mode Blob Configurations
  const MODES_CONFIG = {
    'know-me': {
      blobW: 106.5,
      blobH: 106.5 * (230 / 259), // 94.58
      blobCenterX: 74.4,
      blobCenterY: 214.4,
      iconW: 62.2,
      iconH: 62.2 * (80 / 148), // 33.62
      iconCenterX: 73.1,
      iconCenterY: 201.4,
      labelCenterX: 73.6,
      labelCenterY: 233.2,
      labelFit: 61.7,
      ringCenterX: 74.4,
      ringCenterY: 216.0,
      ringBorderRadius: '50% 50% 46% 54% / 53% 47% 53% 47%',
      checkCenterX: 74.4 + 39.7, // 114.1
      checkCenterY: 214.4 + 30.8, // 245.2
    },
    trivia: {
      blobW: 100.0,
      blobH: 100.0 * (233 / 244), // 95.49
      blobCenterX: 194.3,
      blobCenterY: 209.0,
      iconW: 57.0,
      iconH: 57.0 * (82 / 138), // 33.87
      iconCenterX: 192.7,
      iconCenterY: 202.8,
      labelCenterX: 192.5,
      labelCenterY: 235.0,
      labelFit: 35.0,
      ringCenterX: 194.3,
      ringCenterY: 210.6,
      ringBorderRadius: '52% 48% 47% 53% / 55% 50% 50% 45%',
      checkCenterX: 234.0,
      checkCenterY: 241.4,
    },
    mixed: {
      blobW: 106.0,
      blobH: 106.0 * (232 / 253), // 97.20
      blobCenterX: 317.1,
      blobCenterY: 214.2,
      iconW: 62.0,
      iconH: 62.0 * (83 / 146), // 35.25
      iconCenterX: 317.8,
      iconCenterY: 204.4,
      labelCenterX: 317.8,
      labelCenterY: 235.9,
      labelFit: 40.7,
      ringCenterX: 317.1,
      ringCenterY: 215.8,
      ringBorderRadius: '47% 53% 52% 48% / 50% 46% 54% 50%',
      checkCenterX: 317.1 + 39.7, // 356.8
      checkCenterY: 214.2 + 30.8, // 245.0
    },
  };

  // Categories config
  const CATEGORIES = [
    // Row 1 (y 305.4, h 34.3) -> center Y = 322.55
    { name: 'Food', x: 21.9, w: 107.5, emojiX: 44.8, labelX: 80.9, rowY: 305.4, fit: 27.4, icon: '/game-settings-decorations/emoji-pizza.webp' },
    { name: 'Dreams', x: 140.8, w: 111.1, emojiX: 166.0, labelX: 207.5, rowY: 305.4, icon: '/game-settings-decorations/emoji-moon.webp' },
    { name: 'Fears', x: 262.0, w: 107.4, emojiX: 286.2, labelX: 322.8, rowY: 305.4, icon: '/game-settings-decorations/emoji-fears.webp' },
    // Row 2 (y 348.9, h 34.3) -> center Y = 366.05
    { name: 'Movies', x: 21.9, w: 110.7, emojiX: 47.5, labelX: 87.3, rowY: 348.9, icon: '/game-settings-decorations/emoji-clapper.webp' },
    { name: 'Music', x: 143.0, w: 107.5, emojiX: 168.2, labelX: 204.4, rowY: 348.9, icon: '/game-settings-decorations/emoji-music.webp' },
    { name: 'Travel', x: 261.5, w: 107.9, emojiX: 288.0, labelX: 324.6, rowY: 348.9, icon: '/game-settings-decorations/emoji-plane.webp' },
    // Row 3 (y 392.3, h 34.3) -> center Y = 409.45
    { name: 'Science', x: 21.9, w: 109.3, emojiX: 45.7, labelX: 87.3, rowY: 392.3, icon: '/game-settings-decorations/emoji-flask.webp' },
    { name: 'Funny', x: 141.7, w: 108.8, emojiX: 165.0, labelX: 202.1, rowY: 392.3, icon: '/game-settings-decorations/emoji-funny.webp' },
    { name: 'Deep', x: 261.5, w: 107.9, emojiX: 288.5, labelX: 324.2, rowY: 392.3, icon: '/game-settings-decorations/emoji-cloud.webp' },
    // Row 4 (y 435.7, h 34.3) -> center Y = 452.85
    { name: 'Random', x: 21.9, w: 109.3, emojiX: 45.3, labelX: 88.2, rowY: 435.7, icon: '/game-settings-decorations/emoji-dice-outline.webp' },
  ];

  // Difficulty Pill
  const diffPillLeft =
    difficulty === 'Easy' ? 25.6 : difficulty === 'Medium' ? 139.4 : 254.6;

  // Timer Pill
  const timerPillLeft =
    timer === '10s' ? 28.5 : timer === '20s' ? 112.4 : timer === '30s' ? 195.3 : 282.2;

  // Rounds Pill
  const roundsPillLeft =
    rounds === 5 ? 27.0 : rounds === 10 ? 139.4 : 252.4;

  // Debug measurement state
  const stageRef = useRef<HTMLDivElement>(null);
  const [debugItems, setDebugItems] = useState<DebugItem[]>([]);

  useEffect(() => {
    if (!isDebug || !stageRef.current) return;

    const measureAll = () => {
      const stageRect = stageRef.current?.getBoundingClientRect();
      if (!stageRect) return;

      const items: DebugItem[] = [];

      // Check text items
      const checkText = (id: string, expFontSize: number, expWidth: number) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const computed = window.getComputedStyle(el);
          const measuredFontSize = parseFloat(computed.fontSize) / s;
          const measuredW = rect.width / s;
          const isOff =
            Math.abs(measuredFontSize - expFontSize) > 1 || Math.abs(measuredW - expWidth) > 1;

          items.push({
            id,
            type: 'text',
            expected: { x: 0, y: 0, w: expWidth, fontSize: expFontSize },
            measured: {
              x: 0,
              y: 0,
              w: Number(measuredW.toFixed(1)),
              fontSize: Number(measuredFontSize.toFixed(1)),
            },
            isOff,
          });
        }
      };

      // Check box items
      const checkBox = (id: string, expX: number, expY: number, expW: number, expH: number) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const measuredX = (rect.left - stageRect.left) / s;
          const measuredY = (rect.top - stageRect.top) / (s * k);
          const measuredW = rect.width / s;
          const measuredH = rect.height / s;
          const isOff =
            Math.abs(measuredX - expX) > 1 ||
            Math.abs(measuredY - expY) > 1 ||
            Math.abs(measuredW - expW) > 1 ||
            Math.abs(measuredH - expH) > 1;

          items.push({
            id,
            type: 'box',
            expected: { x: expX, y: expY, w: expW, h: expH },
            measured: {
              x: Number(measuredX.toFixed(1)),
              y: Number(measuredY.toFixed(1)),
              w: Number(measuredW.toFixed(1)),
              h: Number(measuredH.toFixed(1)),
            },
            isOff,
          });
        }
      };

      checkText('text-game-settings', 39, 262);
      checkText('text-subtitle', 13.5, 272.5);
      checkText('text-mode-title', 17.5, 48.9);
      checkText('text-categories-title', 17.5, 93.7);
      checkText('text-diff-title', 17.5, 77.3);
      checkText('text-timer-title', 17.5, 47.5);
      checkText('text-rounds-title', 17.5, 60.8);
      checkText('text-label-know-me', 14.5, 61.7);
      checkText('text-label-trivia', 14.5, 35);
      checkText('text-label-mixed', 14.5, 40.7);

      checkBox('btn-back', 20.1, 19.7, 33.4, 33.4);
      checkBox('track-diff', 22.4, 513.9, 345.6, 32);
      checkBox('track-timer', 22.4, 588.9, 345.6, 28.3);
      checkBox('track-rounds', 22.4, 656.6, 345.6, 27.4);
      checkBox('row-speed-bonus', 22.4, 695.8, 345.2, 29.8);
      checkBox('row-sound-effects', 22.4, 732.9, 345.2, 29.8);
      checkBox('btn-create-game', 43, 774, 304, 42);

      setDebugItems(items);
    };

    const timer = setTimeout(measureAll, 400);
    return () => clearTimeout(timer);
  }, [isDebug, s, k, difficulty, timer, rounds]);

  return (
    <div
      id="game-settings-scroll-viewport"
      className="fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden flex justify-center items-start select-none font-['Nunito',sans-serif]"
      style={{
        backgroundColor: '#F6EFDD',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        zIndex: 50,
      }}
    >
      {/* 
        390-wide stage container:
        - Width = 390 * s, centered.
        - Page height PH = 844 * s * k.
        - On tall screens (k > 1): PH = viewportHeight, fills screen with NO scrolling.
        - On compact screens (k = 1): PH = 844 * s, scrolls vertically.
      */}
      <div
        id="game-settings-stage"
        ref={stageRef}
        className="relative flex-shrink-0"
        style={{
          width: `${390 * s}px`,
          height: `${PH}px`,
          minHeight: `${PH}px`,
          backgroundColor: '#F6EFDD',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* =========================================================================
            DECORATIONS
           ========================================================================= */}
        {/* Top-Right Yellow Crescent: left 312.4, top 0, 63.8 wide */}
        <img
          src="/game-settings-decorations/deco-moon-yellow.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${312.4 * s}px`,
            top: 0,
            width: `${63.8 * s}px`,
            height: `${(63.8 * (143 / 138)) * s}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Right-Edge Pink Heart: left 350, top 81.5, 40 wide, snap right */}
        <img
          src="/game-settings-decorations/deco-heart-pink.webp"
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            top: `${(81.5 + (40 * (102 / 87)) / 2) * s * k - ((40 * (102 / 87)) * s) / 2}px`,
            width: `${40 * s}px`,
            height: `${(40 * (102 / 87)) * s}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Bottom-Left Blue Starburst: left 0, glued to bottom */}
        <img
          src="/game-settings-decorations/deco-star-blue.webp"
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            bottom: `${(844 - (789.6 + 41 * (110 / 90))) * s}px`,
            width: `${41 * s}px`,
            height: `${(41 * (110 / 90)) * s}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Bottom-Right Olive Cross: left 342, glued to bottom */}
        <img
          src="/game-settings-decorations/deco-cross-olive.webp"
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            bottom: `${(844 - (796 + 48 * (103 / 104))) * s}px`,
            width: `${48 * s}px`,
            height: `${(48 * (103 / 104)) * s}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* =========================================================================
            TOP SECTION: Back Button & Headings
           ========================================================================= */}
        {/* Back button: dashed 1.5px ink circle 33.4 at (20.1, 19.7), arrow 18px */}
        <button
          id="btn-back"
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            position: 'absolute',
            left: `${20.1 * s}px`,
            top: `${(19.7 + 33.4 / 2) * s * k - (33.4 * s) / 2}px`,
            width: `${33.4 * s}px`,
            height: `${33.4 * s}px`,
            borderRadius: '50%',
            border: `${1.5 * s}px dashed #161B1E`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            padding: 0,
            zIndex: 20,
            outline: 'none',
            transition: prefersReducedMotion ? 'none' : 'transform 0.12s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg
            width={18 * s}
            height={18 * s}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#161B1E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* "Game settings": left x 21.5, y 81.2, weight 900, size 39px, fit 262 */}
        <FitText
          id="text-game-settings"
          refX={21.5}
          centerY={81.2}
          refW={262}
          size={39}
          weight={900}
          color="#161B1E"
          s={s}
          k={k}
        >
          Game settings
        </FitText>

        {/* Subtitle: left x 22.9, y 116, weight 500, size 13.5px, muted, fit 272.5 */}
        <FitText
          id="text-subtitle"
          refX={22.9}
          centerY={116}
          refW={272.5}
          size={13.5}
          weight={500}
          color="rgba(22, 27, 30, 0.55)"
          s={s}
          k={k}
        >
          You're the host. Sam sees this in the lobby.
        </FitText>

        {/* =========================================================================
            MODE SECTION
           ========================================================================= */}
        {/* Title "Mode": left 21.9, y 153.6, weight 900, size 17.5px, fit 48.9 */}
        <FitText
          id="text-mode-title"
          refX={21.9}
          centerY={153.6}
          refW={48.9}
          size={17.5}
          weight={900}
          color="#161B1E"
          s={s}
          k={k}
        >
          Mode
        </FitText>

        {/* 1. Know Me Blob */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedMode('know-me')}
          style={{
            position: 'absolute',
            left: `${MODES_CONFIG['know-me'].blobCenterX * s}px`,
            top: `${MODES_CONFIG['know-me'].blobCenterY * s * k}px`,
            width: `${MODES_CONFIG['know-me'].blobW * s}px`,
            height: `${MODES_CONFIG['know-me'].blobH * s}px`,
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            zIndex: 5,
            transition: prefersReducedMotion ? 'none' : 'transform 0.12s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        >
          <img
            src="/quick-blob-pink-know-me.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            draggable={false}
          />
        </div>
        <img
          src="/quick-icon-wink-face-sparks.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${MODES_CONFIG['know-me'].iconCenterX * s}px`,
            top: `${MODES_CONFIG['know-me'].iconCenterY * s * k}px`,
            width: `${MODES_CONFIG['know-me'].iconW * s}px`,
            height: `${MODES_CONFIG['know-me'].iconH * s}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
          draggable={false}
        />

        {/* 2. Trivia Blob */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedMode('trivia')}
          style={{
            position: 'absolute',
            left: `${MODES_CONFIG['trivia'].blobCenterX * s}px`,
            top: `${MODES_CONFIG['trivia'].blobCenterY * s * k}px`,
            width: `${MODES_CONFIG['trivia'].blobW * s}px`,
            height: `${MODES_CONFIG['trivia'].blobH * s}px`,
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            zIndex: 5,
            transition: prefersReducedMotion ? 'none' : 'transform 0.12s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        >
          <img
            src="/quick-blob-blue-trivia.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            draggable={false}
          />
        </div>
        <img
          src="/quick-icon-lightbulb-sparks.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${MODES_CONFIG['trivia'].iconCenterX * s}px`,
            top: `${MODES_CONFIG['trivia'].iconCenterY * s * k}px`,
            width: `${MODES_CONFIG['trivia'].iconW * s}px`,
            height: `${MODES_CONFIG['trivia'].iconH * s}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
          draggable={false}
        />

        {/* 3. Mixed Blob */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedMode('mixed')}
          style={{
            position: 'absolute',
            left: `${MODES_CONFIG['mixed'].blobCenterX * s}px`,
            top: `${MODES_CONFIG['mixed'].blobCenterY * s * k}px`,
            width: `${MODES_CONFIG['mixed'].blobW * s}px`,
            height: `${MODES_CONFIG['mixed'].blobH * s}px`,
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            zIndex: 5,
            transition: prefersReducedMotion ? 'none' : 'transform 0.12s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        >
          <img
            src="/quick-blob-green-random.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            draggable={false}
          />
        </div>
        <img
          src="/quick-icon-dice-sparks.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${MODES_CONFIG['mixed'].iconCenterX * s}px`,
            top: `${MODES_CONFIG['mixed'].iconCenterY * s * k}px`,
            width: `${MODES_CONFIG['mixed'].iconW * s}px`,
            height: `${MODES_CONFIG['mixed'].iconH * s}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
          draggable={false}
        />

        {/* Selection Ring: thin wobbly circle matching mockup (border: 2.3px*s solid #161B1E) */}
        {selectedMode && (
          <div
            id="mode-selection-ring"
            style={{
              position: 'absolute',
              left: `${MODES_CONFIG[selectedMode].ringCenterX * s}px`,
              top: `${MODES_CONFIG[selectedMode].ringCenterY * s * k}px`,
              width: `${118 * s}px`,
              height: `${111 * s}px`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'transparent',
              border: `${2.3 * s}px solid #161B1E`,
              borderRadius: MODES_CONFIG[selectedMode].ringBorderRadius,
              pointerEvents: 'none',
              zIndex: 7,
              transition: prefersReducedMotion
                ? 'none'
                : 'left 220ms ease, top 220ms ease, opacity 220ms ease, transform 220ms ease',
            }}
          />
        )}

        {/* Black Check Badge: 24px #161B1E circle with white check */}
        {selectedMode && (
          <div
            id="mode-check-badge"
            style={{
              position: 'absolute',
              left: `${MODES_CONFIG[selectedMode].checkCenterX * s}px`,
              top: `${MODES_CONFIG[selectedMode].checkCenterY * s * k}px`,
              width: `${24 * s}px`,
              height: `${24 * s}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: '#161B1E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 8,
              transition: prefersReducedMotion
                ? 'none'
                : 'left 220ms ease, top 220ms ease, opacity 220ms ease',
            }}
          >
            <svg
              width={13 * s}
              height={13 * s}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* MODE LABELS (Sits ABOVE blob and icon images, z-index 10, solid #161B1E, Nunito 800, 14.5px*s) */}
        <FitText
          id="text-label-know-me"
          centerX={MODES_CONFIG['know-me'].labelCenterX}
          centerY={MODES_CONFIG['know-me'].labelCenterY}
          refW={MODES_CONFIG['know-me'].labelFit}
          size={14.5}
          weight={800}
          color="#161B1E"
          s={s}
          k={k}
          style={{ zIndex: 10 }}
        >
          Know Me
        </FitText>

        <FitText
          id="text-label-trivia"
          centerX={MODES_CONFIG['trivia'].labelCenterX}
          centerY={MODES_CONFIG['trivia'].labelCenterY}
          refW={MODES_CONFIG['trivia'].labelFit}
          size={14.5}
          weight={800}
          color="#161B1E"
          s={s}
          k={k}
          style={{ zIndex: 10 }}
        >
          Trivia
        </FitText>

        <FitText
          id="text-label-mixed"
          centerX={MODES_CONFIG['mixed'].labelCenterX}
          centerY={MODES_CONFIG['mixed'].labelCenterY}
          refW={MODES_CONFIG['mixed'].labelFit}
          size={14.5}
          weight={800}
          color="#161B1E"
          s={s}
          k={k}
          style={{ zIndex: 10 }}
        >
          Mixed
        </FitText>

        {/* =========================================================================
            CATEGORIES SECTION
           ========================================================================= */}
        {/* Title "Categories": left 21.9, y 289.4, weight 900, size 17.5px, fit 93.7 */}
        <FitText
          id="text-categories-title"
          refX={21.9}
          centerY={289.4}
          refW={93.7}
          size={17.5}
          weight={900}
          color="#161B1E"
          s={s}
          k={k}
        >
          Categories
        </FitText>

        {/* Category Chips: height 34.3 */}
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.name);
          const isScaling = animatingChip === cat.name;
          const rowCenterY = cat.rowY + 34.3 / 2;

          return (
            <button
              key={cat.name}
              id={`chip-${cat.name.toLowerCase()}`}
              type="button"
              onClick={() => toggleCategory(cat.name)}
              style={{
                position: 'absolute',
                left: `${cat.x * s}px`,
                top: `${rowCenterY * s * k - (34.3 * s) / 2}px`,
                width: `${cat.w * s}px`,
                height: `${34.3 * s}px`,
                borderRadius: `${34.3 * s}px`,
                backgroundColor: isSelected ? '#161B1E' : '#FCF7EB',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                zIndex: 10,
                outline: 'none',
                transition: prefersReducedMotion
                  ? 'none'
                  : 'background-color 160ms ease, transform 0.12s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {/* Emoji: 21 x 21 centered at emojiX */}
              <img
                src={cat.icon}
                alt=""
                style={{
                  position: 'absolute',
                  left: `${(cat.emojiX - cat.x - 10.5) * s}px`,
                  top: `${(34.3 / 2 - 10.5) * s}px`,
                  width: `${21 * s}px`,
                  height: `${21 * s}px`,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  transform: isScaling ? 'scale(1.08)' : 'scale(1)',
                  transition: prefersReducedMotion ? 'none' : 'transform 220ms ease',
                }}
                draggable={false}
              />

              {/* Label: centered at labelX, font size 12.5px */}
              <FitText
                centerX={cat.labelX - cat.x}
                centerY={34.3 / 2}
                refW={cat.fit}
                size={12.5}
                weight={700}
                color={isSelected ? '#FFFFFF' : '#161B1E'}
                s={s}
                k={1} // inside the chip button, height doesn't scale with k
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  transition: prefersReducedMotion ? 'none' : 'color 160ms ease',
                }}
              >
                {cat.name}
              </FitText>
            </button>
          );
        })}

        {/* =========================================================================
            DIFFICULTY SEGMENTED CONTROL
           ========================================================================= */}
        {/* Title "Difficulty": left 21.9, y 496.1, weight 900, size 17.5px, fit 77.3 */}
        <FitText
          id="text-diff-title"
          refX={21.9}
          centerY={496.1}
          refW={77.3}
          size={17.5}
          weight={900}
          color="#161B1E"
          s={s}
          k={k}
        >
          Difficulty
        </FitText>

        {/* Track: x 22.4, y 513.9, w 345.6, h 32 -> Center Y = 529.9 */}
        <div
          id="track-diff"
          style={{
            position: 'absolute',
            left: `${22.4 * s}px`,
            top: `${529.9 * s * k - (32 * s) / 2}px`,
            width: `${345.6 * s}px`,
            height: `${32 * s}px`,
            borderRadius: `${32 * s}px`,
            backgroundColor: '#FCF7EB',
            zIndex: 10,
          }}
        >
          {/* Sliding Pill: width 111.6, height 32 */}
          <div
            style={{
              position: 'absolute',
              left: `${(diffPillLeft - 22.4) * s}px`,
              top: 0,
              width: `${111.6 * s}px`,
              height: `${32 * s}px`,
              borderRadius: `${32 * s}px`,
              backgroundColor: '#161B1E',
              transition: prefersReducedMotion
                ? 'none'
                : 'left 240ms cubic-bezier(0.3, 0.8, 0.3, 1)',
            }}
          />

          {[
            { label: 'Easy', centerX: 81.4 },
            { label: 'Medium', centerX: 195.2, fit: 45.3 },
            { label: 'Hard', centerX: 310.4 },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setDifficulty(opt.label as any)}
              style={{
                position: 'absolute',
                left: `${(opt.centerX - 22.4) * s}px`,
                top: `${(32 / 2) * s}px`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: 2,
                outline: 'none',
              }}
            >
              <FitText
                centerX={0}
                centerY={0}
                refW={opt.fit}
                size={12.3}
                weight={700}
                color={difficulty === opt.label ? '#FFFFFF' : '#161B1E'}
                s={s}
                k={1}
                style={{
                  position: 'relative',
                  pointerEvents: 'none',
                  transition: prefersReducedMotion ? 'none' : 'color 160ms ease',
                }}
              >
                {opt.label}
              </FitText>
            </button>
          ))}
        </div>

        {/* =========================================================================
            TIMER SEGMENTED CONTROL
           ========================================================================= */}
        {/* Title "Timer": left 21.9, y 571.5, weight 900, size 17.5px, fit 47.5 */}
        <FitText
          id="text-timer-title"
          refX={21.9}
          centerY={571.5}
          refW={47.5}
          size={17.5}
          weight={900}
          color="#161B1E"
          s={s}
          k={k}
        >
          Timer
        </FitText>

        {/* Track: x 22.4, y 588.9, w 345.6, h 28.3 -> Center Y = 603.05 */}
        <div
          id="track-timer"
          style={{
            position: 'absolute',
            left: `${22.4 * s}px`,
            top: `${603.05 * s * k - (28.3 * s) / 2}px`,
            width: `${345.6 * s}px`,
            height: `${28.3 * s}px`,
            borderRadius: `${28.3 * s}px`,
            backgroundColor: '#FCF7EB',
            zIndex: 10,
          }}
        >
          {/* Sliding Pill: width 83, height 28.3 */}
          <div
            style={{
              position: 'absolute',
              left: `${(timerPillLeft - 22.4) * s}px`,
              top: 0,
              width: `${83 * s}px`,
              height: `${28.3 * s}px`,
              borderRadius: `${28.3 * s}px`,
              backgroundColor: '#161B1E',
              transition: prefersReducedMotion
                ? 'none'
                : 'left 240ms cubic-bezier(0.3, 0.8, 0.3, 1)',
            }}
          />

          {[
            { label: '10s', centerX: 70 },
            { label: '20s', centerX: 153.9 },
            { label: '30s', centerX: 236.8 },
            { label: 'Off', centerX: 323.7 },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setTimer(opt.label as any)}
              style={{
                position: 'absolute',
                left: `${(opt.centerX - 22.4) * s}px`,
                top: `${(28.3 / 2) * s}px`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: 2,
                outline: 'none',
              }}
            >
              <FitText
                centerX={0}
                centerY={0}
                size={12.3}
                weight={700}
                color={timer === opt.label ? '#FFFFFF' : '#161B1E'}
                s={s}
                k={1}
                style={{
                  position: 'relative',
                  pointerEvents: 'none',
                  transition: prefersReducedMotion ? 'none' : 'color 160ms ease',
                }}
              >
                {opt.label}
              </FitText>
            </button>
          ))}
        </div>

        {/* =========================================================================
            ROUNDS SEGMENTED CONTROL
           ========================================================================= */}
        {/* Title "Rounds": left 21.9, y 641, weight 900, size 17.5px, fit 60.8 */}
        <FitText
          id="text-rounds-title"
          refX={21.9}
          centerY={641}
          refW={60.8}
          size={17.5}
          weight={900}
          color="#161B1E"
          s={s}
          k={k}
        >
          Rounds
        </FitText>

        {/* Track: x 22.4, y 656.6, w 345.6, h 27.4 -> Center Y = 670.3 */}
        <div
          id="track-rounds"
          style={{
            position: 'absolute',
            left: `${22.4 * s}px`,
            top: `${670.3 * s * k - (27.4 * s) / 2}px`,
            width: `${345.6 * s}px`,
            height: `${27.4 * s}px`,
            borderRadius: `${27.4 * s}px`,
            backgroundColor: '#FCF7EB',
            zIndex: 10,
          }}
        >
          {/* Sliding Pill: width 111.6, height 27.4 */}
          <div
            style={{
              position: 'absolute',
              left: `${(roundsPillLeft - 22.4) * s}px`,
              top: 0,
              width: `${111.6 * s}px`,
              height: `${27.4 * s}px`,
              borderRadius: `${27.4 * s}px`,
              backgroundColor: '#161B1E',
              transition: prefersReducedMotion
                ? 'none'
                : 'left 240ms cubic-bezier(0.3, 0.8, 0.3, 1)',
            }}
          />

          {[
            { val: 5, centerX: 82.8 },
            { val: 10, centerX: 195.2 },
            { val: 15, centerX: 308.2 },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setRounds(opt.val as any)}
              style={{
                position: 'absolute',
                left: `${(opt.centerX - 22.4) * s}px`,
                top: `${(27.4 / 2) * s}px`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: 2,
                outline: 'none',
              }}
            >
              <FitText
                centerX={0}
                centerY={0}
                size={12.3}
                weight={700}
                color={rounds === opt.val ? '#FFFFFF' : '#161B1E'}
                s={s}
                k={1}
                style={{
                  position: 'relative',
                  pointerEvents: 'none',
                  transition: prefersReducedMotion ? 'none' : 'color 160ms ease',
                }}
              >
                {String(opt.val)}
              </FitText>
            </button>
          ))}
        </div>

        {/* =========================================================================
            TOGGLE ROWS
           ========================================================================= */}
        {/* 1. "Speed bonus": y 695.8, h 29.8 -> Center Y = 710.7 */}
        <div
          id="row-speed-bonus"
          style={{
            position: 'absolute',
            left: `${22.4 * s}px`,
            top: `${710.7 * s * k - (29.8 * s) / 2}px`,
            width: `${345.2 * s}px`,
            height: `${29.8 * s}px`,
            borderRadius: `${29.8 * s}px`,
            backgroundColor: '#F3EBCE',
            zIndex: 10,
          }}
        >
          {/* Label: left x 37, y 710.7, weight 800, size 12.5px, fit 72.2 */}
          <FitText
            id="text-speed-bonus"
            refX={37 - 22.4}
            centerY={29.8 / 2}
            refW={72.2}
            size={12.5}
            weight={800}
            color="#161B1E"
            s={s}
            k={1}
          >
            Speed bonus
          </FitText>

          {/* Switch: track 39.4 x 21, right edge at 357.1 */}
          <div
            role="switch"
            aria-checked={speedBonus}
            tabIndex={0}
            onClick={() => setSpeedBonus((prev) => !prev)}
            style={{
              position: 'absolute',
              left: `${(357.1 - 22.4 - 39.4) * s}px`,
              top: `${((29.8 - 21) / 2) * s}px`,
              width: `${39.4 * s}px`,
              height: `${21 * s}px`,
              borderRadius: `${21 * s}px`,
              backgroundColor: speedBonus ? '#161B1E' : '#D9D2BE',
              cursor: 'pointer',
              transition: prefersReducedMotion ? 'none' : 'background-color 200ms ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${((21 - 17.4) / 2) * s}px`,
                left: `${(speedBonus ? 39.4 - 2 - 17.4 : 2) * s}px`,
                width: `${17.4 * s}px`,
                height: `${17.4 * s}px`,
                borderRadius: '50%',
                backgroundColor: '#FCF7EB',
                transition: prefersReducedMotion ? 'none' : 'left 200ms ease-out',
              }}
            />
          </div>
        </div>

        {/* 2. "Sound effects": y 732.9, h 29.8 -> Center Y = 747.8 */}
        <div
          id="row-sound-effects"
          style={{
            position: 'absolute',
            left: `${22.4 * s}px`,
            top: `${747.8 * s * k - (29.8 * s) / 2}px`,
            width: `${345.2 * s}px`,
            height: `${29.8 * s}px`,
            borderRadius: `${29.8 * s}px`,
            backgroundColor: '#F3EBCE',
            zIndex: 10,
          }}
        >
          {/* Label: left x 37, y 747.8, weight 800, size 12.5px */}
          <FitText
            id="text-sound-effects"
            refX={37 - 22.4}
            centerY={29.8 / 2}
            size={12.5}
            weight={800}
            color="#161B1E"
            s={s}
            k={1}
          >
            Sound effects
          </FitText>

          {/* Switch */}
          <div
            role="switch"
            aria-checked={soundEffects}
            tabIndex={0}
            onClick={() => setSoundEffects((prev) => !prev)}
            style={{
              position: 'absolute',
              left: `${(357.1 - 22.4 - 39.4) * s}px`,
              top: `${((29.8 - 21) / 2) * s}px`,
              width: `${39.4 * s}px`,
              height: `${21 * s}px`,
              borderRadius: `${21 * s}px`,
              backgroundColor: soundEffects ? '#161B1E' : '#D9D2BE',
              cursor: 'pointer',
              transition: prefersReducedMotion ? 'none' : 'background-color 200ms ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${((21 - 17.4) / 2) * s}px`,
                left: `${(soundEffects ? 39.4 - 2 - 17.4 : 2) * s}px`,
                width: `${17.4 * s}px`,
                height: `${17.4 * s}px`,
                borderRadius: '50%',
                backgroundColor: '#FCF7EB',
                transition: prefersReducedMotion ? 'none' : 'left 200ms ease-out',
              }}
            />
          </div>
        </div>

        {/* =========================================================================
            BOTTOM BUTTON: "Create game" (Matching attached image exactly)
           ========================================================================= */}
        <button
          id="btn-create-game"
          type="button"
          onClick={handleCreateGame}
          className="btn-press cursor-pointer outline-none select-none transition-all active:scale-[0.98]"
          style={{
            position: 'absolute',
            left: `${43 * s}px`,
            top: `${795 * s * k - (42 * s) / 2}px`,
            width: `${304 * s}px`,
            height: `${42 * s}px`,
            borderRadius: '9999px',
            backgroundColor: '#161B1E',
            border: 'none',
            padding: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            transition: prefersReducedMotion ? 'none' : 'transform 120ms ease, opacity 120ms ease',
          }}
        >
          <span
            id="text-create-game"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: `${19.5 * s}px`,
              color: '#FFFFFF',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            Create game
          </span>
        </button>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#161B1E',
              color: '#FFFFFF',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: `${15 * s}px`,
              padding: `${10 * s}px ${22 * s}px`,
              borderRadius: `${24 * s}px`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 9999,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>

      {/* =========================================================================
          DEBUG OVERLAY (?debug=1)
         ========================================================================= */}
      {isDebug && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '40vh',
            overflowY: 'auto',
            backgroundColor: 'rgba(0,0,0,0.92)',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '11px',
            padding: '10px',
            zIndex: 100000,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#4ade80' }}>
            Scale s = {s.toFixed(4)} | k = {k.toFixed(4)} | Viewport: {viewport.w} x {viewport.h} | PH: {PH.toFixed(1)}px
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #444', color: '#999' }}>
                <th style={{ padding: '2px 4px' }}>Element</th>
                <th style={{ padding: '2px 4px' }}>Type</th>
                <th style={{ padding: '2px 4px' }}>Expected</th>
                <th style={{ padding: '2px 4px' }}>Measured</th>
                <th style={{ padding: '2px 4px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {debugItems.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: item.isOff ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                    color: item.isOff ? '#fca5a5' : '#86efac',
                    borderBottom: '1px solid #333',
                  }}
                >
                  <td style={{ padding: '2px 4px' }}>{item.id}</td>
                  <td style={{ padding: '2px 4px' }}>{item.type}</td>
                  <td style={{ padding: '2px 4px' }}>
                    {item.type === 'text'
                      ? `size: ${item.expected.fontSize}, w: ${item.expected.w}`
                      : `x: ${item.expected.x}, y: ${item.expected.y}, w: ${item.expected.w}, h: ${item.expected.h}`}
                  </td>
                  <td style={{ padding: '2px 4px' }}>
                    {item.type === 'text'
                      ? `size: ${item.measured.fontSize}, w: ${item.measured.w}`
                      : `x: ${item.measured.x}, y: ${item.measured.y}, w: ${item.measured.w}, h: ${item.measured.h}`}
                  </td>
                  <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>
                    {item.isOff ? 'FAIL' : 'OK'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// FIT TEXT HELPER COMPONENT (Nunito, exact font sizes, line-height 1, letter-spacing 0)
// =========================================================================
interface FitTextProps {
  children: string;
  refX?: number; // left anchor (if left-aligned)
  centerX?: number; // center anchor X (if center-aligned)
  centerY: number; // vertical center anchor (y)
  refW?: number; // fit target width in reference px
  size: number; // reference font size
  weight: number;
  color: string;
  s: number;
  k: number;
  id?: string;
  style?: React.CSSProperties;
}

const FitText: React.FC<FitTextProps> = ({
  children,
  refX,
  centerX,
  centerY,
  refW,
  size,
  weight,
  color,
  s,
  k,
  id,
  style,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [scaleX, setScaleX] = useState<number>(1);

  useEffect(() => {
    if (!refW || !spanRef.current) return;

    const measure = () => {
      const el = spanRef.current;
      if (!el) return;
      const prevTransform = el.style.transform;
      el.style.transform = 'none';
      const naturalW = el.getBoundingClientRect().width;
      el.style.transform = prevTransform;

      const targetW = refW * s;
      if (naturalW > 0) {
        setScaleX(targetW / naturalW);
      }
    };

    measure();
    if (document.fonts) {
      document.fonts.ready.then(measure);
    }
  }, [children, refW, s, size, weight]);

  const isCentered = centerX !== undefined;
  const left = isCentered ? `${centerX * s}px` : `${(refX ?? 0) * s}px`;
  const top = `${centerY * s * k}px`;

  return (
    <span
      id={id}
      ref={spanRef}
      style={{
        position: 'absolute',
        left,
        top,
        fontFamily: "'Nunito', sans-serif",
        fontSize: `${size * s}px`,
        fontWeight: weight,
        color,
        lineHeight: 1,
        letterSpacing: '0px',
        whiteSpace: 'nowrap',
        textAlign: isCentered ? 'center' : 'left',
        transform: isCentered
          ? `translate(-50%, -50%) scaleX(${scaleX})`
          : `translateY(-50%) scaleX(${scaleX})`,
        transformOrigin: isCentered ? 'center center' : 'left center',
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 10,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
