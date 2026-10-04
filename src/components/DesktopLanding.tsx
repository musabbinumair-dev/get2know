import React, { useState, useEffect, useMemo } from 'react';
import { ProfileAvatar } from './ProfileAvatar';

interface DesktopLandingProps {
  onGetStarted?: () => void;
  onContinueWithGoogle?: () => Promise<void>;
  onJoinCode?: () => void;
  forcedWidth?: number;
  forcedHeight?: number;
}

export const DesktopLanding: React.FC<DesktopLandingProps> = ({
  onGetStarted,
  onContinueWithGoogle,
  onJoinCode,
  forcedWidth,
  forcedHeight,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // URL query params for debug, overlay, and frame simulation
  const [queryParams, setQueryParams] = useState({
    debug: false,
    overlay: false,
    frame: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      setQueryParams({
        debug: search.get('debug') === '1',
        overlay: search.get('overlay') === '1',
        frame: search.get('frame') || '',
      });
    }
  }, []);

  // Frame switcher state if user selects presets in debug mode
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Viewport tracking (using window.visualViewport if available)
  const [rawViewport, setRawViewport] = useState({
    width: typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 1440,
    height: typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 900,
  });

  useEffect(() => {
    const updateViewport = () => {
      const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setRawViewport({ width: vw, height: vh });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
    };
  }, []);

  // Determine effective viewport dimensions (support forced props, query ?frame=WxH, or preset)
  const viewport = useMemo(() => {
    if (forcedWidth && forcedHeight) {
      return { width: forcedWidth, height: forcedHeight };
    }
    if (selectedPreset) {
      const [w, h] = selectedPreset.split('x').map(Number);
      if (w && h) return { width: w, height: h };
    }
    if (queryParams.frame) {
      const [w, h] = queryParams.frame.split('x').map(Number);
      if (w && h) return { width: w, height: h };
    }
    return rawViewport;
  }, [forcedWidth, forcedHeight, selectedPreset, queryParams.frame, rawViewport]);

  // Updated layout formulas:
  // Scale: s = min(vw / 1440, 1.5, vh / 780)
  // Stage height H = vh / s (always >= 780)
  const vw = viewport.width;
  const vh = viewport.height;
  const s = Math.min(vw / 1440, 1.5, vh / 780);
  const H = vh / s;

  // Group top: Gtop = 148 + 0.475 * (H - 780), main group height 504 (Gtop is 205 at H = 900)
  const Gtop = 148 + 0.475 * (H - 780);

  // Background #F6EFDD for desktop view
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#F6EFDD';
    document.documentElement.style.backgroundColor = '#F6EFDD';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const PRESETS = [
    { label: '1440×900 (s: 1.000, H: 900)', val: '1440x900' },
    { label: '1920×1080 (s: 1.333, H: 810)', val: '1920x1080' },
    { label: '1366×768 (s: 0.949, H: 810)', val: '1366x768' },
    { label: '1280×720 (s: 0.889, H: 810)', val: '1280x720' },
    { label: '1024×768 (s: 0.711, H: 1080)', val: '1024x768' },
    { label: '1180×820 (s: 0.819, H: 1001)', val: '1180x820' },
    { label: '1366×1024 (s: 0.949, H: 1079)', val: '1366x1024' },
    { label: '1024×600 (s: 0.711, H: 844)', val: '1024x600' },
    { label: '2560×1440 (s: 1.500, H: 960)', val: '2560x1440' },
    { label: '1280×560 (s: 0.718, H: 780)', val: '1280x560' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: `${vh}px`,
        backgroundColor: '#F6EFDD',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        userSelect: 'none',
        fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── CORNER DECORATIONS (Anchored to VIEWPORT corners, scaled by s outside stage wrapper) ── */}
      {/* 1. Yellow crescent, top-left: left 0, top 2.7, w 91.7, h 121.7 (cropped by left edge) */}
      <img
        src="/assets/landing-desktop/deco-moon-yellow-topleft.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: 0,
          top: `${2.7 * s}px`,
          width: `${91.7 * s}px`,
          height: `${121.7 * s}px`,
          objectFit: 'contain',
          objectPosition: 'left top',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 2. Pink heart, top-right: right 0, top 16.3, w 91.7, h 102.6 (cropped by right edge) */}
      <img
        src="/assets/landing-desktop/deco-heart-pink-topright.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: 0,
          top: `${16.3 * s}px`,
          width: `${91.7 * s}px`,
          height: `${102.6 * s}px`,
          objectFit: 'contain',
          objectPosition: 'right top',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 3. Blue star, bottom-left: left 14.5, bottom 11.1, w 116.2, h 118.0 */}
      <img
        src="/assets/landing-desktop/deco-star-blue-bottomleft.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: `${14.5 * s}px`,
          bottom: `${11.1 * s}px`,
          width: `${116.2 * s}px`,
          height: `${118.0 * s}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 4. Olive cross, bottom-right: right 113.5, bottom 9.3, w 93.5, h 96.2 */}
      <img
        src="/assets/landing-desktop/deco-cross-olive-bottomright.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${113.5 * s}px`,
          bottom: `${9.3 * s}px`,
          width: `${93.5 * s}px`,
          height: `${96.2 * s}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 5. Yellow crescent, bottom-right: right 10.0, bottom 17.5, w 83.5, h 108.0 */}
      <img
        src="/assets/landing-desktop/deco-moon-yellow-bottomright.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${10.0 * s}px`,
          bottom: `${17.5 * s}px`,
          width: `${83.5 * s}px`,
          height: `${108.0 * s}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── DESIGN STAGE WRAPPER (1440 * s x H * s) ── */}
      <div
        style={{
          position: 'relative',
          width: `${1440 * s}px`,
          height: `${H * s}px`,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '1440px',
            height: `${H}px`,
            transform: `scale(${s})`,
            transformOrigin: 'top left',
            pointerEvents: 'auto',
            outline: queryParams.debug ? '1px dashed #FF5500' : 'none',
          }}
        >
          {/* Mockup Overlay mode (when ?overlay=1 is active) */}
          {queryParams.overlay && (
            <img
              src="/mockups/landing-desktop.png"
              alt="Mockup Overlay"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '1440px',
                height: '900px',
                opacity: 0.5,
                pointerEvents: 'none',
                zIndex: 999,
              }}
            />
          )}

          {/* ── HEADER: Logo group fixed at y: 59, centered on x: 720 ── */}
          <div
            style={{
              position: 'absolute',
              left: '720px',
              top: '59px',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 20,
              outline: queryParams.debug ? '1px solid #4285F4' : 'none',
            }}
          >
            <img
              src="/logo-duo-sparks.webp"
              alt="Get-to-Know-You"
              draggable={false}
              style={{
                width: '92px',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '28px',
                lineHeight: '1',
                letterSpacing: '-0.01em',
                color: '#17181B',
                whiteSpace: 'nowrap',
              }}
            >
              Get-to-Know-You
            </span>
          </div>

          {/* ── MAIN GROUP (One block at Gtop, height: 504px) ── */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: `${Gtop}px`,
              width: '1440px',
              height: '504px',
              zIndex: 10,
              outline: queryParams.debug ? '1px solid #00AA44' : 'none',
            }}
          >
            {/* ════════════ LEFT COLUMN (x from 106) ════════════ */}
            {/* Title: 2 forced lines ("Get-to-" / "Know-You"), Nunito 900 112px, line-height 94px, baselines at dy 91 and dy 185 */}
            <div
              style={{
                position: 'absolute',
                left: '106px',
                top: 0,
                width: '600px',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '112px',
                lineHeight: '94px',
                letterSpacing: '-0.02em',
                color: '#17181B',
                margin: 0,
                padding: 0,
                outline: queryParams.debug ? '1px solid #E91E63' : 'none',
              }}
            >
              <div style={{ position: 'relative', top: '-10px', height: '94px', whiteSpace: 'nowrap' }}>
                Get-to-
              </div>
              <div style={{ position: 'relative', top: '-10px', height: '94px', width: '497px', whiteSpace: 'nowrap' }}>
                Know-You
              </div>
            </div>

            {/* Subtitle: "Two friends. One game.", left x: 107, center dy: 233, Nunito 600 34px, color #7B7C89 */}
            <div
              style={{
                position: 'absolute',
                left: '107px',
                top: '233px',
                transform: 'translateY(-50%)',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '34px',
                lineHeight: '1.2',
                color: '#7B7C89',
                whiteSpace: 'nowrap',
                outline: queryParams.debug ? '1px solid #9C27B0' : 'none',
              }}
            >
              Two friends. One game.
            </div>

            {/* Buttons: top dy: 291, height: 67, fully rounded */}
            {/* 1. "Get started": x 107, w 245, black pill, white text */}
            <button
              type="button"
              onClick={onGetStarted}
              className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#17181B] focus-visible:outline-none select-none"
              style={{
                position: 'absolute',
                left: '107px',
                top: '291px',
                width: '245px',
                height: '67px',
                backgroundColor: '#191B20',
                borderRadius: '9999px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                letterSpacing: '-0.015em',
                transition: 'transform 150ms ease, background-color 150ms ease',
                outline: queryParams.debug ? '1px solid #00BCD4' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
            >
              Get started
            </button>

            {/* 2. "Sign in with Google": x 369, w 282, beige filled pill (#EBE2CD), NO outline, G logo 36px + label, 12px gap */}
            <button
              type="button"
              disabled={isSigningIn}
              onClick={async () => {
                if (isSigningIn) return;
                setIsSigningIn(true);
                setSignInError(null);
                try {
                  if (onContinueWithGoogle) {
                    await onContinueWithGoogle();
                  }
                } catch (err) {
                  console.warn('Sign in error:', err);
                  setSignInError('Sign-in failed. Please try again.');
                  setTimeout(() => setSignInError(null), 3000);
                } finally {
                  setIsSigningIn(false);
                }
              }}
              className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#17181B] focus-visible:outline-none select-none"
              style={{
                position: 'absolute',
                left: '369px',
                top: '291px',
                width: '282px',
                height: '67px',
                backgroundColor: '#EBE2CD',
                borderRadius: '9999px',
                border: 'none',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'transform 150ms ease, background-color 150ms ease',
                cursor: isSigningIn ? 'not-allowed' : 'pointer',
                opacity: isSigningIn ? 0.75 : 1,
                outline: queryParams.debug ? '1px solid #00BCD4' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSigningIn) e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                if (!isSigningIn) e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                if (!isSigningIn) e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                if (!isSigningIn) e.currentTarget.style.transform = 'scale(1.03)';
              }}
            >
              {isSigningIn ? (
                <div className="w-[30px] h-[30px] border-[3px] border-[#161B1E]/30 border-t-[#161B1E] rounded-full animate-spin" />
              ) : (
                <svg width="36" height="36" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.547 0 9s.347 2.827.957 4.039l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                  />
                </svg>
              )}
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '22px',
                  color: '#17181B',
                  letterSpacing: '-0.015em',
                }}
              >
                Sign in with Google
              </span>
            </button>

            {/* Sign-in error notification if any */}
            {signInError && (
              <div
                style={{
                  position: 'absolute',
                  left: '369px',
                  top: '365px',
                  backgroundColor: '#FFF0F0',
                  border: '1px solid #FF8080',
                  color: '#C01010',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '13px',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  zIndex: 30,
                }}
              >
                {signInError}
              </div>
            )}

            {/* ── Mode Pills: top dy: 392, height: 64, fully rounded, background #F1E8CE ── */}
            {/* Pill 1: Know Me (x 106, w 183) */}
            <div
              className="select-none"
              style={{
                position: 'absolute',
                left: '106px',
                top: '392px',
                width: '183px',
                height: '64px',
                backgroundColor: '#F1E8CE',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '13px',
                boxSizing: 'border-box',
                transition: 'transform 150ms ease',
                outline: queryParams.debug ? '1px solid #FF9800' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src="/assets/landing-desktop/mode-know-me.webp"
                alt=""
                style={{
                  width: '44.5px',
                  height: '44.5px',
                  objectFit: 'contain',
                  flexShrink: 0,
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  marginLeft: '12px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '20px',
                  color: '#17181B',
                  letterSpacing: '-0.01em',
                }}
              >
                Know Me
              </span>
            </div>

            {/* Pill 2: Trivia (x 304, w 159) */}
            <div
              className="select-none"
              style={{
                position: 'absolute',
                left: '304px',
                top: '392px',
                width: '159px',
                height: '64px',
                backgroundColor: '#F1E8CE',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '13px',
                boxSizing: 'border-box',
                transition: 'transform 150ms ease',
                outline: queryParams.debug ? '1px solid #FF9800' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src="/assets/landing-desktop/mode-trivia.webp"
                alt=""
                style={{
                  width: '45.4px',
                  height: '44.5px',
                  objectFit: 'contain',
                  flexShrink: 0,
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  marginLeft: '12px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '20px',
                  color: '#17181B',
                  letterSpacing: '-0.01em',
                }}
              >
                Trivia
              </span>
            </div>

            {/* Pill 3: Random (x 479, w 175) */}
            <div
              className="select-none"
              style={{
                position: 'absolute',
                left: '479px',
                top: '392px',
                width: '175px',
                height: '64px',
                backgroundColor: '#F1E8CE',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '13px',
                boxSizing: 'border-box',
                transition: 'transform 150ms ease',
                outline: queryParams.debug ? '1px solid #FF9800' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src="/assets/landing-desktop/mode-random.webp"
                alt=""
                style={{
                  width: '45.4px',
                  height: '44.5px',
                  objectFit: 'contain',
                  flexShrink: 0,
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  marginLeft: '12px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: '20px',
                  color: '#17181B',
                  letterSpacing: '-0.01em',
                }}
              >
                Random
              </span>
            </div>

            {/* Join Line: Under the 3 mode pills, centered on x: 380, center dy: 492 */}
            {/* Text: "Already have a code? Join", Nunito 600 17px, gray #6F7080 */}
            <div
              style={{
                position: 'absolute',
                left: '380px',
                top: '492px',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '17px',
                lineHeight: '1.2',
                color: '#6F7080',
                whiteSpace: 'nowrap',
                outline: queryParams.debug ? '1px solid #795548' : 'none',
              }}
            >
              <span>Already have a code?&nbsp;</span>
              <button
                type="button"
                onClick={onJoinCode}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  fontSize: '17px',
                  lineHeight: '1.2',
                  color: '#6F7080',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  cursor: 'pointer',
                }}
                className="hover:text-[#17181B] transition-colors focus-visible:ring-1 focus-visible:ring-[#17181B] focus-visible:outline-none"
              >
                Join
              </button>
            </div>

            {/* ════════════ RIGHT COLUMN (Hero art, x absolute, dy relative) ════════════ */}
            {/* 1. Yellow blob: x 764, dy +20, w 528, h 477 (z: 1) */}
            <img
              src="/assets/landing/hero-blob-yellow.webp"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '764px',
                top: '20px',
                width: '528px',
                height: '477px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
                outline: queryParams.debug ? '1px solid #FFEB3B' : 'none',
              }}
            />

            {/* 2. Left Avatar (Pink Boy on Pink Blob): centered at (899, dy + 243) -> left: 774, top: 118, size: 250 (z: 2) */}
            <div
              style={{
                position: 'absolute',
                left: '774px',
                top: '118px',
                width: '250px',
                height: '250px',
                zIndex: 2,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: queryParams.debug ? '1px solid #E91E63' : 'none',
              }}
            >
              <ProfileAvatar
                avatarId={1}
                blobId="pink"
                size={250}
                useNewBlob={true}
              />
            </div>

            {/* 3. Right Avatar (Blue Girl on Blue Blob): centered at (1154, dy + 276) -> left: 1023, top: 145, size: 262 (z: 3) */}
            <div
              style={{
                position: 'absolute',
                left: '1023px',
                top: '145px',
                width: '262px',
                height: '262px',
                zIndex: 3,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: queryParams.debug ? '1px solid #2196F3' : 'none',
              }}
            >
              <ProfileAvatar
                avatarId={2}
                blobId="blue"
                size={262}
                useNewBlob={true}
              />
            </div>

            {/* 4. Hero Decorations (z: 4, above avatars, below VS starburst) */}
            {/* Blue Star: x 1182.1, dy -11.6, w 110.8, h 108.0 */}
            <img
              src="/assets/landing-desktop/deco-star-blue-hero.webp"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '1182.1px',
                top: '-11.6px',
                width: '110.8px',
                height: '108.0px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />

            {/* Olive Cross: x 1296.5, dy 74.6, w 85.3, h 89.9 */}
            <img
              src="/assets/landing-desktop/deco-cross-olive-hero.webp"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '1296.5px',
                top: '74.6px',
                width: '85.3px',
                height: '89.9px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />

            {/* Pink Heart: x 1260.2, dy 392.4, w 95.3, h 93.5 */}
            <img
              src="/assets/landing-desktop/deco-heart-pink-hero.webp"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '1260.2px',
                top: '392.4px',
                width: '95.3px',
                height: '93.5px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />

            {/* Sparkle Left: x 720.0, dy 207.2, w 42.7, h 110.8 */}
            <img
              src="/assets/landing-desktop/sparkle-left.webp"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '720.0px',
                top: '207.2px',
                width: '42.7px',
                height: '110.8px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />

            {/* Sparkle Right: x 1295.6, dy 228.1, w 42.7, h 108.0 */}
            <img
              src="/assets/landing-desktop/sparkle-right.webp"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: '1295.6px',
                top: '228.1px',
                width: '42.7px',
                height: '108.0px',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />

            {/* 5. VS Starburst (z: 5, above both avatars and hero decorations) */}
            {/* Starburst: x 966, dy 229, w 105, h 97 */}
            <div
              style={{
                position: 'absolute',
                left: '966px',
                top: '229px',
                width: '105px',
                height: '97px',
                zIndex: 5,
                pointerEvents: 'none',
                outline: queryParams.debug ? '1px solid #FFC107' : 'none',
              }}
            >
              <img
                src="/assets/landing-desktop/badge-vs-starburst.webp"
                alt="VS Starburst"
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* 6. "VS" Text: Nunito 900 36px, ink #17181B, centered on the starburst at (1019, dy 277) (z: 6) */}
            <div
              style={{
                position: 'absolute',
                left: '1019px',
                top: '277px',
                transform: 'translate(-50%, -50%)',
                zIndex: 6,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: '36px',
                lineHeight: '1',
                color: '#17181B',
                pointerEvents: 'none',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              VS
            </div>
          </div>
        </div>
      </div>

      {/* ── DEBUG CONTROLS & RESOLUTION SWITCHER ── */}
      {(queryParams.debug || queryParams.overlay) && (
        <div
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(23, 24, 27, 0.92)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>
              <strong>VW×VH:</strong> {vw}×{vh}
            </span>
            <span>
              <strong>s:</strong> {s.toFixed(3)}
            </span>
            <span>
              <strong>H:</strong> {Math.round(H)}px
            </span>
            <span>
              <strong>Gtop:</strong> {Math.round(Gtop)}px
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#FBD847', fontWeight: 'bold' }}>Preset:</span>
            <select
              value={selectedPreset || ''}
              onChange={(e) => setSelectedPreset(e.target.value || null)}
              style={{
                backgroundColor: '#2A2C32',
                color: '#FFF',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '2px 6px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Viewport ({rawViewport.width}×{rawViewport.height})</option>
              {PRESETS.map((p) => (
                <option key={p.val} value={p.val}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
