import React, { useState } from 'react';
import { Screen } from '../components/Screen';
import { UserProfile } from './CreateProfileScreen';

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
  const [code] = useState<string>(() => initialCode || generateInviteCode());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [sharedLink, setSharedLink] = useState<boolean>(false);
  const [friendJoined, setFriendJoined] = useState<boolean>(false);

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

  return (
    <Screen bg="#A9B8F2">
      {/* ---------------- DECORATIVE BACKGROUND BLOBS ---------------- */}

      {/* Top-Right: Yellow Starburst (cropped at top right) */}
      <div
        className="absolute -top-[20px] -right-[20px] pointer-events-none select-none z-0"
        style={{ width: '92px', height: '92px' }}
      >
        <img
          src="/assets/blobs/starburst-yellow-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[15deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: Yellow Starburst (cropped at left edge) */}
      <div
        className="absolute bottom-[80px] -left-[28px] pointer-events-none select-none z-0"
        style={{ width: '86px', height: '86px' }}
      >
        <img
          src="/assets/blobs/starburst-yellow-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[10deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: Olive Cross (cropped at bottom left corner) */}
      <div
        className="absolute -bottom-[20px] left-[32px] pointer-events-none select-none z-0"
        style={{ width: '76px', height: '80px' }}
      >
        <img
          src="/assets/blobs/cross-olive-decorative.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-12deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Right: Pink Heart (cropped at bottom right corner) */}
      <div
        className="absolute -bottom-[18px] -right-[14px] pointer-events-none select-none z-0"
        style={{ width: '92px', height: '92px' }}
      >
        <img
          src="/assets/blobs/heart-pink-small.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-10deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>


      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100dvh] px-7 pt-9 pb-8 sm:px-8 sm:pt-10 sm:pb-9 select-none">
        <div>
          {/* Top Navigation Row: Back Button & Step Dots */}
          <div className="flex items-center justify-between w-full">
            {/* Dashed Circular Back Button */}
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to profile"
              className="btn-press w-[42px] h-[42px] rounded-full border-[1.5px] border-dashed border-[#1A1C22]/50 flex items-center justify-center hover:bg-[#1A1C22]/5 transition-colors focus:outline-none cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1A1C22"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Step Dots: Step 1 dashed empty, Step 2 filled black */}
            <div className="flex items-center gap-1.5 pr-1">
              <div className="w-[8px] h-[8px] rounded-full border-[1.5px] border-dashed border-[#1A1C22]" />
              <div className="w-[8px] h-[8px] rounded-full bg-[#1A1C22]" />
            </div>
          </div>

          {/* Heading Section */}
          <div className="mt-6">
            <h1 className="text-[37px] sm:text-[39px] font-black text-[#1A1C22] leading-[1.08] tracking-[-0.035em]">
              Invite your person
            </h1>
            <p className="mt-2 text-[16.5px] font-medium text-[#4F5D8A] tracking-[-0.01em]">
              Share this code. Only they can join.
            </p>
          </div>

          {/* Large Cream Code Card (radius ~36px, no shadows, huge Nunito 900) */}
          <div className="mt-6 relative w-full max-w-[340px] mx-auto bg-[#FAF6EA] rounded-[36px] p-6 flex flex-col items-center justify-center min-h-[144px]">
            {/* Dashed circular copy icon at top-right */}
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy invite code"
              title="Copy code"
              className="btn-press absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-full border-[1.5px] border-dashed border-[#1A1C22]/35 flex items-center justify-center hover:bg-[#1A1C22]/5 transition-colors focus:outline-none cursor-pointer"
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

            {/* Huge Code Display */}
            <span className="text-[50px] sm:text-[54px] font-black tracking-[0.02em] text-[#1A1C22] select-all leading-none mt-1">
              {code}
            </span>
          </div>

          {/* Action Pills Row: Copy Code & Share Link (56px tall, fully rounded, Nunito 700, no shadows, no outlines) */}
          <div className="mt-4 flex items-center gap-3.5 w-full max-w-[340px] mx-auto">
            {/* Copy code button: Black with white text */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn-press flex-1 h-[56px] rounded-full font-bold text-[17px] tracking-tight flex items-center justify-center bg-[#1A1C22] text-white hover:bg-[#2A2C34] transition-colors cursor-pointer"
            >
              {copiedCode ? 'Copied!' : 'Copy code'}
            </button>

            {/* Share link button: Cream with black text */}
            <button
              type="button"
              onClick={handleShareLink}
              className="btn-press flex-1 h-[56px] rounded-full font-bold text-[17px] tracking-tight flex items-center justify-center bg-[#FAF6EA] text-[#1A1C22] hover:bg-[#F3EEDC] transition-colors cursor-pointer"
            >
              {sharedLink ? 'Link copied!' : 'Share link'}
            </button>
          </div>

          {/* Two Columns: You & Your Friend */}
          <div className="mt-8 flex items-start justify-center gap-8 sm:gap-10 w-full max-w-[340px] mx-auto">
            {/* Left Column: Player's Avatar on Pink Blob */}
            <div className="flex flex-col items-center">
              <div className="relative w-[116px] h-[116px] flex items-center justify-center">
                <img
                  src={
                    userProfile.color === 'blue'
                      ? '/assets/reveal/card-blob-blue.png'
                      : '/assets/reveal/card-blob-pink.png'
                  }
                  alt="Your blob"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <img
                  src={`/assets/avatars/avatar-${userProfile.avatarId}.png`}
                  alt="You"
                  className="relative z-10 w-[78%] h-[78%] object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
              <span className="mt-2.5 text-[16px] font-bold text-[#1A1C22] tracking-[-0.01em]">
                You
              </span>
            </div>

            {/* Right Column: Friend / Waiting Blob */}
            <div className="flex flex-col items-center">
              {friendJoined ? (
                /* Friend Joined State */
                <div className="relative w-[116px] h-[116px] flex items-center justify-center animate-pop">
                  <img
                    src="/assets/reveal/card-blob-blue.png"
                    alt="Friend blob"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  <img
                    src="/assets/avatars/avatar-2.png"
                    alt="Maya"
                    className="relative z-10 w-[78%] h-[78%] object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              ) : (
                /* Waiting State with Dashed Blob & Sparks */
                <div className="relative w-[116px] h-[116px] flex items-center justify-center">
                  {/* Slow Expanding Pulse Ring */}
                  <div
                    className="absolute inset-[-4px] rounded-full border border-[#1A1C22]/15 animate-ping opacity-25 pointer-events-none"
                    style={{ animationDuration: '3s' }}
                  />

                  {/* 6 Yellow Spark Lines Radiating Outward */}
                  {/* Top-Left spark */}
                  <div className="absolute -top-[5px] -left-[2px] w-[12px] h-[4px] bg-[#F8D56B] rounded-full rotate-[-40deg] pointer-events-none" />
                  {/* Mid-Left spark */}
                  <div className="absolute top-[52px] -left-[10px] w-[13px] h-[4px] bg-[#F8D56B] rounded-full rotate-[0deg] pointer-events-none" />
                  {/* Bottom-Left spark */}
                  <div className="absolute -bottom-[4px] left-[3px] w-[12px] h-[4px] bg-[#F8D56B] rounded-full rotate-[40deg] pointer-events-none" />

                  {/* Top-Right spark */}
                  <div className="absolute -top-[5px] -right-[2px] w-[12px] h-[4px] bg-[#F8D56B] rounded-full rotate-[40deg] pointer-events-none" />
                  {/* Mid-Right spark */}
                  <div className="absolute top-[52px] -right-[10px] w-[13px] h-[4px] bg-[#F8D56B] rounded-full rotate-[0deg] pointer-events-none" />
                  {/* Bottom-Right spark */}
                  <div className="absolute -bottom-[4px] right-[3px] w-[12px] h-[4px] bg-[#F8D56B] rounded-full rotate-[-40deg] pointer-events-none" />

                  {/* Dashed Teardrop Blob */}
                  <div className="w-[110px] h-[110px] animate-pulse-gentle flex items-center justify-center relative">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full object-contain pointer-events-none select-none"
                    >
                      <path
                        d="M 119.2 4 C 116.52 2.66 123.07 -3.44 111.16 4 C 99.26 11.44 62.79 36.3 47.76 48.65 C 32.73 61 27.52 69.19 20.97 78.12 C 14.42 87.05 11.29 95.09 8.47 102.23 C 5.64 109.38 4.74 115.63 4 120.99 C 3.26 126.34 2.96 128.43 4 134.38 C 5.04 140.33 7.87 149.26 11.89 156.4 C 15.9 163.54 20.81 168.3 26.91 174.4 C 33.01 180.5 39.85 187.94 48.04 191.66 C 56.22 195.38 65.45 195.98 75.26 196 C 85.08 196.02 96.68 194.83 106.5 192.4 C 116.32 189.97 124.65 186.25 133.58 181.79 C 142.5 177.33 151.72 171.82 158.42 165.72 C 165.11 159.62 169.28 153.23 173.89 146.09 C 178.5 138.95 183.11 130.62 185.34 121.7 C 187.57 112.78 187.12 103.55 185.34 94.78 C 183.55 86 181.62 78.27 175.82 70.38 C 170.02 62.5 160.05 53.72 153.06 46.13 C 146.07 38.54 141.6 31.99 135.95 24.26 C 130.3 16.52 121.88 5.34 119.2 4 Z"
                        fill="none"
                        stroke="#1A1C22"
                        strokeWidth="2.8"
                        strokeDasharray="4 4"
                      />
                    </svg>
                    {/* Big Centered Question Mark */}
                    <span className="absolute inset-0 flex items-center justify-center text-[38px] font-black text-[#1A1C22] select-none pointer-events-none">
                      ?
                    </span>
                  </div>
                </div>
              )}
              <span className="mt-2.5 text-[16px] font-bold text-[#1A1C22] tracking-[-0.01em]">
                {friendJoined ? 'Maya' : 'Your friend'}
              </span>
            </div>
          </div>

          {/* Status Text */}
          <div className="mt-5 text-center">
            <p className="text-[16px] font-medium text-[#4F5D8A] tracking-[-0.01em]">
              {friendJoined ? "They're in! 🎉" : 'Waiting for them to join...'}
            </p>
          </div>
        </div>

        {/* Temporary Dev Button to simulate friend joining */}
        <div className="mt-6 flex flex-col items-center gap-2 w-full">
          {friendJoined && (onEnterGame || onFriendJoined) && (
            <button
              type="button"
              onClick={onEnterGame || onFriendJoined}
              className="btn-press w-full max-w-[340px] h-[52px] rounded-full font-bold text-[17px] bg-[#1A1C22] text-white flex items-center justify-center cursor-pointer shadow-md transition-all"
            >
              Continue to Today’s Question →
            </button>
          )}
          <button
            type="button"
            onClick={() => setFriendJoined((prev) => !prev)}
            className="text-[12px] font-bold text-[#1A1C22]/60 hover:text-[#1A1C22] bg-[#FAF6EA]/40 hover:bg-[#FAF6EA]/70 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
          >
            {friendJoined ? 'Reset simulation' : '⚡ Simulate friend joined'}
          </button>
        </div>
      </div>
    </Screen>
  );
};
