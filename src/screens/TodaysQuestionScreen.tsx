import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { BottomNav } from '../components/BottomNav';

interface TodaysQuestionScreenProps {
  initialAnswer?: string;
  onLockAnswer?: (answer: string) => void;
  onSettingsClick?: () => void;
}

export const TodaysQuestionScreen: React.FC<TodaysQuestionScreenProps> = ({
  initialAnswer = '',
  onLockAnswer,
  onSettingsClick,
}) => {
  const [answer, setAnswer] = useState<string>(initialAnswer);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [scale, setScale] = useState<number>(1);

  // Responsive scale to fit stage cleanly on any screen size
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(1, Math.min(w / 390, h / 844));
      setScale(s);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLockIn = () => {
    if (!answer.trim() || isLocked) return;
    setIsLocked(true);
    console.log('Locked answer:', answer);
    setToastMessage('Locked in!');
    setTimeout(() => {
      setToastMessage('');
      onLockAnswer?.(answer);
    }, 1200);
  };

  const isButtonDisabled = answer.trim().length === 0 || isLocked;

  return (
    <div className="w-full h-full min-h-[100dvh] flex items-center justify-center bg-[#FAF6EA] select-none overflow-hidden">
      {/* 390x844 Fixed Stage */}
      <div
        className="relative bg-[#FDE073] overflow-hidden select-none"
        style={{
          width: '390px',
          height: '844px',
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* ---------------- TOP BAR ---------------- */}
        <TopBar streak={12} onSettingsClick={onSettingsClick} />

        {/* ---------------- DECORATIVE BLOBS (behind content) ---------------- */}

        {/* 1. Pink Heart (top-left): x 0, y 90, size about 66x66, cropped on left, tilted -20deg */}
        <div
          className="absolute pointer-events-none select-none z-0 animate-float-slow"
          style={{
            left: '-16px',
            top: '90px',
            width: '66px',
            height: '66px',
            transform: 'rotate(-20deg)',
          }}
        >
          <img
            src="/assets/blobs/heart-pink.svg"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* 2. Olive Green Cross (top-mid): x 246, y 90, size 65x67, tilted slightly clockwise */}
        <div
          className="absolute pointer-events-none select-none z-0 animate-float"
          style={{
            left: '246px',
            top: '90px',
            width: '65px',
            height: '67px',
            transform: 'rotate(12deg)',
          }}
        >
          <img
            src="/assets/blobs/cross-olive-decorative.svg"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* 3. Blue Starburst (top-right): x 331, y 117, size about 78x78, cropped on right edge */}
        <div
          className="absolute pointer-events-none select-none z-0 animate-float-reverse"
          style={{
            left: '331px',
            top: '117px',
            width: '78px',
            height: '78px',
            transform: 'rotate(10deg)',
          }}
        >
          <img
            src="/assets/blobs/starburst-blue-join.svg"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* 4. Pink Heart (bottom-left): x 5, y 653, size 84x78, tilted counterclockwise about 20deg */}
        <div
          className="absolute pointer-events-none select-none z-0 animate-float-slow"
          style={{
            left: '5px',
            top: '653px',
            width: '84px',
            height: '78px',
            transform: 'rotate(-20deg)',
          }}
        >
          <img
            src="/assets/blobs/heart-pink.svg"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* 5. Blue Starburst (bottom-right): x 314, y 657, size 76x73, cropped on right edge */}
        <div
          className="absolute pointer-events-none select-none z-0 animate-float"
          style={{
            left: '314px',
            top: '657px',
            width: '76px',
            height: '73px',
            transform: 'rotate(-8deg)',
          }}
        >
          <img
            src="/assets/blobs/starburst-blue-join.svg"
            alt=""
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>


        {/* ---------------- QUESTION TEXT ---------------- */}

        {/* Label "Today's question": x 33, vertical center y 170, Nunito 600, 16px, muted */}
        <div
          className="absolute text-[16px] font-semibold tracking-[-0.01em] select-none z-10"
          style={{
            left: '33px',
            top: '160px',
            color: 'rgba(25, 29, 31, 0.55)',
            lineHeight: '20px',
          }}
        >
          Today’s question
        </div>

        {/* Question: x 33, top y 195, Nunito 900, ink #191D1F. Responsive font size */}
        <div
          className="absolute z-10 font-black text-[#191D1F] select-none break-words"
          style={{
            left: '33px',
            top: '195px',
            width: '320px',
            fontSize: '32px',
            lineHeight: '38px',
            letterSpacing: '-0.03em',
          }}
        >
          What’s a fear<br />
          you’d never tell<br />
          anyone?
        </div>


        {/* ---------------- ANSWER BOX ---------------- */}

        {/* Answer Box: x 31, y 355, 329x120, cream #FAF3E1, corner radius 22px */}
        <div
          className="absolute bg-[#FAF3E1] rounded-[22px] z-10 flex flex-col justify-between overflow-hidden"
          style={{
            left: '31px',
            top: '355px',
            width: '329px',
            height: '120px',
          }}
        >
          {/* Real Textarea */}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, 200))}
            placeholder="Type your answer..."
            maxLength={200}
            disabled={isLocked}
            className="w-full h-[88px] bg-transparent resize-none outline-none font-medium text-[17px] text-[#191D1F] placeholder:text-[#A5A5AD] border-none"
            style={{
              paddingLeft: '24px',
              paddingTop: '20px',
              paddingRight: '24px',
              lineHeight: '24px',
            }}
          />

          {/* Counter "0 / 200": right edge x 346 (inside box: right 14px), vertical center y 459 */}
          <div
            className="text-right font-semibold text-[13px] select-none pr-[14px] pb-[10px]"
            style={{
              color: 'rgba(25, 29, 31, 0.55)',
            }}
          >
            {answer.length} / 200
          </div>
        </div>


        {/* ---------------- LOCK ROW ---------------- */}

        {/* Lock Row Group: avatar at x 33, y 485 */}
        <div
          className="absolute z-10 flex items-center select-none"
          style={{
            left: '33px',
            top: '485px',
          }}
        >
          {/* Avatar-1 on a blue Blob: size 64x65 */}
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{ width: '64px', height: '65px' }}
          >
            <img
              src="/assets/blobs/card-blob-b-blue.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            <img
              src="/assets/avatars/avatar-1.png"
              alt="Avatar"
              className="relative z-10 w-[60%] h-[60%] object-contain pointer-events-none select-none"
              draggable={false}
            />

            {/* Black lock badge: 22px circle overlapping blob bottom-right, center x 88, y 540 */}
            <div
              className="absolute rounded-full bg-[#191D1F] flex items-center justify-center z-20 shadow-none"
              style={{
                right: '-4px',
                bottom: '-2px',
                width: '22px',
                height: '22px',
              }}
            >
              {/* White padlock icon (11px) */}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          {/* Text at x 113 (margin left: 113 - 33 - 64 = 16px): 2 lines with 19.7px line spacing */}
          <div
            className="flex flex-col justify-center text-[14px] font-medium ml-[16px]"
            style={{
              color: 'rgba(25, 29, 31, 0.55)',
              lineHeight: '19.7px',
              maxWidth: '210px',
            }}
          >
            <span>They can’t see it until</span>
            <span>you both answer.</span>
          </div>
        </div>


        {/* ---------------- BUTTON ---------------- */}

        {/* "Lock in my answer": x 33, y 577, 323x47, background ink, fully rounded */}
        <button
          type="button"
          onClick={handleLockIn}
          disabled={isButtonDisabled}
          className={`btn-press absolute rounded-full font-bold text-[18px] text-white flex items-center justify-center z-20 transition-all focus:outline-none select-none ${
            isButtonDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'opacity-100 hover:bg-[#2A2E30] cursor-pointer'
          }`}
          style={{
            left: '33px',
            top: '577px',
            width: '323px',
            height: '47px',
            backgroundColor: '#191D1F',
          }}
        >
          {isLocked ? 'Locked in! 🔒' : 'Lock in my answer'}
        </button>


        {/* ---------------- TOAST ---------------- */}
        {toastMessage && (
          <div className="absolute top-[300px] left-1/2 -translate-x-1/2 z-50 bg-[#191D1F] text-white px-5 py-2.5 rounded-full font-bold text-[15px] shadow-lg animate-pop select-none pointer-events-none">
            {toastMessage}
          </div>
        )}


        {/* ---------------- BOTTOM NAV ---------------- */}
        <div className="absolute bottom-0 left-0 right-0 pb-1 z-30 pointer-events-auto">
          <BottomNav activeTab="home" className="mb-1" />
        </div>
      </div>
    </div>
  );
};
