import React, { useEffect } from 'react';
import { Screen } from '../components/Screen';
import { BottomNav, NavTab } from '../components/BottomNav';
import { mockData } from '../mockData';

interface HomeScreenProps {
  onOpenSettings?: () => void;
  onOpenFriendProfile?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onOpenGameSettings?: () => void;
  onStartKnowMe?: () => void;
  onStartTrivia?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenSettings,
  onOpenFriendProfile,
  onNavigateTab,
  onOpenGameSettings,
  onStartKnowMe,
  onStartTrivia,
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
    <Screen bg="#F8F1E1" className="h-full min-h-[100dvh] text-[#191D21] font-['Nunito'] relative overflow-hidden flex flex-col justify-between">
      {/* Responsive scaling for compact viewports */}
      <style>{`
        /* Smooth responsive scaling on compact screen heights */
        @media (max-height: 740px) and (min-height: 651px) {
          .home-stage {
            transform: scale(0.92);
            transform-origin: top center;
          }
        }
        @media (max-height: 650px) {
          .home-stage {
            transform: scale(0.84);
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
        loading="eager"
        decoding="sync"
        className="absolute top-[69px] left-0 w-[53.5px] h-[61.3px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Top-Right Blue Starburst cropped by screen edge */}
      <img
        src="/deco-starburst-blue-top-right-cropped.webp"
        alt=""
        loading="eager"
        decoding="sync"
        className="absolute top-[75px] right-0 w-[42.1px] h-[71.3px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Bottom-Left Olive Cross: floats above bottom bar */}
      <img
        src="/deco-cross-olive-bottom-left.webp"
        alt=""
        loading="eager"
        decoding="sync"
        className="absolute bottom-[74px] sm:bottom-[82px] left-[6px] w-[52.1px] h-[51.2px] object-contain pointer-events-none select-none z-10"
        draggable={false}
      />

      {/* Bottom-Right Yellow Crescent: floats above bottom bar */}
      <img
        src="/deco-crescent-yellow-bottom-right.webp"
        alt=""
        loading="eager"
        decoding="sync"
        className="absolute bottom-[76px] sm:bottom-[86px] right-[18px] w-[43.9px] h-[52.1px] object-contain pointer-events-none select-none z-10"
        draggable={false}
      />

      {/* Bottom-Right Pink Heart: Complete, smooth uncropped organic heart tucked behind bottom bar */}
      <div className="absolute bottom-[26px] sm:bottom-[32px] right-[8px] w-[58px] h-[58px] pointer-events-none select-none z-10 -rotate-[10deg]">
        <img
          src="/assets/blobs/heart-pink.svg"
          alt=""
          loading="eager"
          decoding="sync"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* =========================================================================
          1. TOP BAR (EXACT position and icon size as Scores and Memory pages)
         ========================================================================= */}
      <div className="relative w-full z-30 flex-shrink-0 pt-7 sm:pt-9 px-6 sm:px-7 select-none">
        <div className="relative w-full max-w-[390px] mx-auto h-[44px] flex items-center justify-between select-none z-20 flex-shrink-0">
          {/* Duo Logo (tappable -> Friend Profile) */}
          <button
            type="button"
            onClick={onOpenFriendProfile}
            className="btn-press cursor-pointer flex items-center justify-start p-0 outline-none transition-transform active:scale-95"
            style={{ width: '64px', height: '28px' }}
            aria-label="Friend Profile"
          >
            <img
              id="logo-duo"
              src="/logo-duo-sparks.webp"
              alt="Duo"
              className="w-full h-full object-contain object-left pointer-events-none select-none"
              draggable={false}
            />
          </button>

          {/* Center Streak Pill */}
          <div
            id="box-streak-pill"
            className="h-[34px] px-3.5 rounded-full bg-[#191D21] flex items-center justify-center gap-1.5 shadow-sm pointer-events-none"
          >
            <img
              src="/icon-flame.webp"
              alt=""
              className="w-[18px] h-[22px] object-contain pointer-events-none select-none"
              draggable={false}
            />
            <span className="text-white font-black text-[19px] leading-none tracking-tight">
              {mockData.streak}
            </span>
          </div>

          {/* Settings Button: Exact vector SVG gear from Scores and Memory page */}
          <button
            type="button"
            id="box-settings-btn"
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN HOME STAGE CONTENT
         ========================================================================= */}
      <div className="home-stage relative z-20 w-full flex-1 max-w-[390px] mx-auto select-none pointer-events-auto h-[600px]">
        {/* 2. GREETING HEADER */}
        <p className="absolute top-[22px] sm:top-[26px] left-[34px] text-[16.5px] font-bold text-[#191D21]/60 tracking-tight leading-none z-10 m-0">
          Ready to play?
        </p>
        <h1 className="absolute top-[46px] sm:top-[50px] left-[33px] text-[43px] font-black text-[#191D21] tracking-[-0.03em] leading-none z-10 m-0">
          Let&apos;s play, {mockData.userName}!
        </h1>

        {/* 3. HERO CARD */}
        {/* Yellow Card Background */}
        <img
          src="/card-hero-yellow.webp"
          alt=""
          className="absolute top-[106px] sm:top-[110px] left-[14.6px] w-[361.7px] h-[250.1px] object-contain pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* Sparks behind avatars */}
        <img
          src="/deco-sparks-yellow-around-avatars.webp"
          alt=""
          className="absolute top-[156px] sm:top-[160px] left-[37px] w-[315px] h-[58.5px] object-contain pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* Alex Avatar (Boy on pink blob) */}
        <img
          src="/avatar-alex-pink-blob-boy.webp"
          alt="Alex"
          className="absolute top-[122px] sm:top-[126px] left-[60.8px] w-[106.5px] h-[112.5px] object-contain pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* Sam Avatar (Girl on blue blob) */}
        <img
          src="/avatar-sam-blue-blob-girl.webp"
          alt="Sam"
          className="absolute top-[127px] sm:top-[131px] left-[220.8px] w-[109.3px] h-[109.3px] object-contain pointer-events-none select-none z-20"
          draggable={false}
        />

        {/* VS Starburst Badge */}
        <img
          src="/badge-vs-starburst-yellow.webp"
          alt=""
          className="absolute top-[142.6px] sm:top-[146.6px] left-[157.3px] w-[73.6px] h-[77.7px] object-contain pointer-events-none select-none z-20"
          draggable={false}
        />
        <span
          className="absolute top-[169.7px] sm:top-[173.7px] left-[175px] w-[38px] text-center font-black text-[28px] text-[#191D21] tracking-tighter pointer-events-none select-none z-30"
          style={{ lineHeight: 1 }}
        >
          VS
        </span>

        {/* "Alex vs Sam" Text */}
        <h2
          className="absolute top-[238.7px] sm:top-[242.7px] left-0 w-full text-center font-black text-[25px] text-[#191D21] tracking-tight pointer-events-none select-none z-20 m-0"
          style={{ lineHeight: 1.1 }}
        >
          {mockData.userName} vs {mockData.friendName}
        </h2>

        {/* "All-time: 7 - 5" Text */}
        <p
          className="absolute top-[268.7px] sm:top-[272.7px] left-0 w-full text-center font-bold text-[15px] text-[#191D21]/60 tracking-tight pointer-events-none select-none z-20 m-0"
          style={{ lineHeight: 1 }}
        >
          All-time: {mockData.record}
        </p>

        {/* "Start a game" Button */}
        <button
          type="button"
          id="box-start-btn"
          onClick={onOpenGameSettings}
          className="btn-press absolute top-[295.3px] sm:top-[299.3px] left-[34.7px] w-[321px] h-[42px] rounded-full bg-[#1A1E22] text-white font-extrabold text-[19px] tracking-tight flex items-center justify-center cursor-pointer z-30 shadow-sm outline-none hover:opacity-95 active:scale-98 transition-all"
        >
          Start a game
        </button>

        {/* 4. QUICK START SECTION */}
        {/* "Quick start" Heading */}
        <h2 className="absolute top-[372px] sm:top-[376px] left-[21px] font-black text-[23px] text-[#191D21] tracking-tight pointer-events-none select-none z-20 m-0">
          Quick start
        </h2>

        {/* Know Me Card */}
        <button
          type="button"
          id="quick-blob-pink"
          onClick={onStartKnowMe || onOpenGameSettings}
          className="btn-press absolute top-[402px] sm:top-[406px] left-[15.1px] w-[118.4px] h-[105.2px] cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group"
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
          onClick={onStartTrivia || onOpenGameSettings}
          className="btn-press absolute top-[401px] sm:top-[405px] left-[140.8px] w-[111.6px] h-[106.5px] cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group"
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
          className="btn-press absolute top-[402.4px] sm:top-[406.4px] left-[259.7px] w-[115.7px] h-[106.1px] cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group"
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

        {/* 5. LAST GAME ROW */}
        <div
          id="box-row-bg"
          className="absolute top-[524px] sm:top-[528px] left-[26.5px] w-[337px] h-[65.8px] rounded-full bg-[#FAEECA] flex items-center justify-between px-3.5 z-20 shadow-sm pointer-events-none"
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
          6. BOTTOM NAVIGATION DOCK (Exact match to Scores and Memory pages)
         ========================================================================= */}
      <div className="absolute bottom-0 left-0 right-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-30 pointer-events-auto">
        <BottomNav activeTab="home" onTabChange={onNavigateTab} className="mb-0" />
      </div>
    </Screen>
  );

};

export default HomeScreen;
