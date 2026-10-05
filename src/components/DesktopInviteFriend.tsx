import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../screens/CreateProfileScreen';

interface DesktopInviteFriendProps {
  userProfile: UserProfile;
  code: string;
  onBack: () => void;
  onFriendJoined?: () => void;
  onEnterGame?: () => void;
  forcedWidth?: number;
  forcedHeight?: number;
}

export const DesktopInviteFriend: React.FC<DesktopInviteFriendProps> = ({
  userProfile,
  code,
  onBack,
  onFriendJoined,
  onEnterGame,
  forcedWidth,
  forcedHeight,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [sharedLink, setSharedLink] = useState(false);
  const [friendJoined, setFriendJoined] = useState(false);

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

  // Background #99B0F7 on body and html
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#99B0F7';
    document.documentElement.style.backgroundColor = '#99B0F7';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    }
  };

  const handleShareLink = async () => {
    const shareData = {
      title: 'Get-to-Know-You',
      text: `Join me on Get-to-Know-You! Code: ${code}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
      } catch {
        // Ignored
      }
      setSharedLink(true);
      setTimeout(() => setSharedLink(false), 1500);
    }
  };

  // Group vertical position formula
  const Gtop = Math.max(130, 148 + 0.45 * (H - 780));

  // Determine user avatar blob image
  const userBlobSrc =
    userProfile.color === 'salmon' || userProfile.color === 'pink'
      ? '/assets/blobs/pink-avatar-blob.webp'
      : userProfile.color === 'teal' || userProfile.color === 'blue'
      ? '/assets/blobs/blue-avatar-blob.webp'
      : `/assets/blobs/avatar-blob-${Math.min(6, Math.max(1, userProfile.avatarId || 1))}.png`;

  const userFaceSrc = `/assets/avatars/avatar-${Math.min(6, Math.max(1, userProfile.avatarId || 1))}.png`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: `${vh}px`,
        backgroundColor: '#99B0F7',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        userSelect: 'none',
        fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── CORNER & EDGE DECORATIONS (Anchored to VIEWPORT, scaled by s) ── */}
      {/* 1. Top-Left Soft Pink Heart */}
      <img
        src="/assets/landing-desktop/deco-heart-pink-hero.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: 0,
          top: '22%',
          transform: 'translateY(-50%)',
          width: `${94 * s}px`,
          height: `${104 * s}px`,
          objectFit: 'contain',
          objectPosition: 'left center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 2. Top-Right Yellow Starburst */}
      <img
        src="/assets/blobs/starburst-yellow-small.svg"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${-10 * s}px`,
          top: `${-10 * s}px`,
          width: `${130 * s}px`,
          height: `${130 * s}px`,
          objectFit: 'contain',
          transform: 'rotate(16deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 3. Bottom-Left Yellow Starburst */}
      <img
        src="/assets/blobs/starburst-yellow-small.svg"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: `${-15 * s}px`,
          bottom: `${75 * s}px`,
          width: `${135 * s}px`,
          height: `${135 * s}px`,
          objectFit: 'contain',
          transform: 'rotate(8deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 4. Bottom-Left Olive 4-Leaf Cross */}
      <img
        src="/assets/blobs/cross-olive-decorative.svg"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          left: `${88 * s}px`,
          bottom: `${14 * s}px`,
          width: `${106 * s}px`,
          height: `${110 * s}px`,
          objectFit: 'contain',
          transform: 'rotate(-10deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 5. Bottom-Right Soft Pink Heart */}
      <img
        src="/assets/blobs/heart-pink-small.svg"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${110 * s}px`,
          bottom: `${10 * s}px`,
          width: `${98 * s}px`,
          height: `${98 * s}px`,
          objectFit: 'contain',
          transform: 'rotate(-6deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 6. Bottom-Right Yellow Crescent Moon */}
      <img
        src="/assets/landing-desktop/deco-moon-yellow-bottomright.webp"
        alt=""
        draggable={false}
        style={{
          position: 'fixed',
          right: `${16 * s}px`,
          bottom: `${24 * s}px`,
          width: `${94 * s}px`,
          height: `${122 * s}px`,
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
              width: '1184px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              zIndex: 20,
            }}
          >
            {/* ════════════ LEFT COLUMN: CODE & ACTIONS (BIG & BOLD) ════════════ */}
            <div style={{ width: '540px' }}>
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
                Invite your<br />person
              </h1>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  fontSize: '28px',
                  lineHeight: '1.2',
                  color: '#2C3A5A',
                  letterSpacing: '-0.01em',
                  marginTop: '16px',
                  marginBottom: 0,
                }}
              >
                Share this code. Only they can join.
              </p>

              {/* Large Cream Code Card: Height 156px */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '156px',
                  backgroundColor: '#FAF6EB',
                  borderRadius: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '34px',
                }}
              >
                {/* Dashed circular copy icon at top-right */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Copy invite code"
                  title="Copy code"
                  className="cursor-pointer hover:bg-[#1B1D20]/10 active:scale-95 transition-all focus:outline-none"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '22px',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '2px dashed rgba(27, 29, 32, 0.45)',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {copiedCode ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A1C22"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A1C22"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="12" height="12" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>

                {/* Big Bold Code Display: Font size 64px */}
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 900,
                    fontSize: '64px',
                    color: '#17181B',
                    letterSpacing: '0.02em',
                    lineHeight: '1',
                    userSelect: 'all',
                  }}
                >
                  {code}
                </span>
              </div>

              {/* Action Pills Row: Height 76px */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '22px' }}>
                {/* Copy code button: Black pill */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#17181B] focus-visible:outline-none select-none flex-1"
                  style={{
                    height: '76px',
                    backgroundColor: '#191B20',
                    borderRadius: '9999px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: '24px',
                    letterSpacing: '-0.01em',
                    transition: 'transform 150ms ease, background-color 150ms ease',
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
                  {copiedCode ? 'Copied!' : 'Copy code'}
                </button>

                {/* Share link button: Cream pill */}
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#17181B] focus-visible:outline-none select-none flex-1"
                  style={{
                    height: '76px',
                    backgroundColor: '#FAF6EB',
                    borderRadius: '9999px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#17181B',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: '24px',
                    letterSpacing: '-0.01em',
                    transition: 'transform 150ms ease, background-color 150ms ease',
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
                  {sharedLink ? 'Link copied!' : 'Share link'}
                </button>
              </div>
            </div>

            {/* ════════════ RIGHT COLUMN: LARGE AVATARS & WAITING STATE ════════════ */}
            <div
              style={{
                width: '580px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px',
              }}
            >
              {/* Avatars Side by Side: Size 215px each, Gap 64px */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '64px' }}>
                {/* 1. Left Avatar: User's Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '215px',
                      height: '215px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={userBlobSrc}
                      alt="Your blob"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />
                    <img
                      src={userFaceSrc}
                      alt={userProfile.name || 'You'}
                      draggable={false}
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        width: '74%',
                        height: '74%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      marginTop: '16px',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                      fontSize: '24px',
                      color: '#324164',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {userProfile.name?.trim() ? userProfile.name.trim() : 'Player'}
                  </span>
                </div>

                {/* 2. Right Avatar: Friend / Waiting Dashed Pear Blob */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {friendJoined ? (
                    <div
                      style={{
                        position: 'relative',
                        width: '215px',
                        height: '215px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      }}
                    >
                      <img
                        src={
                          userProfile.color === 'salmon' || userProfile.color === 'pink'
                            ? '/assets/blobs/blue-avatar-blob.webp'
                            : '/assets/blobs/pink-avatar-blob.webp'
                        }
                        alt="Friend blob"
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                        }}
                      />
                      <img
                        src={`/assets/avatars/avatar-${userProfile.avatarId === 2 ? 1 : 2}.png`}
                        alt="Friend"
                        draggable={false}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          width: '74%',
                          height: '74%',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'relative',
                        width: '215px',
                        height: '215px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* 6 Yellow Radiating Sparks */}
                      {/* Top-Left spark */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '38px',
                          left: '8px',
                          width: '24px',
                          height: '8px',
                          backgroundColor: '#FED868',
                          borderRadius: '9999px',
                          transform: 'rotate(-45deg)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Mid-Left spark */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '102px',
                          left: '-14px',
                          width: '26px',
                          height: '8px',
                          backgroundColor: '#FED868',
                          borderRadius: '9999px',
                          transform: 'rotate(0deg)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Bottom-Left spark */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '38px',
                          left: '10px',
                          width: '24px',
                          height: '8px',
                          backgroundColor: '#FED868',
                          borderRadius: '9999px',
                          transform: 'rotate(45deg)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Top-Right spark */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '38px',
                          right: '8px',
                          width: '24px',
                          height: '8px',
                          backgroundColor: '#FED868',
                          borderRadius: '9999px',
                          transform: 'rotate(45deg)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Mid-Right spark */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '102px',
                          right: '-14px',
                          width: '26px',
                          height: '8px',
                          backgroundColor: '#FED868',
                          borderRadius: '9999px',
                          transform: 'rotate(0deg)',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Bottom-Right spark */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '38px',
                          right: '10px',
                          width: '24px',
                          height: '8px',
                          backgroundColor: '#FED868',
                          borderRadius: '9999px',
                          transform: 'rotate(-45deg)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Dashed Pear / Teardrop Organic Blob Outline */}
                      <div
                        style={{
                          width: '198px',
                          height: '198px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <svg
                          viewBox="0 0 200 200"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                          }}
                        >
                          <path
                            d="M 100 12 C 122 12 144 48 156 78 C 168 108 172 134 162 158 C 152 182 128 192 100 192 C 72 192 48 182 38 158 C 28 134 32 108 44 78 C 56 48 78 12 100 12 Z"
                            fill="none"
                            stroke="#1B1D20"
                            strokeWidth="3.2"
                            strokeDasharray="7 7"
                            strokeLinecap="round"
                          />
                        </svg>

                        {/* Centered Bold Question Mark: Font size 72px */}
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 900,
                            fontSize: '72px',
                            color: '#17181B',
                            lineHeight: '1',
                            pointerEvents: 'none',
                          }}
                        >
                          ?
                        </span>
                      </div>
                    </div>
                  )}
                  <span
                    style={{
                      marginTop: '16px',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                      fontSize: '24px',
                      color: '#324164',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {friendJoined ? 'Maya' : 'Your friend'}
                  </span>
                </div>
              </div>

              {/* Status Text: "Waiting for them to join..." */}
              <div style={{ marginTop: '44px', textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    fontSize: '26px',
                    color: '#324164',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                >
                  {friendJoined ? "They're in! 🎉" : 'Waiting for them to join...'}
                </p>
              </div>

              {/* Ready to enter button if friend joined */}
              {friendJoined && (onEnterGame || onFriendJoined) && (
                <button
                  type="button"
                  onClick={onEnterGame || onFriendJoined}
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-[#17181B] focus-visible:outline-none select-none"
                  style={{
                    marginTop: '24px',
                    height: '68px',
                    padding: '0 40px',
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
                    letterSpacing: '-0.01em',
                    transition: 'transform 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Continue to Today’s Question →
                </button>
              )}
            </div>
          </div>

          {/* ── FOOTER SIMULATION PILL: Centered at bottom ── */}
          <div
            style={{
              position: 'absolute',
              left: '720px',
              bottom: '50px',
              transform: 'translateX(-50%)',
              zIndex: 30,
            }}
          >
            <button
              type="button"
              onClick={() => setFriendJoined((prev) => !prev)}
              className="cursor-pointer hover:bg-white/50 active:scale-95 transition-all focus:outline-none"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#24324F',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '9999px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚡</span>
              <span>{friendJoined ? 'Reset simulation' : 'Simulate friend joined'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
