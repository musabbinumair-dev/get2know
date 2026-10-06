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
    <Screen fullWidth bg="#F8F1E1" className="h-full min-h-[100dvh] text-[#191D21] font-['Nunito'] relative overflow-hidden">
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
        loading="eager"
        decoding="sync"
        className="absolute top-[69px] left-0 w-[53.5px] h-[61.3px] object-contain pointer-events-none select-none z-0 md:hidden"
        draggable={false}
      />

      {/* Top-Right Blue Starburst cropped by screen edge */}
      <img
        src="/deco-starburst-blue-top-right-cropped.webp"
        alt=""
        loading="eager"
        decoding="sync"
        className="absolute top-[75px] right-0 w-[42.1px] h-[71.3px] object-contain pointer-events-none select-none z-0 md:hidden"
        draggable={false}
      />

      {/* Bottom-Left Olive Cross: floats above bottom bar */}
      <img
        src="/deco-cross-olive-bottom-left.webp"
        alt=""
        loading="eager"
        decoding="sync"
        className="absolute bottom-[74px] sm:bottom-[82px] left-[6px] w-[52.1px] h-[51.2px] object-contain pointer-events-none select-none z-10 md:hidden"
        draggable={false}
      />

      {/* Bottom-Right Yellow Crescent: floats above bottom bar */}
      <img
        src="/deco-crescent-yellow-bottom-right.webp"
        alt=""
        loading="eager"
        decoding="sync"
        className="absolute bottom-[76px] sm:bottom-[86px] right-[18px] w-[43.9px] h-[52.1px] object-contain pointer-events-none select-none z-10 md:hidden"
        draggable={false}
      />

      {/* Bottom-Right Pink Heart: Complete, smooth uncropped organic heart tucked behind bottom bar */}
      <div className="absolute bottom-[26px] sm:bottom-[32px] right-[8px] w-[58px] h-[58px] pointer-events-none select-none z-10 -rotate-[10deg] md:hidden">
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
          MOBILE LAYOUT (< 768px: UNTOUCHED)
         ========================================================================= */}
      <div className="home-stage relative z-20 w-full h-full max-w-[390px] mx-auto select-none pointer-events-auto md:hidden">
        
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
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
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
          onClick={onStartKnowMe || onOpenGameSettings}
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
          onClick={onStartTrivia || onOpenGameSettings}
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
          TABLET & DESKTOP LAYOUT (768px and up: Responsive --u Scale min(vw, dvh))
         ========================================================================= */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative w-full h-[100dvh] overflow-hidden select-none font-['Nunito']"
        style={{
          ['--u' as any]: 'min(calc(100vw / 1586), calc(100dvh / 992))',
        }}
      >
        {/* VIEWPORT FIXED DECORATIONS (Pinned directly to corners of screen like Image A) */}
        {/* Pink heart: top-left */}
        <img
          src="/deco-heart-pink-top-left-cropped.webp"
          alt=""
          className="fixed top-0 left-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(100 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />

        {/* Blue star: top-right */}
        <img
          src="/deco-starburst-blue-top-right-cropped.webp"
          alt=""
          className="fixed top-0 right-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(80 * var(--u))',
            height: 'calc(150 * var(--u))',
          }}
          draggable={false}
        />

        {/* Green cross: bottom-left */}
        <img
          src="/deco-cross-olive-bottom-left.webp"
          alt=""
          className="fixed object-contain pointer-events-none select-none z-10"
          style={{
            left: 'calc(12 * var(--u))',
            bottom: 'calc(24 * var(--u))',
            width: 'calc(105 * var(--u))',
            height: 'calc(110 * var(--u))',
          }}
          draggable={false}
        />

        {/* Pink heart: bottom-right corner behind moon */}
        <div
          className="fixed pointer-events-none select-none z-0 -rotate-[10deg]"
          style={{
            right: 0,
            bottom: 0,
            width: 'calc(135 * var(--u))',
            height: 'calc(80 * var(--u))',
          }}
        >
          <img
            src="/assets/blobs/heart-pink.svg"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Yellow moon: bottom-right */}
        <img
          src="/deco-crescent-yellow-bottom-right.webp"
          alt=""
          className="fixed object-contain pointer-events-none select-none z-10"
          style={{
            right: 'calc(25 * var(--u))',
            bottom: 'calc(35 * var(--u))',
            width: 'calc(80 * var(--u))',
            height: 'calc(107 * var(--u))',
          }}
          draggable={false}
        />

        {/* FIXED BOTTOM NAV: 586w x 100h, centered, bottom: 52 * var(--u) */}
        <div
          className="fixed left-1/2 -translate-x-1/2 z-40 select-none"
          style={{
            bottom: 'calc(52 * var(--u))',
            width: 'calc(586 * var(--u))',
            height: 'calc(100 * var(--u))',
          }}
        >
          {/* Black notch circle behind pink plus button */}
          <div
            className="absolute rounded-full bg-[#1C1F23] pointer-events-none z-10"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              top: 'calc(-18 * var(--u))',
              width: 'calc(92 * var(--u))',
              height: 'calc(92 * var(--u))',
            }}
          />

          {/* Pink + button 78 diameter, centered, sticking ~25 above nav */}
          <button
            type="button"
            onClick={() => onNavigateTab?.('today')}
            aria-label="Quick Actions"
            className="btn-press absolute rounded-full bg-[#F9A2CE] flex items-center justify-center text-[#1C1F23] outline-none cursor-pointer z-20 transition-transform hover:scale-105 active:scale-95"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              top: 'calc(-25 * var(--u))',
              width: 'calc(78 * var(--u))',
              height: 'calc(78 * var(--u))',
            }}
          >
            <svg
              style={{ width: 'calc(36 * var(--u))', height: 'calc(36 * var(--u))' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1C1F23"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Black capsule body */}
          <div
            className="w-full h-full bg-[#1C1F23] flex items-center justify-between relative z-0"
            style={{
              borderRadius: 'calc(50 * var(--u))',
              paddingLeft: 'calc(14 * var(--u))',
              paddingRight: 'calc(14 * var(--u))',
            }}
          >
            {/* Left Tabs (Home, Scores) */}
            <div
              className="flex items-center justify-around h-full"
              style={{ width: 'calc(230 * var(--u))' }}
            >
              {/* Home */}
              <button
                type="button"
                onClick={() => onNavigateTab?.('home')}
                aria-label="Home"
                className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none"
              >
                <div
                  className="flex items-center justify-center"
                  style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                >
                  <svg
                    style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V9.5z" />
                    <polyline points="9 21 9 12 15 12 15 21" />
                  </svg>
                </div>
                <span
                  className="font-bold leading-none select-none text-white"
                  style={{
                    fontSize: 'calc(19 * var(--u))',
                    marginTop: 'calc(4 * var(--u))',
                  }}
                >
                  Home
                </span>
                <div
                  className="flex items-center justify-center w-full"
                  style={{ height: 'calc(4.5 * var(--u))', marginTop: 'calc(4 * var(--u))' }}
                >
                  <div
                    className="rounded-full bg-[#FDD960]"
                    style={{
                      width: 'calc(36 * var(--u))',
                      height: 'calc(4.5 * var(--u))',
                    }}
                  />
                </div>
              </button>

              {/* Scores */}
              <button
                type="button"
                onClick={() => onNavigateTab?.('scores')}
                aria-label="Scores"
                className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none"
              >
                <div
                  className="flex items-center justify-center"
                  style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                >
                  <svg
                    style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A5A5AD"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
                    <path d="M18 4H6v7a6 6 0 0 0 12 0V4z" />
                  </svg>
                </div>
                <span
                  className="font-bold leading-none select-none text-[#A5A5AD]"
                  style={{
                    fontSize: 'calc(19 * var(--u))',
                    marginTop: 'calc(4 * var(--u))',
                  }}
                >
                  Scores
                </span>
                <div
                  className="w-full"
                  style={{ height: 'calc(4.5 * var(--u))', marginTop: 'calc(4 * var(--u))' }}
                />
              </button>
            </div>

            {/* Center Clearance for Pink Button */}
            <div style={{ width: 'calc(80 * var(--u))' }} />

            {/* Right Tabs (Memory, Profile) */}
            <div
              className="flex items-center justify-around h-full"
              style={{ width: 'calc(230 * var(--u))' }}
            >
              {/* Memory */}
              <button
                type="button"
                onClick={() => onNavigateTab?.('memory')}
                aria-label="Memory"
                className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none"
              >
                <div
                  className="flex items-center justify-center"
                  style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                >
                  <svg
                    style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A5A5AD"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#A5A5AD" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span
                  className="font-bold leading-none select-none text-[#A5A5AD] whitespace-nowrap"
                  style={{
                    fontSize: 'calc(19 * var(--u))',
                    marginTop: 'calc(4 * var(--u))',
                  }}
                >
                  Memory
                </span>
                <div
                  className="w-full"
                  style={{ height: 'calc(4.5 * var(--u))', marginTop: 'calc(4 * var(--u))' }}
                />
              </button>

              {/* Profile */}
              <button
                type="button"
                onClick={() => onNavigateTab?.('profile')}
                aria-label="Profile"
                className="group flex flex-col items-center justify-center flex-1 h-full cursor-pointer focus:outline-none"
              >
                <div
                  className="flex items-center justify-center"
                  style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                >
                  <svg
                    style={{ width: 'calc(32 * var(--u))', height: 'calc(32 * var(--u))' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A5A5AD"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span
                  className="font-bold leading-none select-none text-[#A5A5AD] whitespace-nowrap"
                  style={{
                    fontSize: 'calc(19 * var(--u))',
                    marginTop: 'calc(4 * var(--u))',
                  }}
                >
                  Profile
                </span>
                <div
                  className="w-full"
                  style={{ height: 'calc(4.5 * var(--u))', marginTop: 'calc(4 * var(--u))' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 1586 x 992 DESIGN CANVAS (Centered within screen) */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: 'calc(1586 * var(--u))',
            height: 'calc(992 * var(--u))',
          }}
        >
          {/* HEADER (center y=75) */}
          {/* People / Duo Logo: center x=265, center y=75 */}
          <button
            type="button"
            onClick={onOpenFriendProfile}
            aria-label="Friend Profile"
            className="btn-press absolute cursor-pointer flex items-center justify-center p-0 outline-none transition-transform active:scale-95 z-20"
            style={{
              left: 'calc(265 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(116 * var(--u))',
              height: 'calc(46 * var(--u))',
            }}
          >
            <img
              src="/logo-duo-sparks.webp"
              alt="Duo"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          </button>

          {/* Streak pill: center x=793, 146w x 66h, "12" font 38 */}
          <div
            className="absolute rounded-full bg-[#191D21] flex items-center justify-center shadow-sm pointer-events-none z-20"
            style={{
              left: 'calc(793 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(146 * var(--u))',
              height: 'calc(66 * var(--u))',
              borderRadius: 'calc(33 * var(--u))',
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: 'calc(8 * var(--u))', paddingLeft: 'calc(4 * var(--u))' }}
            >
              <img
                src="/icon-flame.webp"
                alt=""
                className="object-contain pointer-events-none select-none"
                style={{ width: 'calc(36 * var(--u))', height: 'calc(43 * var(--u))' }}
                draggable={false}
              />
              <span
                className="text-white font-black leading-none tracking-tight"
                style={{ fontSize: 'calc(38 * var(--u))' }}
              >
                {mockData.streak}
              </span>
            </div>
          </div>

          {/* Settings icon: center x=1363, 78 diameter */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="btn-press absolute rounded-full flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
            style={{
              left: 'calc(1363 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(78 * var(--u))',
              height: 'calc(78 * var(--u))',
              border: 'calc(3.5 * var(--u)) dashed #17181B',
            }}
          >
            <svg
              style={{ width: 'calc(38 * var(--u))', height: 'calc(38 * var(--u))' }}
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

          {/* LEFT COLUMN: starts at x=112, width 658, ends at x=770 */}
          {/* "Ready to play?" font 34, gray, left x=112, y=170 */}
          <p
            className="absolute font-bold text-[#191D21]/60 tracking-tight leading-none m-0 z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(166 * var(--u))',
              fontSize: 'calc(34 * var(--u))',
            }}
          >
            Ready to play?
          </p>

          {/* "Let's play, Alex!" left x=112, top 212, baseline y=280. Fits inside 658w without overlap */}
          <h1
            className="absolute font-black text-[#191D21] tracking-[-0.03em] leading-none m-0 z-20 whitespace-nowrap"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(212 * var(--u))',
              fontSize: 'calc(74 * var(--u))',
              maxWidth: 'calc(658 * var(--u))',
            }}
          >
            Let&apos;s play, {mockData.userName}!
          </h1>

          {/* Yellow card: starts at x=112 (aligned with heading left edge), y=322 (~36px gap from heading), 658w x 466h, radius 40 */}
          <div
            className="absolute shadow-sm overflow-hidden z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(322 * var(--u))',
              width: 'calc(658 * var(--u))',
              height: 'calc(466 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              backgroundColor: '#FEE36F',
            }}
          >
            {/* Sparkle lines outside both avatars */}
            <img
              src="/deco-sparks-yellow-around-avatars.webp"
              alt=""
              className="absolute object-contain pointer-events-none select-none z-10"
              style={{
                left: '50%',
                top: 'calc(133 * var(--u))',
                transform: 'translate(-50%, -50%)',
                width: 'calc(580 * var(--u))',
                height: 'auto',
              }}
              draggable={false}
            />

            {/* Avatars: 190 diameter each, VS 130 sitting BETWEEN them, center y=133 inside card */}
            {/* Pink blob (Alex) left */}
            <img
              src="/avatar-alex-pink-blob-boy.webp"
              alt="Alex"
              className="absolute object-contain pointer-events-none select-none z-20"
              style={{
                left: 'calc(58 * var(--u))',
                top: 'calc(38 * var(--u))',
                width: 'calc(190 * var(--u))',
                height: 'calc(190 * var(--u))',
              }}
              draggable={false}
            />

            {/* VS burst ~130 sitting between the avatars */}
            <div
              className="absolute flex items-center justify-center z-30"
              style={{
                left: '50%',
                top: 'calc(133 * var(--u))',
                transform: 'translate(-50%, -50%)',
                width: 'calc(130 * var(--u))',
                height: 'calc(130 * var(--u))',
              }}
            >
              <img
                src="/badge-vs-starburst-yellow.webp"
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <span
                className="absolute font-black text-[#191D21] tracking-tighter pointer-events-none select-none"
                style={{
                  fontSize: 'calc(50 * var(--u))',
                  lineHeight: 1,
                }}
              >
                VS
              </span>
            </div>

            {/* Blue blob (Sam) right */}
            <img
              src="/avatar-sam-blue-blob-girl.webp"
              alt="Sam"
              className="absolute object-contain pointer-events-none select-none z-20"
              style={{
                right: 'calc(58 * var(--u))',
                top: 'calc(38 * var(--u))',
                width: 'calc(190 * var(--u))',
                height: 'calc(190 * var(--u))',
              }}
              draggable={false}
            />

            {/* "Alex vs Sam" font 48 bold, center y=268 inside card */}
            <h2
              className="absolute left-0 w-full text-center font-black text-[#191D21] tracking-tight pointer-events-none select-none z-20 m-0"
              style={{
                top: 'calc(268 * var(--u))',
                transform: 'translateY(-50%)',
                fontSize: 'calc(48 * var(--u))',
                lineHeight: 1,
              }}
            >
              {mockData.userName} vs {mockData.friendName}
            </h2>

            {/* "All-time: 7 - 5" font 29, center y=315 inside card */}
            <p
              className="absolute left-0 w-full text-center font-bold text-[#191D21]/60 tracking-tight pointer-events-none select-none z-20 m-0"
              style={{
                top: 'calc(315 * var(--u))',
                transform: 'translateY(-50%)',
                fontSize: 'calc(29 * var(--u))',
                lineHeight: 1,
              }}
            >
              All-time: {mockData.record}
            </p>

            {/* Black pill button: 602w x 80h, font 38, centered horizontally in card */}
            <button
              type="button"
              onClick={onOpenGameSettings}
              className="btn-press absolute bg-[#1A1E22] text-white font-extrabold tracking-tight flex items-center justify-center cursor-pointer shadow-sm outline-none hover:opacity-95 active:scale-98 transition-all z-30"
              style={{
                left: 'calc(28 * var(--u))',
                top: 'calc(351 * var(--u))',
                width: 'calc(602 * var(--u))',
                height: 'calc(80 * var(--u))',
                borderRadius: 'calc(40 * var(--u))',
                fontSize: 'calc(38 * var(--u))',
              }}
            >
              Start a game
            </button>
          </div>

          {/* RIGHT COLUMN: x=825 to 1500 (675w, 55 gap from left column) */}
          {/* "Quick start" font 54 bold, baseline aligned with "Let's play" */}
          <h2
            className="absolute font-black text-[#191D21] tracking-tight pointer-events-none select-none m-0 z-20"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(232 * var(--u))',
              fontSize: 'calc(54 * var(--u))',
              lineHeight: 1,
            }}
          >
            Quick start
          </h2>

          {/* Three blob tiles row: top y=322 (aligned with top of yellow card), each 220w x 220h, tiny gaps, full 675w */}
          {/* Tile 1: Know Me (Pink) */}
          <button
            type="button"
            onClick={onStartKnowMe || onOpenGameSettings}
            className="btn-press absolute cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group flex items-center justify-center"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(322 * var(--u))',
              width: 'calc(220 * var(--u))',
              height: 'calc(220 * var(--u))',
            }}
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
              className="absolute object-contain pointer-events-none select-none"
              style={{
                top: 'calc(42 * var(--u))',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(126 * var(--u))',
                height: 'calc(70 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="absolute left-0 w-full text-center font-extrabold text-[#191D21] tracking-tight pointer-events-none select-none"
              style={{
                bottom: 'calc(24 * var(--u))',
                fontSize: 'calc(34 * var(--u))',
                lineHeight: 1,
              }}
            >
              Know Me
            </span>
          </button>

          {/* Tile 2: Trivia (Blue) */}
          <button
            type="button"
            onClick={onStartTrivia || onOpenGameSettings}
            className="btn-press absolute cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group flex items-center justify-center"
            style={{
              left: 'calc(1052.5 * var(--u))',
              top: 'calc(322 * var(--u))',
              width: 'calc(220 * var(--u))',
              height: 'calc(220 * var(--u))',
            }}
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
              className="absolute object-contain pointer-events-none select-none"
              style={{
                top: 'calc(42 * var(--u))',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(120 * var(--u))',
                height: 'calc(72 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="absolute left-0 w-full text-center font-extrabold text-[#191D21] tracking-tight pointer-events-none select-none"
              style={{
                bottom: 'calc(24 * var(--u))',
                fontSize: 'calc(34 * var(--u))',
                lineHeight: 1,
              }}
            >
              Trivia
            </span>
          </button>

          {/* Tile 3: Random (Green) */}
          <button
            type="button"
            onClick={onOpenGameSettings}
            className="btn-press absolute cursor-pointer z-20 p-0 outline-none transition-transform active:scale-95 group flex items-center justify-center"
            style={{
              left: 'calc(1280 * var(--u))',
              top: 'calc(322 * var(--u))',
              width: 'calc(220 * var(--u))',
              height: 'calc(220 * var(--u))',
            }}
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
              className="absolute object-contain pointer-events-none select-none"
              style={{
                top: 'calc(42 * var(--u))',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(124 * var(--u))',
                height: 'calc(72 * var(--u))',
              }}
              draggable={false}
            />
            <span
              className="absolute left-0 w-full text-center font-extrabold text-[#191D21] tracking-tight pointer-events-none select-none"
              style={{
                bottom: 'calc(24 * var(--u))',
                fontSize: 'calc(34 * var(--u))',
                lineHeight: 1,
              }}
            >
              Random
            </span>
          </button>

          {/* "Last game" card: 675w x 141h, y=582 to 723, full pill radius */}
          <div
            className="absolute flex items-center justify-between shadow-sm pointer-events-none z-20"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(582 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(141 * var(--u))',
              borderRadius: 'calc(70.5 * var(--u))',
              backgroundColor: '#FAEECA',
              paddingLeft: 'calc(32 * var(--u))',
              paddingRight: 'calc(44 * var(--u))',
            }}
          >
            {/* Trophy blob ~95 at left */}
            <div
              className="flex items-center"
              style={{ gap: 'calc(20 * var(--u))' }}
            >
              <img
                src="/icon-trophy-yellow-blob.webp"
                alt=""
                className="object-contain pointer-events-none select-none"
                style={{
                  width: 'calc(95 * var(--u))',
                  height: 'calc(88 * var(--u))',
                }}
                draggable={false}
              />
              <div className="flex flex-col">
                <span
                  className="font-extrabold text-[#191D21] tracking-tight leading-tight"
                  style={{ fontSize: 'calc(32 * var(--u))' }}
                >
                  {mockData.lastGame.title}
                </span>
                <span
                  className="font-semibold text-[#191D21]/60 tracking-tight leading-tight"
                  style={{
                    fontSize: 'calc(28 * var(--u))',
                    marginTop: 'calc(4 * var(--u))',
                  }}
                >
                  {mockData.lastGame.category}
                </span>
              </div>
            </div>

            {/* Vertical divider line */}
            <div
              style={{
                width: 'calc(3 * var(--u))',
                height: 'calc(72 * var(--u))',
                backgroundColor: '#E8D18A',
                borderRadius: 'calc(2 * var(--u))',
              }}
            />

            {/* "You won" font 30 and "80 - 65" font 54 bold on right */}
            <div
              className="flex flex-col items-start"
              style={{ minWidth: 'calc(150 * var(--u))' }}
            >
              <span
                className="font-semibold text-[#191D21]/60 tracking-tight leading-tight"
                style={{ fontSize: 'calc(30 * var(--u))' }}
              >
                {mockData.lastGame.result}
              </span>
              <span
                className="font-black text-[#191D21] tracking-tight leading-none"
                style={{
                  fontSize: 'calc(54 * var(--u))',
                  marginTop: 'calc(4 * var(--u))',
                }}
              >
                {mockData.lastGame.score}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. MOBILE BOTTOM NAVIGATION DOCK (< 768px: UNTOUCHED)
         ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex justify-center z-30 pointer-events-auto md:hidden">
        <BottomNav activeTab="home" onTabChange={onNavigateTab} className="mb-0" />
      </div>
    </Screen>
  );

};

export default HomeScreen;
