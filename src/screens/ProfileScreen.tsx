import React, { useState, useEffect } from 'react';
import { ProfileAvatar, getBlobColorName } from '../components/ProfileAvatar';
import { ReminderTimeModal } from '../components/ReminderTimeModal';
import { LeaveDuoModal } from '../components/LeaveDuoModal';
import { SignOutModal } from '../components/SignOutModal';
import { BottomNav, NavTab } from '../components/BottomNav';
import { UserProfile } from './CreateProfileScreen';

export interface ProfileScreenProps {
  userProfile?: UserProfile;
  partnerProfile?: UserProfile;
  duoCreatedAt?: number | string;
  inviteCode?: string;
  dailyReminderEnabled?: boolean;
  dailyReminderTime?: string;
  friendAlertsEnabled?: boolean;
  autoOpenSignOutModal?: boolean;
  autoOpenTimePicker?: boolean;
  autoOpenLeaveDuoModal?: boolean;
  onBack: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
  onLeaveDuo: () => void;
  onToggleDailyReminder?: (enabled: boolean) => void;
  onChangeReminderTime?: (time: string) => void;
  onToggleFriendAlerts?: (enabled: boolean) => void;
  onOpenFriendProfile?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  showDebugOverlay?: boolean;
  sessionType?: 'NEW' | 'GUEST' | 'GOOGLE';
  userEmail?: string | null;
  onSignInWithGoogle?: () => void;
}

function formatDuoDate(timestamp?: number | string): string {
  if (!timestamp) return 'Sep 14';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Sep 14';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile = { avatarId: 1, name: 'Player 1', color: 'salmon' },
  partnerProfile = { avatarId: 2, name: 'Alex', color: 'teal' },
  duoCreatedAt = '2024-09-14',
  inviteCode = 'K7X-92P',
  dailyReminderEnabled = true,
  dailyReminderTime = '9:00 PM',
  friendAlertsEnabled = true,
  autoOpenSignOutModal = false,
  autoOpenTimePicker = false,
  autoOpenLeaveDuoModal = false,
  sessionType = 'GUEST',
  userEmail = null,
  onSignInWithGoogle,
  onBack,
  onEditProfile,
  onSignOut,
  onLeaveDuo,
  onToggleDailyReminder,
  onChangeReminderTime,
  onToggleFriendAlerts,
  onOpenFriendProfile,
  onNavigateTab,
  showDebugOverlay = false,
}) => {
  // Local state for interactive toggles & time
  const [reminderOn, setReminderOn] = useState<boolean>(dailyReminderEnabled);
  const [reminderTime, setReminderTime] = useState<string>(dailyReminderTime);
  const [alertsOn, setAlertsOn] = useState<boolean>(friendAlertsEnabled);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(autoOpenTimePicker);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(autoOpenLeaveDuoModal);
  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(autoOpenSignOutModal);

  // Sync state if props change
  useEffect(() => {
    setReminderOn(dailyReminderEnabled);
  }, [dailyReminderEnabled]);

  useEffect(() => {
    setReminderTime(dailyReminderTime);
  }, [dailyReminderTime]);

  useEffect(() => {
    setAlertsOn(friendAlertsEnabled);
  }, [friendAlertsEnabled]);

  // Window viewport measurements for responsive scaling
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

  // Sync background color to cream #F5EEDC
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#F5EEDC';
    document.documentElement.style.backgroundColor = '#F5EEDC';
    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // Check query params for debug overlay
  const isDebugFromUrl =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('overlay') === '1';
  const renderOverlay = showDebugOverlay || isDebugFromUrl;

  // Scale by viewport width so stage spans 100% width with ZERO side margins
  const scale = viewport.width / 390;
  // Stage height in stage coordinate units
  const stageH = viewport.height / scale;

  // Detect compact / short mobile viewports (stageH < 780)
  const isCompact = stageH < 780;

  // Layout positions depending on isCompact
  const backBtnTop = isCompact ? 28 : 52;
  const titleTop = isCompact ? 72 : 110;
  const profileRowTop = isCompact ? 122 : 172;
  const profileAvatarSize = isCompact ? 86 : 97;

  const duoCardTop = isCompact ? 218 : 288;

  const row1Top = isCompact ? 294 : 378;
  const rowH = isCompact ? 52 : 59;
  const rowGap = isCompact ? 6 : 8;

  const row2Top = row1Top + rowH + rowGap; // compact: 352
  const row3Top = row2Top + rowH + rowGap; // compact: 410

  const editBtnTop = isCompact ? 472 : 591;
  const btnH = isCompact ? 39 : 43;
  const btnGap = isCompact ? 8 : 12;

  const signOutTop = editBtnTop + btnH + btnGap; // compact: 519
  const leaveDuoTop = signOutTop + btnH + (isCompact ? 8 : 14); // compact: 566

  // Copy Invite Code Handler
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode);
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Toggle handlers
  const handleToggleReminder = () => {
    const nextVal = !reminderOn;
    setReminderOn(nextVal);
    onToggleDailyReminder?.(nextVal);
  };

  const handleToggleAlerts = () => {
    const nextVal = !alertsOn;
    setAlertsOn(nextVal);
    onToggleFriendAlerts?.(nextVal);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#F5EEDC] flex justify-center items-start overflow-hidden font-['Nunito',sans-serif]">
      {/* ---------------- 390 DESIGN STAGE CONTAINER ---------------- */}
      <div
        className="relative bg-[#F5EEDC] overflow-hidden select-none"
        style={{
          width: '390px',
          height: `${stageH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* ---------------- DECORATIONS (BEHIND EVERYTHING) ---------------- */}
        {/* deco-moon-yellow: top-left corner */}
        <img
          src="/assets/profile/deco-moon-yellow.webp"
          alt=""
          className={`absolute top-0 left-0 pointer-events-none select-none z-0 ${
            isCompact ? 'w-[32px]' : 'w-[39px]'
          }`}
          draggable={false}
        />

        {/* deco-heart-pink: top-right corner */}
        <img
          src="/assets/profile/deco-heart-pink.webp"
          alt=""
          className={`absolute right-0 pointer-events-none select-none z-0 ${
            isCompact ? 'top-[16px] w-[46px]' : 'top-[25px] w-[55px]'
          }`}
          draggable={false}
        />

        {/* deco-star-blue: bottom-left corner */}
        <img
          src="/assets/profile/deco-star-blue.webp"
          alt=""
          className={`absolute bottom-0 left-0 pointer-events-none select-none z-0 ${
            isCompact ? 'w-[70px]' : 'w-[82px]'
          }`}
          draggable={false}
        />

        {/* deco-cross-olive: bottom-right corner */}
        <img
          src="/assets/profile/deco-cross-olive.webp"
          alt=""
          className={`absolute right-0 pointer-events-none select-none z-0 ${
            isCompact ? 'bottom-[8px] w-[48px]' : 'bottom-[11px] w-[56px]'
          }`}
          draggable={false}
        />

        {/* ---------------- HEADER ---------------- */}
        {/* Back Button: dashed 1.5px ink circle 38px at (25, backBtnTop) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="absolute left-[25px] w-[38px] h-[38px] rounded-full border-[1.5px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 transition-colors cursor-pointer z-20 focus:outline-none"
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

        {/* Title "You": x 24 */}
        <h1
          className={`absolute left-[24px] font-black text-[#17181B] tracking-[-0.02em] leading-none z-10 ${
            isCompact ? 'text-[42px]' : 'text-[52px]'
          }`}
          style={{ top: `${titleTop}px` }}
        >
          You
        </h1>

        {/* ---------------- PROFILE ROW ---------------- */}
        {/* Avatar at (22, profileRowTop) */}
        <div
          className="absolute left-[22px] z-20"
          style={{ top: `${profileRowTop}px` }}
        >
          <ProfileAvatar
            avatarId={userProfile.avatarId}
            blobId={userProfile.color}
            size={profileAvatarSize}
            onClick={onEditProfile}
          />

          {/* Edit Badge: ink circle 26px / 28px with white pencil icon */}
          <button
            type="button"
            onClick={onEditProfile}
            aria-label="Edit profile"
            className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-[#17181B] flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform z-30 ${
              isCompact ? 'w-[24px] h-[24px]' : 'w-[28px] h-[28px]'
            }`}
          >
            <svg
              width={isCompact ? '12' : '14'}
              height={isCompact ? '12' : '14'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
        </div>

        {/* Profile Name & Subtitle at x 135 (or x 122 in compact) */}
        <div
          className="absolute z-10 flex flex-col justify-center"
          style={{
            left: isCompact ? '120px' : '135px',
            top: `${profileRowTop + (isCompact ? 10 : 14)}px`,
            height: isCompact ? '64px' : '70px',
          }}
        >
          {/* Name */}
          <div
            className={`font-black text-[#17181B] tracking-[-0.02em] leading-none truncate ${
              isCompact ? 'text-[30px] max-w-[220px]' : 'text-[36px] max-w-[230px]'
            }`}
          >
            {userProfile.name || 'Player'}
          </div>

          {/* Subtitle */}
          <div
            className={`mt-1 font-bold text-[#17181B]/50 leading-none ${
              isCompact ? 'text-[14px]' : 'text-[15px]'
            }`}
          >
            {getBlobColorName(userProfile.color, userProfile.avatarId)} player
          </div>

          {/* User Google Email */}
          {userEmail && (
            <div className="mt-1 font-semibold text-[12px] text-[#17181B]/40 leading-none truncate max-w-[220px]">
              {userEmail}
            </div>
          )}
        </div>

        {/* ---------------- DUO CARD ---------------- */}
        <div
          onClick={onOpenFriendProfile}
          className={`absolute left-[22px] w-[346px] rounded-[22px] bg-[#EDE5D0] px-3.5 flex items-center z-10 cursor-pointer hover:bg-[#e4dbce] transition-colors ${
            isCompact ? 'h-[68px]' : 'h-[76px]'
          }`}
          style={{ top: `${duoCardTop}px` }}
        >
          {/* Left Avatar (current user) */}
          <div className="relative flex-shrink-0">
            <ProfileAvatar
              avatarId={userProfile.avatarId}
              blobId={userProfile.color}
              size={isCompact ? 48 : 55}
            />
          </div>

          {/* Sparkle Sun Yellow Asset between avatars */}
          <img
            src="/assets/profile/sparkle-sun-yellow.webp"
            alt=""
            className="w-[21px] h-auto object-contain mx-1 pointer-events-none select-none z-10 flex-shrink-0"
            draggable={false}
          />

          {/* Right Avatar (partner) */}
          <div className="relative flex-shrink-0">
            <ProfileAvatar
              avatarId={partnerProfile.avatarId}
              blobId={partnerProfile.color}
              size={isCompact ? 48 : 55}
            />
          </div>

          {/* Duo Info Text */}
          <div className="ml-3 sm:ml-4 flex flex-col justify-center min-w-0">
            {/* "You + {partnerName}" */}
            <div
              className={`font-black text-[#17181B] tracking-[-0.01em] leading-tight truncate ${
                isCompact ? 'text-[16px] max-w-[160px]' : 'text-[18px] max-w-[170px]'
              }`}
            >
              You + {partnerProfile.name || 'Alex'}
            </div>

            {/* "Together since {date}" */}
            <div
              className={`mt-0.5 font-bold text-[#17181B]/50 leading-tight ${
                isCompact ? 'text-[12px]' : 'text-[13px]'
              }`}
            >
              Together since {formatDuoDate(duoCreatedAt)}
            </div>
          </div>
        </div>

        {/* ---------------- SETTINGS ROWS ---------------- */}
        {/* ROW 1: Daily Reminder (bg #FBDDE4) */}
        <div
          className="absolute left-[22px] w-[346px] rounded-full bg-[#FBDDE4] px-3.5 flex items-center justify-between z-10"
          style={{ top: `${row1Top}px`, height: `${rowH}px` }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Icon Blob Pink + Bell Icon */}
            <div
              className={`relative flex items-center justify-center flex-shrink-0 ${
                isCompact ? 'w-[38px] h-[38px]' : 'w-[45px] h-[45px]'
              }`}
            >
              <img
                src="/assets/profile/icon-blob-pink.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <svg
                width={isCompact ? '19' : '22'}
                height={isCompact ? '19' : '22'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>

            {/* Label "Daily reminder" */}
            <span
              className={`font-extrabold text-[#17181B] tracking-tight ${
                isCompact ? 'text-[15px]' : 'text-[16px]'
              }`}
            >
              Daily reminder
            </span>
          </div>

          <div className="flex items-center gap-2 pr-0.5">
            {/* Time Pill "9:00 PM" */}
            <button
              type="button"
              onClick={() => setShowTimePicker(true)}
              className="w-[65px] h-[24px] sm:w-[67px] sm:h-[25px] rounded-full bg-[#FBBBD0] flex items-center justify-center font-bold text-[11.5px] sm:text-[12px] text-[#17181B] cursor-pointer hover:bg-[#f9a2bf] transition-colors focus:outline-none"
            >
              {reminderTime}
            </button>

            {/* Toggle Switch 46x25 */}
            <div
              onClick={handleToggleReminder}
              className={`relative w-[44px] h-[24px] sm:w-[46px] sm:h-[25px] rounded-full cursor-pointer transition-colors duration-200 flex items-center ${
                reminderOn ? 'bg-[#17181B]' : 'bg-[#17181B]/25'
              }`}
            >
              <div
                className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  reminderOn ? 'translate-x-[22px] sm:translate-x-[23px]' : 'translate-x-[2.5px]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ROW 2: Friend answered alerts (bg #CADCFB) */}
        <div
          className="absolute left-[22px] w-[346px] rounded-full bg-[#CADCFB] px-3.5 flex items-center justify-between z-10"
          style={{ top: `${row2Top}px`, height: `${rowH}px` }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Icon Blob Blue + Chat Icon */}
            <div
              className={`relative flex items-center justify-center flex-shrink-0 ${
                isCompact ? 'w-[38px] h-[38px]' : 'w-[45px] h-[45px]'
              }`}
            >
              <img
                src="/assets/profile/icon-blob-blue.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <svg
                width={isCompact ? '19' : '22'}
                height={isCompact ? '19' : '22'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="8" cy="10" r="1" fill="#17181B" />
                <circle cx="12" cy="10" r="1" fill="#17181B" />
                <circle cx="16" cy="10" r="1" fill="#17181B" />
              </svg>
            </div>

            {/* Label "Friend answered alerts" */}
            <span
              className={`font-extrabold text-[#17181B] tracking-tight ${
                isCompact ? 'text-[15px]' : 'text-[16px]'
              }`}
            >
              Friend answered alerts
            </span>
          </div>

          {/* Toggle Switch */}
          <div
            onClick={handleToggleAlerts}
            className={`relative w-[44px] h-[24px] sm:w-[46px] sm:h-[25px] rounded-full cursor-pointer transition-colors duration-200 flex items-center pr-0.5 ${
              alertsOn ? 'bg-[#17181B]' : 'bg-[#17181B]/25'
            }`}
          >
            <div
              className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                alertsOn ? 'translate-x-[22px] sm:translate-x-[23px]' : 'translate-x-[2.5px]'
              }`}
            />
          </div>
        </div>

        {/* ROW 3: Invite code (bg #DCDFBE) */}
        <div
          className="absolute left-[22px] w-[346px] rounded-full bg-[#DCDFBE] px-3.5 flex items-center justify-between z-10"
          style={{ top: `${row3Top}px`, height: `${rowH}px` }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Icon Blob Olive + Key Icon */}
            <div
              className={`relative flex items-center justify-center flex-shrink-0 ${
                isCompact ? 'w-[38px] h-[38px]' : 'w-[45px] h-[45px]'
              }`}
            >
              <img
                src="/assets/profile/icon-blob-olive.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <svg
                width={isCompact ? '19' : '22'}
                height={isCompact ? '19' : '22'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
              >
                <path d="M21 2l-2 2m-2-2l2 2M15.5 7.5l3 3L7 22H3v-4L15.5 7.5z" />
                <circle cx="16.5" cy="7.5" r="3.5" />
              </svg>
            </div>

            {/* Label "Invite code" */}
            <span
              className={`font-extrabold text-[#17181B] tracking-tight ${
                isCompact ? 'text-[15px]' : 'text-[16px]'
              }`}
            >
              Invite code
            </span>
          </div>

          <div className="flex items-center gap-2 pr-0.5">
            {/* Code e.g. "K7X-92P" */}
            <span
              className={`font-extrabold text-[#17181B] tracking-[0.02em] ${
                isCompact ? 'text-[14px]' : 'text-[15px]'
              }`}
            >
              {inviteCode}
            </span>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy invite code"
              className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] rounded-full border-[1.5px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/10 active:scale-95 transition-all cursor-pointer focus:outline-none"
            >
              <svg
                width={isCompact ? '14' : '16'}
                height={isCompact ? '14' : '16'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17181B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toast when code copied */}
        {copiedToast && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-[#17181B] text-white text-[13px] font-extrabold px-3 py-1 rounded-full shadow-md z-30 pointer-events-none animate-fadeIn"
            style={{ top: `${row3Top + (isCompact ? 56 : 65)}px` }}
          >
            Copied!
          </div>
        )}

        {/* ---------------- BUTTONS ---------------- */}
        {/* "Edit profile": x 23 */}
        <button
          type="button"
          onClick={onEditProfile}
          className={`absolute left-[23px] w-[343px] rounded-full border-2 border-[#17181B] bg-transparent text-[#17181B] font-extrabold hover:bg-[#17181B]/5 active:scale-[0.99] transition-all cursor-pointer z-10 focus:outline-none ${
            isCompact ? 'text-[15.5px]' : 'text-[17px]'
          }`}
          style={{ top: `${editBtnTop}px`, height: `${btnH}px` }}
        >
          Edit profile
        </button>

        {/* "Sign out" / "Sign in with Google to save your history": x 23 */}
        <button
          type="button"
          onClick={() => {
            if (sessionType === 'GUEST') {
              onSignInWithGoogle?.();
            } else {
              setShowSignOutModal(true);
            }
          }}
          className={`absolute left-[23px] w-[343px] rounded-full bg-[#17181B] text-white font-extrabold hover:bg-[#25272c] active:scale-[0.99] transition-all cursor-pointer z-10 focus:outline-none flex items-center justify-center px-4 ${
            isCompact ? (sessionType === 'GUEST' ? 'text-[13px]' : 'text-[15.5px]') : (sessionType === 'GUEST' ? 'text-[14px]' : 'text-[17px]')
          }`}
          style={{ top: `${signOutTop}px`, height: `${btnH}px` }}
        >
          {sessionType === 'GUEST' ? 'Sign in with Google to save your history' : 'Sign out'}
        </button>

        {/* Link "Leave duo and delete my data": centered */}
        <div
          className="absolute left-0 right-0 text-center z-10"
          style={{ top: `${leaveDuoTop}px` }}
        >
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="font-semibold text-[13px] text-[#17181B]/55 underline hover:text-[#17181B] transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
          >
            Leave duo and delete my data
          </button>
        </div>

        {/* ---------------- BOTTOM NAVIGATION DOCK ---------------- */}
        {onNavigateTab && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center z-30 pointer-events-auto">
            <BottomNav activeTab="profile" onTabChange={onNavigateTab} className="mb-0" />
          </div>
        )}

        {/* ---------------- DEBUG MOCKUP OVERLAY ---------------- */}
        {renderOverlay && (
          <img
            src="/mockups/profile.png"
            alt="Mockup Overlay"
            className="absolute top-0 left-0 w-[390px] h-[844px] object-cover pointer-events-none z-50 opacity-50"
            draggable={false}
          />
        )}
      </div>

      {/* ---------------- TIME PICKER MODAL (WHEEL SHEET) ---------------- */}
      {showTimePicker && (
        <ReminderTimeModal
          initialTime={reminderTime}
          onSave={(newTime: string) => {
            setReminderTime(newTime);
            onChangeReminderTime?.(newTime);
            setShowTimePicker(false);
          }}
          onClose={() => setShowTimePicker(false)}
        />
      )}

      {/* ---------------- CONFIRMATION BOTTOM SHEET: LEAVE DUO ---------------- */}
      {showLeaveModal && (
        <LeaveDuoModal
          onConfirm={() => {
            setShowLeaveModal(false);
            onLeaveDuo();
          }}
          onClose={() => setShowLeaveModal(false)}
        />
      )}

      {/* ---------------- CONFIRMATION DIALOG: SIGN OUT ---------------- */}
      {showSignOutModal && (
        <SignOutModal
          onConfirmSignOut={() => {
            setShowSignOutModal(false);
            onSignOut();
          }}
          onClose={() => setShowSignOutModal(false)}
        />
      )}
    </div>
  );
};
