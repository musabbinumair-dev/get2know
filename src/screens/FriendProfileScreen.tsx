import React, { useState, useEffect } from 'react';
import { ProfileAvatar, getBlobColorName } from '../components/ProfileAvatar';

export interface FriendProfileData {
  name: string;
  subtitle: string;
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
}

const DEFAULT_FRIEND: FriendProfileData = {
  name: 'Sam',
  subtitle: 'Teal player, joined Sep 12',
  avatarId: 2,
  color: 'teal',
  streakDays: 12,
  matchesCount: 38,
  guessWinsCount: 21,
  lastAnsweredTime: 'today, 8:42 PM',
};

const IMAGE_ASSETS = [
  {
    file: 'deco-crescent-yellow-top-left-cropped.webp',
    x: 0,
    y: 0,
    w: 38.9,
    h: 53.1,
    snap: 'left-top',
    zIndex: 5,
  },
  {
    file: 'deco-heart-pink-top-right-cropped.webp',
    x: 325.9,
    y: 13.7,
    w: 64.1,
    h: 74.2,
    snap: 'right',
    zIndex: 5,
  },
  {
    file: 'deco-starburst-blue-bottom-left-cropped.webp',
    x: 0,
    y: 752.1,
    w: 91.5,
    h: 92.9,
    snap: 'left-bottom',
    zIndex: 5,
  },
  // Increased Stats Decorations Sizes
  {
    file: 'stat-starburst-yellow-streak.webp',
    x: 24.5,
    y: 404,
    w: 105,
    h: 105,
    zIndex: 8,
  },
  {
    file: 'stat-teardrop-blue-matches.webp',
    x: 147,
    y: 404,
    w: 96,
    h: 105,
    zIndex: 8,
  },
  {
    file: 'stat-cross-olive-guess-wins.webp',
    x: 261,
    y: 404,
    w: 105,
    h: 105,
    zIndex: 8,
  },
  // Last Answered Clock Blob Icon
  {
    file: 'icon-clock-teal-blob.webp',
    x: 34.8,
    y: 559.4,
    w: 41.2,
    h: 42.6,
    zIndex: 20,
  },
];

export const FriendProfileScreen: React.FC<FriendProfileScreenProps> = ({
  friendData = DEFAULT_FRIEND,
  onBack,
}) => {
  // Nudge Toast & Disabled Countdown State
  const [nudgeCooldown, setNudgeCountdown] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Preload all webp image assets on mount
  useEffect(() => {
    IMAGE_ASSETS.forEach((asset) => {
      const img = new Image();
      img.src = `/${asset.file}`;
    });
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

  // Viewport Measurements (supports visualViewport)
  const [viewport, setViewport] = useState(() => {
    if (typeof window !== 'undefined') {
      const vv = window.visualViewport;
      return {
        width: vv ? vv.width : window.innerWidth,
        height: vv ? vv.height : window.innerHeight,
      };
    }
    return { width: 390, height: 844 };
  });

  useEffect(() => {
    const updateSize = () => {
      const vv = window.visualViewport;
      setViewport({
        width: vv ? vv.width : window.innerWidth,
        height: vv ? vv.height : window.innerHeight,
      });
    };

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateSize);
      window.visualViewport.addEventListener('scroll', updateSize);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateSize);
        window.visualViewport.removeEventListener('scroll', updateSize);
      }
    };
  }, []);

  // Scale Factors
  const vw = Math.min(viewport.width, 430);
  const vh = viewport.height;
  const sx = vw / 390;
  const sy = vh / 844;
  const u = Math.min(sx, sy);

  // Stage scaling matching ProfileScreen
  const stageH = vh / sx;
  const isCompact = stageH < 780;

  // Exact positions inherited from Profile page
  const backBtnTop = isCompact ? 28 : 52;
  const titleTop = isCompact ? 72 : 110;

  // Debug Query Parameter
  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1';

  // Helper for computing image styles
  const getImageStyle = (asset: (typeof IMAGE_ASSETS)[0]) => {
    const w = asset.w * u;
    const h = asset.h * u;

    if (asset.snap === 'left-top') {
      return {
        position: 'absolute' as const,
        left: 0,
        top: 0,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: asset.zIndex || 5,
      };
    }

    if (asset.snap === 'right') {
      return {
        position: 'absolute' as const,
        right: 0,
        top: `${asset.y * sy}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: asset.zIndex || 5,
      };
    }

    if (asset.snap === 'left-bottom') {
      return {
        position: 'absolute' as const,
        left: 0,
        bottom: 0,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: asset.zIndex || 5,
      };
    }

    // Default center formula
    const centerX = (asset.x + asset.w / 2) * sx;
    const centerY = (asset.y + asset.h / 2) * sy;
    return {
      position: 'absolute' as const,
      left: `${centerX - w / 2}px`,
      top: `${centerY - h / 2}px`,
      width: `${w}px`,
      height: `${h}px`,
      zIndex: asset.zIndex || 10,
    };
  };

  // Row background (x 22, y 551, 347 x 58.7)
  const rowW = 347 * sx;
  const rowH = 58.7 * u;
  const rowCenterX = (22 + 347 / 2) * sx;
  const rowCenterY = (551 + 58.7 / 2) * sy;
  const rowStyle = {
    position: 'absolute' as const,
    left: `${rowCenterX - rowW / 2}px`,
    top: `${rowCenterY - rowH / 2}px`,
    width: `${rowW}px`,
    height: `${rowH}px`,
  };

  // Nudge button (x 22, y 629.3, 347 x 48.7)
  const btnW = 347 * sx;
  const btnH = 48.7 * u;
  const btnCenterX = (22 + 347 / 2) * sx;
  const btnCenterY = (629.3 + 48.7 / 2) * sy;
  const btnStyle = {
    position: 'absolute' as const,
    left: `${btnCenterX - btnW / 2}px`,
    top: `${btnCenterY - btnH / 2}px`,
    width: `${btnW}px`,
    height: `${btnH}px`,
  };

  // Print Table of File -> Rendered Size on Mount
  useEffect(() => {
    console.table(
      IMAGE_ASSETS.map((a) => ({
        File: a.file,
        'Rendered Width (px)': (a.w * u).toFixed(1),
        'Rendered Height (px)': (a.h * u).toFixed(1),
      }))
    );
  }, [u]);

  const avatarCenterX = (103 + 184 / 2) * sx;
  const avatarCenterY = (168.5 + 193.6 / 2) * sy;
  const avatarW = 184 * u;
  const avatarH = 193.6 * u;

  return (
    <div className="w-full h-[100dvh] bg-[#F5EEDA] flex justify-center items-center overflow-hidden font-['Nunito',sans-serif] select-none">
      {/* ── STAGE CONTAINER ── */}
      <div
        className="relative overflow-hidden bg-[#F5EEDA]"
        style={{ width: `${vw}px`, height: `${vh}px` }}
      >
        {/* ── 1. DECORATION & STAT IMAGES ── */}
        {IMAGE_ASSETS.map((asset) => (
          <img
            key={asset.file}
            src={`/${asset.file}`}
            alt=""
            style={getImageStyle(asset)}
            className="pointer-events-none select-none object-contain"
            draggable={false}
          />
        ))}

        {/* ── 2. DYNAMIC FRIEND AVATAR & BLOB ── */}
        <div
          style={{
            position: 'absolute',
            left: `${avatarCenterX - avatarW / 2}px`,
            top: `${avatarCenterY - avatarH / 2}px`,
            width: `${avatarW}px`,
            height: `${avatarH}px`,
            zIndex: 10,
          }}
          className="flex items-center justify-center pointer-events-none select-none"
        >
          <ProfileAvatar
            avatarId={friendData.avatarId ?? 2}
            blobId={friendData.color ?? 'teal'}
            size={avatarW}
          />
        </div>

        {/* ── 3. BACK BUTTON (Inherited exact position, size & style from Profile page) ── */}
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

        {/* ── 4. HEADING / TITLE (Inherited exact position, size & style from Profile page) ── */}
        <h1
          className={`absolute left-[24px] font-black text-[#17181B] tracking-[-0.02em] leading-none z-15 ${
            isCompact ? 'text-[42px]' : 'text-[52px]'
          }`}
          style={{ top: `${titleTop}px` }}
        >
          {friendData.name}
        </h1>

        {/* ── 5. TEXT: Subtitle "Teal player, joined Sep 12" (Anchor c at 194.5, 385.8, size 16, weight 700, muted) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${194.5 * sx}px`,
            top: `${385.8 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${16 * u}px`,
            fontWeight: 700,
            color: '#11131980',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          {friendData.subtitle || `${getBlobColorName(friendData.color, friendData.avatarId)} player, joined Sep 12`}
        </div>

        {/* ── 6. STAT VALUE 1: "12" Streak (c at 78.3, 449.5, size 34, weight 900) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${78.3 * sx}px`,
            top: `${449.5 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${34 * u}px`,
            fontWeight: 900,
            color: '#111319',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          {friendData.streakDays}
        </div>

        {/* ── 7. STAT UNIT 1: "days" (c at 78.3, 472.4, size 15, weight 800) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${78.3 * sx}px`,
            top: `${472.4 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${15 * u}px`,
            fontWeight: 800,
            color: '#111319',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          days
        </div>

        {/* ── 8. STAT VALUE 2: "38" Matches (c at 194.5, 459, size 34, weight 900) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${194.5 * sx}px`,
            top: `${459 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${34 * u}px`,
            fontWeight: 900,
            color: '#111319',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          {friendData.matchesCount}
        </div>

        {/* ── 9. STAT VALUE 3: "21" Guess wins (c at 313.5, 457.3, size 34, weight 900) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${313.5 * sx}px`,
            top: `${457.3 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${34 * u}px`,
            fontWeight: 900,
            color: '#111319',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          {friendData.guessWinsCount}
        </div>

        {/* ── 10. STAT LABELS: Streak (78.3, 518), Matches (194.5, 518), Guess wins (313.5, 518) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${78.3 * sx}px`,
            top: `${518 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${16 * u}px`,
            fontWeight: 700,
            color: '#11131980',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          Streak
        </div>

        <div
          style={{
            position: 'absolute',
            left: `${194.5 * sx}px`,
            top: `${518 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${16 * u}px`,
            fontWeight: 700,
            color: '#11131980',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          Matches
        </div>

        <div
          style={{
            position: 'absolute',
            left: `${313.5 * sx}px`,
            top: `${518 * sy}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${16 * u}px`,
            fontWeight: 700,
            color: '#11131980',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 15,
          }}
        >
          Guess wins
        </div>

        {/* ── 11. ROW BACKGROUND: (22, 551, 347 x 58.7, bg #D5E9DE) ── */}
        <div
          style={rowStyle}
          className="rounded-full bg-[#D5E9DE] pointer-events-none z-10"
        />

        {/* ── 12. "Last answered" (Anchor l at 90.2, 580.4, size 18, weight 800) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${90.2 * sx}px`,
            top: `${580.4 * sy}px`,
            transform: 'translateY(-50%)',
            fontSize: `${18 * u}px`,
            fontWeight: 800,
            color: '#111319',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 25,
          }}
        >
          Last answered
        </div>

        {/* ── 13. "today, 8:42 PM" (Anchor r at 353.3, 580.4, size 17, weight 600, muted) ── */}
        <div
          style={{
            position: 'absolute',
            left: `${353.3 * sx}px`,
            top: `${580.4 * sy}px`,
            transform: 'translate(-100%, -50%)',
            fontSize: `${17 * u}px`,
            fontWeight: 600,
            color: '#11131980',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            zIndex: 25,
          }}
        >
          {friendData.lastAnsweredTime}
        </div>

        {/* ── 14. NUDGE BUTTON: (22, 629.3, 347 x 48.7, bg #121419) ── */}
        <button
          type="button"
          onClick={handleSendNudge}
          disabled={nudgeCooldown > 0}
          style={btnStyle}
          className={`rounded-full bg-[#121419] flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] z-25 ${
            nudgeCooldown > 0 ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#20222a]'
          }`}
        >
          {/* "Send a nudge" text (c at 184, 654.5, size 19, weight 800, white) */}
          <span
            style={{
              fontSize: `${19 * u}px`,
              fontWeight: 800,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            {nudgeCooldown > 0 ? `Nudge sent (${nudgeCooldown}s)` : 'Send a nudge'}
          </span>
          {/* Wave hand emoji icon inside button */}
          <img
            src="/icon-wave-hand.webp"
            alt=""
            style={{
              width: `${21 * u}px`,
              height: `${23 * u}px`,
            }}
            className="object-contain pointer-events-none select-none"
            draggable={false}
          />
        </button>

        {/* ── 15. TOAST NOTIFICATION: "Nudge sent 👋" ── */}
        {showToast && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 bg-[#121419] text-white px-5 py-2.5 rounded-full font-black text-[15px] shadow-lg animate-pop z-50 flex items-center gap-2">
            <span>Nudge sent</span>
            <span>👋</span>
          </div>
        )}

        {/* ── 16. SELF-CHECK DEBUG OVERLAY (?debug=1) ── */}
        {isDebug && (
          <div className="absolute top-2 left-2 z-50 bg-black/90 text-white p-3 rounded-xl text-[11px] font-mono max-w-[350px] shadow-2xl overflow-auto max-h-[300px]">
            <div className="font-bold text-yellow-300 mb-1">
              DEBUG OVERLAY (Friend Profile)
            </div>
            <div>vw: {vw.toFixed(1)}px | vh: {vh.toFixed(1)}px</div>
            <div>sx: {sx.toFixed(4)} | sy: {sy.toFixed(4)} | u: {u.toFixed(4)}</div>
            <div className="mt-2 border-t border-gray-700 pt-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400">
                    <th>Asset</th>
                    <th>Rendered WxH</th>
                  </tr>
                </thead>
                <tbody>
                  {IMAGE_ASSETS.map((a) => (
                    <tr key={a.file} className="border-b border-gray-800">
                      <td className="truncate max-w-[150px]">{a.file}</td>
                      <td>
                        {(a.w * u).toFixed(1)}x{(a.h * u).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
