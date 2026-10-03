import React, { useState, useRef, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

export interface LeaveDuoModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export const LeaveDuoModal: React.FC<LeaveDuoModalProps> = ({
  onConfirm,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');

  // Swipe-down to dismiss state
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);

  const isConfirmed = confirmText.trim().toUpperCase() === 'LEAVE';

  // Smooth Closing Trigger
  const handleClose = useCallback(() => {
    triggerHaptic(10);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 240);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!isConfirmed) return;
    triggerHaptic(30);
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
    }, 240);
  }, [isConfirmed, onConfirm]);

  // Swipe / Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    setIsDragging(true);
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startYRef.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(0);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 60) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 60) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/45 z-50 flex flex-col justify-end ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleClose}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative bg-[#FAF6EB] rounded-t-[36px] pt-3 pb-8 px-6 w-full max-w-none sm:max-w-[390px] mx-auto shadow-2xl select-none font-['Nunito',sans-serif] overflow-hidden ${
          isClosing ? 'animate-slideDown' : dragY === 0 && !isDragging ? 'animate-slideUp' : ''
        }`}
        style={{
          transform: isClosing ? 'translateY(100%)' : dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP GRAB HANDLE BAR ── */}
        <div
          onClick={handleClose}
          className="w-full py-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-[44px] h-[4.5px] rounded-full bg-[#17181B]/25 hover:bg-[#17181B]/40 transition-colors" />
        </div>

        {/* ── TITLE & SUBTITLE ── */}
        <h2 className="font-black text-[24px] text-[#17181B] tracking-tight text-center leading-tight mt-1">
          Leave duo and delete data?
        </h2>
        <p className="mt-2 text-[15px] font-bold text-[#17181B]/60 leading-snug text-center max-w-[320px] mx-auto">
          This will disconnect you from your partner and permanently delete your shared question history.
        </p>

        {/* ── TYPE CONFIRMATION FIELD WITH EXACT STYLED IN-FIELD PLACEHOLDER ── */}
        <div className="mt-5 mb-2 relative">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              triggerHaptic(5);
            }}
            className="w-full h-[52px] px-4 rounded-2xl bg-[#EFE7D5] border-2 border-[#17181B]/15 text-center font-black text-[17px] text-[#17181B] focus:outline-none focus:border-[#D93838] transition-all"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          {confirmText === '' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-[14px] font-extrabold text-[#17181B]/75">
              <span>Type&nbsp;</span>
              <span className="text-[#D93838] font-black uppercase tracking-wider bg-[#D93838]/10 px-2 py-0.5 rounded-md">
                LEAVE
              </span>
              <span>&nbsp;to confirm:</span>
            </div>
          )}
        </div>

        {/* ── BUTTON ACTIONS ── */}
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed}
            className={`w-full h-[52px] rounded-full font-extrabold text-[16.5px] transition-all shadow-sm focus:outline-none ${
              isConfirmed
                ? 'bg-[#D93838] text-white hover:bg-[#c22e2e] active:scale-[0.98] cursor-pointer'
                : 'bg-[#17181B]/15 text-[#17181B]/35 cursor-not-allowed'
            }`}
          >
            Yes, leave duo & delete data
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full h-[52px] rounded-full border-2 border-[#17181B] bg-transparent text-[#17181B] font-extrabold text-[16.5px] hover:bg-[#17181B]/5 active:scale-[0.98] transition-all cursor-pointer focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
