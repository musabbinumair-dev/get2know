import React, { useState, useEffect } from 'react';
import { ProfileAvatar, getBlobColorName } from '../components/ProfileAvatar';
import { BottomNav, NavTab } from '../components/BottomNav';

export interface FriendProfileData {
  name: string;
  subtitle?: string;
  avatarId?: number;
  color?: string;
  streakDays: number;
  matchesCount: number;
  guessWinsCount: number;
  lastAnsweredTime: string;
}

export interface FriendProfileScreenProps {
  friendData?: FriendProfileData;
  onBack: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

const DEFAULT_FRIEND: FriendProfileData = {
  name: 'Alex',
  subtitle: 'Teal player, joined Sep 12',
  avatarId: 2,
  color: 'teal',
  streakDays: 12,
  matchesCount: 38,
  guessWinsCount: 21,
  lastAnsweredTime: 'today, 8:42 PM',
};

const STAT_ASSETS = [
  '/assets/scores/stat-starburst-yellow-streak.webp',
  '/assets/scores/stat-teardrop-blue-matches.webp',
  '/assets/scores/stat-cross-olive-guess-wins.webp',
];

export const FriendProfileScreen: React.FC<FriendProfileScreenProps> = ({
  friendData = DEFAULT_FRIEND,
  onBack,
  onNavigateTab,
}) => {
  // Preload score stats assets
  useEffect(() => {
    STAT_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Nudge Toast & Disabled Countdown State
  const [nudgeCooldown, setNudgeCountdown] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Sync background color
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#F5EEDA';
    document.documentElement.style.backgroundColor = '#F5EEDA';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (nudgeCooldown <= 0) return;
    const timer = setInterval(() => {
      setNudgeCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [nudgeCooldown]);

  const handleSendNudge = () => {
    if (nudgeCooldown > 0) return;
    setShowToast(true);
    setNudgeCountdown(30);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Window viewport measurements matching ProfileScreen
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scale by viewport width so stage spans 100% width with ZERO side margins
  const scale = viewport.width / 390;
  // Stage height in stage coordinate units
  const stageH = viewport.height / scale;
  // Detect compact / short mobile viewports (stageH < 780)
  const isCompact = stageH < 780;

  // Exact positions matching ProfileScreen
  const backBtnTop = isCompact ? 28 : 52;
  const titleTop = isCompact ? 72 : 110;

  // Derived positions for content layout
  const avatarTop = isCompact ? 120 : 164;
  const avatarSize = isCompact ? 128 : 152;
  const subtitleTop = isCompact ? 254 : 326;
  const statsTop = isCompact ? 286 : 362;
  const rowTop = isCompact ? 418 : 504;
  const nudgeBtnTop = isCompact ? 488 : 578;

  return (
    <div className="relative w-full h-[100dvh] bg-[#F5EEDA] flex justify-center items-start overflow-hidden font-['Nunito',sans-serif]">
      {/* ---------------- 390 DESIGN STAGE CONTAINER ---------------- */}
      <div
        className="relative bg-[#F5EEDA] overflow-hidden select-none"
        style={{
          width: '390px',
          height: `${stageH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* ---------------- DECORATIONS (BEHIND EVERYTHING) ---------------- */}
        {/* deco-crescent-yellow: top-left corner */}
        <img
          src="/deco-crescent-yellow-top-left-cropped.webp"
          alt=""
          className={`absolute top-0 left-0 pointer-events-none select-none z-0 ${
            isCompact ? 'w-[34px]' : 'w-[40px]'
          }`}
          draggable={false}
        />

        {/* deco-heart-pink: top-right corner */}
        <img
          src="/deco-heart-pink-top-right-cropped.webp"
          alt=""
          className={`absolute right-0 pointer-events-none select-none z-0 ${
            isCompact ? 'top-[12px] w-[54px]' : 'top-[20px] w-[64px]'
          }`}
          draggable={false}
        />

        {/* deco-starburst-blue: bottom-left corner */}
        <img
          src="/deco-starburst-blue-bottom-left-cropped.webp"
          alt=""
          className={`absolute bottom-0 left-0 pointer-events-none select-none z-0 ${
            isCompact ? 'w-[75px]' : 'w-[92px]'
          }`}
          draggable={false}
        />

        {/* ---------------- 1. BACK BUTTON (EXACT POSITION, SIZE & STYLE AS PROFILE SCREEN) ---------------- */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="absolute left-[25px] w-[38px] h-[38px] rounded-full border-[1.5px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer z-30 focus:outline-none"
          style={{ top: `${backBtnTop}px` }}
        >
          <svg
            width="20"
            height="20"
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

        {/* ---------------- 2. HEADING / TITLE (EXACT POSITION, SIZE & STYLE AS PROFILE SCREEN) ---------------- */}
        <h1
          className={`absolute left-[24px] font-black text-[#17181B] tracking-[-0.02em] leading-none z-10 ${
            isCompact ? 'text-[42px]' : 'text-[52px]'
          }`}
          style={{ top: `${titleTop}px` }}
        >
          {friendData.name}
        </h1>

        {/* ---------------- 3. FRIEND AVATAR & BLOB ---------------- */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
          style={{ top: `${avatarTop}px`, width: `${avatarSize}px`, height: `${avatarSize}px` }}
        >
          <ProfileAvatar
            avatarId={friendData.avatarId ?? 2}
            blobId={friendData.color ?? 'teal'}
            size={avatarSize}
          />
        </div>

        {/* ---------------- 4. SUBTITLE ---------------- */}
        <div
          className="absolute left-0 right-0 text-center z-15 px-4"
          style={{ top: `${subtitleTop}px` }}
        >
          <span className="font-bold text-[15.5px] text-[#111319]/60 leading-none">
            {friendData.subtitle ||
              `${getBlobColorName(friendData.color, friendData.avatarId)} player, joined Sep 12`}
          </span>
        </div>

        {/* ---------------- 5. STATS ROW (3 SHAPES USING SAME ASSETS AS SCORES PAGE) ---------------- */}
        <div
          className="absolute left-[22px] w-[346px] grid grid-cols-3 gap-2.5 z-15"
          style={{ top: `${statsTop}px` }}
        >
          {/* Stat 1: Streak */}
          <div className="flex flex-col items-center select-none">
            <div className="relative w-full aspect-square max-w-[92px] sm:max-w-[100px] flex items-center justify-center">
              <img
                src="/assets/scores/stat-starburst-yellow-streak.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />
              <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none">
                <span className="text-[28px] sm:text-[31px] font-black text-[#17181B] leading-none tracking-tight">
                  {friendData.streakDays}
                </span>
                <span className="text-[12.5px] sm:text-[13.5px] font-extrabold text-[#17181B] leading-none mt-0.5">
                  days
                </span>
              </div>
            </div>
            <span className="text-[13px] sm:text-[14px] font-bold text-[#17181B]/55 mt-1 tracking-tight leading-none text-center">
              Streak
            </span>
          </div>

          {/* Stat 2: Matches */}
          <div className="flex flex-col items-center select-none">
            <div className="relative w-full aspect-square max-w-[92px] sm:max-w-[100px] flex items-center justify-center">
              <img
                src="/assets/scores/stat-teardrop-blue-matches.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />
              <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none pt-2 sm:pt-2.5">
                <span className="text-[28px] sm:text-[31px] font-black text-[#17181B] leading-none tracking-tight">
                  {friendData.matchesCount}
                </span>
              </div>
            </div>
            <span className="text-[13px] sm:text-[14px] font-bold text-[#17181B]/55 mt-1 tracking-tight leading-none text-center">
              Matches
            </span>
          </div>

          {/* Stat 3: Guess Wins */}
          <div className="flex flex-col items-center select-none">
            <div className="relative w-full aspect-square max-w-[92px] sm:max-w-[100px] flex items-center justify-center">
              <img
                src="/assets/scores/stat-cross-olive-guess-wins.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />
              <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none">
                <span className="text-[28px] sm:text-[31px] font-black text-[#17181B] leading-none tracking-tight">
                  {friendData.guessWinsCount}
                </span>
              </div>
            </div>
            <span className="text-[13px] sm:text-[14px] font-bold text-[#17181B]/55 mt-1 tracking-tight leading-none text-center">
              Guess wins
            </span>
          </div>
        </div>

        {/* ---------------- 6. LAST ANSWERED ROW ---------------- */}
        <div
          className="absolute left-[22px] w-[346px] h-[58px] rounded-full bg-[#D5E9DE] flex items-center justify-between px-4 z-20 shadow-xs"
          style={{ top: `${rowTop}px` }}
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-clock-teal-blob.webp"
              alt=""
              className="w-[36px] h-[36px] object-contain pointer-events-none select-none"
              draggable={false}
            />
            <span className="font-black text-[17px] text-[#111319] tracking-tight">
              Last answered
            </span>
          </div>
          <span className="font-semibold text-[15px] text-[#111319]/60 tracking-tight">
            {friendData.lastAnsweredTime}
          </span>
        </div>

        {/* ---------------- 7. NUDGE BUTTON ---------------- */}
        <button
          type="button"
          onClick={handleSendNudge}
          disabled={nudgeCooldown > 0}
          style={{ top: `${nudgeBtnTop}px` }}
          className={`absolute left-[22px] w-[346px] h-[48px] rounded-full bg-[#121419] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.99] z-25 ${
            nudgeCooldown > 0 ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#20222a]'
          }`}
        >
          <span className="font-extrabold text-[17.5px] text-white tracking-tight">
            {nudgeCooldown > 0 ? `Nudge sent (${nudgeCooldown}s)` : 'Send a nudge'}
          </span>
          <img
            src="/icon-wave-hand.webp"
            alt=""
            className="w-[22px] h-[22px] object-contain pointer-events-none select-none"
            draggable={false}
          />
        </button>

        {/* ---------------- 8. TOAST NOTIFICATION: "Nudge sent 👋" ---------------- */}
        {showToast && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 bg-[#121419] text-white px-5 py-2.5 rounded-full font-black text-[15px] shadow-lg animate-pop z-50 flex items-center gap-2 pointer-events-none">
            <span>Nudge sent</span>
            <span>👋</span>
          </div>
        )}

        {/* ---------------- 9. BOTTOM NAVIGATION DOCK (EXACT SAME POSITION & SIZE AS PROFILE SCREEN) ---------------- */}
        {onNavigateTab && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center z-30 pointer-events-auto">
            <BottomNav activeTab="profile" onTabChange={onNavigateTab} className="mb-0" />
          </div>
        )}
      </div>
    </div>
  );
};
