import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PillButton } from '../components/PillButton';
import { playReadySound } from '../lib/soundEffects';
import { useSession } from '../services/sessionContext';
import { normalizeRoomCode } from '../services/roomService';

interface JoinCodeScreenProps {
  onBack: () => void;
  onCreateDuo: () => void;
  onJoinSuccess?: (code: string) => void;
}

export const JoinCodeScreen: React.FC<JoinCodeScreenProps> = ({
  onBack,
  onCreateDuo,
  onJoinSuccess,
}) => {
  const { profile, joinRoom, pendingInviteCode, setPendingInviteCode } = useSession();

  // Extract initial 6 alphanumeric digits from pending invite code or URL ?join=
  const getInitialDigits = (): string[] => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('join') || params.get('code') || pendingInviteCode;
      if (urlCode) {
        const cleaned = urlCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
        const arr = ['', '', '', '', '', ''];
        for (let i = 0; i < cleaned.length; i++) {
          arr[i] = cleaned[i];
        }
        return arr;
      }
    }
    return ['', '', '', '', '', ''];
  };

  const [digits, setDigits] = useState<string[]>(getInitialDigits);
  const [activeBoxIndex, setActiveBoxIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus appropriate box on mount
  useEffect(() => {
    const firstEmpty = digits.findIndex((d) => !d);
    const targetIdx = firstEmpty === -1 ? 5 : firstEmpty;
    inputRefs.current[targetIdx]?.focus();
    setActiveBoxIndex(targetIdx);
  }, []);

  // Viewport tracking for full width responsiveness
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

  const scale = viewport.width / 390;
  const stageH = viewport.height / scale;
  const isCompact = stageH < 780;

  const rawCode = digits.join('');

  const handleJoin = useCallback(async () => {
    if (rawCode.length < 6 || isJoining) return;
    setIsJoining(true);
    setErrorMessage('');

    try {
      const normalized = normalizeRoomCode(rawCode);
      if (!profile) {
        // Friend needs to set real name and avatar before joining
        setPendingInviteCode(normalized);
        onCreateDuo();
        return;
      }
      const joinedRoom = await joinRoom(normalized, profile);
      playReadySound();
      onJoinSuccess?.(joinedRoom.code);
    } catch (err: unknown) {
      setIsShaking(true);
      const msg = err instanceof Error ? err.message : 'Could not join room. Try again.';
      setErrorMessage(msg);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsJoining(false);
    }
  }, [rawCode, isJoining, profile, setPendingInviteCode, onCreateDuo, joinRoom, onJoinSuccess]);

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
      if (rawCode.length === 6) {
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

  // Dynamic speech bubble text based on code length
  let speechText = 'Type the 6-character code';
  if (rawCode.length === 0) {
    speechText = 'Type the 6-character code';
  } else if (rawCode.length < 6) {
    speechText = `${6 - rawCode.length} more letter${6 - rawCode.length === 1 ? '' : 's'}!`;
  } else {
    speechText = 'Ready to go! 🎉';
  }

  // Exact vertical layout anchor points
  const headerTop = 40;
  const mascotTop = isCompact ? 108 : 138;
  const bubbleTop = isCompact ? 180 : 210;
  const boxesTop = isCompact ? 375 : 415;
  const errorTop = boxesTop + 68;
  const joinBtnTop = isCompact ? 515 : 565;
  const dontHaveCodeTop = isCompact ? 600 : 650;

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden select-none"
      style={{
        backgroundColor: '#FDE473',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ── CORNER DECORATIONS ── */}
      <img
        src="/assets/welcome/starburst-blue-left.png"
        alt=""
        className="absolute -top-[16px] -left-[16px] w-[86px] h-[86px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/assets/welcome/starburst-yellow-right.png"
        alt=""
        className="absolute -bottom-[20px] -right-[20px] w-[90px] h-[90px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      <div
        style={{
          width: '390px',
          height: `${stageH}px`,
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* ── HEADER (Back Button + Centered Title) ── */}
        <div
          style={{
            position: 'absolute',
            top: `${headerTop}px`,
            left: 0,
            width: '390px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="btn-press cursor-pointer flex items-center justify-center rounded-full bg-[#1A1C22]/10 hover:bg-[#1A1C22]/20 text-[#1A1C22] transition-colors focus:outline-none"
            style={{
              position: 'absolute',
              left: '24px',
              width: '42px',
              height: '42px',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <h1
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '26px',
              color: '#1A1C22',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Enter Duo Code
          </h1>
        </div>

        {/* ── MASCOT / AVATAR ── */}
        <div
          style={{
            position: 'absolute',
            top: `${mascotTop}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '115px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <img
            src="/assets/guess/answer-blob-1-pink.webp"
            alt="Mascot Blob"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
          <img
            src="/assets/avatars/avatar-2.png"
            alt="Mascot Face"
            style={{
              position: 'absolute',
              width: '78px',
              height: '78px',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>

        {/* ── SPEECH BUBBLE ── */}
        <div
          style={{
            position: 'absolute',
            top: `${bubbleTop}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FAF6EA',
            borderRadius: '24px',
            padding: '12px 24px',
            border: '2px solid #1A1C22',
            boxShadow: '0 4px 14px rgba(26,28,34,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '16px',
              color: '#1A1C22',
            }}
          >
            {speechText}
          </span>
        </div>

        {/* ── 6 DIGIT CODE BOXES WITH CENTER DASH ── */}
        <div
          className={isShaking ? 'animate-shake' : ''}
          style={{
            position: 'absolute',
            top: `${boxesTop}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
          }}
        >
          {/* First 3 boxes */}
          {[0, 1, 2].map((idx) => {
            const isFilled = Boolean(digits[idx]);
            const isFocused = activeBoxIndex === idx;
            return (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={1}
                value={digits[idx]}
                onFocus={() => setActiveBoxIndex(idx)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onChange={(e) => handleChange(idx, e)}
                onPaste={handlePaste}
                style={{
                  width: '46px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: '#FAF6EA',
                  border: isFocused ? '3px solid #1A1C22' : '2px solid rgba(26,28,34,0.18)',
                  textAlign: 'center',
                  fontFamily: "'Nunito', monospace",
                  fontWeight: 900,
                  fontSize: '28px',
                  color: '#1A1C22',
                  outline: 'none',
                  boxShadow: isFilled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'border 120ms ease',
                }}
              />
            );
          })}

          {/* Dash separator */}
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: '26px',
              color: '#1A1C22',
              margin: '0 2px',
            }}
          >
            -
          </span>

          {/* Last 3 boxes */}
          {[3, 4, 5].map((idx) => {
            const isFilled = Boolean(digits[idx]);
            const isFocused = activeBoxIndex === idx;
            return (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={1}
                value={digits[idx]}
                onFocus={() => setActiveBoxIndex(idx)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onChange={(e) => handleChange(idx, e)}
                onPaste={handlePaste}
                style={{
                  width: '46px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: '#FAF6EA',
                  border: isFocused ? '3px solid #1A1C22' : '2px solid rgba(26,28,34,0.18)',
                  textAlign: 'center',
                  fontFamily: "'Nunito', monospace",
                  fontWeight: 900,
                  fontSize: '28px',
                  color: '#1A1C22',
                  outline: 'none',
                  boxShadow: isFilled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'border 120ms ease',
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              position: 'absolute',
              top: `${errorTop}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '340px',
              textAlign: 'center',
              color: '#D32F2F',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '14px',
              zIndex: 10,
              lineHeight: 1.25,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* ── JOIN DUO BUTTON ── */}
        <div
          style={{
            position: 'absolute',
            top: `${joinBtnTop}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '340px',
            zIndex: 10,
          }}
        >
          <PillButton
            onClick={handleJoin}
            disabled={rawCode.length < 6 || isJoining}
            variant="black"
          >
            <span style={{ fontSize: '18px', fontWeight: 800 }}>
              {isJoining ? 'Joining...' : 'Join duo'}
            </span>
          </PillButton>
        </div>

        {/* ── DON'T HAVE A CODE? CREATE DUO ── */}
        <div
          style={{
            position: 'absolute',
            top: `${dontHaveCodeTop}px`,
            left: 0,
            width: '390px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#656972',
            zIndex: 10,
          }}
        >
          <span>Don’t have a code?</span>
          <button
            type="button"
            onClick={onCreateDuo}
            className="cursor-pointer text-[#1A1C22] font-black underline underline-offset-2 hover:opacity-80 transition-opacity bg-transparent border-none p-0 focus:outline-none"
          >
            Create Duo
          </button>
        </div>
      </div>
    </div>
  );
};
