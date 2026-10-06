// Shared design tokens across game pages (Home, Today, Guess, Reveal, Scores, Lobby)
export const TOKENS = {
  typography: {
    pageTitle: 'text-[36px] sm:text-[40px] font-black text-[#17181B] tracking-[-0.03em] leading-none',
    sectionHeading: 'text-[22px] sm:text-[23px] font-black text-[#17181B] tracking-tight leading-none',
    subtitle: 'text-[15px] sm:text-[16px] font-bold text-[#17181B]/60 tracking-tight leading-snug',
    playerName: 'text-[16px] font-black text-[#17181B] tracking-tight leading-tight',
    pillText: 'text-[12.5px] font-extrabold tracking-tight leading-none',
    chipText: 'text-[13px] font-bold tracking-tight leading-none',
    buttonText: 'text-[16.5px] font-extrabold tracking-tight leading-none',
  },
  buttons: {
    primary:
      'w-full h-[52px] sm:h-[54px] rounded-full bg-[#17181B] hover:bg-[#282B30] text-white font-extrabold text-[16.5px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform',
    secondary:
      'w-full h-[52px] sm:h-[54px] rounded-full bg-[#EBE2CD] hover:bg-[#E0D6BF] text-[#17181B] font-extrabold text-[16.5px] tracking-tight flex items-center justify-center gap-2 cursor-pointer focus:outline-none active:scale-[0.98] transition-transform',
    back: 'w-[42px] h-[42px] rounded-full border-[1.6px] border-dashed border-[#17181B] flex items-center justify-center bg-transparent hover:bg-[#17181B]/5 active:scale-95 transition-transform cursor-pointer focus:outline-none p-0',
  },
  card: {
    radius: 'rounded-[32px] sm:rounded-[36px]',
    bgYellow: '#FEE36F',
  },
  layout: {
    mobileMaxWidth: 'max-w-[390px]',
    mobileContainer: 'w-full max-w-[390px] mx-auto flex flex-col px-5 pt-4 pb-12 relative min-h-max select-none font-[\'Nunito\',sans-serif]',
  },
  decorations: {
    moon: 'w-[52px] h-[58px] object-contain pointer-events-none select-none',
    heart: 'w-[40px] h-[48px] object-contain pointer-events-none select-none',
    star: 'w-[64px] h-[72px] object-contain pointer-events-none select-none',
    cross: 'w-[58px] h-[58px] object-contain pointer-events-none select-none',
  },
};
