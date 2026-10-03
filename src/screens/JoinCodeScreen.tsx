import React, { useState, useRef, useEffect } from 'react';
import { PillButton } from '../components/PillButton';

interface JoinCodeScreenProps {
  validCode?: string;
  onBack: () => void;
  onCreateDuo: () => void;
  onJoinSuccess?: (code: string) => void;
}

export const JoinCodeScreen: React.FC<JoinCodeScreenProps> = ({
  validCode = 'K7X92P',
  onBack,
  onCreateDuo,
  onJoinSuccess,
}) => {
  // Empty input digits initially
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeBoxIndex, setActiveBoxIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isDebug, setIsDebug] = useState<boolean>(false);
  const [isOverlay, setIsOverlay] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Check debug & overlay query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
      setIsOverlay(params.get('overlay') === '1');
    }
  }, []);

  // Viewport tracking for full width responsiveness without side margins
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

  // Scale by viewport width so the stage always spans 100% width with ZERO left/right margins
  const scale = viewport.width / 390;
  // Stage height in stage coordinate units to match full viewport height
  const stageH = viewport.height / scale;

  // Detect compact / short mobile screens (height < 780px)
  const isCompact = stageH < 780;

  const code = digits.join('');

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setErrorMessage('');
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setActiveBoxIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      setActiveBoxIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      setActiveBoxIndex(index + 1);
    } else if (e.key === 'Enter') {
      if (code.length === 6) {
        handleJoin();
      }
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!cleaned) return;

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');

    // Auto advance to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveBoxIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const cleaned = pasted.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    if (!cleaned) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }
    setDigits(newDigits);
    setErrorMessage('');

    const nextFocus = Math.min(cleaned.length, 5);
    inputRefs.current[nextFocus]?.focus();
    setActiveBoxIndex(nextFocus);
  };

  const handleJoin = () => {
    if (code.length < 6) return;

    const normalizedTarget = validCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (code === normalizedTarget || code === 'K7X92P') {
      setErrorMessage('');
      onJoinSuccess?.(code);
    } else {
      setIsShaking(true);
      setErrorMessage("That code doesn't match. Try again.");
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Dynamic speech bubble text based on code length
  let speechText = 'Almost there!';
  if (code.length === 0) {
    speechText = 'Ask them for the code!';
  } else if (code.length >= 6) {
    speechText = 'Ready to go! 🎉';
  }

  const isComplete = code.length === 6;

  // Geometry & Spacing:
  // Move code fields closer to headings with a clean, spacious 30px gap below the subtitle
  const backBtnTop = isCompact ? '26px' : '36px';
  const headingTop = isCompact ? '76px' : '96px';
  const codeRowTop = isCompact ? '184px' : '238px'; // Heading ends at ~154px on compact, giving ~30px gap

  // Join button top
  const joinBtnTop = isCompact
    ? Math.max(500, stageH - 118)
    : Math.min(708, Math.max(530, stageH - 128));

  // Graphic element sizes & positions
  const avatarWidth = isCompact ? '118px' : '143px';
  const bubbleWidth = isCompact ? '128px' : '154px';
  const sparkleWidth = isCompact ? '25px' : '31px';
  const starWidth = isCompact ? '66px' : '80px';
  const crossWidth = isCompact ? '64px' : '77px';

  // Centering the combined avatar + bubble illustration (total width ~300px standard / ~248px compact)
  const avatarLeft = isCompact ? '52px' : '48px';
  const bubbleLeft = isCompact ? '172px' : '195px';
  const bubbleTextCenterLeft = isCompact ? '236px' : '272px';
  const sparkleLeft = isCompact ? '166px' : '188px';

  const starTop = joinBtnTop - (isCompact ? 52 : 69) - (isCompact ? 69 : 84);
  const crossTop = joinBtnTop - (isCompact ? 32 : 43) - (isCompact ? 66 : 80);

  // Avatar group top position: perfectly centered vertically in the available space between code row and bottom
  const avatarTop = isCompact ? 295 : Math.max(345, Math.min(390, starTop - 85));

  // Speech bubble text sizing so text fits cleanly inside the bubble body
  const getBubbleTextProps = (text: string) => {
    if (text.length > 18) {
      return {
        fontSize: isCompact ? '11px' : '12px',
        lineHeight: isCompact ? '13px' : '14px',
        maxWidth: isCompact ? '108px' : '126px',
      };
    } else if (text.length > 14) {
      return {
        fontSize: isCompact ? '12px' : '14px',
        lineHeight: isCompact ? '14px' : '16px',
        maxWidth: isCompact ? '112px' : '132px',
      };
    }
    return {
      fontSize: isCompact ? '13px' : '16px',
      lineHeight: isCompact ? '16px' : '20px',
      maxWidth: isCompact ? '116px' : '136px',
    };
  };

  const bubbleTextStyle = getBubbleTextProps(speechText);

  return (
    <div
      className="relative w-full h-full min-h-screen bg-[#F5CCE2] overflow-x-hidden overflow-y-auto flex flex-col items-center select-none font-nunito"
      style={{ minHeight: '100dvh' }}
    >
      {/* 390px wide stage, scaled to fill 100% viewport width with ZERO side margins */}
      <div
        className="relative bg-[#F5CCE2] flex-shrink-0 select-none overflow-hidden"
        style={{
          width: '390px',
          height: `${stageH}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: `${stageH * (scale - 1)}px`,
        }}
      >
        {/* Mockup Overlay in ?debug=1&overlay=1 */}
        {isDebug && isOverlay && (
          <img
            src="/mockups/join.png"
            alt="Mockup overlay"
            className="absolute inset-0 w-[390px] h-[844px] pointer-events-none opacity-50 z-50 object-cover select-none"
            draggable={false}
          />
        )}

        {/* ---------------- DECORATIONS ---------------- */}

        {/* deco-moon-yellow */}
        <img
          src="/assets/join/deco-moon-yellow.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0"
          style={{
            left: '306px',
            top: '11px',
            width: isCompact ? '70px' : '81px',
            height: 'auto',
          }}
          draggable={false}
        />

        {/* deco-star-blue */}
        <img
          src="/assets/join/deco-star-blue.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0"
          style={{
            left: '3px',
            top: `${starTop}px`,
            width: starWidth,
            height: 'auto',
          }}
          draggable={false}
        />

        {/* deco-cross-olive */}
        <img
          src="/assets/join/deco-cross-olive.webp"
          alt=""
          className="absolute pointer-events-none select-none z-0"
          style={{
            left: isCompact ? '298px' : '295px',
            top: `${crossTop}px`,
            width: crossWidth,
            height: 'auto',
          }}
          draggable={false}
        />

        {/* CENTERED ILLUSTRATION GROUP: avatar-blob-blue */}
        <img
          src="/assets/join/avatar-blob-blue.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10"
          style={{
            left: avatarLeft,
            top: `${avatarTop}px`,
            width: avatarWidth,
            height: 'auto',
          }}
          draggable={false}
        />

        {/* CENTERED ILLUSTRATION GROUP: bubble-cream */}
        <img
          src="/assets/join/bubble-cream.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10"
          style={{
            left: bubbleLeft,
            top: `${avatarTop + 1}px`,
            width: bubbleWidth,
            height: 'auto',
          }}
          draggable={false}
        />

        {/* Bubble text */}
        <div
          className="absolute font-bold text-[#17181B] pointer-events-none select-none z-20 text-center flex items-center justify-center tracking-tight"
          style={{
            left: bubbleTextCenterLeft,
            top: `${avatarTop + (isCompact ? 27 : 32)}px`,
            width: isCompact ? '110px' : '130px',
            height: isCompact ? '34px' : '42px',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            color: '#17181B',
            fontSize: bubbleTextStyle.fontSize,
            lineHeight: bubbleTextStyle.lineHeight,
            maxWidth: bubbleTextStyle.maxWidth,
          }}
        >
          {speechText}
        </div>

        {/* sparkle-yellow */}
        <img
          src="/assets/join/sparkle-yellow.webp"
          alt=""
          className="absolute pointer-events-none select-none z-10"
          style={{
            left: sparkleLeft,
            top: `${avatarTop + (isCompact ? 62 : 76)}px`,
            width: sparkleWidth,
            height: 'auto',
          }}
          draggable={false}
        />

        {/* ---------------- MAIN CONTENT & INTERACTION ---------------- */}

        {/* Top Navigation Row: Dashed Circular Back Button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to welcome"
          style={{ top: backBtnTop }}
          className="btn-press absolute left-[28px] w-[44px] h-[44px] rounded-full border-[1.8px] border-dashed border-[#1B1D20] flex items-center justify-center hover:bg-[#1B1D20]/5 transition-colors focus:outline-none cursor-pointer z-20"
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

        {/* Heading Section */}
        <div
          className="absolute z-20"
          style={{
            left: '28px',
            top: headingTop,
            width: '334px',
          }}
        >
          <h1 className="text-[40px] font-black text-[#1A1C22] leading-[1.08] tracking-[-0.035em]">
            Got a code?
          </h1>
          <p className="mt-2 text-[16.5px] font-medium text-[#1A1C22]/65 tracking-[-0.01em]">
            Ask your friend for their invite code.
          </p>
        </div>

        {/* Six Cream Rounded Input Boxes */}
        <div
          className={`absolute z-20 ${isShaking ? 'animate-shake' : ''}`}
          style={{
            left: '24px',
            top: codeRowTop,
            width: '342px',
          }}
        >
          <div className="flex items-center justify-between gap-2 w-full">
            {digits.map((digit, index) => {
              const isFocused = activeBoxIndex === index;

              return (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck="false"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setActiveBoxIndex(index)}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-[50px] h-[72px] rounded-[20px] bg-[#FAF6EA] text-center font-extrabold text-[30px] text-[#1A1C22] caret-[#1A1C22] outline-none transition-all cursor-pointer selection:bg-transparent ${
                    isFocused
                      ? 'border-[3px] border-[#1A1C22]'
                      : 'border-[3px] border-transparent'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message if code is wrong */}
          {errorMessage && (
            <p className="mt-2.5 text-center text-[14px] font-bold text-[#C93B3B] tracking-tight">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Bottom Actions: Join Button */}
        <div
          className="absolute z-20"
          style={{
            left: '25px',
            top: `${joinBtnTop}px`,
            width: '340px',
          }}
        >
          <PillButton
            variant="black"
            disabled={!isComplete}
            onClick={handleJoin}
            className={`w-[340px] h-[56px] text-[18px] font-bold tracking-tight shadow-none transition-all ${
              isComplete
                ? 'opacity-100 hover:bg-[#2A2C34] cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Join
          </PillButton>

          <p className="mt-3.5 text-center text-[15px] font-medium text-[#1A1C22]/65 tracking-[-0.01em]">
            Don’t have one?{' '}
            <button
              type="button"
              onClick={onCreateDuo}
              className="text-[#1A1C22] underline underline-offset-2 hover:opacity-80 transition-opacity font-bold cursor-pointer"
            >
              Create a duo
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
