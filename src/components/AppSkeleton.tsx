import React from 'react';

interface AppSkeletonProps {
  progress?: number;
}

export const AppSkeleton: React.FC<AppSkeletonProps> = ({ progress = 0 }) => {
  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#F8F1E1] flex items-center justify-center p-0 select-none overflow-hidden font-['Nunito',sans-serif]">
      {/* Phone container mockup matching the app shell */}
      <div className="w-full max-w-[430px] h-[100dvh] max-h-[932px] bg-[#FAF6EA] relative flex flex-col justify-between p-5 overflow-hidden shadow-2xl sm:rounded-[36px] border-4 border-[#191D21]/10">
        
        {/* =========================================================================
            SKELETON DECORATION PLACEHOLDERS (matching the exact corner positions)
           ========================================================================= */}
        {/* Top-Left Heart Skeleton */}
        <div className="absolute top-[20px] left-[16px] w-12 h-12 rounded-full bg-[#EAD8D8]/50 animate-pulse pointer-events-none" />

        {/* Top-Right Starburst Skeleton */}
        <div className="absolute top-[24px] right-[16px] w-10 h-14 rounded-2xl bg-[#D4E2F0]/50 animate-pulse pointer-events-none" />

        {/* Bottom-Left Olive Cross Skeleton */}
        <div className="absolute bottom-[90px] left-[16px] w-11 h-11 rounded-xl bg-[#E2E6D4]/60 animate-pulse pointer-events-none" />

        {/* Bottom-Right Yellow Crescent Skeleton */}
        <div className="absolute bottom-[92px] right-[20px] w-10 h-12 rounded-full bg-[#F5EDD0]/70 animate-pulse pointer-events-none" />

        {/* ── TOP BAR SKELETON ── */}
        <div className="w-full flex items-center justify-between pt-2 px-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#E4DCB8]/60 animate-pulse border-2 border-[#191D21]/15" />
            <div className="w-24 h-5 rounded-full bg-[#E4DCB8]/50 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-7 rounded-full bg-[#FEE2B8]/70 animate-pulse border border-[#191D21]/10" />
            <div className="w-9 h-9 rounded-full bg-[#E4DCB8]/60 animate-pulse" />
          </div>
        </div>

        {/* ── CENTER HERO CARD SKELETON ── */}
        <div className="my-auto w-full flex flex-col items-center z-10 py-4">
          <div className="w-full bg-[#FFFDF5] rounded-[32px] border-[3px] border-[#191D21] p-6 shadow-[0_8px_0px_#191D21] flex flex-col items-center gap-5 relative overflow-hidden">
            {/* Subtle card background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            {/* Tag pill skeleton */}
            <div className="w-28 h-6 rounded-full bg-[#F4E3A1]/70 animate-pulse" />

            {/* Question Lines Skeleton */}
            <div className="w-full flex flex-col items-center gap-2.5 my-2">
              <div className="w-4/5 h-6 rounded-lg bg-[#E0D8C3] animate-pulse" />
              <div className="w-3/5 h-6 rounded-lg bg-[#E0D8C3] animate-pulse" />
            </div>

            {/* Two Facing Avatar Bubbles Skeleton */}
            <div className="flex items-center justify-center gap-4 my-2 w-full">
              <div className="w-20 h-20 rounded-full bg-[#F8C8D4]/60 animate-pulse border-2 border-[#191D21]/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/40" />
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FAD961]/80 animate-bounce flex items-center justify-center font-black text-xs border border-[#191D21]/20">
                VS
              </div>
              <div className="w-20 h-20 rounded-full bg-[#B8D8F8]/60 animate-pulse border-2 border-[#191D21]/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Action button skeleton */}
            <div className="w-full h-14 rounded-full bg-[#191D21]/15 animate-pulse mt-2" />
          </div>

          {/* Loading status & progress indicator */}
          <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-[260px]">
            <div className="flex items-center justify-between w-full text-xs font-black text-[#191D21]/70 px-1">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#F5A623] animate-ping" />
                Preloading decorations...
              </span>
              <span>{Math.max(progress, 15)}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-[#E8DEC3] rounded-full overflow-hidden border border-[#191D21]/20 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#FF7A8A] via-[#FAD961] to-[#4ECDC4] rounded-full transition-all duration-200 ease-out"
                style={{ width: `${Math.max(progress, 15)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── BOTTOM NAV SKELETON ── */}
        <div className="w-full h-16 bg-[#FFFDF5] rounded-full border-2 border-[#191D21]/15 flex items-center justify-around px-4 shadow-sm z-10 mb-1">
          <div className="w-10 h-10 rounded-full bg-[#E0D8C3]/50 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-[#E0D8C3]/50 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-[#E0D8C3]/50 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-[#E0D8C3]/50 animate-pulse" />
        </div>

      </div>
    </div>
  );
};
