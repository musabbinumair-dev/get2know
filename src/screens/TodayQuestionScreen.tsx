import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import { GameHeader } from '../components/GameHeader';
import { UserProfile } from './CreateProfileScreen';
import { QuestionData } from '../data/gameData';
import { useGameSession } from '../services/gameSessionContext';
import { getBlobConfig } from '../lib/blobs';
import { getAvatarFaceImageSrc } from '../components/ProfileAvatar';
import { NavTab } from '../components/BottomNav';
import { useSession } from '../services/sessionContext';
import { playLockInSound } from '../lib/soundEffects';

interface TodayQuestionScreenProps {
  userProfile?: UserProfile;
  partnerProfile?: UserProfile;
  questionData?: QuestionData;
  streak?: number;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onLockInSuccess?: (answer: string) => void;
  onShuffleQuestion?: () => void;
}

export const TodayQuestionScreen: React.FC<TodayQuestionScreenProps> = ({
  userProfile,
  partnerProfile: _partnerProfile,
  questionData,
  streak = 12,
  onOpenSettings,
  onLockInSuccess,
}) => {
  const gameSession = useGameSession();
  const { profile: sessionProfile } = useSession();
  const isInGame = gameSession.isActive;

  const currentQuestionText = isInGame
    ? gameSession.currentQuestion.question
    : questionData?.question || 'What’s a fear you’d never tell anyone?';

  const [answer, setAnswer] = useState<string>(() => {
    return localStorage.getItem('today_answer') || questionData?.player1DefaultAnswer || '';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('today_answer_locked') === 'true';
  });

  const maxChars = 200;

  // Resolve user avatar + blob dynamically (only what the User chose in profile creating page)
  const resolvedUser: UserProfile = (() => {
    if (userProfile && (userProfile.avatarId || userProfile.color)) {
      return userProfile;
    }
    if (sessionProfile && (sessionProfile.avatarId || sessionProfile.color)) {
      return sessionProfile;
    }
    if (typeof window !== 'undefined') {
      try {
        const savedGoogle = localStorage.getItem('gty_google_profile');
        if (savedGoogle) return JSON.parse(savedGoogle);
        const savedGuest = localStorage.getItem('gty_profile');
        if (savedGuest) return JSON.parse(savedGuest);
      } catch {}
    }
    return { avatarId: 1, name: 'Player 1', color: 'salmon' };
  })();

  const userAvatarId = resolvedUser.avatarId || 1;
  const userColor = resolvedUser.color || 'salmon';
  const userBlobConfig = getBlobConfig(userColor, userAvatarId);
  const userFaceSrc = getAvatarFaceImageSrc(userAvatarId);
  const userBlobSrc = userBlobConfig.src || userBlobConfig.legacySrc;

  // Clear answer on new round in game
  useEffect(() => {
    if (isInGame) {
      setAnswer('');
      setIsLocked(false);
    }
  }, [isInGame, gameSession.currentRound]);

  // Sync body & html background to bright warm yellow
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FEE273';
    document.documentElement.style.backgroundColor = '#FEE273';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    const text = e.target.value.slice(0, maxChars);
    setAnswer(text);
    localStorage.setItem('today_answer', text);
  };

  const handleLockIn = () => {
    playLockInSound();
    const finalAnswer = answer.trim() || 'My secret answer';
    setIsLocked(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gty_last_mode', 'know-me');
      localStorage.setItem('gty_last_mode', 'know-me');
    }

    if (isInGame) {
      setTimeout(() => {
        gameSession.submitAnswer(finalAnswer);
      }, 400);
    } else {
      localStorage.setItem('today_answer_locked', 'true');
      if (questionData) {
        localStorage.setItem(`today_answer_${questionData.id}`, finalAnswer);
      }
      setTimeout(() => {
        onLockInSuccess?.(finalAnswer);
      }, 450);
    }
  };

  // Auto-submit when timer expires in game
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (isInGame && gameSession.isTimerActive && gameSession.timer === 0 && !hasAutoSubmitted.current && !isLocked) {
      hasAutoSubmitted.current = true;
      handleLockIn();
    }
  }, [isInGame, gameSession.isTimerActive, gameSession.timer, isLocked]);

  useEffect(() => {
    hasAutoSubmitted.current = false;
  }, [gameSession.currentRound]);

  // Dynamic question number label (e.g. Question 01, 02, 03...)
  const getModeLabel = () => {
    const roundNum = isInGame ? gameSession.currentRound : 1;
    return `Question ${String(roundNum).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-full min-h-[100dvh] flex flex-col items-center justify-start select-none overflow-x-hidden overflow-y-auto"
      style={{ backgroundColor: '#FEE273' }}
    >
      <style>{`
        .today-stage {
          --u: calc(100vw / 852);
          --u390: calc(100vw / 390);
          width: calc(852 * var(--u));
          height: calc(1846 * var(--u));
          min-height: 100dvh;
          position: relative;
          overflow: visible;
          margin: 0 auto;
        }
        @media (min-width: 600px) and (min-height: 600px) {
          .today-stage {
            --u: min(calc(100vw / 852), calc(100dvh / 1846));
            --u390: min(calc(100vw / 390), calc(100dvh / 844));
          }
        }
      `}</style>

      {/* 852 x 1846 Stage */}
      <div className="today-stage flex-shrink-0 md:hidden">
        {/* =========================================================================
            DECORATIONS (WebP assets moved to /assets/today/, sizes on 390-wide stage)
           ========================================================================= */}
        {/* 1. Pink heart top-left: x 0, top -81 from label center, w 67, h 67 (flush left, cut by it) */}
        <img
          src="/assets/today/deco-heart-pink-topleft.webp"
          alt=""
          width={67}
          height={67}
          aria-hidden="true"
          draggable={false}
          className="absolute object-contain pointer-events-none select-none z-0"
          style={{
            left: 0,
            top: 'calc(372 * var(--u) - 81 * var(--u390))',
            width: 'calc(67 * var(--u390))',
            height: 'calc(67 * var(--u390))',
          }}
        />

        {/* 2. Green cross: x 245, top -81 from label center, w 66, h 68 */}
        <img
          src="/assets/today/deco-cross-olive.webp"
          alt=""
          width={66}
          height={68}
          aria-hidden="true"
          draggable={false}
          className="absolute object-contain pointer-events-none select-none z-0"
          style={{
            left: 'calc(245 * var(--u390))',
            top: 'calc(372 * var(--u) - 81 * var(--u390))',
            width: 'calc(66 * var(--u390))',
            height: 'calc(68 * var(--u390))',
          }}
        />

        {/* 3. Blue star top-right: right edge flush, top -54 from label center, w 60, h 80 (cut by right edge) */}
        <img
          src="/assets/today/deco-star-blue-topright.webp"
          alt=""
          width={60}
          height={80}
          aria-hidden="true"
          draggable={false}
          className="absolute object-contain pointer-events-none select-none z-0"
          style={{
            right: 0,
            top: 'calc(372 * var(--u) - 54 * var(--u390))',
            width: 'calc(60 * var(--u390))',
            height: 'calc(80 * var(--u390))',
          }}
        />

        {/* 4. Pink heart bottom-left: x 4, bottom edge 8px above nav top edge, w 85, h 79 */}
        <img
          src="/assets/today/deco-heart-pink-bottomleft.webp"
          alt=""
          width={85}
          height={79}
          aria-hidden="true"
          draggable={false}
          className="absolute object-contain pointer-events-none select-none z-0"
          style={{
            left: 'calc(4 * var(--u390))',
            bottom: 'calc(80 * var(--u390))',
            width: 'calc(85 * var(--u390))',
            height: 'calc(79 * var(--u390))',
          }}
        />

        {/* 5. Blue star bottom-right: right edge flush, bottom edge 8px above nav top edge, w 76, h 75 (cut by right edge) */}
        <img
          src="/assets/today/deco-star-blue-bottomright.webp"
          alt=""
          width={76}
          height={75}
          aria-hidden="true"
          draggable={false}
          className="absolute object-contain pointer-events-none select-none z-0"
          style={{
            right: 0,
            bottom: 'calc(80 * var(--u390))',
            width: 'calc(76 * var(--u390))',
            height: 'calc(75 * var(--u390))',
          }}
        />

        {/* =========================================================================
            TOP BAR: KEEP AS IS (same components, same position)
           ========================================================================= */}
        <div
          className="absolute left-0 right-0 z-20 flex justify-center"
          style={{
            top: 'calc(28 * var(--u))',
          }}
        >
          {isInGame ? (
            <GameHeader
              showLogo={true}
              roundPillPosition="center"
              currentRound={gameSession.currentRound}
              totalRounds={gameSession.totalRounds}
              timer={gameSession.timer}
              isTimerActive={gameSession.isTimerActive}
              showTimer={true}
              showBack={false}
              onExit={gameSession.exitGame}
            />
          ) : (
            <TopBar streak={streak} onSettingsClick={onOpenSettings} />
          )}
        </div>

        {/* =========================================================================
            1. LABEL: "Today's question"
            font 36, medium, gray-dark (~#5C5A47), left x=72, center y=372
           ========================================================================= */}
        <div
          className="absolute font-medium select-none z-10"
          style={{
            left: 'calc(72 * var(--u))',
            top: 'calc(352 * var(--u))',
            fontSize: 'calc(36 * var(--u))',
            color: '#5C5A47',
            lineHeight: 1.1,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {getModeLabel()}
        </div>

        {/* =========================================================================
            2. HEADING (QUESTION)
            font 88, extra-bold (Nunito 900), near-black, line-height ~1.08,
            left x=72, wraps to 3 lines, spans y=425 to 720.
           ========================================================================= */}
        <h1
          className="absolute font-black text-[#17181B] select-none z-10 break-words"
          style={{
            left: 'calc(72 * var(--u))',
            top: 'calc(425 * var(--u))',
            width: 'calc(708 * var(--u))',
            fontSize: 'calc(88 * var(--u))',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
          }}
        >
          {currentQuestionText}
        </h1>

        {/* =========================================================================
            3. ANSWER CARD
            x=67 to 786 (719w), y=776 to 1037 (261h), radius 48, cream (#FAF4E3),
            NO divider line inside.
           ========================================================================= */}
        <div
          className="absolute z-10 select-none"
          style={{
            left: 'calc(67 * var(--u))',
            top: 'calc(776 * var(--u))',
            width: 'calc(719 * var(--u))',
            height: 'calc(261 * var(--u))',
            borderRadius: 'calc(48 * var(--u))',
            backgroundColor: '#FAF4E3',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          }}
        >
          <textarea
            value={answer}
            onChange={handleTextChange}
            disabled={isLocked}
            placeholder="Type your answer…"
            rows={3}
            className="w-full h-full bg-transparent resize-none border-none outline-none font-medium text-[#17181B] placeholder:text-[#17181B]/35 leading-[1.28]"
            style={{
              fontSize: 'calc(34 * var(--u))',
              paddingLeft: 'calc(52 * var(--u))',
              paddingTop: 'calc(40 * var(--u))',
              paddingRight: 'calc(52 * var(--u))',
              paddingBottom: 'calc(54 * var(--u))',
              fontFamily: "'Nunito', sans-serif",
            }}
            autoFocus={!isLocked}
          />

          {/* Counter "0 / 200" bottom-RIGHT inside the card, right padding 30, bottom padding 24 */}
          <div
            className="absolute font-bold select-none pointer-events-none"
            style={{
              right: 'calc(30 * var(--u))',
              bottom: 'calc(24 * var(--u))',
              fontSize: 'calc(24 * var(--u))',
              color: '#8C8A7B',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {answer.length} / {maxChars}
          </div>
        </div>

        {/* =========================================================================
            4. LOCK ROW
            y=1060 to 1205, left x=72
            - Dynamic avatar blob chosen by the user in profile creating page ~140 diameter
            - Small black circle lock badge (~48) at bottom-right.
            - Text "They can't see it until you both answer." font 30, gray-dark,
              left x=246, 2 lines, vertically centered with avatar.
           ========================================================================= */}
        <div
          className="absolute z-10 flex items-center select-none"
          style={{
            left: 'calc(72 * var(--u))',
            top: 'calc(1060 * var(--u))',
            height: 'calc(145 * var(--u))',
          }}
        >
          {/* Dynamic User Avatar Blob 140 diameter */}
          <div
            className="relative inline-flex items-center justify-center flex-shrink-0"
            style={{
              width: 'calc(140 * var(--u))',
              height: 'calc(140 * var(--u))',
            }}
          >
            <img
              src={userBlobSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <div
              className="relative z-10 flex items-center justify-center pointer-events-none select-none"
              style={{
                width: `${userBlobConfig.avatarScale * 100}%`,
                height: `${userBlobConfig.avatarScale * 100}%`,
                transform: `translate(${userBlobConfig.offsetX}px, ${userBlobConfig.offsetY}px)`,
              }}
            >
              <img
                src={userFaceSrc}
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>

            {/* lock-badge: w 22, h 22, anchored to bottom-right corner of avatar slot (right edge 2px past avatar right edge, bottom edge aligned) */}
            <img
              src="/assets/today/lock-badge.webp"
              alt=""
              width={22}
              height={22}
              draggable={false}
              className="absolute pointer-events-none select-none z-20 object-contain"
              style={{
                width: 'calc(22 * var(--u390))',
                height: 'calc(22 * var(--u390))',
                right: 'calc(-2 * var(--u390))',
                bottom: 0,
              }}
            />
          </div>

          {/* Privacy text: left x=246 (margin-left: 34), font 30, gray-dark, 2 lines */}
          <div
            className="font-bold select-none"
            style={{
              marginLeft: 'calc(34 * var(--u))',
              maxWidth: 'calc(534 * var(--u))',
              fontSize: 'calc(30 * var(--u))',
              lineHeight: 1.25,
              color: '#5C5A47',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            They can’t see it until
            <br />
            you both answer.
          </div>
        </div>

        {/* =========================================================================
            5. BUTTON "Lock in my answer"
            x=71 to 779 (708w), y=1259 to 1362 (103h), full pill, near-black,
            text font 38 bold white, centered.
           ========================================================================= */}
        <button
          type="button"
          onClick={handleLockIn}
          disabled={!answer.trim() && !isInGame}
          className={`btn-press absolute flex items-center justify-center text-center font-bold text-white transition-all outline-none z-10 ${
            isLocked
              ? 'opacity-90 cursor-default'
              : answer.trim() || isInGame
              ? 'cursor-pointer hover:bg-[#252830] active:scale-[0.98]'
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{
            left: 'calc(71 * var(--u))',
            top: 'calc(1259 * var(--u))',
            width: 'calc(708 * var(--u))',
            height: 'calc(103 * var(--u))',
            borderRadius: 'calc(52 * var(--u))',
            backgroundColor: '#17181B',
            fontSize: 'calc(38 * var(--u))',
            fontFamily: "'Nunito', sans-serif",
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          }}
        >
          {isLocked ? 'Answer locked! 🔒' : 'Lock in my answer'}
        </button>
      </div>

      {/* =========================================================================
          TABLET & DESKTOP LAYOUT (768px and up: Responsive --u Scale min(vw, dvh))
         ========================================================================= */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative w-full h-[100dvh] overflow-hidden select-none font-['Nunito']"
        style={{
          ['--u' as any]: 'min(calc(100vw / 1586), calc(100dvh / 992))',
          backgroundColor: '#FEE273',
        }}
      >
        {/* VIEWPORT FIXED DECORATIONS */}
        <img
          src="/assets/today/deco-heart-pink-topleft.webp"
          alt=""
          className="fixed top-0 left-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(100 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/today/deco-star-blue-topright.webp"
          alt=""
          className="fixed top-0 right-0 object-contain pointer-events-none select-none z-10"
          style={{
            width: 'calc(80 * var(--u))',
            height: 'calc(150 * var(--u))',
          }}
          draggable={false}
        />
        <img
          src="/assets/today/deco-heart-pink-bottomleft.webp"
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
        <img
          src="/assets/today/deco-star-blue-bottomright.webp"
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

        {/* 1586 x 992 DESIGN CANVAS */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: 'calc(1586 * var(--u))',
            height: 'calc(992 * var(--u))',
          }}
        >
          {/* HEADER: Back / Settings at left x=112, center y=75 */}
          <button
            type="button"
            onClick={isInGame ? gameSession.exitGame : onOpenSettings}
            aria-label="Exit"
            className="btn-press absolute rounded-full flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(78 * var(--u))',
              height: 'calc(78 * var(--u))',
              border: 'calc(3.5 * var(--u)) dashed #17181B',
            }}
          >
            <svg
              style={{ width: 'calc(34 * var(--u))', height: 'calc(34 * var(--u))' }}
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

          {/* Center Round / Question Pill */}
          <div
            className="absolute rounded-full bg-[#191D21] flex items-center justify-center shadow-sm pointer-events-none z-20"
            style={{
              left: 'calc(793 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              height: 'calc(54 * var(--u))',
              paddingLeft: 'calc(28 * var(--u))',
              paddingRight: 'calc(28 * var(--u))',
              borderRadius: 'calc(27 * var(--u))',
            }}
          >
            <span
              className="text-white font-extrabold tracking-tight"
              style={{ fontSize: 'calc(26 * var(--u))' }}
            >
              {isInGame ? `Round ${gameSession.currentRound} of ${gameSession.totalRounds}` : getModeLabel()}
            </span>
          </div>

          {/* Settings icon right */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="btn-press absolute rounded-full flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer focus:outline-none z-20"
            style={{
              left: 'calc(1426 * var(--u))',
              top: 'calc(75 * var(--u))',
              transform: 'translate(-50%, -50%)',
              width: 'calc(78 * var(--u))',
              height: 'calc(78 * var(--u))',
              border: 'calc(3.5 * var(--u)) dashed #17181B',
            }}
          >
            <img
              src="/icon-gear-settings.webp"
              alt=""
              style={{ width: 'calc(36 * var(--u))', height: 'calc(36 * var(--u))' }}
              className="object-contain"
            />
          </button>

          {/* LEFT COLUMN: x=112 to 770 (658w) */}
          <p
            className="absolute font-bold text-[#5C5A47] tracking-tight leading-none m-0 z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(166 * var(--u))',
              fontSize: 'calc(34 * var(--u))',
            }}
          >
            {getModeLabel()}
          </p>

          <h1
            className="absolute font-black text-[#17181B] tracking-[-0.03em] leading-[1.12] m-0 z-20 break-words"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(212 * var(--u))',
              width: 'calc(658 * var(--u))',
              fontSize: 'calc(80 * var(--u))',
            }}
          >
            {currentQuestionText}
          </h1>

          <p
            className="absolute font-bold text-[#17181B]/60 leading-relaxed m-0 z-20"
            style={{
              left: 'calc(112 * var(--u))',
              top: 'calc(540 * var(--u))',
              width: 'calc(658 * var(--u))',
              fontSize: 'calc(30 * var(--u))',
            }}
          >
            Write what comes to mind first. Your friend will answer the exact same question before results are revealed!
          </p>

          {/* RIGHT COLUMN: x=825 to 1500 (675w, 55 gap) */}
          <h2
            className="absolute font-black text-[#17181B] tracking-tight pointer-events-none select-none m-0 z-20"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(212 * var(--u))',
              fontSize: 'calc(54 * var(--u))',
              lineHeight: 1,
            }}
          >
            Your secret answer
          </h2>

          {/* Answer Card */}
          <div
            className="absolute shadow-sm overflow-hidden z-20"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(280 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(280 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              backgroundColor: '#FAF4E3',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <textarea
              value={answer}
              onChange={handleTextChange}
              disabled={isLocked}
              placeholder="Type your answer…"
              rows={4}
              className="w-full h-full bg-transparent resize-none border-none outline-none font-medium text-[#17181B] placeholder:text-[#17181B]/35 leading-normal"
              style={{
                fontSize: 'calc(32 * var(--u))',
                padding: 'calc(36 * var(--u))',
                fontFamily: "'Nunito', sans-serif",
              }}
              autoFocus={!isLocked}
            />

            {/* Counter bottom-right inside card */}
            <div
              className="absolute font-bold select-none pointer-events-none"
              style={{
                right: 'calc(32 * var(--u))',
                bottom: 'calc(24 * var(--u))',
                fontSize: 'calc(24 * var(--u))',
                color: '#8C8A7B',
              }}
            >
              {answer.length} / {maxChars}
            </div>
          </div>

          {/* Lock Row */}
          <div
            className="absolute z-20 flex items-center"
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(590 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(130 * var(--u))',
            }}
          >
            {/* Dynamic User Avatar Blob */}
            <div
              className="relative inline-flex items-center justify-center flex-shrink-0"
              style={{
                width: 'calc(120 * var(--u))',
                height: 'calc(120 * var(--u))',
              }}
            >
              <img
                src={userBlobSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <div
                className="relative z-10 flex items-center justify-center pointer-events-none select-none"
                style={{
                  width: `${userBlobConfig.avatarScale * 100}%`,
                  height: `${userBlobConfig.avatarScale * 100}%`,
                  transform: `translate(${userBlobConfig.offsetX}px, ${userBlobConfig.offsetY}px)`,
                }}
              >
                <img
                  src={userFaceSrc}
                  alt=""
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>

              {/* Lock badge at corner */}
              <img
                src="/assets/today/lock-badge.webp"
                alt=""
                draggable={false}
                className="absolute pointer-events-none select-none z-20 object-contain"
                style={{
                  width: 'calc(36 * var(--u))',
                  height: 'calc(36 * var(--u))',
                  right: 'calc(-4 * var(--u))',
                  bottom: 'calc(-4 * var(--u))',
                }}
              />
            </div>

            {/* Privacy text */}
            <div
              className="font-bold select-none"
              style={{
                marginLeft: 'calc(28 * var(--u))',
                fontSize: 'calc(28 * var(--u))',
                lineHeight: 1.3,
                color: '#5C5A47',
              }}
            >
              They can’t see it until
              <br />
              you both answer.
            </div>
          </div>

          {/* Lock in answer Button: Black pill button, 675w x 80h, font 38, radius 40 */}
          <button
            type="button"
            onClick={handleLockIn}
            disabled={!answer.trim() && !isInGame}
            className={`btn-press absolute flex items-center justify-center text-center font-black text-white transition-all outline-none z-30 shadow-sm ${
              isLocked
                ? 'opacity-90 cursor-default'
                : answer.trim() || isInGame
                ? 'cursor-pointer hover:bg-[#252830] active:scale-[0.98]'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              left: 'calc(825 * var(--u))',
              top: 'calc(750 * var(--u))',
              width: 'calc(675 * var(--u))',
              height: 'calc(80 * var(--u))',
              borderRadius: 'calc(40 * var(--u))',
              backgroundColor: '#17181B',
              fontSize: 'calc(38 * var(--u))',
            }}
          >
            {isLocked ? 'Answer locked! 🔒' : 'Lock in my answer'}
          </button>
        </div>
      </div>
    </div>
  );
};
