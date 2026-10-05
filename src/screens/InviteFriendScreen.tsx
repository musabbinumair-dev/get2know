import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { UserProfile } from './CreateProfileScreen';
import { DesktopInviteFriend } from '../components/DesktopInviteFriend';

interface InviteFriendScreenProps {
  userProfile: UserProfile;
  inviteCode?: string;
  onBack: () => void;
  onFriendJoined?: () => void;
  onEnterGame?: () => void;
}

export function generateInviteCode(): string {
  // Characters avoiding ambiguous ones: 0/O, 1/I/L
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 3; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${part1}-${part2}`;
}

export const InviteFriendScreen: React.FC<InviteFriendScreenProps> = ({
  userProfile,
  inviteCode: initialCode,
  onBack,
  onFriendJoined,
  onEnterGame,
}) => {
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

  // Frame parameter support e.g. ?frame=1440x900
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

  const isDesktopLandscape =
    effectiveWidth >= 900 && effectiveWidth / effectiveHeight >= 1.15;

  const [code] = useState<string>(() => initialCode || generateInviteCode());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [sharedLink, setSharedLink] = useState<boolean>(false);
  const [friendJoined, setFriendJoined] = useState<boolean>(false);

  // Full-bleed periwinkle background on body & html
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

  // Copy code to clipboard
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

  // Share link handler
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

  if (isDesktopLandscape) {
    return (
      <DesktopInviteFriend
        userProfile={userProfile}
        code={code}
        onBack={onBack}
        onFriendJoined={onFriendJoined}
        onEnterGame={onEnterGame}
        forcedWidth={effectiveWidth !== viewport.width ? effectiveWidth : undefined}
        forcedHeight={effectiveHeight !== viewport.height ? effectiveHeight : undefined}
      />
    );
  }

  return (
    <Screen bg="#99B0F7">
      {/* ---------------- DECORATIVE BACKGROUND BLOBS (EXACT MATCH WITH REFERENCE IMAGE) ---------------- */}

      {/* Top-Right: Yellow Starburst (cropped at top right corner) */}
      <div
        className="absolute -top-[16px] -right-[16px] pointer-events-none select-none z-0"
        style={{ width: '92px', height: '92px' }}
      >
        <img
          src="/assets/blobs/starburst-yellow-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[16deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: 8-Point Yellow Starburst (cropped at left edge) */}
      <div
        className="absolute bottom-[96px] -left-[28px] pointer-events-none select-none z-0"
        style={{ width: '92px', height: '92px' }}
      >
        <img
          src="/assets/blobs/starburst-yellow-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[10deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: Olive 4-Leaf Cross (cropped at bottom left) */}
      <div
        className="absolute -bottom-[22px] left-[26px] pointer-events-none select-none z-0"
        style={{ width: '84px', height: '88px' }}
      >
        <img
          src="/assets/blobs/cross-olive-decorative.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-12deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Right: Soft Pink Heart (cropped at bottom right) */}
      <div
        className="absolute -bottom-[20px] -right-[16px] pointer-events-none select-none z-0"
        style={{ width: '106px', height: '106px' }}
      >
        <img
          src="/assets/blobs/heart-pink-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-8deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100dvh] sm:min-h-0 sm:h-full px-7 pt-9 pb-8 sm:px-8 sm:pt-9 sm:pb-9 select-none">
        <div>
          {/* Top Navigation Row: Back Button & Step Dots */}
          <div className="flex items-center justify-between w-full">
            {/* Dashed Circular Back Button: 44x44 */}
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to profile"
              className="btn-press w-[44px] h-[44px] rounded-full border-[1.8px] border-dashed border-[#1B1D20] flex items-center justify-center hover:bg-[#1B1D20]/5 transition-colors focus:outline-none cursor-pointer"
            >
              <svg
                width="20"
                height="20"
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

            {/* Step Dots: Step 1 dashed 14px, Step 2 filled black 14px, gap 9px */}
            <div className="flex items-center gap-[9px] pr-1">
              <div className="w-[14px] h-[14px] rounded-full border-[1.6px] border-dashed border-[#1B1D20] box-border" />
              <div className="w-[14px] h-[14px] rounded-full bg-[#1B1D20]" />
            </div>
          </div>

          {/* Heading Section: Nunito 900 Title + Subtitle */}
          <div className="mt-5 sm:mt-6">
            <h1 className="text-[38px] sm:text-[42px] font-black text-[#1A1C22] leading-[1.06] tracking-[-0.035em]">
              Invite your person
            </h1>
            <p className="mt-2 text-[16.5px] sm:text-[17.5px] font-medium text-[#485375] tracking-[-0.01em]">
              Share this code. Only they can join.
            </p>
          </div>

          {/* Cream Code Card (rounded ~38px, Nunito 900 large code, dashed copy button in top right) */}
          <div className="mt-6 relative w-full max-w-[342px] mx-auto bg-[#FAF6EB] rounded-[38px] px-6 py-8 flex flex-col items-center justify-center min-h-[148px]">
            {/* Dashed circular copy icon at top-right */}
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy invite code"
              title="Copy code"
              className="btn-press absolute top-4 right-4 w-[34px] h-[34px] rounded-full border-[1.6px] border-dashed border-[#1B1D20]/35 flex items-center justify-center hover:bg-[#1B1D20]/5 transition-colors focus:outline-none cursor-pointer"
            >
              {copiedCode ? (
                <svg
                  width="15"
                  height="15"
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
                  width="15"
                  height="15"
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

            {/* Large Bold Code Display (e.g. K7X-92P) */}
            <span className="text-[50px] sm:text-[54px] font-black tracking-[0.015em] text-[#1A1C22] select-all leading-none mt-2">
              {code}
            </span>
          </div>

          {/* Action Pills Row: Copy code & Share link */}
          <div className="mt-4 flex items-center gap-3.5 w-full max-w-[342px] mx-auto">
            {/* Copy code button: Black with white text */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn-press flex-1 h-[52px] sm:h-[54px] rounded-full font-bold text-[16.5px] sm:text-[17px] tracking-tight flex items-center justify-center bg-[#1A1C22] text-white hover:bg-[#2A2C34] transition-colors cursor-pointer"
            >
              {copiedCode ? 'Copied!' : 'Copy code'}
            </button>

            {/* Share link button: Cream with dark text */}
            <button
              type="button"
              onClick={handleShareLink}
              className="btn-press flex-1 h-[52px] sm:h-[54px] rounded-full font-bold text-[16.5px] sm:text-[17px] tracking-tight flex items-center justify-center bg-[#FAF6EB] text-[#1A1C22] hover:bg-[#F3EEDC] transition-colors cursor-pointer"
            >
              {sharedLink ? 'Link copied!' : 'Share link'}
            </button>
          </div>

          {/* Avatar Section: You & Your Friend Side-by-Side */}
          <div className="mt-8 sm:mt-10 flex items-start justify-center gap-8 sm:gap-12 w-full max-w-[342px] mx-auto">
            {/* Left Column: Player's Avatar on Chosen Blob */}
            <div className="flex flex-col items-center">
              <div className="relative w-[118px] h-[118px] flex items-center justify-center">
                {/* User's exact chosen blob */}
                <img
                  src={
                    userProfile.color === 'salmon'
                      ? '/file_00000000199c8207ba1ef4dff8b5f719.png'
                      : userProfile.color === 'teal'
                      ? '/file_00000000872c821185f1f972a55e71f3.png'
                      : `/assets/blobs/avatar-blob-${Math.min(6, Math.max(1, userProfile.avatarId || 1))}.png`
                  }
                  alt="Your blob"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                {/* User's exact chosen character face */}
                <img
                  src={`/assets/avatars/avatar-${Math.min(6, Math.max(1, userProfile.avatarId || 1))}.png`}
                  alt={userProfile.name || 'You'}
                  className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
              <span className="mt-2.5 text-[16px] font-semibold text-[#485375] tracking-tight">
                {userProfile.name?.trim() ? userProfile.name.trim() : 'You'}
              </span>
            </div>

            {/* Right Column: Friend / Waiting Dashed Blob with 6 Sparks & Question Mark */}
            <div className="flex flex-col items-center">
              {friendJoined ? (
                /* Friend Joined State */
                <div className="relative w-[118px] h-[118px] flex items-center justify-center animate-pop">
                  <img
                    src={
                      userProfile.color === 'salmon'
                        ? '/file_00000000872c821185f1f972a55e71f3.png'
                        : '/file_00000000199c8207ba1ef4dff8b5f719.png'
                    }
                    alt="Friend blob"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  <img
                    src={`/assets/avatars/avatar-${userProfile.avatarId === 2 ? 1 : 2}.png`}
                    alt="Friend"
                    className="relative z-10 w-[74%] h-[74%] object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              ) : (
                /* Waiting State with Dashed Pear Blob, Question Mark & 6 Radiating Sparks */
                <div className="relative w-[118px] h-[118px] flex items-center justify-center">
                  {/* 6 Yellow Spark Capsules Radiating Outward */}
                  {/* Top-Left spark */}
                  <div className="absolute -top-[2px] -left-[2px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[-45deg] pointer-events-none" />
                  {/* Mid-Left spark */}
                  <div className="absolute top-[54px] -left-[14px] w-[15px] h-[5px] bg-[#FED868] rounded-full rotate-[0deg] pointer-events-none" />
                  {/* Bottom-Left spark */}
                  <div className="absolute -bottom-[2px] -left-[1px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[45deg] pointer-events-none" />

                  {/* Top-Right spark */}
                  <div className="absolute -top-[2px] -right-[2px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[45deg] pointer-events-none" />
                  {/* Mid-Right spark */}
                  <div className="absolute top-[54px] -right-[14px] w-[15px] h-[5px] bg-[#FED868] rounded-full rotate-[0deg] pointer-events-none" />
                  {/* Bottom-Right spark */}
                  <div className="absolute -bottom-[2px] -right-[1px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[-45deg] pointer-events-none" />

                  {/* Dashed Pear / Teardrop Organic Blob Outline */}
                  <div className="w-[112px] h-[112px] flex items-center justify-center relative">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full object-contain pointer-events-none select-none"
                    >
                      <path
                        d="M 100 12 C 122 12 144 48 156 78 C 168 108 172 134 162 158 C 152 182 128 192 100 192 C 72 192 48 182 38 158 C 28 134 32 108 44 78 C 56 48 78 12 100 12 Z"
                        fill="none"
                        stroke="#1B1D20"
                        strokeWidth="2.4"
                        strokeDasharray="5 5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Big Bold Centered Question Mark */}
                    <span className="absolute inset-0 flex items-center justify-center text-[44px] font-black text-[#1A1C22] select-none pointer-events-none leading-none">
                      ?
                    </span>
                  </div>
                </div>
              )}
              <span className="mt-2.5 text-[16px] font-semibold text-[#485375] tracking-tight">
                {friendJoined ? 'Maya' : 'Your friend'}
              </span>
            </div>
          </div>

          {/* Status Text: "Waiting for them to join..." */}
          <div className="mt-6 text-center">
            <p className="text-[16.5px] font-medium text-[#485375] tracking-[-0.01em]">
              {friendJoined ? "They're in! 🎉" : 'Waiting for them to join...'}
            </p>
          </div>
        </div>

        {/* Footer / Simulation Control */}
        <div className="mt-6 flex flex-col items-center gap-2 w-full">
          {friendJoined && (onEnterGame || onFriendJoined) && (
            <button
              type="button"
              onClick={onEnterGame || onFriendJoined}
              className="btn-press w-full max-w-[342px] h-[54px] rounded-full font-bold text-[17px] bg-[#1A1C22] text-white flex items-center justify-center cursor-pointer transition-all"
            >
              Continue to Today’s Question →
            </button>
          )}
          <button
            type="button"
            onClick={() => setFriendJoined((prev) => !prev)}
            className="text-[12px] font-bold text-[#1A1C22]/50 hover:text-[#1A1C22] bg-[#FAF6EA]/30 hover:bg-[#FAF6EA]/60 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
          >
            {friendJoined ? 'Reset simulation' : '⚡ Simulate friend joined'}
          </button>
        </div>
      </div>
    </Screen>
  );
};
