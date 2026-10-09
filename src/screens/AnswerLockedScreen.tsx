import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSession } from '../services/gameSessionContext';
import { TopBar } from '../components/TopBar';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { NavTab } from '../components/BottomNav';
import { playPartnerAnsweredSound, playNudgeSound, playTapSound } from '../lib/soundEffects';

interface AnswerLockedScreenProps {
  friendName?: string;
  friendAvatarId?: number;
  friendBlobId?: string | number;
  streak?: number;
  onEditAnswer?: () => void;
  onOpenSettings?: () => void;
  onOpenFriendProfile?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onPlayer2Answered?: () => void;
}

export const AnswerLockedScreen: React.FC<AnswerLockedScreenProps> = ({
  friendName,
  friendAvatarId,
  friendBlobId,
  streak,
  onEditAnswer,
  onOpenSettings,
  onOpenFriendProfile,
  onPlayer2Answered,
}) => {
  const navigate = useNavigate();
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  // Partner Profile state from persistent storage or default
  const partnerProfile = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem('partner_profile') ||
        localStorage.getItem('gty_partner_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      name: 'Your friend',
      avatarId: 2,
      color: 'teal',
      blobId: 'teal',
    };
  }, []);

  const resolvedFriendName =
    friendName && friendName !== 'Player 2' && friendName !== 'Sam'
      ? friendName
      : partnerProfile.name || 'Your friend';

  const resolvedAvatarId = friendAvatarId || partnerProfile.avatarId || 2;
  const resolvedBlobId =
    friendBlobId || partnerProfile.blobId || partnerProfile.color || 'teal';
  const resolvedStreak = streak ?? 0;

  const [toastMessage, setToastMessage] = useState<string>('');
  const [nudgeCooldown, setNudgeCooldown] = useState<number>(0);
  const [friendStatus, setFriendStatus] = useState<string>('Answering...');
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  const simulationTimers = useRef<NodeJS.Timeout[]>([]);

  // Cleanup simulation timers on unmount
  useEffect(() => {
    return () => {
      simulationTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Set background color on mount
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#FAF6EA';
    document.documentElement.style.backgroundColor = '#FAF6EA';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const isTrivia =
    (isInGame && gameSession.currentRoundType === 'trivia') ||
    (typeof window !== 'undefined' &&
      (sessionStorage.getItem('gty_last_mode') === 'trivia' ||
        localStorage.getItem('gty_last_mode') === 'trivia'));

  // Avatar click handler: triggers state change from lightened/grayscale to full vibrant normal state and advances
  const handleAvatarClick = () => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setFriendStatus('Answer locked in! 🎉');
    playPartnerAnsweredSound();

    // Transition to the guess/next screen
    const t2 = setTimeout(() => {
      if (isInGame) {
        gameSession.advanceFromWaiting();
      } else if (onPlayer2Answered) {
        onPlayer2Answered();
      } else if (isTrivia) {
        navigate('/reveal');
      } else {
        navigate('/guess');
      }
    }, 1200);
    simulationTimers.current.push(t2);
  };

  // Cooldown countdown effect for Nudge button
  useEffect(() => {
    if (nudgeCooldown <= 0) return;
    const timer = setInterval(() => {
      setNudgeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [nudgeCooldown]);

  const handleNudge = () => {
    if (nudgeCooldown > 0) return;
    playNudgeSound();
    setToastMessage('Nudge sent 👋');
    setNudgeCooldown(30);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);

    const nudgeTimer = setTimeout(() => {
      if (!isAnswerLocked) {
        handleAvatarClick();
      }
    }, 1500);
    simulationTimers.current.push(nudgeTimer);
  };

  const handleEditClick = () => {
    playTapSound();
    if (typeof window !== 'undefined') {
      localStorage.setItem('today_answer_locked', 'false');
    }
    if (onEditAnswer) {
      onEditAnswer();
    } else if (isInGame) {
      if (gameSession.currentRoundType === 'trivia') {
        navigate('/trivia-question');
      } else {
        navigate('/today-question');
      }
    } else if (isTrivia) {
      navigate('/trivia-question');
    } else {
      navigate('/today-question');
    }
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      navigate('/profile');
    }
  };

  const handleOpenFriendProfile = () => {
    if (onOpenFriendProfile) {
      onOpenFriendProfile();
    } else {
      navigate('/friend');
    }
  };

  return (
    <div
      className="relative w-full min-h-[100dvh] bg-[#FAF6EA] select-none font-['Nunito',sans-serif] overflow-x-hidden"
      style={{
        backgroundColor: '#FAF6EA',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1B1D20] text-white px-5 py-2.5 rounded-full font-black text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE LAYOUT (< 768px: Mobile First, Exact Home Top Bar, No Bottom Bar)
         ========================================================================= */}
      <div className="md:hidden relative w-full min-h-[100dvh] max-w-[390px] mx-auto flex flex-col justify-between items-center select-none">
        {/* ---------------- EXACT TOP BAR AS HOMEPAGE ---------------- */}
        <TopBar
          mode="streak"
          streak={resolvedStreak}
          onOpenSettings={handleOpenSettings}
          onOpenFriendProfile={handleOpenFriendProfile}
          className="w-full absolute top-0 left-0"
        />

        {/* ---------------- MAIN CONTENT BODY ---------------- */}
        <div className="w-full px-5 flex-1 flex flex-col items-center justify-start pt-[82px] pb-6 relative z-10">
          {/* Lock Cluster: Lock-blob + sparkles centered; heart top-left, blue star top-right, green cross right below star */}
          <div className="relative w-full max-w-[340px] h-[185px] sm:h-[195px] flex items-center justify-center">
            {/* Sparkle lines behind lock-blob (same center) */}
            <img
              src="/assets/lock-sparkles.webp"
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] sm:w-[225px] h-auto object-contain pointer-events-none select-none z-0"
              draggable={false}
            />

            {/* Pink Heart: Top-Left */}
            <img
              src="/assets/heart-pink.webp"
              alt=""
              className="absolute left-[18px] sm:left-[22px] top-[14px] w-[50px] sm:w-[54px] h-[47px] sm:h-[50px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />

            {/* Blue Star: Top-Right */}
            <img
              src="/assets/star-blue.webp"
              alt=""
              className="absolute right-[20px] sm:right-[24px] top-[10px] w-[52px] sm:w-[56px] h-[52px] sm:h-[56px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />

            {/* Green Cross: Right below the star */}
            <img
              src="/assets/cross-green.webp"
              alt=""
              className="absolute right-[26px] sm:right-[30px] top-[80px] sm:top-[86px] w-[44px] sm:w-[48px] h-[43px] sm:h-[47px] object-contain pointer-events-none select-none z-10"
              draggable={false}
            />

            {/* Lock Blob: Yellow blob with padlock, centered */}
            <img
              src="/assets/lock-blob.webp"
              alt="Answer locked"
              className="relative z-10 w-[130px] sm:w-[140px] h-auto object-contain pointer-events-none select-none drop-shadow-xs"
              draggable={false}
            />
          </div>

          {/* Heading: "Answer locked in" huge extra-bold, centered, one line */}
          <div className="text-center mt-1 sm:mt-2 mb-1 flex flex-col items-center">
            <h1 className="text-[34px] sm:text-[38px] font-black text-[#1B1D20] tracking-[-0.035em] leading-tight m-0 select-none whitespace-nowrap">
              Answer locked in
            </h1>

            {/* Subtitle: "Waiting for {friend name}…" gray, centered */}
            <p className="mt-1 sm:mt-1.5 text-[17px] sm:text-[18px] font-bold text-[#1B1D20]/60 tracking-tight m-0 select-none">
              {friendStatus !== 'Answering...'
                ? friendStatus
                : `Waiting for ${resolvedFriendName}…`}
            </p>
          </div>

          {/* Avatar + STATIC Ring Arcs (NO animation) + Clock Badge (Enlarged avatar and blob) */}
          <div
            onClick={handleAvatarClick}
            className="relative flex items-center justify-center my-3 sm:my-4 select-none cursor-pointer active:scale-95 transition-transform"
            style={{ width: '172px', height: '166px' }}
            title="Click avatar to see answer state"
          >
            {/* STATIC Ring Arcs (animation removed) */}
            <img
              src="/assets/waiting-ring-arcs.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              draggable={false}
            />

            {/* Enlarged Dynamic Avatar Container: size increased under the ring */}
            <div className="relative w-[116px] h-[116px] flex items-center justify-center z-10">
              <div
                className="w-full h-full flex items-center justify-center transition-all duration-300"
                style={{
                  opacity: isAnswerLocked ? 1 : 0.55,
                  filter: isAnswerLocked ? 'none' : 'grayscale(25%)',
                }}
              >
                <ProfileAvatar
                  avatarId={resolvedAvatarId}
                  blobId={resolvedBlobId}
                  size={116}
                  useNewBlob={true}
                />
              </div>

              {/* Clock badge at bottom-right of the avatar */}
              <img
                src="/assets/clock-badge.webp"
                alt=""
                className="absolute -bottom-1 -right-1 w-[36px] h-[36px] object-contain pointer-events-none select-none z-20 drop-shadow-sm"
                draggable={false}
              />
            </div>
          </div>

          {/* Action Buttons: Nudge, Edit Answer, Caption */}
          <div className="w-full max-w-[342px] flex flex-col items-center gap-2.5 mt-2 sm:mt-3 z-20">
            {/* Button 1: "Nudge them 👋" */}
            <button
              type="button"
              onClick={handleNudge}
              disabled={nudgeCooldown > 0 || isAnswerLocked}
              className="btn-press w-full h-[54px] rounded-full bg-[#1B1D20] hover:bg-[#2B2E33] active:scale-[0.98] transition-all text-white font-black text-[18px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-sm focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <span>{nudgeCooldown > 0 ? `Nudged (${nudgeCooldown}s)` : 'Nudge them'}</span>
              <span className="text-[20px] leading-none">👋</span>
            </button>

            {/* Button 2: "Edit answer" */}
            <button
              type="button"
              onClick={handleEditClick}
              disabled={isAnswerLocked}
              className="btn-press w-full h-[54px] rounded-full bg-[#FAF3DF] hover:bg-[#F2E8CD] active:scale-[0.98] transition-all text-[#1B1D20] font-black text-[18px] tracking-tight flex items-center justify-center shadow-xs border border-[#1B1D20]/5 cursor-pointer focus:outline-none"
            >
              Edit answer
            </button>

            {/* Footnote Caption */}
            <p className="mt-0.5 text-[13.5px] sm:text-[14px] font-bold text-[#1B1D20]/50 tracking-tight text-center m-0 select-none">
              We’ll tell you when they answer.
            </p>
          </div>
        </div>

        {/* ---------------- CORNER DECORATIONS (NO BOTTOM NAV) ---------------- */}
        {/* Moon bottom-left */}
        <img
          src="/assets/moon-yellow.webp"
          alt=""
          className="absolute -left-[14px] bottom-[20px] w-[58px] sm:w-[64px] h-[64px] sm:h-[70px] object-contain pointer-events-none select-none z-10"
          draggable={false}
        />

        {/* Pink heart bottom-right */}
        <img
          src="/assets/heart-pink.webp"
          alt=""
          className="absolute -right-[12px] bottom-[22px] w-[60px] sm:w-[66px] h-[56px] sm:h-[62px] object-contain pointer-events-none select-none z-10"
          draggable={false}
        />
      </div>

      {/* =========================================================================
          DESKTOP & TABLET LAYOUT (>= 768px: Exact Home Top Bar, No Bottom Bar)
         ========================================================================= */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative w-full h-[100dvh] overflow-hidden select-none font-['Nunito']"
        style={{
          ['--u' as any]: 'min(calc(100vw / 1586), calc(100dvh / 992))',
        }}
      >
        {/* VIEWPORT FIXED CORNER DECORATIONS */}
        {/* Pink Heart: Top-Left */}
        <img
          src="/assets/heart-pink.webp"
          alt=""
          className="fixed pointer-events-none select-none z-10"
          style={{
            top: 0,
            left: 0,
            width: 'calc(100 * var(--u))',
            height: 'calc(140 * var(--u))',
          }}
          draggable={false}
        />

        {/* Blue Star: Top-Right */}
        <img
          src="/assets/star-blue.webp"
          alt=""
          className="fixed pointer-events-none select-none z-10"
          style={{
            top: 0,
            right: 0,
            width: 'calc(80 * var(--u))',
            height: 'calc(150 * var(--u))',
          }}
          draggable={false}
        />

        {/* Green Cross: Bottom-Left */}
        <img
          src="/assets/cross-green.webp"
          alt=""
          className="fixed pointer-events-none select-none z-10"
          style={{
            bottom: 'calc(24 * var(--u))',
            left: 'calc(12 * var(--u))',
            width: 'calc(105 * var(--u))',
            height: 'calc(110 * var(--u))',
          }}
          draggable={false}
        />

        {/* Yellow Moon: Bottom-Right */}
        <img
          src="/assets/moon-yellow.webp"
          alt=""
          className="fixed pointer-events-none select-none z-10"
          style={{
            bottom: 'calc(35 * var(--u))',
            right: 'calc(25 * var(--u))',
            width: 'calc(80 * var(--u))',
            height: 'calc(107 * var(--u))',
          }}
          draggable={false}
        />

        {/* 1586 x 992 DESIGN CANVAS */}
        <div
          className="relative flex flex-col items-center z-20 flex-shrink-0"
          style={{
            width: 'calc(1586 * var(--u))',
            height: 'calc(992 * var(--u))',
          }}
        >
          {/* HEADER: Exactly as Homepage (center y=75) */}
          {/* People / Duo Logo: center x=265, center y=75 */}
          <button
            type="button"
            onClick={handleOpenFriendProfile}
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
                {resolvedStreak}
              </span>
            </div>
          </div>

          {/* Settings icon: center x=1363, 78 diameter */}
          <button
            type="button"
            onClick={handleOpenSettings}
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

          {/* MAIN STAGE CONTENT (Single centered column) */}
          <div
            className="flex flex-col items-center justify-center w-full"
            style={{ marginTop: 'calc(110 * var(--u))' }}
          >
            {/* Lock Blob + Sparkles */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 'calc(440 * var(--u))',
                height: 'calc(230 * var(--u))',
              }}
            >
              {/* Sparkles centered behind lock */}
              <img
                src="/assets/lock-sparkles.webp"
                alt=""
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none select-none z-0"
                style={{
                  width: 'calc(320 * var(--u))',
                }}
                draggable={false}
              />

              {/* Heart top-left */}
              <img
                src="/assets/heart-pink.webp"
                alt=""
                className="absolute object-contain pointer-events-none select-none z-10"
                style={{
                  left: 'calc(40 * var(--u))',
                  top: 'calc(14 * var(--u))',
                  width: 'calc(65 * var(--u))',
                  height: 'calc(62 * var(--u))',
                }}
                draggable={false}
              />

              {/* Star top-right */}
              <img
                src="/assets/star-blue.webp"
                alt=""
                className="absolute object-contain pointer-events-none select-none z-10"
                style={{
                  right: 'calc(42 * var(--u))',
                  top: 'calc(10 * var(--u))',
                  width: 'calc(68 * var(--u))',
                  height: 'calc(68 * var(--u))',
                }}
                draggable={false}
              />

              {/* Lock blob */}
              <img
                src="/assets/lock-blob.webp"
                alt="Answer locked"
                className="relative z-10 object-contain pointer-events-none select-none drop-shadow-sm"
                style={{
                  width: 'calc(190 * var(--u))',
                }}
                draggable={false}
              />
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center flex flex-col items-center mt-2">
              <h1
                className="font-black text-[#1B1D20] tracking-[-0.035em] leading-tight m-0 select-none whitespace-nowrap"
                style={{ fontSize: 'calc(80 * var(--u))' }}
              >
                Answer locked in!
              </h1>
              <p
                className="font-bold text-[#1B1D20]/60 tracking-tight m-0 select-none"
                style={{
                  fontSize: 'calc(34 * var(--u))',
                  marginTop: 'calc(10 * var(--u))',
                }}
              >
                {friendStatus !== 'Answering...'
                  ? friendStatus
                  : `Waiting for ${resolvedFriendName} to answer…`}
              </p>
            </div>

            {/* Dynamic Avatar with STATIC Ring Arcs */}
            <div
              onClick={handleAvatarClick}
              className="relative flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform"
              style={{
                width: 'calc(240 * var(--u))',
                height: 'calc(240 * var(--u))',
                marginTop: 'calc(20 * var(--u))',
                marginBottom: 'calc(20 * var(--u))',
              }}
              title="Click avatar to simulate friend answering"
            >
              {/* STATIC Ring Arcs */}
              <img
                src="/assets/waiting-ring-arcs.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                draggable={false}
              />

              {/* Avatar Container */}
              <div
                className="relative flex items-center justify-center z-10"
                style={{
                  width: 'calc(160 * var(--u))',
                  height: 'calc(160 * var(--u))',
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-all duration-300"
                  style={{
                    opacity: isAnswerLocked ? 1 : 0.6,
                    filter: isAnswerLocked ? 'none' : 'grayscale(25%)',
                  }}
                >
                  <ProfileAvatar
                    avatarId={resolvedAvatarId}
                    blobId={resolvedBlobId}
                    size={160}
                    useNewBlob={true}
                  />
                </div>

                {/* Clock Badge */}
                <img
                  src="/assets/clock-badge.webp"
                  alt=""
                  className="absolute object-contain pointer-events-none select-none z-20"
                  style={{
                    right: 'calc(-2 * var(--u))',
                    bottom: 'calc(-2 * var(--u))',
                    width: 'calc(50 * var(--u))',
                    height: 'calc(50 * var(--u))',
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Buttons & Caption */}
            <div
              className="flex flex-col items-center w-full"
              style={{
                width: 'calc(540 * var(--u))',
                gap: 'calc(16 * var(--u))',
                marginTop: 'calc(8 * var(--u))',
              }}
            >
              {/* Black Pill Button: Nudge */}
              <button
                type="button"
                onClick={handleNudge}
                disabled={nudgeCooldown > 0 || isAnswerLocked}
                className="btn-press w-full rounded-full bg-[#1B1D20] hover:bg-[#2B2E33] active:scale-[0.98] transition-all text-white font-black tracking-tight flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
                style={{
                  height: 'calc(80 * var(--u))',
                  borderRadius: 'calc(40 * var(--u))',
                  fontSize: 'calc(38 * var(--u))',
                }}
              >
                <span>{nudgeCooldown > 0 ? `Nudged (${nudgeCooldown}s)` : 'Nudge them'}</span>
                <span>👋</span>
              </button>

              {/* Cream Pill Button: Edit Answer */}
              <button
                type="button"
                onClick={handleEditClick}
                disabled={isAnswerLocked}
                className="btn-press w-full rounded-full bg-[#FAF3DF] hover:bg-[#F2E8CD] active:scale-[0.98] transition-all text-[#1B1D20] font-black tracking-tight flex items-center justify-center cursor-pointer shadow-xs border border-[#1B1D20]/5"
                style={{
                  height: 'calc(76 * var(--u))',
                  borderRadius: 'calc(38 * var(--u))',
                  fontSize: 'calc(34 * var(--u))',
                }}
              >
                Edit answer
              </button>

              {/* Footnote */}
              <p
                className="font-bold text-[#1B1D20]/50 tracking-tight text-center m-0 select-none mt-1"
                style={{
                  fontSize: 'calc(24 * var(--u))',
                }}
              >
                We’ll notify you both as soon as results are ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
