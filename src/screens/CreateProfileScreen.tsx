import React, { useState, useEffect } from 'react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { AvatarBlob } from '../components/AvatarBlob';
import { DesktopCreateProfile } from '../components/DesktopCreateProfile';

export interface UserProfile {
  avatarId: number;
  name: string;
  color: 'salmon' | 'teal' | 'pink' | 'blue';
  createdAt?: string;
}

interface CreateProfileScreenProps {
  initialProfile?: UserProfile;
  onBack: () => void;
  onContinue: (profile: UserProfile) => void;
}

export const AVATAR_OPTIONS = [
  {
    id: 1,
    color: 'salmon',
    alt: 'Boy with messy hair',
    blob: '/assets/blobs/avatar-blob-1.png',
    face: '/assets/avatars/avatar-1.png',
  },
  {
    id: 2,
    color: 'teal',
    alt: 'Girl with wavy hair and heart clip',
    blob: '/assets/blobs/avatar-blob-2.png',
    face: '/assets/avatars/avatar-2.png',
  },
  {
    id: 3,
    color: 'indigo',
    alt: 'Boy with round glasses',
    blob: '/assets/blobs/avatar-blob-3.png',
    face: '/assets/avatars/avatar-3.png',
  },
  {
    id: 4,
    color: 'slate',
    alt: 'Girl with top bun',
    blob: '/assets/blobs/avatar-blob-4.png',
    face: '/assets/avatars/avatar-4.png',
  },
  {
    id: 5,
    color: 'lime',
    alt: 'Boy with bucket hat',
    blob: '/assets/blobs/avatar-blob-5.png',
    face: '/assets/avatars/avatar-5.png',
  },
  {
    id: 6,
    color: 'orange',
    alt: 'Girl with pink hair and headphones',
    blob: '/assets/blobs/avatar-blob-6.png',
    face: '/assets/avatars/avatar-6.png',
  },
];

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({
  initialProfile,
  onBack,
  onContinue,
}) => {
  // Viewport tracking (using window.visualViewport if available)
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 390,
    height: typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 844,
  });

  useEffect(() => {
    const updateViewport = () => {
      const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setViewport({ width: vw, height: vh });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
    };
  }, []);

  // Frame parameter support e.g. ?frame=1440x900
  const frameParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('frame')
      : null;
  let effectiveWidth = viewport.width;
  let effectiveHeight = viewport.height;
  if (frameParam) {
    const [fw, fh] = frameParam.split('x').map(Number);
    if (fw && fh) {
      effectiveWidth = fw;
      effectiveHeight = fh;
    }
  }

  const isDesktopLandscape =
    effectiveWidth >= 900 && effectiveWidth / effectiveHeight >= 1.15;

  // Selections
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(
    initialProfile?.avatarId ?? null
  );

  const [name, setName] = useState<string>(
    initialProfile?.name && initialProfile.name !== 'Player' ? initialProfile.name : ''
  );

  const [selectedColor, setSelectedColor] = useState<'salmon' | 'teal' | null>(
    initialProfile?.color === 'teal' || initialProfile?.color === 'salmon'
      ? initialProfile.color
      : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onContinue({
      avatarId: selectedAvatarId ?? 1,
      name: name.trim() || 'Player',
      color: selectedColor ?? 'salmon',
    });
    setIsSubmitting(false);
  };

  if (isDesktopLandscape) {
    return (
      <DesktopCreateProfile
        initialProfile={initialProfile}
        onBack={onBack}
        onContinue={onContinue}
        forcedWidth={effectiveWidth !== viewport.width ? effectiveWidth : undefined}
        forcedHeight={effectiveHeight !== viewport.height ? effectiveHeight : undefined}
      />
    );
  }

  return (
    <Screen bg="#FDE473">
      {/* ── TOP-RIGHT CORNER DECORATION (MATCHING OTHER PAGES) ── */}
      <div
        className="absolute -top-[16px] -right-[16px] pointer-events-none select-none z-0"
        style={{ width: '84px', height: '84px' }}
      >
        <img
          src="/assets/welcome/starburst-blue-right.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ── BOTTOM-LEFT CORNER DECORATION (MATCHING OTHER PAGES) ── */}
      <div
        className="absolute -bottom-[20px] -left-[20px] pointer-events-none select-none z-0"
        style={{ width: '82px', height: '82px' }}
      >
        <img
          src="/assets/welcome/starburst-blue-left.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ── BOTTOM-RIGHT CORNER PINK CRESCENT (MATCHING OTHER PAGES) ── */}
      <div
        className="absolute -bottom-[16px] -right-[14px] pointer-events-none select-none z-0"
        style={{ width: '74px', height: '80px' }}
      >
        <img
          src="/assets/blobs/crescent-pink-bottom-right.png"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ── MAIN CONTENT: EXACT PADDING & FLEX STRUCTURE AS INVITE & JOIN PAGES ── */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100dvh] sm:min-h-0 sm:h-full px-7 pt-9 pb-8 sm:px-8 sm:pt-9 sm:pb-9 select-none">
        <div>
          {/* Top Navigation Row: Exactly identical to Joining/Invite page */}
          <div className="flex items-center justify-between w-full">
            {/* Dashed Circular Back Button (44x44) */}
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to welcome"
              className="btn-press w-[44px] h-[44px] rounded-full border-[1.8px] border-dashed border-[#1B1D20] flex items-center justify-center hover:bg-[#1B1D20]/5 transition-colors focus:outline-none cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1B1D20"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Step Dots: Step 1 filled black 14px, Step 2 dashed 14px, gap 9px */}
            <div className="flex items-center gap-[9px] pr-1">
              <div className="w-[14px] h-[14px] rounded-full bg-[#1B1D20]" />
              <div className="w-[14px] h-[14px] rounded-full border-[1.6px] border-dashed border-[#1B1D20] box-border" />
            </div>
          </div>

          {/* Heading Section: Proportions match Join & Invite pages */}
          <div className="mt-5 sm:mt-6">
            <h1 className="text-[36px] sm:text-[38px] font-black text-[#1A1C22] leading-[1.08] tracking-[-0.035em]">
              Who are you?
            </h1>
            <p className="mt-1.5 sm:mt-2 text-[16px] sm:text-[16.5px] font-medium text-[#1A1C22]/70 tracking-[-0.01em]">
              Pick how your friend will see you.
            </p>
          </div>

          {/* 6 Avatars Grid: Clean 3x2, compact size fitting without scrolling */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5 max-w-[340px] mx-auto">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className="aspect-square relative flex items-center justify-center cursor-pointer active:scale-95 transition-transform max-w-[96px] sm:max-w-[104px] mx-auto w-full"
                >
                  {/* Colored Blob Swatch */}
                  <img
                    src={avatar.blob}
                    alt=""
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* Face Illustration */}
                  <img
                    src={avatar.face}
                    alt={avatar.alt}
                    className="w-[72%] h-[72%] object-contain pointer-events-none select-none absolute inset-0 m-auto"
                    draggable={false}
                  />

                  {/* Selection Badge & Border */}
                  {isSelected && (
                    <>
                      <div className="absolute inset-[-2px] rounded-full border-[3px] border-[#1B1D20] pointer-events-none z-10" />
                      <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-[#1B1D20] rounded-full flex items-center justify-center z-20">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Label "Your name" */}
          <div className="mt-3.5 sm:mt-4 text-[17px] sm:text-[18px] font-black text-[#1A1C22] tracking-[-0.02em]">
            Your name
          </div>

          {/* Name Input Pill */}
          <div className="mt-1.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name"
              maxLength={20}
              className="w-full h-[48px] sm:h-[50px] rounded-full bg-[#FAF6EA] px-6 text-[16.5px] font-medium text-[#1A1C22] placeholder:text-[#1A1C22]/40 outline-none border-[2px] border-transparent focus:border-[#1A1C22] transition-all"
            />
          </div>

          {/* Label "Your color" */}
          <div className="mt-3 sm:mt-3.5 text-[17px] sm:text-[18px] font-black text-[#1A1C22] tracking-[-0.02em]">
            Your color
          </div>

          {/* Color Blobs: Salmon & Blue/Teal from Central Registry */}
          <div className="flex items-center gap-4 mt-1.5">
            {/* Salmon Pink Blob */}
            <div
              onClick={() => setSelectedColor('salmon')}
              className="w-[80px] h-[72px] relative cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
            >
              <AvatarBlob color="salmon" size={72} useNewBlob={true}>
                {selectedColor === 'salmon' && (
                  <>
                    <div className="absolute inset-[-2px] rounded-full border-[3px] border-[#1B1D20] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-[#1B1D20] rounded-full flex items-center justify-center z-10">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </>
                )}
              </AvatarBlob>
            </div>

            {/* Blue Blob (New Master Blob) */}
            <div
              onClick={() => setSelectedColor('teal')}
              className="w-[80px] h-[72px] relative cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
            >
              <AvatarBlob color="blue" size={72} useNewBlob={true}>
                {(selectedColor === 'teal' || selectedColor === ('blue' as any)) && (
                  <>
                    <div className="absolute inset-[-2px] rounded-full border-[3px] border-[#1B1D20] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-[#1B1D20] rounded-full flex items-center justify-center z-10">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </>
                )}
              </AvatarBlob>
            </div>
          </div>
        </div>

        {/* Continue Button: Standardized PillButton size matching other pages */}
        <div className="mt-5 sm:mt-6 w-full">
          <PillButton onClick={handleContinue} variant="black" isLoading={isSubmitting}>
            Continue
          </PillButton>
        </div>
      </div>
    </Screen>
  );
};
