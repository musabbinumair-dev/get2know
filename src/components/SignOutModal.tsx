import React, { useState, useCallback, useEffect } from 'react';

export interface SignOutModalProps {
  onConfirmSignOut: () => void;
  onClose: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  onConfirmSignOut,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirmSignOut();
    }, 200);
  }, [onConfirmSignOut]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-['Nunito',sans-serif] select-none ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleClose}
    >
      {/* ── CENTERED DIALOG CARD CONTAINER ── */}
      <div
        className={`relative w-full max-w-[320px] bg-[#FAF6EB] rounded-[36px] pt-12 pb-6 px-6 shadow-2xl flex flex-col items-center justify-center text-center ${
          isClosing ? 'animate-scaleDown' : 'animate-scaleUp'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP OLIVE BLOB (90px, overlapping top edge with Duo Logo) ── */}
        <div className="absolute -top-[45px] left-1/2 -translate-x-1/2 w-[90px] h-[90px] z-20 flex items-center justify-center pointer-events-none select-none">
          {/* Olive Blob Shape */}
          <svg
            viewBox="0 0 300 300"
            className="absolute inset-0 w-full h-full object-contain filter drop-shadow-sm pointer-events-none select-none"
          >
            <path
              d="M 183.49 4 C 172.77 3.33 158.93 3.33 143.3 6.68 C 127.68 10.03 102.23 18.96 89.72 24.09 C 77.22 29.23 75.21 31.24 68.29 37.49 C 61.37 43.74 54.01 50.21 48.2 61.6 C 42.4 72.98 39.27 92.85 33.47 105.8 C 27.66 118.75 18.29 128.35 13.38 139.28 C 8.46 150.22 5.34 162.06 4 171.43 C 2.66 180.81 4 187.73 5.34 195.54 C 6.68 203.35 9.13 211.39 12.04 218.31 C 14.94 225.23 17.62 230.37 22.75 237.06 C 27.89 243.76 35.03 252.24 42.84 258.5 C 50.66 264.75 53.78 269.43 69.63 274.57 C 85.48 279.7 121.65 286.85 137.94 289.3 C 154.24 291.76 156.92 290.87 167.41 289.3 C 177.91 287.74 191.3 283.72 200.9 279.93 C 210.5 276.13 216.53 272.78 225.01 266.53 C 233.49 260.28 241.53 257.16 251.8 242.42 C 262.07 227.69 279.48 192.86 286.62 178.13 C 293.77 163.39 293.1 162.72 294.66 154.02 C 296.22 145.31 298.01 137.5 296 125.89 C 293.99 114.28 289.08 96.87 282.61 84.37 C 276.13 71.87 265.86 60.93 257.16 50.88 C 248.45 40.83 238.63 30.79 230.37 24.09 C 222.11 17.39 215.41 14.05 207.6 10.7 C 199.78 7.35 194.2 4.67 183.49 4 Z"
              fill="#748749"
            />
          </svg>

          {/* Logo from Questions Page Top Left */}
          <img
            src="/assets/waiting/logo-duo.webp"
            alt="Duo"
            className="relative z-10 w-[60px] h-[24px] object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* ── TITLE ── */}
        <h2 className="font-black text-[26px] text-[#17181B] tracking-tight leading-tight mt-1 mb-1.5 z-10">
          Sign out?
        </h2>

        {/* ── BODY TEXT ── */}
        <p className="text-[15px] font-bold text-[#17181B]/60 leading-snug px-1 mb-6 z-10 max-w-[240px]">
          Your answers stay safe. Sign back in anytime.
        </p>

        {/* ── BUTTON ACTIONS ── */}
        <div className="w-full flex flex-col gap-2.5 z-10">
          {/* Black Pill "Sign out" */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-[48px] rounded-full bg-[#17181B] text-white font-extrabold text-[16.5px] hover:bg-[#25272c] active:scale-[0.98] transition-all cursor-pointer focus:outline-none shadow-sm"
          >
            Sign out
          </button>

          {/* Cream-tinted Pill "Stay" */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full h-[48px] rounded-full bg-[#EFE7D5] hover:bg-[#E7DDC8] text-[#17181B] font-extrabold text-[16.5px] active:scale-[0.98] transition-all cursor-pointer focus:outline-none border border-[#17181B]/10"
          >
            Stay
          </button>
        </div>
      </div>
    </div>
  );
};
