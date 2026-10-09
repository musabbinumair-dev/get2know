import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { UserProfile } from './CreateProfileScreen';
import { DesktopInviteFriend } from '../components/DesktopInviteFriend';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { useSession } from '../services/sessionContext';

export interface InviteFriendScreenProps {
  userProfile: UserProfile;
  inviteCode?: string;
  onBack: () => void;
  onFriendJoined?: () => void;
  onEnterGame?: () => void;
}

export const InviteFriendScreen: React.FC<InviteFriendScreenProps> = ({
  userProfile,
  inviteCode: propInviteCode,
  onBack,
  onFriendJoined,
  onEnterGame,
}) => {
  const { roomCode, partnerProfile, friendJoined: sessionFriendJoined } = useSession();
  const code = roomCode || propInviteCode || 'ABC-123';
  const friendJoined = sessionFriendJoined || Boolean(partnerProfile);

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

    window.addEventListener('resize', updateViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    return () => {
      window.removeEventListener('resize', updateViewport);
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

  const isDesktopLandscape =
    effectiveWidth >= 900 && effectiveWidth / effectiveHeight >= 1.15;

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [sharedLink, setSharedLink] = useState<boolean>(false);

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
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Share link handler with ?join=CODE
  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/?join=${code}`;
    const shareData = {
      title: 'Join my Duo on Get-to-Know-You',
      text: `Join me on Get-to-Know-You! Code: ${code}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setSharedLink(true);
        setTimeout(() => setSharedLink(false), 2000);
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // Ignored
      }
      setSharedLink(true);
      setTimeout(() => setSharedLink(false), 2000);
    }
  };

  if (isDesktopLandscape) {
    return (
      <DesktopInviteFriend
        userProfile={userProfile}
        partnerProfile={partnerProfile}
        inviteCode={code}
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
      {/* ── TOP CORNER DECORATIONS (PERIWINKLE BACKGROUND) ── */}
      {/* Top-Right: Yellow Sun/Spark */}
      <div
        className="absolute -top-[16px] -right-[16px] pointer-events-none select-none z-0"
        style={{ width: '84px', height: '84px' }}
      >
        <img
          src="/assets/welcome/starburst-yellow-right.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Top-Left: Pink Spark */}
      <div
        className="absolute -top-[14px] -left-[14px] pointer-events-none select-none z-0"
        style={{ width: '76px', height: '76px' }}
      >
        <img
          src="/assets/welcome/starburst-pink-left.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ── BOTTOM CORNER DECORATIONS ── */}
      {/* Bottom-Right: Soft Yellow Deco */}
      <div
        className="absolute -bottom-[20px] -right-[20px] pointer-events-none select-none z-0"
        style={{ width: '88px', height: '88px' }}
      >
        <img
          src="/assets/welcome/starburst-yellow-right.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none opacity-80"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: Teal/Blue Deco */}
      <div
        className="absolute -bottom-[18px] -left-[18px] pointer-events-none select-none z-0"
        style={{ width: '82px', height: '82px' }}
      >
        <img
          src="/assets/welcome/starburst-blue-left.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none opacity-80"
          draggable={false}
        />
      </div>

      {/* ── TOP BAR (Back Button) ── */}
      <div className="relative z-10 w-full flex items-center justify-between pt-4 pb-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="btn-press w-[40px] h-[40px] flex items-center justify-center rounded-full bg-[#1A1C22]/10 hover:bg-[#1A1C22]/20 text-[#1A1C22] transition-colors cursor-pointer focus:outline-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center py-2">
        <div className="w-full flex flex-col items-center">
          {/* Header Title: "Invite your person" */}
          <h1 className="text-[34px] sm:text-[38px] font-black text-[#1A1C22] tracking-[-0.03em] leading-tight text-center mt-2">
            Invite your person
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-[16px] text-[#485375] font-semibold text-center max-w-[320px] leading-snug">
            Share this code so they can join your Duo. It expires in 24 hours.
          </p>

          {/* Code Card / Pill */}
          <div className="mt-6 w-full max-w-[342px] bg-[#FAF6EA] rounded-[24px] p-5 flex flex-col items-center shadow-sm border border-[#1A1C22]/10">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#727D9A]">
              Your Duo Code
            </span>
            <div className="mt-2 flex items-center justify-center font-mono font-black text-[38px] sm:text-[42px] tracking-[0.14em] text-[#1A1C22]">
              {code}
            </div>

            {/* Action Buttons: Copy Code & Share Link */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 w-full">
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn-press h-[46px] rounded-full font-bold text-[14.5px] bg-[#1A1C22] text-white flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#2C2F38] transition-all"
              >
                <span>{copiedCode ? '✓ Copied' : 'Copy code'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareLink}
                className="btn-press h-[46px] rounded-full font-bold text-[14.5px] bg-[#EBE2CD] text-[#1A1C22] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#DFD5BE] transition-all"
              >
                <span>{sharedLink ? '✓ Shared' : 'Share link'}</span>
              </button>
            </div>
          </div>

          {/* ── DUO STATUS SECTION: Both Avatars ── */}
          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-8">
            {/* Left Column: You */}
            <div className="flex flex-col items-center">
              <div className="relative w-[118px] h-[118px] flex items-center justify-center">
                <ProfileAvatar
                  avatarId={userProfile.avatarId}
                  blobId={userProfile.color}
                  size={118}
                  useNewBlob={true}
                />
              </div>
              <span className="mt-2.5 text-[16px] font-semibold text-[#485375] tracking-tight">
                {userProfile.name?.trim() ? userProfile.name.trim() : 'You'}
              </span>
            </div>

            {/* Right Column: Friend / Waiting Dashed Blob */}
            <div className="flex flex-col items-center">
              {friendJoined && partnerProfile ? (
                /* Friend Joined State */
                <div className="relative w-[118px] h-[118px] flex items-center justify-center animate-pop">
                  <ProfileAvatar
                    avatarId={partnerProfile.avatarId}
                    blobId={partnerProfile.color}
                    size={118}
                    useNewBlob={true}
                  />
                </div>
              ) : (
                /* Waiting State with Dashed Pear Blob, Question Mark & 6 Radiating Sparks */
                <div className="relative w-[118px] h-[118px] flex items-center justify-center">
                  <div className="absolute -top-[2px] -left-[2px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[-45deg] pointer-events-none" />
                  <div className="absolute top-[54px] -left-[14px] w-[15px] h-[5px] bg-[#FED868] rounded-full rotate-[0deg] pointer-events-none" />
                  <div className="absolute -bottom-[2px] -left-[1px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[45deg] pointer-events-none" />
                  <div className="absolute -top-[2px] -right-[2px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[45deg] pointer-events-none" />
                  <div className="absolute top-[54px] -right-[14px] w-[15px] h-[5px] bg-[#FED868] rounded-full rotate-[0deg] pointer-events-none" />
                  <div className="absolute -bottom-[2px] -right-[1px] w-[14px] h-[5px] bg-[#FED868] rounded-full rotate-[-45deg] pointer-events-none" />

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
                    <span className="absolute inset-0 flex items-center justify-center text-[44px] font-black text-[#1A1C22] select-none pointer-events-none leading-none">
                      ?
                    </span>
                  </div>
                </div>
              )}
              <span className="mt-2.5 text-[16px] font-semibold text-[#485375] tracking-tight">
                {friendJoined && partnerProfile?.name ? partnerProfile.name : 'Your friend'}
              </span>
            </div>
          </div>

          {/* Status Text: "Waiting for them to join..." or "They're in! 🎉" */}
          <div className="mt-6 text-center">
            <p className="text-[16.5px] font-medium text-[#485375] tracking-[-0.01em]">
              {friendJoined ? "They're in! 🎉" : 'Waiting for them to join...'}
            </p>
          </div>
        </div>

        {/* Enter game button when friend joined */}
        {friendJoined && (
          <div className="mt-6 flex flex-col items-center gap-2 w-full">
            <button
              type="button"
              onClick={onEnterGame || onFriendJoined}
              className="btn-press w-full max-w-[342px] h-[54px] rounded-full font-bold text-[17px] bg-[#1A1C22] text-white flex items-center justify-center cursor-pointer transition-all shadow-md"
            >
              Continue to Today’s Question →
            </button>
          </div>
        )}
      </div>
    </Screen>
  );
};
