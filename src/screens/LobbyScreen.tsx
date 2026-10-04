import React, { useState, useEffect, useRef } from 'react';
import {
  useGameStore,
  gameStore,
  COLOR_HEX_MAP,
  PlayerColor,
} from '../store';
import { getBlobImageSrc, getAvatarFaceImageSrc } from '../components/ProfileAvatar';

interface LobbyScreenProps {
  onBackToSettings: () => void;
  onLeave: () => void;
  onStartCountdown: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onBackToSettings,
  onLeave,
  onStartCountdown,
}) => {
  const store = useGameStore();
  const { me, friend, gameSettings, allTime } = store;

  // Viewport tracking (visualViewport if available for exact sizing)
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      const vv = window.visualViewport;
      setViewport({
        w: vv ? vv.width : window.innerWidth,
        h: vv ? vv.height : window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Responsive scale calculations (exactly as specified)
  const vw = Math.min(viewport.w, 430);
  const vh = viewport.h;
  const sx = vw / 390;
  const sy = vh / 844;
  const u = Math.min(sx, sy);

  // Background sync
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.backgroundColor = '#F6EFDD';
    document.body.style.backgroundColor = '#F6EFDD';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Nudge button state & countdown
  const [nudgeCooldown, setNudgeCooldown] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNudge = () => {
    if (nudgeCooldown > 0 || !friend) return;
    setNudgeCooldown(30);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(`Nudge sent to ${friend.name} 👋`);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    if (nudgeCooldown <= 0) return;
    const timer = setInterval(() => {
      setNudgeCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [nudgeCooldown]);

  // Handle "I'm ready" toggle
  const handleToggleReady = () => {
    gameStore.setMeReady(!me.ready);
  };

  // Both ready auto-advance logic
  const isBothReady = me.ready && friend?.ready === true;
  useEffect(() => {
    if (isBothReady) {
      const timer = setTimeout(() => {
        onStartCountdown();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBothReady, onStartCountdown]);

  // Dynamic Subtitle text
  let subtitleText = '';
  if (friend === null) {
    subtitleText = 'Waiting for friend to join...';
  } else if (isBothReady) {
    subtitleText = "Everyone's ready!";
  } else if (me.ready && !friend.ready) {
    subtitleText = `Waiting for ${friend.name}...`;
  } else {
    subtitleText = `Waiting for ${friend.name} to get ready.`;
  }

  // Debug flag
  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  // Category emoji mapping
  const CATEGORY_EMOJIS: Record<string, string> = {
    Food: '/game-settings-decorations/emoji-pizza.webp',
    Dreams: '/game-settings-decorations/emoji-moon.webp',
    Fears: '/game-settings-decorations/emoji-fears.webp',
    Movies: '/game-settings-decorations/emoji-clapper.webp',
    Music: '/game-settings-decorations/emoji-music.webp',
    Travel: '/game-settings-decorations/emoji-plane.webp',
    Science: '/game-settings-decorations/emoji-flask.webp',
    Funny: '/game-settings-decorations/emoji-funny.webp',
    Deep: '/game-settings-decorations/emoji-cloud.webp',
    Random: '/game-settings-decorations/emoji-dice-outline.webp',
  };

  // Mode icon mapping
  const MODE_ICONS: Record<string, string> = {
    trivia: '/game-settings-decorations/icon-bulb.webp',
    'know-me': '/game-settings-decorations/icon-wink.webp',
    mixed: '/game-settings-decorations/icon-dice-color.webp',
  };
  const MODE_LABELS: Record<string, string> = {
    trivia: 'Trivia',
    'know-me': 'Know Me',
    mixed: 'Mixed',
  };

  // Chips calculation with max-4-rows constraint
  // If categories are very numerous, truncate categories and add "+N more"
  const categoriesToDisplay = gameSettings.categories;
  const maxCategoryCount = 7;
  const hasHiddenCategories = categoriesToDisplay.length > maxCategoryCount;
  const visibleCategories = hasHiddenCategories
    ? categoriesToDisplay.slice(0, maxCategoryCount - 1)
    : categoriesToDisplay;
  const hiddenCount = categoriesToDisplay.length - visibleCategories.length;

  return (
    <div
      id="lobby-screen-wrapper"
      className="fixed inset-0 w-full h-full flex justify-center items-center select-none overflow-hidden font-['Nunito',sans-serif]"
      style={{ backgroundColor: '#F6EFDD' }}
    >
      {/* Dynamic Keyframes for Animations */}
      <style>{`
        @keyframes rotateDashedRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulseRingOut {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.45; }
          100% { transform: translate(-50%, -50%) scale(1.14); opacity: 0; }
        }
        @keyframes dotFade {
          0%, 20% { opacity: 0.2; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0.2; }
        }
        .stagger-dot-1 { animation: dotFade 1.2s infinite ease-in-out; }
        .stagger-dot-2 { animation: dotFade 1.2s infinite ease-in-out 0.2s; }
        .stagger-dot-3 { animation: dotFade 1.2s infinite ease-in-out 0.4s; }
      `}</style>

      {/* 390-width stage canvas */}
      <div
        id="lobby-stage"
        className="relative overflow-hidden flex-shrink-0"
        style={{
          width: `${vw}px`,
          height: `${vh}px`,
          backgroundColor: '#F6EFDD',
        }}
      >
        {/* =========================================================================
            CORNER DECORATIONS (Exact positions from Game settings screen)
           ========================================================================= */}
        {/* Crescent, top-right (Snap top/right) */}
        <img
          src="/game-settings-decorations/deco-moon-yellow.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${312.4 * sx}px`,
            top: 0,
            width: `${63.8 * u}px`,
            height: `${63.8 * (143 / 138) * u}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Pink Heart, right edge (Snap right) */}
        <img
          src="/game-settings-decorations/deco-heart-pink.webp"
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            top: `${81.5 * sy}px`,
            width: `${40 * u}px`,
            height: `${40 * (102 / 87) * u}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Blue Star, bottom-left (Glued to bottom-left) */}
        <img
          src="/game-settings-decorations/deco-star-blue.webp"
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            bottom: `${(844 - (789.6 + 41 * (110 / 90))) * sy}px`,
            width: `${41 * u}px`,
            height: `${41 * (110 / 90) * u}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Olive Cross, bottom-right (Glued to bottom-right) */}
        <img
          src="/game-settings-decorations/deco-cross-olive.webp"
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            bottom: `${(844 - (796 + 48 * (103 / 104))) * sy}px`,
            width: `${48 * u}px`,
            height: `${48 * (103 / 104) * u}px`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* =========================================================================
            TOP SECTION: Back Button & Headings
           ========================================================================= */}
        {/* Back Button: dashed 1.5px ink circle 33.4 at (20.1, 19.7), arrow 18px */}
        <button
          type="button"
          onClick={onBackToSettings}
          aria-label="Back to settings"
          style={{
            position: 'absolute',
            left: `${(20.1 + 33.4 / 2) * sx}px`,
            top: `${(19.7 + 33.4 / 2) * sy}px`,
            width: `${33.4 * u}px`,
            height: `${33.4 * u}px`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `${1.5 * u}px dashed #161B1E`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            padding: 0,
            zIndex: 25,
            outline: 'none',
            transition: 'transform 0.12s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        >
          <svg
            width={18 * u}
            height={18 * u}
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

        {/* "Lobby": left x 21.5, y 81.2 (vc), weight 900, size 39 */}
        <h1
          style={{
            position: 'absolute',
            left: `${21.5 * sx}px`,
            top: `${81.2 * sy}px`,
            transform: 'translateY(-50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${39 * u}px`,
            color: '#161B1E',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            margin: 0,
            pointerEvents: 'none',
          }}
        >
          Lobby
        </h1>

        {/* Subtitle: left x 22.9, y 116 (vc), weight 500, size 13.5, muted */}
        <p
          style={{
            position: 'absolute',
            left: `${22.9 * sx}px`,
            top: `${116 * sy}px`,
            transform: 'translateY(-50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 500,
            fontSize: `${13.5 * u}px`,
            color: 'rgba(22, 27, 30, 0.5)',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            margin: 0,
            pointerEvents: 'none',
          }}
        >
          {subtitleText}
        </p>

        {/* =========================================================================
            PLAYERS CARD
           ========================================================================= */}
        {/* card-hero-yellow.webp at (14.6, 150), 361.7 x 250.1 */}
        <img
          src="/card-hero-yellow.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${(14.6 + 361.7 / 2) * sx}px`,
            top: `${(150 + 250.1 / 2) * sy}px`,
            width: `${361.7 * u}px`,
            height: `${250.1 * u}px`,
            transform: 'translate(-50%, -50%)',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 5,
          }}
          draggable={false}
        />

        {/* deco-sparks-yellow-around-avatars.webp at (37, 200.3), 315 x 58.5 */}
        <img
          src="/deco-sparks-yellow-around-avatars.webp"
          alt=""
          style={{
            position: 'absolute',
            left: `${(37 + 315 / 2) * sx}px`,
            top: `${(200.3 + 58.5 / 2) * sy}px`,
            width: `${315 * u}px`,
            height: `${58.5 * u}px`,
            transform: 'translate(-50%, -50%)',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 6,
          }}
          draggable={false}
        />

        {/* ---------------- ME AVATAR SLOT: center (114, 222) ---------------- */}
        <div
          id="slot-me-avatar"
          style={{
            position: 'absolute',
            left: `${114 * sx}px`,
            top: `${222 * sy}px`,
            transform: 'translate(-50%, -50%)',
            width: `${108 * u}px`,
            height: `${108 * u}px`,
            zIndex: 10,
          }}
        >
          {/* Waiting Pulsing Ring */}
          {!me.ready && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${126 * u}px`,
                height: `${126 * u}px`,
                borderRadius: '50%',
                border: `${2.5 * u}px solid ${COLOR_HEX_MAP[me.color] || '#FD8F82'}`,
                pointerEvents: 'none',
                animation: 'pulseRingOut 2s infinite ease-out',
                zIndex: 1,
              }}
            />
          )}

          {/* Waiting Rotating Dashed Ring */}
          {!me.ready && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${126 * u}px`,
                height: `${126 * u}px`,
                borderRadius: '50%',
                border: `${2.5 * u}px dashed ${COLOR_HEX_MAP[me.color] || '#FD8F82'}CC`,
                pointerEvents: 'none',
                animation: 'rotateDashedRing 8s linear infinite',
                zIndex: 2,
              }}
            />
          )}

          {/* Avatar Graphic */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              opacity: me.ready ? 1 : 0.6,
              filter: me.ready ? 'none' : 'grayscale(0.35)',
              transition: 'opacity 250ms ease, filter 250ms ease',
              zIndex: 3,
            }}
          >
            <img
              src={getBlobImageSrc(me.color, me.avatarId)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              draggable={false}
            />
            <img
              src={getAvatarFaceImageSrc(me.avatarId)}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: '74%',
                height: '74%',
                objectFit: 'contain',
              }}
              draggable={false}
            />
          </div>

          {/* Status Badge (Bottom-Right of slot center + (38*u, 38*u)) */}
          <div
            style={{
              position: 'absolute',
              left: `${54 * u + 38 * u}px`,
              top: `${54 * u + 38 * u}px`,
              transform: 'translate(-50%, -50%)',
              width: me.ready ? `${24 * u}px` : `${28 * u}px`,
              height: me.ready ? `${24 * u}px` : `${28 * u}px`,
              borderRadius: '50%',
              backgroundColor: me.ready ? '#161B1E' : '#5C626F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 12,
              transition: 'all 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {me.ready ? (
              <svg width={13 * u} height={13 * u} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width={15 * u} height={15 * u} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </div>
        </div>

        {/* ---------------- FRIEND AVATAR SLOT: center (275.5, 225) ---------------- */}
        <div
          id="slot-friend-avatar"
          style={{
            position: 'absolute',
            left: `${275.5 * sx}px`,
            top: `${225 * sy}px`,
            transform: 'translate(-50%, -50%)',
            width: `${108 * u}px`,
            height: `${108 * u}px`,
            zIndex: 10,
          }}
        >
          {friend ? (
            <>
              {/* Waiting Pulsing Ring */}
              {!friend.ready && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${126 * u}px`,
                    height: `${126 * u}px`,
                    borderRadius: '50%',
                    border: `${2.5 * u}px solid ${COLOR_HEX_MAP[friend.color] || '#02CCC3'}`,
                    pointerEvents: 'none',
                    animation: 'pulseRingOut 2s infinite ease-out',
                    zIndex: 1,
                  }}
                />
              )}

              {/* Waiting Rotating Dashed Ring */}
              {!friend.ready && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${126 * u}px`,
                    height: `${126 * u}px`,
                    borderRadius: '50%',
                    border: `${2.5 * u}px dashed ${COLOR_HEX_MAP[friend.color] || '#02CCC3'}CC`,
                    pointerEvents: 'none',
                    animation: 'rotateDashedRing 8s linear infinite',
                    zIndex: 2,
                  }}
                />
              )}

              {/* Avatar Graphic */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  opacity: friend.ready ? 1 : 0.6,
                  filter: friend.ready ? 'none' : 'grayscale(0.35)',
                  transition: 'opacity 250ms ease, filter 250ms ease',
                  zIndex: 3,
                }}
              >
                <img
                  src={getBlobImageSrc(friend.color, friend.avatarId)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  draggable={false}
                />
                <img
                  src={getAvatarFaceImageSrc(friend.avatarId)}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    margin: 'auto',
                    width: '74%',
                    height: '74%',
                    objectFit: 'contain',
                  }}
                  draggable={false}
                />
              </div>

              {/* Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  left: `${54 * u + 38 * u}px`,
                  top: `${54 * u + 38 * u}px`,
                  transform: 'translate(-50%, -50%)',
                  width: friend.ready ? `${24 * u}px` : `${28 * u}px`,
                  height: friend.ready ? `${24 * u}px` : `${28 * u}px`,
                  borderRadius: '50%',
                  backgroundColor: friend.ready ? '#161B1E' : '#5C626F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  zIndex: 12,
                  transition: 'all 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {friend.ready ? (
                  <svg width={13 * u} height={13 * u} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width={15 * u} height={15 * u} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>
            </>
          ) : (
            /* Empty dashed slot when friend has not joined */
            <div
              style={{
                width: `${108 * u}px`,
                height: `${108 * u}px`,
                borderRadius: '50%',
                border: `${2.5 * u}px dashed rgba(22, 27, 30, 0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: `${34 * u}px`,
                  fontWeight: 900,
                  color: 'rgba(22, 27, 30, 0.3)',
                  lineHeight: 1,
                }}
              >
                ?
              </span>
            </div>
          )}
        </div>

        {/* ---------------- VS BADGE: centered at (194.1, 225.5), 73.6 x 77.7 ---------------- */}
        <div
          id="badge-vs-starburst"
          style={{
            position: 'absolute',
            left: `${194.1 * sx}px`,
            top: `${225.5 * sy}px`,
            transform: 'translate(-50%, -50%)',
            width: `${73.6 * u}px`,
            height: `${77.7 * u}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/badge-vs-starburst-yellow.webp"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '52%',
              transform: 'translate(-50%, -50%) scaleX(1)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: `${24 * u}px`,
              color: '#161B1E',
              lineHeight: 1,
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
            }}
          >
            VS
          </span>
        </div>

        {/* ---------------- PLAYER NAMES ---------------- */}
        {/* ME: c at (114, 301), weight 900, size 17.5, ink with " (you)" in size 12 */}
        <div
          id="name-me"
          style={{
            position: 'absolute',
            left: `${114 * sx}px`,
            top: `${301 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${17.5 * u}px`,
            color: '#161B1E',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            zIndex: 12,
            pointerEvents: 'none',
          }}
        >
          {me.name}
          <span
            style={{
              fontWeight: 600,
              fontSize: `${12 * u}px`,
              color: 'rgba(22, 27, 30, 0.5)',
              marginLeft: `${2 * u}px`,
            }}
          >
            {' '}(you)
          </span>
        </div>

        {/* FRIEND: c at (275.5, 301), weight 900, size 17.5, ink */}
        <div
          id="name-friend"
          style={{
            position: 'absolute',
            left: `${275.5 * sx}px`,
            top: `${301 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${17.5 * u}px`,
            color: '#161B1E',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            zIndex: 12,
            pointerEvents: 'none',
          }}
        >
          {friend ? friend.name : 'Waiting...'}
        </div>

        {/* ---------------- STATUS PILLS: 96 x 26, fully rounded ---------------- */}
        {/* ME status pill: center (114, 326) */}
        <div
          id="status-pill-me"
          style={{
            position: 'absolute',
            left: `${114 * sx}px`,
            top: `${326 * sy}px`,
            transform: 'translate(-50%, -50%)',
            width: `${96 * u}px`,
            height: `${26 * u}px`,
            borderRadius: '9999px',
            backgroundColor: me.ready ? '#161B1E' : '#FCF7EB',
            color: me.ready ? '#FFFFFF' : '#161B1E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${4 * u}px`,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: `${12.3 * u}px`,
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            zIndex: 12,
            transition: 'background-color 200ms ease, color 200ms ease',
          }}
        >
          {me.ready ? (
            <>
              <span>Ready</span>
              <svg width={11 * u} height={11 * u} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scale(1)', transition: 'transform 200ms' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </>
          ) : (
            <>
              <span>Waiting</span>
              <div style={{ display: 'flex', gap: `${2 * u}px`, alignItems: 'center' }}>
                <span className="stagger-dot-1" style={{ width: `${3 * u}px`, height: `${3 * u}px`, borderRadius: '50%', backgroundColor: '#8A8A93' }} />
                <span className="stagger-dot-2" style={{ width: `${3 * u}px`, height: `${3 * u}px`, borderRadius: '50%', backgroundColor: '#8A8A93' }} />
                <span className="stagger-dot-3" style={{ width: `${3 * u}px`, height: `${3 * u}px`, borderRadius: '50%', backgroundColor: '#8A8A93' }} />
              </div>
            </>
          )}
        </div>

        {/* FRIEND status pill: center (275.5, 326) */}
        <div
          id="status-pill-friend"
          style={{
            position: 'absolute',
            left: `${275.5 * sx}px`,
            top: `${326 * sy}px`,
            transform: 'translate(-50%, -50%)',
            width: `${96 * u}px`,
            height: `${26 * u}px`,
            borderRadius: '9999px',
            backgroundColor: friend?.ready ? '#161B1E' : '#FCF7EB',
            color: friend?.ready ? '#FFFFFF' : '#161B1E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${4 * u}px`,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: `${12.3 * u}px`,
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            zIndex: 12,
            transition: 'background-color 200ms ease, color 200ms ease',
          }}
        >
          {friend ? (
            friend.ready ? (
              <>
                <span>Ready</span>
                <svg width={11 * u} height={11 * u} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            ) : (
              <>
                <span>Waiting</span>
                <div style={{ display: 'flex', gap: `${2 * u}px`, alignItems: 'center' }}>
                  <span className="stagger-dot-1" style={{ width: `${3 * u}px`, height: `${3 * u}px`, borderRadius: '50%', backgroundColor: '#8A8A93' }} />
                  <span className="stagger-dot-2" style={{ width: `${3 * u}px`, height: `${3 * u}px`, borderRadius: '50%', backgroundColor: '#8A8A93' }} />
                  <span className="stagger-dot-3" style={{ width: `${3 * u}px`, height: `${3 * u}px`, borderRadius: '50%', backgroundColor: '#8A8A93' }} />
                </div>
              </>
            )
          ) : (
            <span style={{ color: 'rgba(22, 27, 30, 0.45)' }}>Not joined</span>
          )}
        </div>

        {/* "All-time: 7 - 5": c at (194.8, 376), weight 600, size 12.5, muted */}
        <p
          id="text-all-time"
          style={{
            position: 'absolute',
            left: `${194.8 * sx}px`,
            top: `${376 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 600,
            fontSize: `${12.5 * u}px`,
            color: 'rgba(22, 27, 30, 0.5)',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            margin: 0,
            zIndex: 12,
            pointerEvents: 'none',
          }}
        >
          All-time: {allTime.me} - {allTime.friend}
        </p>

        {/* =========================================================================
            GAME RULES CHIP AREA
           ========================================================================= */}
        {/* Section title "Game": left 21.9, y 428 (vc), weight 900, size 17.5 */}
        <h2
          id="title-game-rules"
          style={{
            position: 'absolute',
            left: `${21.9 * sx}px`,
            top: `${428 * sy}px`,
            transform: 'translateY(-50%)',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: `${17.5 * u}px`,
            color: '#161B1E',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            margin: 0,
            pointerEvents: 'none',
          }}
        >
          Game
        </h2>

        {/* Chip area: left 22, top 446, width 347, max 4 rows */}
        <div
          id="game-rules-chip-area"
          style={{
            position: 'absolute',
            left: `${22 * sx}px`,
            top: `${446 * sy}px`,
            width: `${347 * sx}px`,
            maxHeight: `${(34.3 * 4 + 8.6 * 3) * u + 4 * u}px`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${8.6 * u}px`,
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* 1. Mode Chip */}
          <div
            style={{
              height: `${34.3 * u}px`,
              borderRadius: '9999px',
              padding: `0 ${12 * u}px`,
              backgroundColor: '#161B1E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: `${5 * u}px`,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: `${12.5 * u}px`,
              lineHeight: 1,
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <img
              src={MODE_ICONS[gameSettings.mode] || '/game-settings-decorations/icon-bulb.webp'}
              alt=""
              style={{ width: `${21 * u}px`, height: `${21 * u}px`, objectFit: 'contain' }}
              draggable={false}
            />
            <span>{MODE_LABELS[gameSettings.mode] || 'Trivia'}</span>
          </div>

          {/* 2. Category Chips */}
          {visibleCategories.map((cat) => (
            <div
              key={cat}
              style={{
                height: `${34.3 * u}px`,
                borderRadius: '9999px',
                padding: `0 ${12 * u}px`,
                backgroundColor: '#161B1E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: `${5 * u}px`,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: `${12.5 * u}px`,
                lineHeight: 1,
                letterSpacing: '0px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {CATEGORY_EMOJIS[cat] && (
                <img
                  src={CATEGORY_EMOJIS[cat]}
                  alt=""
                  style={{ width: `${21 * u}px`, height: `${21 * u}px`, objectFit: 'contain' }}
                  draggable={false}
                />
              )}
              <span>{cat}</span>
            </div>
          ))}

          {/* "+N more" Chip if categories exceeded max */}
          {hasHiddenCategories && (
            <div
              style={{
                height: `${34.3 * u}px`,
                borderRadius: '9999px',
                padding: `0 ${12 * u}px`,
                backgroundColor: '#FCF7EB',
                color: '#161B1E',
                display: 'flex',
                alignItems: 'center',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: `${12.5 * u}px`,
                lineHeight: 1,
                letterSpacing: '0px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              +{hiddenCount} more
            </div>
          )}

          {/* 3. Difficulty Chip */}
          <div
            style={{
              height: `${34.3 * u}px`,
              borderRadius: '9999px',
              padding: `0 ${12 * u}px`,
              backgroundColor: '#FCF7EB',
              color: '#161B1E',
              display: 'flex',
              alignItems: 'center',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: `${12.5 * u}px`,
              lineHeight: 1,
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {gameSettings.difficulty}
          </div>

          {/* 4. Timer Chip */}
          <div
            style={{
              height: `${34.3 * u}px`,
              borderRadius: '9999px',
              padding: `0 ${12 * u}px`,
              backgroundColor: '#FCF7EB',
              color: '#161B1E',
              display: 'flex',
              alignItems: 'center',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: `${12.5 * u}px`,
              lineHeight: 1,
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {gameSettings.timerSeconds ? `${gameSettings.timerSeconds}s timer` : 'No timer'}
          </div>

          {/* 5. Rounds Chip */}
          <div
            style={{
              height: `${34.3 * u}px`,
              borderRadius: '9999px',
              padding: `0 ${12 * u}px`,
              backgroundColor: '#FCF7EB',
              color: '#161B1E',
              display: 'flex',
              alignItems: 'center',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: `${12.5 * u}px`,
              lineHeight: 1,
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {gameSettings.rounds} rounds
          </div>

          {/* 6. Speed bonus Chip */}
          {gameSettings.speedBonus && (
            <div
              style={{
                height: `${34.3 * u}px`,
                borderRadius: '9999px',
                padding: `0 ${12 * u}px`,
                backgroundColor: '#FCF7EB',
                color: '#161B1E',
                display: 'flex',
                alignItems: 'center',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: `${12.5 * u}px`,
                lineHeight: 1,
                letterSpacing: '0px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Speed bonus
            </div>
          )}
        </div>

        {/* =========================================================================
            BUTTONS & LINKS
           ========================================================================= */}
        {/* "Nudge {friend} 👋": x 43, y 652, 304 x 32 (width 304*sx), cream, ink text weight 800 size 13 */}
        <button
          type="button"
          onClick={handleNudge}
          disabled={nudgeCooldown > 0 || !friend}
          className="cursor-pointer outline-none select-none transition-all active:scale-[0.98]"
          style={{
            position: 'absolute',
            left: `${(43 + 304 / 2) * sx}px`,
            top: `${(652 + 32 / 2) * sy}px`,
            width: `${304 * sx}px`,
            height: `${32 * u}px`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '9999px',
            backgroundColor: '#FCF7EB',
            color: '#161B1E',
            border: 'none',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: `${13 * u}px`,
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            opacity: !friend ? 0.4 : 1,
          }}
        >
          {nudgeCooldown > 0
            ? `Nudge sent ✓ (${nudgeCooldown}s)`
            : friend
            ? `Nudge ${friend.name} 👋`
            : 'Friend not joined'}
        </button>

        {/* "I'm ready": x 43, y 692, 304 x 38, #161B1E, white text weight 800 size 14 */}
        <button
          type="button"
          onClick={handleToggleReady}
          className="cursor-pointer outline-none select-none transition-all active:scale-[0.98]"
          style={{
            position: 'absolute',
            left: `${(43 + 304 / 2) * sx}px`,
            top: `${(692 + 38 / 2) * sy}px`,
            width: `${304 * sx}px`,
            height: `${38 * u}px`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '9999px',
            backgroundColor: me.ready ? '#FCF7EB' : '#161B1E',
            color: me.ready ? '#161B1E' : '#FFFFFF',
            border: 'none',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: `${14 * u}px`,
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'background-color 200ms ease, color 200ms ease, transform 120ms ease',
          }}
        >
          {me.ready ? 'Ready ✓ (tap to undo)' : "I'm ready"}
        </button>

        {/* "Change settings" link (host only; guests don't see it; center y 756) */}
        {me.isHost && (
          <button
            type="button"
            onClick={onBackToSettings}
            className="cursor-pointer outline-none select-none hover:underline"
            style={{
              position: 'absolute',
              left: `${195 * sx}px`,
              top: `${756 * sy}px`,
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: `${12.5 * u}px`,
              color: 'rgba(22, 27, 30, 0.5)',
              lineHeight: 1,
              letterSpacing: '0px',
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            Change settings
          </button>
        )}

        {/* "Leave" link: center y 780, goes back to Home */}
        <button
          type="button"
          onClick={onLeave}
          className="cursor-pointer outline-none select-none hover:underline"
          style={{
            position: 'absolute',
            left: `${195 * sx}px`,
            top: `${780 * sy}px`,
            transform: 'translate(-50%, -50%)',
            background: 'transparent',
            border: 'none',
            padding: 0,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: `${12.5 * u}px`,
            color: 'rgba(22, 27, 30, 0.5)',
            lineHeight: 1,
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
            zIndex: 20,
          }}
        >
          Leave
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
              fontSize: `${14 * u}px`,
              padding: `${10 * u}px ${20 * u}px`,
              borderRadius: `${24 * u}px`,
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
          DEV / DEBUG PANEL (?debug=1)
         ========================================================================= */}
      {isDebug && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            left: 10,
            right: 10,
            maxHeight: '40vh',
            overflowY: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '11px',
            padding: '10px',
            borderRadius: '10px',
            zIndex: 100000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#4ade80' }}>
              DEBUG PANEL | sx: {sx.toFixed(3)}, sy: {sy.toFixed(3)}, u: {u.toFixed(3)}
            </span>
            <span style={{ color: '#999' }}>{viewport.w}x{viewport.h}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={() => gameStore.setFriendReady(!friend?.ready)}
              style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              Toggle Friend Ready ({friend?.ready ? 'Ready' : 'Waiting'})
            </button>
            <button
              type="button"
              onClick={() => gameStore.setMeHost(!me.isHost)}
              style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              Toggle Host ({me.isHost ? 'Host' : 'Guest'})
            </button>
            <button
              type="button"
              onClick={() => {
                const nextId = (me.avatarId % 6) + 1;
                const colors: PlayerColor[] = ['salmon', 'teal', 'indigo', 'pink', 'lime', 'orange'];
                gameStore.setMeAvatar(nextId, colors[nextId - 1]);
              }}
              style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              Cycle My Avatar ({me.avatarId})
            </button>
            <button
              type="button"
              onClick={() => {
                if (!friend) return;
                const nextId = (friend.avatarId % 6) + 1;
                const colors: PlayerColor[] = ['teal', 'salmon', 'indigo', 'pink', 'lime', 'orange'];
                gameStore.setFriendAvatar(nextId, colors[nextId - 1]);
              }}
              style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              Cycle Friend Avatar ({friend?.avatarId ?? 'none'})
            </button>
            <button
              type="button"
              onClick={() => gameStore.toggleFriendPresent()}
              style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              Toggle Friend Present ({friend ? 'Yes' : 'No'})
            </button>
            <button
              type="button"
              onClick={() => {
                const all = ['Food', 'Dreams', 'Fears', 'Movies', 'Music', 'Travel', 'Science', 'Funny', 'Deep', 'Random'];
                const current = gameSettings.categories.length;
                if (current >= 10) {
                  gameStore.updateGameSettings({ categories: ['Food', 'Movies', 'Music'] });
                } else {
                  gameStore.updateGameSettings({ categories: all });
                }
              }}
              style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
            >
              Toggle 3 vs 10 Categories ({gameSettings.categories.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
