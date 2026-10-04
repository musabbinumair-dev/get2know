import React, { useEffect } from 'react';
import { Screen } from '../components/Screen';
import { BottomNav, NavTab } from '../components/BottomNav';
import { mockData } from '../mockData';

interface HomeScreenProps {
  onOpenSettings?: () => void;
  onOpenFriendProfile?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onOpenGameSettings?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenSettings,
  onOpenFriendProfile,
  onNavigateTab,
  onOpenGameSettings,
}) => {
  // Sync background color
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = '#F8F1E1';
    document.body.style.backgroundColor = '#F8F1E1';
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  return (
    <Screen bg="#F8F1E1" className="text-[#191D21] font-['Nunito'] relative overflow-hidden">
      {/* Responsive scaling for compact viewports */}
      <style>{`
        /* Smooth responsive scaling on compact screen heights */
        @media (max-height: 800px) and (min-height: 701px) {
          .home-stage {
            transform: scale(0.92);
            transform-origin: top center;
          }
        }
        @media (max-height: 700px) and (min-height: 621px) {
          .home-stage {
            transform: scale(0.85);
            transform-origin: top center;
          }
        }
        @media (max-height: 620px) {
          .home-stage {
            transform: scale(0.77);
            transform-origin: top center;
          }
        }
      `}</style>

      {/* =========================================================================
          BACKGROUND DECORATIONS
         ========================================================================= */}
      {/* Top-Left Pink Heart cropped by screen edge */}
      <img
        src="/deco-heart-pink-top-left-cropped.webp"
        alt=""
        className="absolute top-[69px] left-0 w-[53.5px] h-[61.3px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Top-Right Blue Starburst cropped by screen edge */}
      <img
        src="/deco-starburst-blue-top-right-cropped.webp"
        alt=""
        className="absolute top-[75px] right-0 w-[42.1px] h-[71.3px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Bottom-Left Olive Cross: floats above bottom bar */}
      <img
        src="/deco-cross-olive-bottom-left.webp"
        alt=""
        className="absolute bottom-[74px] sm:bottom-[82px] left-[6px] w-[52.1px] h-[51.2px] object-contain pointer-events-none select-none z-10"
        draggable={false}
      />

      {/* Bottom-Right Yellow Crescent: floats above bottom bar */}
      <img
        src="/deco-crescent-yellow-bottom-right.webp"
        alt=""
        className="absolute bottom-[76px] sm:bottom-[86px] right-[18px] w-[43.9px] h-[52.1px] object-contain pointer-events-none select-none z-10"
        draggable={false}
      />

      {/* Bottom-Right Pink Heart: Complete, smooth uncropped organic heart tucked behind bottom bar */}
      <div className="absolute bottom-[26px] sm:bottom-[32px] right-[8px] w-[58px] h-[58px] pointer-events-none select-none z-10 -rotate-[10deg]">
        <img
          src="/assets/blobs/heart-pink.svg"
          alt=""
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* =========================================================================
          MAIN CONTENT CONTAINER (Centered 390px column, un-stretched)
         ========================================================================= */}
      <div className="home-stage relative z-20 w-full h-full max-w-[390px] mx-auto select-none pointer-events-auto">
        
        {/* 1. TOP BAR (Moved downwards for generous breathing room from top) */}
        {/* Duo Logo (tappable -> Friend Profile) */}
        <button
          type="button"
          onClick={onOpenFriendProfile}
          className="btn-press absolute top-[34px] left-[19.7px] w-[58.1px] h-[22.9px] cursor-pointer flex items-center justify-center p-0 z-20 outline-none transition-transform active:scale-95"
          aria-label="Friend Profile"
        >
          <img
            id="logo-duo"
            src="/logo-duo-sparks.webp"
            alt="Duo"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </button>

        {/* Center Streak Pill */}
        <div
          id="box-streak-pill"
          className="absolute top-[29px] left-[159.6px] w-[70.8px] h-[33.3px] rounded-full bg-[#191D21] flex items-center justify-center z-20 shadow-sm pointer-events-none"
        >
          <div className="flex items-center gap-1.5 pl-0.5">
            <img
              src="/icon-flame.webp"
              alt=""
              className="w-[18.3px] h-[21.9px] object-contain pointer-events-none select-none"
              draggable={false}
            />
            <span className="text-white font-black text-[19px] leading-none tracking-tight">
              {mockData.streak}
            </span>
          </div>
        </div>

        {/* Settings Button: Exact vector SVG gear from Scores page */}
        <button
          type="button"
          id="box-settings-btn"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="btn-press absolute top-[28.5px] right-[19.7px] w-[38px] h-[38px] rounded-full border-[1.8px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
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

        {/* 2. GREETING HEADER (Shifted a little above) */}
        <p className="absolute top-[106px] left-[34px] text-[16.5px] font-bold text-[#191D21]/60 tracking-tight leading-none z-10 m-0">
          Ready to play?
        </p>
        <h1 className="absolute top-[130px] left-[33px] text-[43px] font-black text-[#191D21] tracking-[-0.03em] leading-none z-10 m-0">
          Let&apos;s play, {mockData.userName}!
        </h1>

        {/* 3. HERO CARD (Shifted a little above) */}
        {/* Yellow Card Background */}
        <img
          src="/card-hero-yellow.webp"
          alt=""
          className="absolute top-[190px] left-[14.6px] w-[361.7px] h-[250.1px] object-contain pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* Sparks behind avatars */}
        <img
          src="/deco-sparks-yellow-around-avatars.webp"
          alt=""
          className="absolute top-[240px] left-[37px] w-[315px] h-[58.5px] object-contain pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* Alex Avatar (Boy on pink blob) */}
        <img
          src="/avatar-alex-pink-blob-boy.webp"
          alt="Alex"
          className="absolute top-[206px] left-[60.8px] w-[106.5px] h-[112.5px] object-contain pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* Sam Avatar (Girl on blue blob) */}
        <img
          src="/avatar-sam-blue-blob-girl.webp"
          alt="Sam"
          className="absolute top-[211px] left-[220.8px] w-[109.3px] h-[109.3px] object-contain pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* VS Starburst Badge */}
        <img
          src="/badge-vs-starburst-yellow.webp"
          alt=""
          className="absolute top-[226.6px] left-[157.3px] w-[73.6px] h-[77.7px] object-contain pointer-events-none select-none z-20"
          draggable={false}
        />
        <span
          className="absolute top-[253.7px] left-[175px] w-[38px] text-center font-black text-[28px] text-[#191D21] tracking-tighter pointer-events-none select-none z-30"
          style={{ lineHeight: 1 }}
        >
          VS
        </span>

        {/* "Alex vs Sam" Text */}
        <h2
          className="absolute top-[322.7px] left-0 w-full text-center font-black text-[25px] text-[#191D21] tracking-tight pointer-events-none select-none z-20 m-0"
          style={{ lineHeight: 1.1 }}
        >
          {mockData.userName} vs {mockData.friendName}
        </h2>

        {/* "All-time: 7 - 5" Text */}
        <p
          className="absolute top-[352.7px] left-0 w-full text-center font-bold text-[15px] text-[#191D21]/60 tracking-tight pointer-events-none select-none z-20 m-0"
          style={{ lineHeight: 1 }}
        >
          All-time: {mockData.record}
        </p>

        {/* "Start a game" Button */}
        <button
          type="button"
          id="box-start-btn"
          onClick={onOpenGameSettings}
          className="btn-press absolute top-[379.3px] left-[34.7px] w-[321px] h-[42px] rounded-full bg-[#1A1E22] text-white font-extrabold text-[19px] tracking-tight flex items-center justify-center cursor-pointer z-30 shadow-sm outline-none hover:opacity-95 active:scale-98 transition-all"
        >
          Start a game
        </button>

        {/* 4. QUICK START SECTION (Shifted a little above) */}
        {/* "Quick start" Heading */}
        <h2 className="absolute top-[456px] left-[21px] font-black text-[23px] text-[#191D21] tracking-tight pointer-events-none select-none z-20 m-0">
          Quick start
        </h2>

        {/* Know Me Card */}
        <button
          type="button"
          id="quick-blob-pink"
          onClick={onOpenGameSettings}
          className="btn-press absolute top-[486px] left-[15.1px] w-[118.4px] h-[105.2px] cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group"
        >
          <img
            src="/quick-blob-pink-know-me.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
            draggable={false}
          />
          <img
            src="/quick-icon-wink-face-sparks.webp"
            alt=""
            className="absolute top-[23.4px] left-[25.3px] w-[67.7px] h-[36.6px] object-contain pointer-events-none select-none"
            draggable={false}
          />
          <span className="absolute top-[67px] left-0 w-full text-center font-extrabold text-[19px] text-[#191D21] tracking-tight pointer-events-none select-none">
            Know Me
          </span>
        </button>

        {/* Trivia Card */}
        <button
          type="button"
          id="quick-blob-blue"
          onClick={onOpenGameSettings}
          className="btn-press absolute top-[485px] left-[140.8px] w-[111.6px] h-[106.5px] cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group"
        >
          <img
            src="/quick-blob-blue-trivia.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
            draggable={false}
          />
          <img
            src="/quick-icon-lightbulb-sparks.webp"
            alt=""
            className="absolute top-[24.7px] left-[24.2px] w-[63.1px] h-[37.5px] object-contain pointer-events-none select-none"
            draggable={false}
          />
          <span className="absolute top-[68px] left-0 w-full text-center font-extrabold text-[19px] text-[#191D21] tracking-tight pointer-events-none select-none">
            Trivia
          </span>
        </button>

        {/* Random Card */}
        <button
          type="button"
          id="quick-blob-green"
          onClick={onOpenGameSettings}
          className="btn-press absolute top-[486.4px] left-[259.7px] w-[115.7px] h-[106.1px] cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group"
        >
          <img
            src="/quick-blob-green-random.webp"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
            draggable={false}
          />
          <img
            src="/quick-icon-dice-sparks.webp"
            alt=""
            className="absolute top-[23.3px] left-[24.4px] w-[66.8px] h-[37.9px] object-contain pointer-events-none select-none"
            draggable={false}
          />
          <span className="absolute top-[67px] left-0 w-full text-center font-extrabold text-[19px] text-[#191D21] tracking-tight pointer-events-none select-none">
            Random
          </span>
        </button>

        {/* 5. LAST GAME ROW (Shifted a little above) */}
        <div
          id="box-row-bg"
          className="absolute top-[608px] left-[26.5px] w-[337px] h-[65.8px] rounded-full bg-[#FAEECA] flex items-center justify-between px-3.5 z-20 shadow-sm pointer-events-none"
        >
          {/* Trophy & Title */}
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-trophy-yellow-blob.webp"
              alt=""
              className="w-[47.5px] h-[43.9px] object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] text-[#191D21] tracking-tight leading-tight">
                {mockData.lastGame.title}
              </span>
              <span className="font-semibold text-[14px] text-[#191D21]/60 tracking-tight leading-tight mt-0.5">
                {mockData.lastGame.category}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[2px] h-[32px] bg-[#E8D18A] rounded-full" />

          {/* Result & Score */}
          <div className="flex flex-col items-start min-w-[70px]">
            <span className="font-semibold text-[14.5px] text-[#191D21]/60 tracking-tight leading-tight">
              {mockData.lastGame.result}
            </span>
            <span className="font-black text-[25px] text-[#191D21] tracking-tight leading-none mt-0.5">
              {mockData.lastGame.score}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. GLOBAL BOTTOM NAVIGATION DOCK
         ========================================================================= */}
      <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center z-30 pointer-events-auto">
        <BottomNav activeTab="today" onTabChange={onNavigateTab} className="mb-0" />
      </div>
    </Screen>
  );
};

export default HomeScreen;
