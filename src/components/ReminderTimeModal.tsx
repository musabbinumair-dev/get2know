import React, { useState, useRef, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

export interface ReminderTimeModalProps {
  initialTime?: string; // e.g. "9:00 PM"
  onSave: (time: string) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 42; // Height of each time item in px

export const ReminderTimeModal: React.FC<ReminderTimeModalProps> = ({
  initialTime = '9:00 PM',
  onSave,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Swipe-down to dismiss state
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);

  // Parse initial time
  const parseInitialTime = (timeStr: string) => {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return {
        hour: parseInt(match[1], 10),
        minute: match[2],
        period: match[3].toUpperCase() as 'AM' | 'PM',
      };
    }
    return { hour: 9, minute: '00', period: 'PM' as const };
  };

  const parsed = parseInitialTime(initialTime);
  const [selectedHour, setSelectedHour] = useState<number>(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState<string>(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(parsed.period);

  // Smooth Closing Trigger
  const handleClose = useCallback(() => {
    triggerHaptic(10);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 240);
  }, [onClose]);

  const handleSave = useCallback(() => {
    triggerHaptic(25);
    setIsClosing(true);
    setTimeout(() => {
      const formatted = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      onSave(formatted);
    }, 240);
  }, [selectedHour, selectedMinute, selectedPeriod, onSave]);

  // Swipe / Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-scrollbar')) return;
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
    if (target.closest('button') || target.closest('.no-scrollbar')) return;
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

  // Data Arrays
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));
  const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  // Scroll Container Refs
  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const periodRef = useRef<HTMLDivElement | null>(null);

  // Triple arrays for infinite seamless scrolling
  const tripleHours = [...hours, ...hours, ...hours];
  const tripleMinutes = [...minutes, ...minutes, ...minutes];

  // Initial Scroll Positions
  useEffect(() => {
    if (hourRef.current) {
      const hourIndex = hours.indexOf(selectedHour);
      hourRef.current.scrollTop = (hours.length + hourIndex) * ITEM_HEIGHT;
    }
    if (minuteRef.current) {
      const minIndex = minutes.indexOf(selectedMinute);
      minuteRef.current.scrollTop = (minutes.length + (minIndex >= 0 ? minIndex : 0)) * ITEM_HEIGHT;
    }
    if (periodRef.current) {
      const pIndex = periods.indexOf(selectedPeriod);
      periodRef.current.scrollTop = pIndex * ITEM_HEIGHT;
    }
  }, []);

  // Handle Hour Scroll
  const handleHourScroll = () => {
    if (!hourRef.current) return;
    const { scrollTop } = hourRef.current;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const hourVal = tripleHours[index];
    if (hourVal && hourVal !== selectedHour) {
      setSelectedHour(hourVal);
      triggerHaptic(5);
    }

    if (scrollTop < hours.length * ITEM_HEIGHT * 0.5) {
      hourRef.current.scrollTop += hours.length * ITEM_HEIGHT;
    } else if (scrollTop > hours.length * ITEM_HEIGHT * 2.2) {
      hourRef.current.scrollTop -= hours.length * ITEM_HEIGHT;
    }
  };

  // Handle Minute Scroll
  const handleMinuteScroll = () => {
    if (!minuteRef.current) return;
    const { scrollTop } = minuteRef.current;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const minVal = tripleMinutes[index];
    if (minVal && minVal !== selectedMinute) {
      setSelectedMinute(minVal);
      triggerHaptic(5);
    }

    if (scrollTop < minutes.length * ITEM_HEIGHT * 0.5) {
      minuteRef.current.scrollTop += minutes.length * ITEM_HEIGHT;
    } else if (scrollTop > minutes.length * ITEM_HEIGHT * 2.2) {
      minuteRef.current.scrollTop -= minutes.length * ITEM_HEIGHT;
    }
  };

  // Handle Period Scroll
  const handlePeriodScroll = () => {
    if (!periodRef.current) return;
    const { scrollTop } = periodRef.current;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const pVal = periods[index];
    if (pVal && pVal !== selectedPeriod) {
      setSelectedPeriod(pVal);
      triggerHaptic(8);
    }
  };

  // Click / Tap Item Handlers with smooth scroll
  const scrollToHourIndex = (idx: number) => {
    triggerHaptic(5);
    if (hourRef.current) {
      hourRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const scrollToMinuteIndex = (idx: number) => {
    triggerHaptic(5);
    if (minuteRef.current) {
      minuteRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const scrollToPeriodIndex = (idx: number) => {
    triggerHaptic(8);
    if (periodRef.current) {
      periodRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
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
        <h2 className="font-black text-[26px] text-[#17181B] tracking-tight text-center leading-tight mt-1">
          Daily reminder time
        </h2>
        <p className="mt-1 text-[15px] font-bold text-[#17181B]/50 text-center">
          When should we nudge you?
        </p>

        {/* ── 3-COLUMN TIME WHEEL WITH 3 DIFFERENT COLOR HIGHLIGHT BLOBS ── */}
        <div className="relative mt-6 mb-6 h-[126px] flex items-center justify-center gap-4 sm:gap-6 select-none">
          {/* Background Fixed Selection 3-Color Organic Blobs */}
          <div className="absolute top-[40px] left-0 right-0 h-[46px] pointer-events-none z-0 flex items-center justify-center gap-4 sm:gap-6">
            {/* Column 1: Pink / Salmon Organic Blob */}
            <div className="w-[84px] h-[46px] flex items-center justify-center">
              <svg viewBox="0 0 120 60" className="w-[84px] h-[46px]">
                <path d="M15,8 C35,2 85,3 105,9 C118,20 116,40 104,50 C84,58 36,56 16,50 C2,40 3,18 15,8 Z" fill="#F8ADBE" />
              </svg>
            </div>

            {/* Column 2: Bright Yellow Organic Blob */}
            <div className="w-[84px] h-[46px] flex items-center justify-center">
              <svg viewBox="0 0 120 60" className="w-[84px] h-[46px]">
                <path d="M12,12 C32,4 88,2 108,12 C117,24 115,44 102,52 C82,58 32,58 14,48 C3,38 2,20 12,12 Z" fill="#FDD663" />
              </svg>
            </div>

            {/* Column 3: Mint / Teal Organic Blob */}
            <div className="w-[84px] h-[46px] flex items-center justify-center">
              <svg viewBox="0 0 120 60" className="w-[84px] h-[46px]">
                <path d="M18,9 C38,3 82,5 102,11 C116,22 114,42 105,51 C85,57 38,55 15,49 C4,39 5,19 18,9 Z" fill="#8FE0D0" />
              </svg>
            </div>
          </div>

          {/* COLUMN 1: HOURS (Scrollable) */}
          <div className="relative w-[84px] h-[126px] z-10">
            <div
              ref={hourRef}
              onScroll={handleHourScroll}
              className="h-[126px] overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth py-[42px]"
            >
              {tripleHours.map((h, idx) => {
                const isSelected = h === selectedHour;
                return (
                  <div
                    key={`h-${idx}`}
                    onClick={() => scrollToHourIndex(idx)}
                    className={`h-[42px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'font-black text-[24px] text-[#17181B] scale-100'
                        : 'font-extrabold text-[17px] text-[#17181B]/35 hover:text-[#17181B]/60 scale-90'
                    }`}
                  >
                    {h}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: MINUTES (Scrollable) */}
          <div className="relative w-[84px] h-[126px] z-10">
            <div
              ref={minuteRef}
              onScroll={handleMinuteScroll}
              className="h-[126px] overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth py-[42px]"
            >
              {tripleMinutes.map((m, idx) => {
                const isSelected = m === selectedMinute;
                return (
                  <div
                    key={`m-${idx}`}
                    onClick={() => scrollToMinuteIndex(idx)}
                    className={`h-[42px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'font-black text-[24px] text-[#17181B] scale-100'
                        : 'font-extrabold text-[17px] text-[#17181B]/35 hover:text-[#17181B]/60 scale-90'
                    }`}
                  >
                    {m}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3: AM / PM (Scrollable) */}
          <div className="relative w-[84px] h-[126px] z-10">
            <div
              ref={periodRef}
              onScroll={handlePeriodScroll}
              className="h-[126px] overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth py-[42px]"
            >
              {periods.map((p, idx) => {
                const isSelected = p === selectedPeriod;
                return (
                  <div
                    key={`p-${idx}`}
                    onClick={() => scrollToPeriodIndex(idx)}
                    className={`h-[42px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'font-black text-[22px] text-[#17181B] scale-100'
                        : 'font-extrabold text-[17px] text-[#17181B]/35 hover:text-[#17181B]/60 scale-90'
                    }`}
                  >
                    {p}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PRIMARY ACTION BUTTON: Set time ── */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full h-[52px] rounded-full bg-[#17181B] text-white font-extrabold text-[17.5px] hover:bg-[#25272c] active:scale-[0.98] transition-all cursor-pointer focus:outline-none shadow-sm"
        >
          Set time
        </button>

        {/* ── CANCEL LINK ── */}
        <button
          type="button"
          onClick={handleClose}
          className="mt-3 block mx-auto text-[15px] font-bold text-[#17181B]/60 underline hover:text-[#17181B] transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
