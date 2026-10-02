import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../components/Screen';
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
  // Pre-fill 'K', '7', 'X' to match mockup exactly on first load
  const [digits, setDigits] = useState<string[]>(['K', '7', 'X', '', '', '']);
  const [activeBoxIndex, setActiveBoxIndex] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the active box on mount (box index 3 by default)
  useEffect(() => {
    inputRefs.current[3]?.focus();
  }, []);

  const triggerBounce = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 260);
  };

  const code = digits.join('');

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setErrorMessage('');
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
        triggerBounce();
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setActiveBoxIndex(index - 1);
        triggerBounce();
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
    // Extract any new alphanumeric character
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!cleaned) return;

    // Take the last character typed in this box
    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');
    triggerBounce();

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
    triggerBounce();

    const nextFocus = Math.min(cleaned.length, 5);
    inputRefs.current[nextFocus]?.focus();
    setActiveBoxIndex(nextFocus);
  };

  const handleJoin = () => {
    if (code.length < 6) return;

    const normalizedTarget = validCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (code === normalizedTarget || code === 'K7X92P') {
      console.log('joined', code);
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

  return (
    <Screen bg="#F4A7D3">
      {/* ---------------- DECORATIVE BACKGROUND BLOBS ---------------- */}

      {/* Top-Right: Yellow Crescent Moon */}
      <div
        className="absolute top-[18px] right-[18px] pointer-events-none select-none z-0"
        style={{ width: '88px', height: '94px' }}
      >
        <img
          src="/assets/blobs/crescent-yellow-join.svg"
          alt=""
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Left Side: Blue Starburst */}
      <div
        className="absolute bottom-[200px] -left-[18px] pointer-events-none select-none z-0"
        style={{ width: '94px', height: '94px' }}
      >
        <img
          src="/assets/blobs/starburst-blue-join.svg"
          alt=""
          className="w-full h-full object-contain rotate-[-6deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Right Side: Olive Cross */}
      <div
        className="absolute bottom-[160px] right-[16px] pointer-events-none select-none z-0"
        style={{ width: '86px', height: '90px' }}
      >
        <img
          src="/assets/blobs/cross-olive-join.svg"
          alt=""
          className="w-full h-full object-contain rotate-[15deg] select-none pointer-events-none"
          draggable={false}
        />
      </div>


      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100dvh] sm:min-h-0 sm:h-full px-7 pt-9 pb-8 sm:px-8 sm:pt-9 sm:pb-9 select-none">
        <div>
          {/* Top Navigation Row: Dashed Circular Back Button (44x44) */}
          <div className="flex items-center justify-between w-full">
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
          </div>

          {/* Heading Section */}
          <div className="mt-6">
            <h1 className="text-[38px] sm:text-[40px] font-black text-[#1A1C22] leading-[1.08] tracking-[-0.035em]">
              Got a code?
            </h1>
            <p className="mt-2 text-[16.5px] font-medium text-[#1A1C22]/65 tracking-[-0.01em]">
              Ask your friend for their invite code.
            </p>
          </div>

          {/* Six Cream Rounded Input Boxes */}
          <div className={`mt-7 relative w-full max-w-[342px] mx-auto ${isShaking ? 'animate-shake' : ''}`}>
            {/* 6 Boxes Container (about 56x72px, radius ~20px) */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full">
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
                    className={`w-[50px] sm:w-[54px] h-[68px] sm:h-[72px] rounded-[20px] bg-[#FAF6EA] text-center font-extrabold text-[28px] sm:text-[30px] text-[#1A1C22] caret-[#1A1C22] outline-none transition-all cursor-pointer selection:bg-transparent ${
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

          {/* Center Stage: Avatar-1 on Blue Blob + Cream Speech Bubble + Sparks */}
          <div className="mt-10 relative flex items-center justify-center w-full max-w-[340px] mx-auto min-h-[170px]">
            {/* Left: Avatar-1 on Blue Card Blob with gentle bounce */}
            <div
              className={`relative w-[142px] h-[142px] flex items-center justify-center -mr-2 ${
                isBouncing ? 'animate-avatar-bounce' : ''
              }`}
            >
              <img
                src="/assets/blobs/avatar-blob-blue-join.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              <img
                src="/assets/avatars/avatar-1.png"
                alt="Avatar"
                className="relative z-10 w-[78%] h-[78%] object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>

            {/* Right: Speech Bubble & Spark Lines */}
            <div className="relative flex flex-col items-start -ml-2 mb-6">
              {/* Cream Speech Bubble */}
              <div className="relative inline-flex items-center bg-[#FAF6EA] px-5 py-3 rounded-[24px] shadow-none z-10">
                <span className="text-[17px] font-black text-[#1A1C22] tracking-[-0.01em]">
                  {speechText}
                </span>
                {/* Speech tail pointing down-left toward avatar */}
                <svg
                  className="absolute -bottom-[7px] left-[16px] w-[18px] h-[12px] text-[#FAF6EA]"
                  viewBox="0 0 18 12"
                  fill="currentColor"
                >
                  <path d="M0 0C6 1 12 4 16 11C12 7 8 4 4 0Z" />
                </svg>
              </div>

              {/* Three Short Yellow Spark Lines near the bubble */}
              <div className="relative mt-2.5 ml-1 flex flex-col gap-1.5 pointer-events-none">
                <div className="w-[12px] h-[4px] bg-[#F8D56B] rounded-full rotate-[-25deg]" />
                <div className="w-[14px] h-[4px] bg-[#F8D56B] rounded-full rotate-[0deg] ml-1.5" />
                <div className="w-[12px] h-[4px] bg-[#F8D56B] rounded-full rotate-[25deg]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions: Join Button & Create Duo Link */}
        <div className="w-full max-w-[340px] mx-auto flex flex-col items-center">
          <PillButton
            variant="black"
            disabled={!isComplete}
            onClick={handleJoin}
            className={`w-full max-w-[340px] h-[56px] text-[18px] font-bold tracking-tight shadow-none transition-all ${
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
    </Screen>
  );
};
