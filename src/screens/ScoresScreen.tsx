import React, { useEffect } from 'react';
import { Screen } from '../components/Screen';
import { BottomNav, NavTab } from '../components/BottomNav';
import { UserProfile } from './CreateProfileScreen';
import { INITIAL_CATEGORY_STATS } from '../data/gameData';

export interface CategoryStat {
  name: string;
  pct: string;
  bg: string;
  iconSrc: string;
  iconW: string;
}

export interface ScoresScreenProps {
  player1Profile?: UserProfile;
  player2Profile?: UserProfile;
  syncScore?: number;
  streak?: number;
  matches?: number;
  guessWins?: number;
  categories?: CategoryStat[];
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

const WEBP_ASSETS = [
  '/assets/scores/icon-category-dreams-blue-moon.webp',
  '/assets/scores/deco-cross-olive-right.webp',
  '/assets/scores/deco-star-blue-top-right-cropped.webp',
  '/assets/scores/deco-heart-pink-top-left-cropped.webp',
  '/assets/scores/icon-category-fears-green-scream.webp',
  '/assets/scores/deco-moon-yellow-bottom-left.webp',
  '/assets/scores/deco-sparks-yellow-around-heart.webp',
  '/assets/scores/deco-heart-pink-bottom-right-cropped.webp',
  '/assets/scores/icon-category-food-pink-pizza.webp',
  '/assets/scores/hero-heart-pink-sync-score.webp',
  '/assets/scores/stat-starburst-yellow-streak.webp',
  '/assets/scores/stat-teardrop-blue-matches.webp',
  '/assets/scores/stat-cross-olive-guess-wins.webp',
];

export const ScoresScreen: React.FC<ScoresScreenProps> = ({
  player1Profile = { avatarId: 1, name: 'Player 1', color: 'salmon' },
  player2Profile = { avatarId: 2, name: 'Player 2', color: 'teal' },
  syncScore = 74,
  streak = 12,
  matches = 38,
  guessWins = 21,
  categories = INITIAL_CATEGORY_STATS,
  onOpenSettings,
  onNavigateTab,
}) => {
  // Preload all webp images
  useEffect(() => {
    WEBP_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Background #F8F4E6 across html, body
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#F8F4E6';
    document.documentElement.style.backgroundColor = '#F8F4E6';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Weekly bars data: heights scaled proportionately to fit smoothly
  const weeklyBars = [
    { day: 'MON', pH: 52, bH: 36 },
    { day: 'TUE', pH: 54, bH: 44 },
    { day: 'WED', pH: 36, bH: 39 },
    { day: 'THU', pH: 67, bH: 58 },
    { day: 'FRI', pH: 45, bH: 36 },
    { day: 'SAT', pH: 60, bH: 49 },
    { day: 'SUN', pH: 43, bH: 50 },
  ];

  return (
    <Screen bg="#F8F4E6" className="h-full min-h-[100dvh]">
      {/* ---------------- DECORATIVE BACKGROUND BLOBS (BELOW CONTENT, Z-INDEX 0) ---------------- */}

      {/* Top-Left: Pink Heart (peeking from left edge) */}
      <div className="absolute top-[76px] sm:top-[86px] -left-[14px] pointer-events-none select-none z-0 w-[58px] sm:w-[64px]">
        <img
          src="/assets/scores/deco-heart-pink-top-left-cropped.webp"
          alt=""
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Top-Right: Blue 7-Point Star (peeking from right edge) */}
      <div className="absolute top-[70px] sm:top-[80px] -right-[14px] pointer-events-none select-none z-0 w-[60px] sm:w-[66px]">
        <img
          src="/assets/scores/deco-star-blue-top-right-cropped.webp"
          alt=""
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Olive Cross: under blue star on right edge */}
      <div className="absolute top-[168px] sm:top-[182px] -right-[10px] pointer-events-none select-none z-0 w-[54px] sm:w-[60px]">
        <img
          src="/assets/scores/deco-cross-olive-right.webp"
          alt=""
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Left: Yellow Crescent Moon (behind tab bar) */}
      <div className="absolute bottom-[66px] sm:bottom-[74px] -left-[6px] pointer-events-none select-none z-0 w-[44px] sm:w-[50px]">
        <img
          src="/assets/scores/deco-moon-yellow-bottom-left.webp"
          alt=""
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Bottom-Right: Pink Heart (behind tab bar) */}
      <div className="absolute bottom-[64px] sm:bottom-[72px] -right-[10px] pointer-events-none select-none z-0 w-[42px] sm:w-[48px]">
        <img
          src="/assets/scores/deco-heart-pink-bottom-right-cropped.webp"
          alt=""
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* ---------------- MAIN RESPONSIVE CONTENT (FITS IN ONE SCREEN, NO SCROLL) ---------------- */}
      <div className="relative z-10 flex flex-col justify-between h-full pt-7 sm:pt-9 pb-[76px] px-6 sm:px-7 select-none overflow-hidden font-nunito">
        <div>
          {/* Top Bar: "Scores" Title & Settings Gear Button (exact size as other pages) */}
          <div className="relative w-full max-w-[390px] mx-auto h-[44px] flex items-center justify-between select-none z-20 flex-shrink-0">
            {/* Title: Scores */}
            <h1 className="text-[28px] sm:text-[32px] font-black text-[#17181B] leading-none tracking-[-0.025em]">
              Scores
            </h1>

            {/* Right: Settings Gear Button (exact size and icon as other pages) */}
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Settings"
              className="btn-press w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full border-[1.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          {/* ---------------- HERO SYNC SCORE SECTION ---------------- */}
          <div className="w-full max-w-[342px] mx-auto mt-2 sm:mt-3 flex flex-col items-center select-none">
            {/* "Sync score" label */}
            <p className="text-[14px] sm:text-[15.5px] font-bold text-[#17181B]/55 tracking-tight leading-none mb-1 sm:mb-1.5">
              Sync score
            </p>

            {/* Heart + Sparks + "74%" Score */}
            <div className="relative w-[190px] sm:w-[210px] h-[115px] sm:h-[125px] flex items-center justify-center">
              {/* Sparks around heart */}
              <img
                src="/assets/scores/deco-sparks-yellow-around-heart.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />

              {/* Heart Pink Shape */}
              <img
                src="/assets/scores/hero-heart-pink-sync-score.webp"
                alt=""
                className="relative z-10 w-[142px] sm:w-[155px] h-auto object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* 74% Text Centered */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pt-2">
                <span className="text-[48px] sm:text-[54px] font-black text-[#17181B] leading-none tracking-[-0.04em] select-none">
                  {syncScore}%
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-[13px] sm:text-[14px] font-semibold text-[#17181B]/55 tracking-tight text-center leading-none mt-1 sm:mt-1.5">
              You two are getting closer
            </p>
          </div>

          {/* ---------------- 3 STATS SHAPES ROW ---------------- */}
          <div className="w-full max-w-[342px] mx-auto mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* Stat 1: Streak */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[96px] sm:max-w-[104px] flex items-center justify-center">
                <img
                  src="/assets/scores/stat-starburst-yellow-streak.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                  draggable={false}
                />
                <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none">
                  <span className="text-[28px] sm:text-[32px] font-black text-[#17181B] leading-none tracking-tight">
                    {streak}
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-extrabold text-[#17181B] leading-none mt-0.5">
                    days
                  </span>
                </div>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#17181B]/55 mt-1 tracking-tight leading-none">
                Streak
              </span>
            </div>

            {/* Stat 2: Matches */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[96px] sm:max-w-[104px] flex items-center justify-center">
                <img
                  src="/assets/scores/stat-teardrop-blue-matches.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                  draggable={false}
                />
                <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none pt-2 sm:pt-3">
                  <span className="text-[28px] sm:text-[32px] font-black text-[#17181B] leading-none tracking-tight">
                    {matches}
                  </span>
                </div>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#17181B]/55 mt-1 tracking-tight leading-none">
                Matches
              </span>
            </div>

            {/* Stat 3: Guess Wins */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[96px] sm:max-w-[104px] flex items-center justify-center">
                <img
                  src="/assets/scores/stat-cross-olive-guess-wins.webp"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                  draggable={false}
                />
                <div className="relative z-10 flex flex-col items-center justify-center leading-none select-none">
                  <span className="text-[28px] sm:text-[32px] font-black text-[#17181B] leading-none tracking-tight">
                    {guessWins}
                  </span>
                </div>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#17181B]/55 mt-1 tracking-tight leading-none">
                Guess wins
              </span>
            </div>
          </div>

          {/* ---------------- THIS WEEK SECTION ---------------- */}
          <div className="w-full max-w-[342px] mx-auto mt-3.5 sm:mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[20px] sm:text-[22px] font-black text-[#17181B] tracking-tight leading-none">
                This week
              </h2>
              {/* Dynamic duo avatars indicator */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FCA0D1]" />
                  <span className="text-[11px] font-bold text-[#17181B]/70">{player1Profile.name || 'You'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8EAFFD]" />
                  <span className="text-[11px] font-bold text-[#17181B]/70">{player2Profile.name || 'Player 2'}</span>
                </div>
              </div>
            </div>

            {/* 7 Day Bar Pairs */}
            <div className="w-full flex items-end justify-between px-1 h-[76px] sm:h-[82px] border-b border-[#17181B]/8 pb-1">
              {weeklyBars.map((b) => (
                <div key={b.day} className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1">
                    {/* Pink Bar */}
                    <div
                      style={{ height: `${b.pH * 0.9}px` }}
                      className="w-[11px] sm:w-[13px] bg-[#FCA0D1] rounded-full"
                    />
                    {/* Blue Bar */}
                    <div
                      style={{ height: `${b.bH * 0.9}px` }}
                      className="w-[11px] sm:w-[13px] bg-[#8EAFFD] rounded-full"
                    />
                  </div>
                  {/* Day Label */}
                  <span className="text-[10.5px] sm:text-[11.5px] font-bold text-[#17181B]/50 tracking-wider">
                    {b.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------- MOST IN SYNC SECTION ---------------- */}
          <div className="w-full max-w-[342px] mx-auto mt-3 sm:mt-3.5 flex flex-col gap-1.5 sm:gap-2">
            <h2 className="text-[20px] sm:text-[22px] font-black text-[#17181B] tracking-tight leading-none mb-0.5 sm:mb-1">
              Most in sync
            </h2>

            {categories.map((cat) => (
              <div
                key={cat.name}
                style={{ backgroundColor: cat.bg }}
                className="w-full h-[40px] sm:h-[44px] rounded-full px-3.5 sm:px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={cat.iconSrc}
                    alt=""
                    className={`${cat.iconW} h-auto object-contain pointer-events-none select-none`}
                    draggable={false}
                  />
                  <span className="font-extrabold text-[16px] sm:text-[17px] text-[#17181B] tracking-tight">
                    {cat.name}
                  </span>
                </div>
                <span className="font-black text-[18px] sm:text-[20px] text-[#17181B] tracking-tight">
                  {cat.pct}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- BOTTOM NAVIGATION DOCK (AUTHENTIC, UN-DISTORTED) ---------------- */}
      <div className="absolute bottom-0 left-0 right-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-30 pointer-events-auto">
        <BottomNav activeTab="scores" onTabChange={onNavigateTab} className="mb-0" />
      </div>
    </Screen>
  );
};
