import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, AVATAR_OPTIONS } from '../screens/CreateProfileScreen';

interface DesktopCreateProfileProps {
  initialProfile?: UserProfile;
  onBack: () => void;
  onContinue: (profile: UserProfile) => void;
  forcedWidth?: number;
  forcedHeight?: number;
}

export const DesktopCreateProfile: React.FC<DesktopCreateProfileProps> = ({
  initialProfile,
  onBack,
  onContinue,
  forcedWidth,
  forcedHeight,
}) => {
  // Selections
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(
    initialProfile?.avatarId ?? 1
  );

  const [name, setName] = useState<string>(
    initialProfile?.name && initialProfile.name !== 'Player' ? initialProfile.name : ''
  );

  const [selectedColor, setSelectedColor] = useState<'salmon' | 'teal'>(
    initialProfile?.color === 'teal' ? 'teal' : 'salmon'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Viewport tracking
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

  const viewport = useMemo(() => {
    if (forcedWidth && forcedHeight) {
      return { width: forcedWidth, height: forcedHeight };
    }
    return rawViewport;
  }, [forcedWidth, forcedHeight, rawViewport]);

  // Stage scaling
  const vw = viewport.width;
  const vh = viewport.height;
  const s = Math.min(vw / 1440, 1.5, vh / 780);
  const H = vh / s;

  // Background #FDE473 on body and html
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FDE473';
    document.documentElement.style.backgroundColor = '#FDE473';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const handleContinueClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 200));
      await Promise.resolve(
        onContinue({
          avatarId: selectedAvatarId,
          name: name.trim() || 'Player',
          color: selectedColor,
        })
      );
    } catch (err) {
      console.error('Desktop profile continue error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group vertical position formula
  const Gtop = Math.max(130, 148 + 0.45 * (H - 780));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: `${vh}px`,
        backgroundColor: '#FDE473',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        userSelect: 'none',
        fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── CORNER & EDGE DECORATIONS (Anchored to VIEWPORT, scaled by s) ── */}
      {/* 1. Top-Right Blue Star */}
      <img
        src="/assets/landing-desktop/deco-star-blue-hero.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${12 * s}px`,
          top: `${12 * s}px`,
          width: `${120 * s}px`,
          height: `${118 * s}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 2. Mid-Left Pink Heart */}
      <img
        src="/assets/landing-desktop/deco-heart-pink-hero.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: 0,
          top: '30%',
          transform: 'translateY(-50%)',
          width: `${94 * s}px`,
          height: `${104 * s}px`,
          objectFit: 'contain',
          objectPosition: 'left center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 3. Mid-Right Olive Cross */}
      <img
        src="/assets/landing-desktop/deco-cross-olive-hero.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${24 * s}px`,
          top: '26%',
          transform: 'translateY(-50%)',
          width: `${90 * s}px`,
          height: `${94 * s}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 4. Bottom-Left Blue Star */}
      <img
        src="/assets/landing-desktop/deco-star-blue-bottomleft.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: `${14 * s}px`,
          bottom: `${14 * s}px`,
          width: `${124 * s}px`,
          height: `${126 * s}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 5. Bottom-Right Pink Crescent */}
      <img
        src="/assets/blobs/crescent-pink-bottom-right.png"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${18 * s}px`,
          bottom: `${18 * s}px`,
          width: `${94 * s}px`,
          height: `${118 * s}px`,
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
          }}
        >
          {/* ── TOP BAR: Back Button (Left), Logo (Center), Step Progress (Right) ── */}
          {/* 1. Dashed Circular Back Button */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="cursor-pointer hover:bg-[#1B1D20]/10 active:scale-95 transition-all focus:outline-none"
            style={{
              position: 'absolute',
              left: '52px',
              top: '59px',
              transform: 'translateY(-50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '2px dashed #1B1D20',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1B1D20"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 2. Top Center Logo Lockup */}
          <div
            style={{
              position: 'absolute',
              left: '720px',
              top: '59px',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 30,
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

          {/* 3. Top Right Step Dots */}
          <div
            style={{
              position: 'absolute',
              right: '52px',
              top: '59px',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 30,
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#1B1D20',
              }}
            />
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '1.8px dashed #1B1D20',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ── MAIN CONTENT CONTAINER: CENTERED BALANCED TWO-COLUMN LAYOUT ── */}
          <div
            style={{
              position: 'absolute',
              left: '720px',
              top: `${Gtop}px`,
              transform: 'translateX(-50%)',
              width: '1180px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              zIndex: 20,
            }}
          >
            {/* ════════════ LEFT COLUMN: WHO ARE YOU & 6 AVATARS ════════════ */}
            <div style={{ width: '600px' }}>
              <h1
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: '80px',
                  lineHeight: '0.98',
                  letterSpacing: '-0.035em',
                  color: '#17181B',
                  margin: 0,
                  padding: 0,
                }}
              >
                Who are you?
              </h1>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  fontSize: '28px',
                  lineHeight: '1.2',
                  color: '#17181B',
                  opacity: 0.75,
                  letterSpacing: '-0.01em',
                  marginTop: '16px',
                  marginBottom: 0,
                }}
              >
                Pick how your friend will see you.
              </p>

              {/* 3x2 Large Avatars Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 176px)',
                  gap: '24px',
                  marginTop: '36px',
                }}
              >
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;

                  return (
                    <div
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatarId(avatar.id);
                        if (avatar.color === 'teal' || avatar.color === 'indigo') {
                          setSelectedColor('teal');
                        } else if (avatar.color === 'salmon' || avatar.color === 'pink') {
                          setSelectedColor('salmon');
                        }
                      }}
                      className="cursor-pointer transition-transform select-none"
                      style={{
                        position: 'relative',
                        width: '176px',
                        height: '176px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.transform = 'scale(1.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)';
                      }}
                    >
                      {/* Blob image */}
                      <img
                        src={avatar.blob}
                        alt=""
                        draggable={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Face image */}
                      <img
                        src={avatar.face}
                        alt={avatar.alt}
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          margin: 'auto',
                          width: '74%',
                          height: '74%',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Selection Ring & Checkmark Badge */}
                      {isSelected && (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              inset: '-6px',
                              borderRadius: '50%',
                              border: '4px solid #17181B',
                              pointerEvents: 'none',
                              zIndex: 10,
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              width: '32px',
                              height: '32px',
                              backgroundColor: '#17181B',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 20,
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ════════════ RIGHT COLUMN: NAME & COLOR (BIG & PROPORTIONATE) ════════════ */}
            <div style={{ width: '500px', paddingTop: '10px' }}>
              {/* 1. "Your name" Label */}
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: '36px',
                  color: '#17181B',
                  letterSpacing: '-0.02em',
                }}
              >
                Your name
              </div>

              {/* Name Input Pill: Height 84px */}
              <div style={{ marginTop: '18px' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name"
                  maxLength={20}
                  className="w-full focus:border-[#17181B] transition-colors"
                  style={{
                    height: '84px',
                    borderRadius: '9999px',
                    backgroundColor: '#FCF7EB',
                    padding: '0 36px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '28px',
                    color: '#17181B',
                    outline: 'none',
                    border: '3px solid transparent',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 2. "Your color" Label */}
              <div
                style={{
                  marginTop: '44px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: '36px',
                  color: '#17181B',
                  letterSpacing: '-0.02em',
                }}
              >
                Your color
              </div>

              {/* Color Blobs Selector: Large Salmon & Blue */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '20px' }}>
                {/* Salmon / Pink Blob */}
                <div
                  onClick={() => setSelectedColor('salmon')}
                  className="cursor-pointer transition-transform select-none"
                  style={{
                    position: 'relative',
                    width: '140px',
                    height: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: selectedColor === 'salmon' ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedColor !== 'salmon') e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = selectedColor === 'salmon' ? 'scale(1.02)' : 'scale(1)';
                  }}
                >
                  <img
                    src="/assets/blobs/pink-avatar-blob.webp"
                    alt="Pink / Salmon"
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                  {selectedColor === 'salmon' && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          inset: '-6px',
                          borderRadius: '50%',
                          border: '4px solid #17181B',
                          pointerEvents: 'none',
                          zIndex: 10,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '30px',
                          height: '30px',
                          backgroundColor: '#17181B',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 20,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>

                {/* Blue / Teal Blob */}
                <div
                  onClick={() => setSelectedColor('teal')}
                  className="cursor-pointer transition-transform select-none"
                  style={{
                    position: 'relative',
                    width: '140px',
                    height: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: selectedColor === 'teal' ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedColor !== 'teal') e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = selectedColor === 'teal' ? 'scale(1.02)' : 'scale(1)';
                  }}
                >
                  <img
                    src="/assets/blobs/blue-avatar-blob.webp"
                    alt="Blue / Teal"
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                  {selectedColor === 'teal' && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          inset: '-6px',
                          borderRadius: '50%',
                          border: '4px solid #17181B',
                          pointerEvents: 'none',
                          zIndex: 10,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '30px',
                          height: '30px',
                          backgroundColor: '#17181B',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 20,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 3. "Continue" Button: Height 84px */}
              <div style={{ marginTop: '56px' }}>
                <button
                  type="button"
                  onClick={handleContinueClick}
                  disabled={isSubmitting}
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#17181B] focus-visible:outline-none select-none w-full"
                  style={{
                    height: '84px',
                    backgroundColor: '#191B20',
                    borderRadius: '9999px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: '28px',
                    letterSpacing: '-0.015em',
                    transition: 'transform 150ms ease, background-color 150ms ease',
                    opacity: isSubmitting ? 0.75 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    if (!isSubmitting) e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    if (!isSubmitting) e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                >
                  {isSubmitting ? (
                    <div className="w-[32px] h-[32px] border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
