import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../services/sessionContext';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { GameSettingsModal } from '../components/GameSettingsModal';
import { triggerHaptic } from '../utils/haptics';

export interface GameSettingsState {
  mode: 'know-me' | 'trivia' | 'mixed';
  categories: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timer: '10s' | '20s' | '30s' | 'Off';
  rounds: 5 | 10 | 15;
  speedBonus?: boolean;
  soundEffects?: boolean;
}

export interface LobbyScreenProps {
  onBack?: () => void;
  onStartGame?: () => void;
  onChangeSettings?: () => void;
  onLeave?: () => void;
  initialSettings?: GameSettingsState;
}

// Exact WebP emojis & icons mapped from GameSettings page
const GAME_SETTINGS_ICON_MAP: Record<string, string> = {
  Food: '/game-settings-decorations/emoji-pizza.webp',
  food: '/game-settings-decorations/emoji-pizza.webp',
  Movies: '/game-settings-decorations/emoji-clapper.webp',
  movies: '/game-settings-decorations/emoji-clapper.webp',
  Music: '/game-settings-decorations/emoji-music.webp',
  music: '/game-settings-decorations/emoji-music.webp',
  Dreams: '/game-settings-decorations/emoji-moon.webp',
  dreams: '/game-settings-decorations/emoji-moon.webp',
  Fears: '/game-settings-decorations/emoji-fears.webp',
  fears: '/game-settings-decorations/emoji-fears.webp',
  Travel: '/game-settings-decorations/emoji-plane.webp',
  travel: '/game-settings-decorations/emoji-plane.webp',
  Science: '/game-settings-decorations/emoji-flask.webp',
  science: '/game-settings-decorations/emoji-flask.webp',
  Funny: '/game-settings-decorations/emoji-funny.webp',
  funny: '/game-settings-decorations/emoji-funny.webp',
  Deep: '/game-settings-decorations/emoji-cloud.webp',
  deep: '/game-settings-decorations/emoji-cloud.webp',
  Trivia: '/game-settings-decorations/icon-bulb.webp',
  trivia: '/game-settings-decorations/icon-bulb.webp',
  'Know me': '/game-settings-decorations/icon-wink.webp',
  'know-me': '/game-settings-decorations/icon-wink.webp',
  Mixed: '/game-settings-decorations/icon-dice-color.webp',
  mixed: '/game-settings-decorations/icon-dice-color.webp',
};

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onBack,
  onStartGame,
  onChangeSettings,
  onLeave,
  initialSettings,
}) => {
  const navigate = useNavigate();
  const { profile } = useSession();

  // Saved or initial game settings from GameSettings page
  const [gameSettings, setGameSettings] = useState<GameSettingsState>(() => {
    if (initialSettings) return initialSettings;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gty_game_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      mode: 'trivia',
      categories: ['Food', 'Movies', 'Music'],
      difficulty: 'Medium',
      timer: '20s',
      rounds: 10,
      speedBonus: true,
      soundEffects: true,
    };
  });

  // Partner Profile state from storage
  const [partnerProfile, setPartnerProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partner_profile') || localStorage.getItem('gty_partner_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      avatarId: 2,
      name: 'Sam',
      color: 'teal',
    };
  });

  // Dynamic user data from profile (updates immediately when profile changes)
  const currentUser = useMemo(() => {
    return {
      name: profile?.name || 'Alex',
      avatarId: profile?.avatarId ?? 1,
      color: profile?.color || 'salmon',
    };
  }, [profile]);

  const friendName = partnerProfile.name || 'Sam';

  // 1. DEFAULT STATE: BOTH READY
  const [isUserReady, setIsUserReady] = useState<boolean>(true);
  const [isFriendReady, setIsFriendReady] = useState<boolean>(true);
  const [isNudgeDisabled, setIsNudgeDisabled] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showAllSettingsModal, setShowAllSettingsModal] = useState<boolean>(false);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nudgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Nudge (only active while friend is NOT ready)
  const handleNudge = () => {
    if (isNudgeDisabled || isFriendReady) return;
    setIsNudgeDisabled(true);
    showToast('Nudged!');

    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = setTimeout(() => {
      setIsNudgeDisabled(false);
    }, 5000);
  };

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 2. Button Action logic for all 4 states
  const handleMainButtonClick = () => {
    if (isUserReady && isFriendReady) {
      // Both ready -> Start game
      if (onStartGame) {
        onStartGame();
      } else {
        navigate('/guess');
      }
      return;
    }

    if (isUserReady && !isFriendReady) {
      // I'm ready, friend not -> Cancel ready
      setIsUserReady(false);
      return;
    }

    // Neither ready OR Friend ready, I'm not -> I'm ready
    setIsUserReady(true);
  };

  // Simulation control removed

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/settings-game');
    }
  };

  const handleChangeSettingsClick = () => {
    triggerHaptic(10);
    setShowAllSettingsModal(true);
    onChangeSettings?.();
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    if (onLeave) {
      onLeave();
    } else {
      navigate('/home');
    }
  };

  // Dynamic Game Chips:
  const blackChips = useMemo(() => {
    const list: { id: string; text: string; icon?: string }[] = [];

    // Selected Mode chip
    if (gameSettings.mode === 'trivia') {
      list.push({ id: 'mode-trivia', text: 'Trivia', icon: GAME_SETTINGS_ICON_MAP['Trivia'] });
    } else if (gameSettings.mode === 'know-me') {
      list.push({ id: 'mode-knowme', text: 'Know me', icon: GAME_SETTINGS_ICON_MAP['Know me'] });
    } else if (gameSettings.mode === 'mixed') {
      list.push({ id: 'mode-mixed', text: 'Mixed', icon: GAME_SETTINGS_ICON_MAP['Mixed'] });
    }

    // Selected Categories chips
    const categories = gameSettings.categories || ['Food', 'Movies', 'Music'];
    categories.forEach((cat, idx) => {
      if (cat.toLowerCase() === 'trivia' && gameSettings.mode === 'trivia') return;
      list.push({
        id: `cat-${idx}-${cat}`,
        text: cat,
        icon: GAME_SETTINGS_ICON_MAP[cat] || undefined,
      });
    });

    return list;
  }, [gameSettings]);

  const creamChips = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    if (gameSettings.difficulty) {
      list.push({ id: 'difficulty', text: gameSettings.difficulty });
    }
    if (gameSettings.timer) {
      list.push({ id: 'timer', text: gameSettings.timer });
    }
    if (gameSettings.rounds) {
      list.push({ id: 'rounds', text: `${gameSettings.rounds} rounds` });
    }
    return list;
  }, [gameSettings]);

  const allChips = useMemo(() => {
    return [
      ...blackChips.map((c) => ({ ...c, kind: 'black' as const })),
      ...creamChips.map((c) => ({ ...c, kind: 'cream' as const })),
    ];
  }, [blackChips, creamChips]);

  const shouldTruncate = allChips.length > 5;
  const displayedChips = shouldTruncate ? allChips.slice(0, 4) : allChips;
  const hiddenCount = allChips.length - displayedChips.length;

  // Dynamic Measurement of Game Chips container height
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const [measuredChipsHeight, setMeasuredChipsHeight] = useState<number>(76.6);

  useEffect(() => {
    const measure = () => {
      if (chipsRef.current) {
        const h = chipsRef.current.offsetHeight;
        if (h > 0) {
          setMeasuredChipsHeight(h);
        }
      }
    };
    measure();
    const timeout = setTimeout(measure, 50);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && chipsRef.current) {
      observer = new ResizeObserver(measure);
      observer.observe(chipsRef.current);
    }

    return () => {
      clearTimeout(timeout);
      if (observer) observer.disconnect();
    };
  }, [blackChips, creamChips]);

  // ---------------- VIEWPORT & RESPONSIVE SOLVER ----------------
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? (window.visualViewport?.height ?? window.innerHeight) : 844,
  }));

  // URL Query params
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const isDebug = searchParams.get('debug') === '1';
  const isOverlay = searchParams.get('overlay') === '1';
  const insetParam = parseInt(searchParams.get('inset') || '0', 10) || 0;
  const frameParam = searchParams.get('frame');

  useEffect(() => {
    const updateViewport = () => {
      const vh = (window.visualViewport?.height ?? window.innerHeight) - insetParam;
      const vw = window.visualViewport?.width ?? window.innerWidth;
      setViewport({ width: vw, height: vh });
    };

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }
    updateViewport();

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, [insetParam]);

  const effectiveViewport = useMemo(() => {
    if (frameParam && frameParam.includes('x')) {
      const [fw, fh] = frameParam.split('x').map(Number);
      if (!isNaN(fw) && !isNaN(fh) && fw > 0 && fh > 0) {
        return { width: fw, height: fh - insetParam };
      }
    }
    return viewport;
  }, [viewport, frameParam, insetParam]);

  // Robust Dynamic Layout Calculation
  const layout = useMemo(() => {
    const vw = effectiveViewport.width;
    const vh = effectiveViewport.height;

    // Scale horizontally up to 390 stage
    const scale = Math.min(vw / 390, 1.25);
    const availableH = vh / scale;

    const cardHeight = 228.9;
    const chipsH = Math.max(34.3, measuredChipsHeight);

    // Minimum compact base height needed
    const minNeededH = 20 + 35 + 10 + 78 + 10 + cardHeight + 12 + 28 + 8 + chipsH + 16 + 47.5 + 10 + 47.7 + 14 + 30 + 16;
    const baseTargetH = Math.max(availableH, minNeededH, 844);

    // Expansion distribution factor on tall screens
    const extraH = Math.max(0, baseTargetH - minNeededH);
    const r = Math.min(1.6, extraH / 140);

    const backTop = 22 + r * 10;
    const headTop = backTop + 35 + (10 + r * 5);
    const cardTop = headTop + 78 + (10 + r * 7);
    const gameTop = cardTop + cardHeight + (12 + r * 7);
    const chipsTop = gameTop + 28 + 8;
    // Nudge top placed strictly BELOW measured chips container
    const nudgeTop = chipsTop + chipsH + (16 + r * 10);
    const readyTop = nudgeTop + 47.5 + 10;
    const linksTop = readyTop + 47.7 + (14 + r * 6);

    const totalContentBottom = linksTop + 30 + 20;
    const stageHeight = Math.max(baseTargetH, totalContentBottom);

    const starTop = stageHeight - 86.1 - 5.5;
    const crossTop = stageHeight - 72.8 - 4.0;
    const heartTop = headTop + 24;

    return {
      scale,
      stageHeight,
      cardHeight,
      backTop,
      headTop,
      cardTop,
      gameTop,
      chipsTop,
      nudgeTop,
      readyTop,
      linksTop,
      starTop,
      crossTop,
      heartTop,
    };
  }, [effectiveViewport, measuredChipsHeight]);

  // Card Inner Positions based on cardTop and cardHeight
  const alexCenterY = layout.cardTop + 90.4;
  const samCenterY = layout.cardTop + 91.4;
  const starburstY = layout.cardTop + 63.6;
  const playerNamesY = layout.cardTop + 152.9;
  const pillsY = layout.cardTop + 167.1;

  // Typing dots animation CSS injection
  useEffect(() => {
    const styleId = 'lobby-typing-dots-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes lobbyTypingDot1 {
          0%, 15% { opacity: 0; }
          20%, 100% { opacity: 1; }
        }
        @keyframes lobbyTypingDot2 {
          0%, 35% { opacity: 0; }
          40%, 100% { opacity: 1; }
        }
        @keyframes lobbyTypingDot3 {
          0%, 55% { opacity: 0; }
          60%, 100% { opacity: 1; }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Subtitle text based on exact 4 states
  const subtitleText = useMemo(() => {
    if (isUserReady && isFriendReady) {
      return "Both ready. Let's go!";
    }
    if (isUserReady && !isFriendReady) {
      return `Waiting for ${friendName} to get ready.`;
    }
    if (!isUserReady && isFriendReady) {
      return `${friendName} is ready. Your turn!`;
    }
    return `Waiting for you and ${friendName} to get ready.`;
  }, [isUserReady, isFriendReady, friendName]);

  // Main button text based on exact 4 states
  const mainButtonText = useMemo(() => {
    if (isUserReady && isFriendReady) {
      return 'Start game';
    }
    if (isUserReady && !isFriendReady) {
      return 'Cancel ready';
    }
    return "I'm ready";
  }, [isUserReady, isFriendReady]);

  // Presets for debug bar
  const PRESETS = [
    { label: '360x625', w: 360, h: 625 },
    { label: '360x640', w: 360, h: 640 },
    { label: '375x667', w: 375, h: 667 },
    { label: '375x812', w: 375, h: 812 },
    { label: '390x844', w: 390, h: 844 },
    { label: '393x852', w: 393, h: 852 },
    { label: '412x915', w: 412, h: 915 },
    { label: '430x932', w: 430, h: 932 },
    { label: '768x1024', w: 768, h: 1024 },
  ];

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden flex justify-center items-start select-none font-['Nunito',sans-serif]"
      style={{
        backgroundColor: '#F6EFDD',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
    >
      {/* ---------------- STAGE WRAPPER ---------------- */}
      <div
        id="lobby-stage-container"
        className="md:hidden"
        style={{
          width: `${390 * layout.scale}px`,
          height: `${layout.stageHeight * layout.scale}px`,
          minHeight: '100%',
          position: 'relative',
          flexShrink: 0,
          backgroundColor: '#F6EFDD',
        }}
      >
        <div
          id="lobby-stage"
          style={{
            width: '390px',
            height: `${layout.stageHeight}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${layout.scale})`,
            transformOrigin: 'top left',
            backgroundColor: '#F6EFDD',
            overflow: 'hidden',
          }}
        >
          {/* ---------------- Z0: BACKGROUND DECORATIONS ---------------- */}

          {/* Moon: Top right flush */}
          <img
            src="/assets/lobby/deco-moon-yellow.webp"
            alt=""
            loading="eager"
            decoding="sync"
            style={{
              position: 'absolute',
              left: '319.5px',
              top: 0,
              width: '61.3px',
              height: '67.3px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            draggable={false}
          />

          {/* Heart: Right flush */}
          <img
            src="/assets/lobby/deco-heart-pink.webp"
            alt=""
            loading="eager"
            decoding="sync"
            style={{
              position: 'absolute',
              left: '350.2px',
              top: `${layout.heartTop}px`,
              width: '39.8px',
              height: '49.4px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            draggable={false}
          />

          {/* Star: Bottom left (dynamically anchored to stage bottom) */}
          <img
            src="/assets/lobby/deco-star-blue.webp"
            alt=""
            loading="eager"
            decoding="sync"
            style={{
              position: 'absolute',
              left: '0px',
              top: `${layout.starTop}px`,
              width: '76.9px',
              height: '86.1px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            draggable={false}
          />

          {/* Cross: Bottom right (dynamically anchored to stage bottom) */}
          <img
            src="/assets/lobby/deco-cross-olive.webp"
            alt=""
            loading="eager"
            decoding="sync"
            style={{
              position: 'absolute',
              left: '310.3px',
              top: `${layout.crossTop}px`,
              width: '76.0px',
              height: '72.8px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            draggable={false}
          />

          {/* ---------------- BACK BUTTON ---------------- */}
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="Go back"
            style={{
              position: 'absolute',
              left: '24px',
              top: `${layout.backTop}px`,
              width: '35px',
              height: '35px',
              borderRadius: '9999px',
              border: '1.5px dashed #17181B',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
            className="active:scale-95 transition-transform"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#17181B"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Simulation control removed */}

          {/* ---------------- HEAD BLOCK ---------------- */}
          <div
            style={{
              position: 'absolute',
              left: '28px',
              top: `${layout.headTop}px`,
              width: '334px',
              zIndex: 5,
            }}
          >
            <h1
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '51px',
                lineHeight: '1',
                letterSpacing: '-0.02em',
                color: '#000000',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Lobby
            </h1>

            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '16.5px',
                lineHeight: '1.2',
                color: '#686A75',
                marginTop: '8px',
                marginBottom: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {subtitleText}
            </p>
          </div>

          {/* ---------------- CARD & PLAYERS BLOCK ---------------- */}
          {/* Yellow Wobbly Card Background */}
          <img
            src="/assets/lobby/hero-card-yellow.webp"
            alt=""
            style={{
              position: 'absolute',
              left: '16.5px',
              top: `${layout.cardTop}px`,
              width: '357.0px',
              height: `${layout.cardHeight}px`,
              objectFit: 'fill',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            draggable={false}
          />

          {/* Sparkles */}
          <img
            src="/assets/lobby/sparkle-left.webp"
            alt=""
            style={{
              position: 'absolute',
              left: '30.2px',
              top: `${alexCenterY - 30.9}px`,
              width: '24.7px',
              height: '61.8px',
              pointerEvents: 'none',
              zIndex: 2,
            }}
            draggable={false}
          />

          <img
            src="/assets/lobby/sparkle-right.webp"
            alt=""
            style={{
              position: 'absolute',
              left: '340.1px',
              top: `${samCenterY - 29.3}px`,
              width: '24.7px',
              height: '58.6px',
              pointerEvents: 'none',
              zIndex: 2,
            }}
            draggable={false}
          />

          {/* VS Starburst */}
          <div
            style={{
              position: 'absolute',
              left: '161.1px',
              top: `${starburstY}px`,
              width: '68.2px',
              height: '66.8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <img
              src="/assets/lobby/badge-vs-starburst.webp"
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
            <span
              style={{
                position: 'relative',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '26px',
                lineHeight: '1',
                color: '#17181B',
                letterSpacing: '-0.02em',
              }}
            >
              VS
            </span>
          </div>

          {/* Alex Avatar Slot (center: 117, alexCenterY; size: 98x98) */}
          <div
            style={{
              position: 'absolute',
              left: `${117 - 49}px`,
              top: `${alexCenterY - 49}px`,
              width: '98px',
              height: '98px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProfileAvatar
              avatarId={currentUser.avatarId}
              blobId={currentUser.color}
              size={98}
              useNewBlob={true}
            />
          </div>

          {/* Alex Name */}
          <div
            style={{
              position: 'absolute',
              left: '117px',
              top: `${playerNamesY}px`,
              transform: 'translate(-50%, -50%)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '19px',
              lineHeight: '1.1',
              color: '#000000',
              whiteSpace: 'nowrap',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              zIndex: 4,
            }}
          >
            {currentUser.name}
          </div>

          {/* Alex Pill */}
          <div
            style={{
              position: 'absolute',
              left: `${117 - 43}px`,
              top: `${pillsY}px`,
              width: '86px',
              height: '26px',
              borderRadius: '9999px',
              backgroundColor: isUserReady ? '#17181B' : '#FBEAB2',
              color: isUserReady ? '#FFFFFF' : '#686A75',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '13.5px',
              lineHeight: '1',
              zIndex: 4,
            }}
          >
            {isUserReady ? (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Ready</span>
              </>
            ) : (
              <span>Not ready</span>
            )}
          </div>

          {/* Sam Avatar Slot (center: 273, samCenterY; size: 98x98) */}
          <div
            style={{
              position: 'absolute',
              left: `${273 - 49}px`,
              top: `${samCenterY - 49}px`,
              width: '98px',
              height: '98px',
              opacity: isFriendReady ? 1.0 : 0.6,
              transition: 'opacity 0.25s ease',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ProfileAvatar
              avatarId={partnerProfile.avatarId}
              blobId={partnerProfile.color}
              size={98}
              useNewBlob={true}
            />
          </div>

          {/* Clock Badge */}
          {!isFriendReady && (
            <div
              style={{
                position: 'absolute',
                left: `${273 + 31 - 12}px`,
                top: `${samCenterY + 31 - 12}px`,
                width: '24px',
                height: '24px',
                borderRadius: '9999px',
                backgroundColor: '#23272B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          )}

          {/* Sam Name */}
          <div
            style={{
              position: 'absolute',
              left: '273px',
              top: `${playerNamesY}px`,
              transform: 'translate(-50%, -50%)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '19px',
              lineHeight: '1.1',
              color: '#000000',
              whiteSpace: 'nowrap',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              zIndex: 4,
            }}
          >
            {friendName}
          </div>

          {/* Sam Pill */}
          <div
            style={{
              position: 'absolute',
              left: `${273 - 43}px`,
              top: `${pillsY}px`,
              width: '86px',
              height: '26px',
              borderRadius: '9999px',
              backgroundColor: isFriendReady ? '#17181B' : '#FBEAB2',
              color: isFriendReady ? '#FFFFFF' : '#686A75',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '13.5px',
              lineHeight: '1',
              zIndex: 4,
            }}
          >
            {isFriendReady ? (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Ready</span>
              </>
            ) : (
              <div className="flex items-center">
                <span>Waiting</span>
                <span className="inline-flex tracking-tight ml-[1px]">
                  <span style={{ animation: 'lobbyTypingDot1 1.4s infinite' }}>.</span>
                  <span style={{ animation: 'lobbyTypingDot2 1.4s infinite' }}>.</span>
                  <span style={{ animation: 'lobbyTypingDot3 1.4s infinite' }}>.</span>
                </span>
              </div>
            )}
          </div>

          {/* ---------------- GAME SECTION TITLE ---------------- */}
          <div
            style={{
              position: 'absolute',
              left: '27.5px',
              top: `${layout.gameTop}px`,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '26px',
              lineHeight: '28px',
              color: '#161B1E',
              zIndex: 5,
            }}
          >
            Game
          </div>

          {/* ---------------- DYNAMIC GAME CHIPS ---------------- */}
          <div
            ref={chipsRef}
            style={{
              position: 'absolute',
              left: '22px',
              top: `${layout.chipsTop}px`,
              width: '346px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px 8px',
              zIndex: 5,
            }}
          >
            {displayedChips.map((chip) =>
              chip.kind === 'black' ? (
                <div
                  key={chip.id}
                  style={{
                    height: '34.3px',
                    borderRadius: '34.3px',
                    backgroundColor: '#161B1E',
                    color: '#FFFFFF',
                    padding: chip.icon ? '0 14px 0 10px' : '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    lineHeight: '1',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {chip.icon && (
                    <img
                      src={chip.icon}
                      alt=""
                      style={{ width: '21px', height: '21px', objectFit: 'contain' }}
                      draggable={false}
                    />
                  )}
                  <span>{chip.text}</span>
                </div>
              ) : (
                <div
                  key={chip.id}
                  style={{
                    height: '34.3px',
                    borderRadius: '34.3px',
                    backgroundColor: '#FCF7EB',
                    color: '#161B1E',
                    padding: '0 15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    lineHeight: '1',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {chip.text}
                </div>
              )
            )}

            {shouldTruncate && (
              <div
                onClick={() => {
                  triggerHaptic(10);
                  setShowAllSettingsModal(true);
                }}
                style={{
                  height: '34.3px',
                  borderRadius: '34.3px',
                  backgroundColor: '#EAE1CE',
                  color: '#17181B',
                  padding: '0 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '13px',
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                className="active:scale-95 transition-transform hover:bg-[#DCD0B8]"
              >
                {`+${hiddenCount} more...`}
              </div>
            )}
          </div>

          {/* ---------------- ACTION BUTTONS & LINKS (Placed dynamically below chips) ---------------- */}

          {/* Nudge Button */}
          <button
            type="button"
            onClick={handleNudge}
            disabled={isNudgeDisabled || isFriendReady}
            style={{
              position: 'absolute',
              left: '27px',
              top: `${layout.nudgeTop}px`,
              width: '336.5px',
              height: '47.5px',
              borderRadius: '9999px',
              backgroundColor: '#EBE2CD',
              color: '#17181B',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '18px',
              cursor: isNudgeDisabled || isFriendReady ? 'default' : 'pointer',
              opacity: isFriendReady ? 0.5 : isNudgeDisabled ? 0.6 : 1.0,
              zIndex: 6,
            }}
            className={!isNudgeDisabled && !isFriendReady ? 'active:scale-[0.98] transition-transform hover:bg-[#E3D9C2]' : ''}
          >
            <span>{`Nudge ${friendName}`}</span>
            <img
              src="/assets/lobby/emoji-wave.webp"
              alt=""
              style={{ width: '20.1px', height: '19.2px', objectFit: 'contain' }}
              draggable={false}
            />
          </button>

          {/* Main Action Button */}
          <button
            type="button"
            onClick={handleMainButtonClick}
            style={{
              position: 'absolute',
              left: '27px',
              top: `${layout.readyTop}px`,
              width: '335px',
              height: '47.7px',
              borderRadius: '9999px',
              backgroundColor: '#17181B',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '22px',
              cursor: 'pointer',
              zIndex: 6,
              boxShadow: '0 4px 12px rgba(23, 24, 27, 0.15)',
            }}
            className="active:scale-[0.98] transition-transform"
          >
            {mainButtonText}
          </button>

          {/* Links Row */}
          <div
            style={{
              position: 'absolute',
              left: '0px',
              width: '390px',
              top: `${layout.linksTop}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '26px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              color: '#6A6C6D',
              zIndex: 6,
            }}
          >
            <button
              type="button"
              onClick={handleChangeSettingsClick}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                color: 'inherit',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Change settings
            </button>

            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                color: 'inherit',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Leave
            </button>
          </div>

          {/* ---------------- OVERLAY MODE (?overlay=1) ---------------- */}
          {isOverlay && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '390px',
                height: '844px',
                pointerEvents: 'none',
                opacity: 0.5,
                zIndex: 999,
              }}
            >
              <img
                src="/mockups/lobby.png"
                alt="Mockup Overlay"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          TABLET & DESKTOP LAYOUT (768px and up: Responsive --u Scale min(vw, dvh))
         ========================================================================= */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative w-full h-[100dvh] overflow-hidden select-none font-['Nunito']"
        style={{
          ['--u' as any]: 'min(calc(100vw / 1586), calc(100dvh / 992))',
          backgroundColor: '#F6EFDD',
        }}
      >
        {/* VIEWPORT FIXED DECORATIONS */}
        <img
          src="/assets/lobby/deco-moon-yellow.webp"
          alt=""
          className="fixed top-0 left-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(100 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/lobby/deco-heart-pink.webp"
          alt=""
          className="fixed top-0 right-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(80 * var(--u))',
            height: 'calc(150 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/lobby/deco-star-blue.webp"
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
          src="/assets/lobby/deco-cross-olive.webp"
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
            onClick={handleBackClick}
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

          {/* Lobby pill center top */}
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
              Game Lobby
            </span>
          </div>

          {/* Settings button on right x=1426, y=75 */}
          <button
            type="button"
            onClick={handleChangeSettingsClick}
            aria-label="Game Settings"
            className="btn-press absolute rounded-full flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
            style={{
              left: 'calc(1426 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(78 * var(--u))',
              height: 'calc(78 * var(--u))',
              border: 'calc(3.5 * var(--u)) dashed #17181B',
            }}
          >
            <img
              src="/icon-gear-settings.webp"
              alt=""
              style={{ width: 'calc(36 * var(--u))', height: 'calc(36 * var(--u))' }}
              className="object-contain"
            />
          </button>

          {/* LEFT COLUMN: x=112 to 770 (658w) */}
          <p
            className="absolute font-bold text-[#191D21]/60 tracking-tight leading-none m-0 z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(166 * var(--u))',
              fontSize: 'calc(34 * var(--u))',
            }}
          >
            Private room
          </p>

          <h1
            className="absolute font-black text-[#191D21] tracking-[-0.03em] leading-none m-0 z-20 whitespace-nowrap"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(212 * var(--u))',
              fontSize: 'calc(92 * var(--u))',
              maxWidth: 'calc(658 * var(--u))',
            }}
          >
            Match lobby
          </h1>

          <p
            className="absolute font-bold text-[#191D21]/70 leading-relaxed m-0 z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(322 * var(--u))',
              width: 'calc(658 * var(--u))',
              fontSize: 'calc(32 * var(--u))',
            }}
          >
            {subtitleText}
          </p>

          {/* Invite Code & Share Card */}
          <div
            className="absolute shadow-sm overflow-hidden z-20 flex flex-col justify-between"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(410 * var(--u))',
              width: 'calc(658 * var(--u))',
              height: 'calc(430 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              backgroundColor: '#FEE36F',
              padding: 'calc(36 * var(--u))',
            }}
          >
            <div>
              <span
                className="font-extrabold uppercase tracking-wider text-[#191D21]/60"
                style={{ fontSize: 'calc(24 * var(--u))' }}
              >
                Invite Your Friend
              </span>
              <div
                className="font-black text-[#191D21] tracking-tight mt-2"
                style={{ fontSize: 'calc(38 * var(--u))' }}
              >
                Share code to play together
              </div>

              {/* Code pill */}
              <div
                className="flex items-center justify-between bg-white/80 rounded-2xl px-6 py-4 mt-6 border-2 border-[#191D21]/10"
                style={{
                  borderRadius: 'calc(24 * var(--u))',
                  padding: 'calc(20 * var(--u)) calc(28 * var(--u))',
                }}
              >
                <span
                  className="font-black text-[#191D21] tracking-widest font-mono"
                  style={{ fontSize: 'calc(42 * var(--u))' }}
                >
                  DUO-8824
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('DUO-8824');
                    showToast('Invite code copied! 📋');
                  }}
                  className="btn-press bg-[#191D21] text-white font-extrabold px-5 py-2.5 rounded-full cursor-pointer border-none outline-none"
                  style={{
                    fontSize: 'calc(22 * var(--u))',
                    borderRadius: 'calc(20 * var(--u))',
                    padding: 'calc(12 * var(--u)) calc(22 * var(--u))',
                  }}
                >
                  Copy code
                </button>
              </div>

              <p
                className="font-medium text-[#191D21]/65 mt-4"
                style={{ fontSize: 'calc(24 * var(--u))', lineHeight: 1.35 }}
              >
                When your friend enters the code or link, their status will instantly flip to Ready.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#191D21]/15">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + '/join?code=DUO-8824');
                  showToast('Invite link copied! 🔗');
                }}
                className="btn-press font-extrabold text-[#191D21] bg-white/60 hover:bg-white px-5 py-3 rounded-full flex items-center gap-2 cursor-pointer border-none"
                style={{
                  fontSize: 'calc(24 * var(--u))',
                  borderRadius: 'calc(24 * var(--u))',
                }}
              >
                <span>🔗 Share invite link</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="font-bold text-[#191D21]/60 hover:text-[#191D21] cursor-pointer bg-transparent border-none"
                style={{ fontSize: 'calc(24 * var(--u))' }}
              >
                Leave lobby
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: x=825 to 1500 (675w, 55 gap) */}
          <h2
            className="absolute font-black text-[#191D21] tracking-tight pointer-events-none select-none m-0 z-20"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(212 * var(--u))',
              fontSize: 'calc(54 * var(--u))',
              lineHeight: 1,
            }}
          >
            Players & status
          </h2>

          {/* Two Players Card */}
          <div
            className="absolute shadow-sm overflow-hidden z-20 flex flex-col justify-between"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(280 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(360 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              backgroundColor: '#FAEECA',
              padding: 'calc(32 * var(--u))',
            }}
          >
            <div className="relative flex items-center justify-around h-full">
              {/* Left Player: You */}
              <div className="flex flex-col items-center">
                <div
                  className="relative"
                  style={{
                    width: 'calc(170 * var(--u))',
                    height: 'calc(170 * var(--u))',
                  }}
                >
                  <ProfileAvatar
                    avatarId={currentUser.avatarId}
                    blobId={currentUser.color}
                    size={170}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-black text-white"
                    style={{
                      backgroundColor: isUserReady ? '#4ADE80' : '#8A8A93',
                      fontSize: 'calc(18 * var(--u))',
                      borderRadius: 'calc(12 * var(--u))',
                    }}
                  >
                    {isUserReady ? 'READY' : 'WAITING'}
                  </div>
                </div>
                <span
                  className="font-black text-[#191D21] mt-3"
                  style={{ fontSize: 'calc(28 * var(--u))' }}
                >
                  {currentUser.name} (You)
                </span>
              </div>

              {/* VS Starburst in center */}
              <div
                className="flex items-center justify-center relative"
                style={{
                  width: 'calc(100 * var(--u))',
                  height: 'calc(100 * var(--u))',
                }}
              >
                <img
                  src="/badge-vs-starburst-yellow.webp"
                  alt=""
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <span
                  className="absolute font-black text-[#191D21] tracking-tighter"
                  style={{ fontSize: 'calc(38 * var(--u))' }}
                >
                  VS
                </span>
              </div>

              {/* Right Player: Friend */}
              <div className="flex flex-col items-center">
                <div
                  className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => setIsFriendReady((r) => !r)}
                  style={{
                    width: 'calc(170 * var(--u))',
                    height: 'calc(170 * var(--u))',
                  }}
                  title="Click to toggle friend ready state"
                >
                  <ProfileAvatar
                    avatarId={partnerProfile.avatarId}
                    blobId={partnerProfile.color}
                    size={170}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-black text-white"
                    style={{
                      backgroundColor: isFriendReady ? '#4ADE80' : '#8A8A93',
                      fontSize: 'calc(18 * var(--u))',
                      borderRadius: 'calc(12 * var(--u))',
                    }}
                  >
                    {isFriendReady ? 'READY' : 'WAITING'}
                  </div>
                </div>
                <span
                  className="font-black text-[#191D21] mt-3"
                  style={{ fontSize: 'calc(28 * var(--u))' }}
                >
                  {friendName}
                </span>
              </div>
            </div>

            {/* Bottom info row in card */}
            <div className="flex items-center justify-between pt-2 border-t border-[#191D21]/10 text-[#191D21]/70 font-bold" style={{ fontSize: 'calc(22 * var(--u))' }}>
              <span>Mode: {gameSettings.mode.toUpperCase()}</span>
              <span>{gameSettings.rounds} Rounds • {gameSettings.timer}</span>
              <button
                type="button"
                onClick={handleChangeSettingsClick}
                className="underline text-[#191D21] font-black cursor-pointer bg-transparent border-none p-0"
              >
                Change rules
              </button>
            </div>
          </div>

          {/* Match Settings Chips Row */}
          <div
            className="absolute z-20 flex items-center justify-between"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(670 * var(--u))',
              width: 'calc(675 * var(--u))',
            }}
          >
            <div className="flex flex-wrap gap-2" style={{ gap: 'calc(8 * var(--u))' }}>
              {gameSettings.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-white/80 text-[#191D21] font-bold px-3 py-1.5 rounded-full shadow-xs"
                  style={{
                    fontSize: 'calc(20 * var(--u))',
                    borderRadius: 'calc(16 * var(--u))',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            {!isFriendReady && (
              <button
                type="button"
                onClick={handleNudge}
                disabled={isNudgeDisabled}
                className="btn-press font-extrabold text-[#191D21] bg-[#FEE36F] hover:bg-[#FDD835] px-4 py-2 rounded-full cursor-pointer border-none outline-none shadow-xs"
                style={{
                  fontSize: 'calc(22 * var(--u))',
                  borderRadius: 'calc(20 * var(--u))',
                }}
              >
                👋 Nudge {friendName}
              </button>
            )}
          </div>

          {/* Main Start / Ready Button: Black pill button, 675w x 80h, font 38, radius 40 */}
          <button
            type="button"
            onClick={handleMainButtonClick}
            className="btn-press absolute bg-[#1A1E22] text-white font-extrabold tracking-tight flex items-center justify-center cursor-pointer shadow-sm outline-none hover:opacity-95 active:scale-98 transition-all z-30"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(760 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(80 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              fontSize: 'calc(38 * var(--u))',
            }}
          >
            {isUserReady && isFriendReady
              ? "Start game"
              : isUserReady
              ? "Cancel ready"
              : "I'm ready!"}
          </button>
        </div>
      </div>

      {/* ---------------- TOAST NOTIFICATION ---------------- */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#17181B',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '9999px',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ---------------- GAME SETTINGS (MORE...) MODAL ---------------- */}
      <GameSettingsModal
        isOpen={showAllSettingsModal}
        onClose={() => setShowAllSettingsModal(false)}
        settings={gameSettings}
        onUpdateSettings={setGameSettings}
      />

      {/* ---------------- LEAVE MODAL ---------------- */}
      {showLeaveModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#17181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-pop select-none"
          onClick={() => setShowLeaveModal(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-[24px] bg-[#F6EFDD] p-6 shadow-2xl relative border border-[#17181B]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '22px',
                color: '#17181B',
                marginBottom: '8px',
              }}
            >
              Leave lobby?
            </h2>
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                color: '#686A75',
                lineHeight: '1.3',
                marginBottom: '20px',
              }}
            >
              Are you sure you want to leave the game? Your friend will be notified.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '9999px',
                  backgroundColor: '#EAE1CE',
                  color: '#17181B',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '9999px',
                  backgroundColor: '#17181B',
                  color: '#FFFFFF',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DEBUG / TESTING BAR (?debug=1) ---------------- */}
      {isDebug && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(23, 24, 27, 0.95)',
            color: '#FFFFFF',
            padding: '10px 14px',
            fontSize: '11px',
            fontFamily: 'monospace',
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 font-bold">
            <span>
              Scale: {layout.scale.toFixed(3)} | H: {layout.stageHeight.toFixed(1)}px | ChipsH: {measuredChipsHeight.toFixed(1)}px
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsUserReady((r) => !r)}
                className="px-2 py-0.5 rounded bg-blue-600 text-white font-sans text-[10px]"
              >
                Toggle Alex ({isUserReady ? 'Ready' : 'Not ready'})
              </button>
              <button
                onClick={() => setIsFriendReady((r) => !r)}
                className="px-2 py-0.5 rounded bg-green-600 text-white font-sans text-[10px]"
              >
                Toggle Sam ({isFriendReady ? 'Ready' : 'Waiting'})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap text-[10px]">
            <span className="text-gray-400">Friend Color:</span>
            {['teal', 'pink', 'blue', 'salmon', 'lime', 'orange'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setPartnerProfile((prev: any) => ({ ...prev, color: c }));
                }}
                className={`px-1.5 py-0.5 rounded font-sans capitalize ${
                  partnerProfile.color === c ? 'bg-amber-400 text-black font-bold' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-400">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('frame', `${p.w}x${p.h}`);
                  window.history.replaceState({}, '', url.toString());
                  setViewport({ width: p.w, height: p.h });
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-sans ${
                  effectiveViewport.width === p.w && effectiveViewport.height === p.h
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
