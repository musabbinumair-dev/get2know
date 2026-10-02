import React, { useState, useEffect, useRef } from 'react';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onJoinCode?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onJoinCode,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);

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

  // Seamless full-bleed ivory background #FAF6EA on body and html
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FAF6EA';
    document.documentElement.style.backgroundColor = '#FAF6EA';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

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
  const buttonTopY = 730 * f;
  const joinLineTopY = buttonTopY + 54 + 10 * f;

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

          {/* ── 12. "GET STARTED" BUTTON: 294x54 pill at (48, buttonTopY), solid deep black #191B20 ── */}
          <button
            type="button"
            onClick={onGetStarted}
            className="btn-press cursor-pointer hover:bg-[#282a30] transition-colors focus:outline-none"
            style={{
              position: 'absolute',
              left: '48px',
              top: `${buttonTopY}px`,
              width: '294px',
              height: '54px',
              backgroundColor: '#191B20',
              borderRadius: '9999px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 800,
              fontSize: '19px',
              letterSpacing: '-0.015em',
              margin: 0,
              padding: 0,
              zIndex: 20,
              boxSizing: 'border-box',
            }}
          >
            Get started
          </button>

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
              onClick={onJoinCode}
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
