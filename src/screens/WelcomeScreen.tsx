import React, { useState, useEffect, useRef } from 'react';
import { DesktopLanding } from '../components/DesktopLanding';
import { playReadySound, playTapSound } from '../lib/soundEffects';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onContinueWithGoogle?: () => Promise<void>;
  onJoinCode?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onContinueWithGoogle,
  onJoinCode,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Safe area insets probe
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    const probeTop = document.createElement('div');
    probeTop.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top, 0px);pointer-events:none;visibility:hidden;z-index:-1;';
    const probeBottom = document.createElement('div');
    probeBottom.style.cssText =
      'position:fixed;bottom:0;left:0;width:0;height:env(safe-area-inset-bottom, 0px);pointer-events:none;visibility:hidden;z-index:-1;';

    document.body.appendChild(probeTop);
    document.body.appendChild(probeBottom);

    const updateSafeArea = () => {
      setSafeArea({
        top: probeTop.offsetHeight || 0,
        bottom: probeBottom.offsetHeight || 0,
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      probeTop.remove();
      probeBottom.remove();
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  // Viewport tracking (using window.visualViewport if available)
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 390,
    height: typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 844,
  });

  useEffect(() => {
    const updateViewport = () => {
      const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setViewport({ width: vw, height: vh });
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

  // Check URL frame parameter e.g. ?frame=1440x900
  const frameParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('frame')
      : null;
  let effectiveWidth = viewport.width;
  let effectiveHeight = viewport.height;
  if (frameParam) {
    const [fw, fh] = frameParam.split('x').map(Number);
    if (fw && fh) {
      effectiveWidth = fw;
      effectiveHeight = fh;
    }
  }

  // Desktop + landscape tablet condition: width >= 900 AND width/height >= 1.15
  const isDesktopLandscape =
    effectiveWidth >= 900 && effectiveWidth / effectiveHeight >= 1.15;

  // Seamless full-bleed ivory background #FAF6EA on body and html for mobile
  useEffect(() => {
    if (isDesktopLandscape) return;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FAF6EA';
    document.documentElement.style.backgroundColor = '#FAF6EA';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, [isDesktopLandscape]);

  if (isDesktopLandscape) {
    return (
      <DesktopLanding
        onGetStarted={onGetStarted}
        onContinueWithGoogle={onContinueWithGoogle}
        onJoinCode={onJoinCode}
        forcedWidth={effectiveWidth !== viewport.width ? effectiveWidth : undefined}
        forcedHeight={effectiveHeight !== viewport.height ? effectiveHeight : undefined}
      />
    );
  }

  // Width scale: fill full width on mobile, cap at 1.3 on desktop/tablets
  const scale = Math.min(viewport.width / 390, 1.3);

  // Available height in stage units
  const availHeightPx = Math.max(0, viewport.height - safeArea.top - safeArea.bottom);
  const H = availHeightPx / scale;

  // Adaptive vertical scaling factor for short viewports
  const f = H < 844 ? Math.max(0.68, H / 844) : 1.0;
  const s_hero = H < 844 ? Math.max(0.85, Math.min(1.0, H / 844)) : 1.0;

  // ── EXACT REFERENCE LAYOUT COORDINATES (on 390 x 844 stage)
  // Top decorations:
  const crescentTopY = 28 * f;
  const heartRightTopY = 24 * f;
  const starburstRightTopY = 165 * f; // Above girl's head on the right edge

  // Header lockup:
  const logoTopY = 80 * f;
  const wordmarkTopY = logoTopY + 28;

  // Hero illustration:
  const heroTopY = 250 * f;
  const heroW = 342 * s_hero;
  const heroH = 175 * s_hero;
  const heroLeft = 195 - heroW / 2;

  // Title & Tagline:
  const titleTopY = heroTopY + heroH + 26 * f;
  const taglineTopY = titleTopY + 44 + 10 * f;

  // Mid decorations:
  const starburstLeftTopY = 585 * f;
  const crossOliveTopY = 605 * f;

  // Lower decorations:
  const heartLeftTopY = 705 * f; // Sits above the left side of the button
  const crescentBottomTopY = 720 * f; // Sits to the right of the button

  // Button & Join link:
  const buttonTopY = 678 * f;
  const googleBtnTopY = 742 * f;
  const joinLineTopY = 804 * f;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#FAF6EA',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: `${safeArea.top}px`,
        paddingBottom: `${safeArea.bottom}px`,
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* ── STAGE CONTAINER (Strict 390 width scaled to fill screen, zero side gaps) ── */}
      <div
        style={{
          position: 'relative',
          width: `${390 * scale}px`,
          height: `${H * scale}px`,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <div
          ref={stageRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '390px',
            height: `${H}px`,
            overflow: 'hidden',
            backgroundColor: '#FAF6EA',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* ── 1. TOP-LEFT YELLOW CRESCENT MOON: (10, crescentTopY), width 70, height 84 ── */}
          <img
            src="/assets/welcome/crescent-yellow-top.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '10px',
              top: `${crescentTopY}px`,
              width: '70px',
              height: '84px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 2. TOP-RIGHT PINK HEART: (310, heartRightTopY), width 80, height 84, cropped right ── */}
          <img
            src="/assets/welcome/heart-pink-right.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '310px',
              top: `${heartRightTopY}px`,
              width: '80px',
              height: '84px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 3. TOP BRANDING LOCKUP: logo-duo + wordmark "Get-to-Know-You" ── */}
          <img
            src="/assets/welcome/logo-duo.png"
            alt="Get-to-Know-You logo"
            draggable={false}
            style={{
              position: 'absolute',
              left: `${195 - 64 / 2}px`,
              top: `${logoTopY}px`,
              width: '64px',
              height: '23px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: 0,
              top: `${wordmarkTopY}px`,
              width: '390px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 900,
              fontSize: '15.5px',
              lineHeight: '16px',
              letterSpacing: '-0.025em',
              color: '#1B1D20',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            Get-to-Know-You
          </div>

          {/* ── 4. UPPER-RIGHT BLUE STARBURST: (332, starburstRightTopY), cropped right edge, above girl's head ── */}
          <img
            src="/assets/welcome/starburst-blue-right.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '332px',
              top: `${starburstRightTopY}px`,
              width: '58px',
              height: '76px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 5. HERO PAIR ILLUSTRATION: centered at centerX = 195, y: heroTopY ── */}
          <img
            src="/assets/welcome/hero-pair.png"
            alt="Two friends"
            draggable={false}
            style={{
              position: 'absolute',
              left: `${heroLeft}px`,
              top: `${heroTopY}px`,
              width: `${heroW}px`,
              height: `${heroH}px`,
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* ── 6. MAIN TITLE: "Get-to-Know-You", Nunito 900, 42px ── */}
          <h1
            style={{
              position: 'absolute',
              left: 0,
              top: `${titleTopY}px`,
              width: '390px',
              margin: 0,
              padding: '0 16px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 900,
              fontSize: '42px',
              lineHeight: '44px',
              letterSpacing: '-0.035em',
              color: '#191B20',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            Get-to-Know-You
          </h1>

          {/* ── 7. TAGLINE: "Two friends. One question a day.", Nunito 600, 18.5px ── */}
          <p
            style={{
              position: 'absolute',
              left: 0,
              top: `${taglineTopY}px`,
              width: '390px',
              margin: 0,
              padding: '0 20px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 600,
              fontSize: '18.5px',
              lineHeight: '22px',
              letterSpacing: '-0.015em',
              color: '#75767C',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            Two friends. One question a day.
          </p>

          {/* ── 8. MID-LEFT BLUE STARBURST: (2, starburstLeftTopY), width 74, height 74, cropped left edge ── */}
          <img
            src="/assets/welcome/starburst-blue-left.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '2px',
              top: `${starburstLeftTopY}px`,
              width: '74px',
              height: '74px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 9. MID-RIGHT OLIVE 4-LOBE CROSS: (304, crossOliveTopY), width 66, height 66, ~18px margin from right edge ── */}
          <img
            src="/assets/welcome/cross-olive.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '304px',
              top: `${crossOliveTopY}px`,
              width: '66px',
              height: '66px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 10. BOTTOM-LEFT PINK HEART: (0, heartLeftTopY), sits right above the left side of button ── */}
          <img
            src="/assets/welcome/heart-pink-left.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '0px',
              top: `${heartLeftTopY}px`,
              width: '69px',
              height: '63px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 11. BOTTOM-RIGHT YELLOW CRESCENT: (328, crescentBottomTopY), sits alongside right of button ── */}
          <img
            src="/assets/welcome/crescent-yellow-bottom.png"
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '328px',
              top: `${crescentBottomTopY}px`,
              width: '60px',
              height: '72px',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* ── 12. "GET STARTED" BUTTON: 304x48 pill at (43, buttonTopY), solid deep black #191B20 ── */}
          <button
            type="button"
            onClick={onGetStarted}
            className="btn-press cursor-pointer hover:bg-[#282a30] transition-colors focus:outline-none select-none"
            style={{
              position: 'absolute',
              left: '43px',
              top: `${buttonTopY}px`,
              width: '304px',
              height: '48px',
              backgroundColor: '#191B20',
              borderRadius: '9999px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '-0.015em',
              margin: 0,
              padding: 0,
              zIndex: 20,
              boxSizing: 'border-box',
            }}
          >
            Get started
          </button>

          {/* ── 12B. "SIGN IN WITH GOOGLE" BUTTON: 304x46 pill at (43, googleBtnTopY), darker background #EBE2CD, no border, logo close to text ── */}
          <button
            type="button"
            disabled={isSigningIn}
            onClick={async () => {
              if (isSigningIn) return;
              playReadySound();
              setIsSigningIn(true);
              setSignInError(null);
              try {
                if (onContinueWithGoogle) {
                  await onContinueWithGoogle();
                }
              } catch (err) {
                console.warn('Sign-in issue:', err);
                setSignInError('Sign-in failed. Try again.');
                setTimeout(() => setSignInError(null), 3000);
              } finally {
                setIsSigningIn(false);
              }
            }}
            className="btn-press cursor-pointer hover:bg-[#E3D9C2] active:scale-[0.98] transition-all focus:outline-none select-none"
            style={{
              position: 'absolute',
              left: '43px',
              top: `${googleBtnTopY}px`,
              width: '304px',
              height: '46px',
              backgroundColor: '#EBE2CD',
              borderRadius: '9999px',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 20,
              boxSizing: 'border-box',
              cursor: isSigningIn ? 'not-allowed' : 'pointer',
              opacity: isSigningIn ? 0.75 : 1,
            }}
          >
            {/* Google "G" logo: 18px close to text */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isSigningIn ? (
                <div className="w-[18px] h-[18px] border-2 border-[#161B1E]/30 border-t-[#161B1E] rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
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
            </div>

            <span
              style={{
                fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 800,
                fontSize: '18px',
                color: '#161B1E',
                letterSpacing: '-0.015em',
              }}
            >
              Sign in with Google
            </span>
          </button>

          {/* Sign-in Error Toast */}
          {signInError && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: `${googleBtnTopY + 54}px`,
                backgroundColor: '#FFF0F0',
                border: '1px solid #FF8080',
                color: '#C01010',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '9999px',
                zIndex: 30,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {signInError}
            </div>
          )}

          {/* ── 13. "Already have a code? Join": centered beneath button at joinLineTopY ── */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: `${joinLineTopY}px`,
              width: '390px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 500,
              fontSize: '13.5px',
              lineHeight: '18px',
              letterSpacing: '-0.01em',
              color: '#75767C',
              zIndex: 20,
            }}
          >
            <span>Already have a code?&nbsp;</span>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onJoinCode?.();
              }}
              style={{
                fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 600,
                fontSize: '13.5px',
                lineHeight: '18px',
                color: '#75767C',
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                textDecoration: 'underline',
                textUnderlineOffset: '2.5px',
                cursor: 'pointer',
              }}
              className="hover:text-[#191B20] transition-colors focus:outline-none"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
