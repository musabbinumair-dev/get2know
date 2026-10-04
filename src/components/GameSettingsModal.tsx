import React, { useState, useRef, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { GameSettingsState } from '../screens/LobbyScreen';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettingsState;
  onUpdateSettings: (newSettings: GameSettingsState) => void;
}

// Exact category emoji webps used in GameSettings page
const CATEGORY_ITEMS = [
  { name: 'Food', icon: '/game-settings-decorations/emoji-pizza.webp' },
  { name: 'Movies', icon: '/game-settings-decorations/emoji-clapper.webp' },
  { name: 'Music', icon: '/game-settings-decorations/emoji-music.webp' },
  { name: 'Travel', icon: '/game-settings-decorations/emoji-plane.webp' },
  { name: 'Science', icon: '/game-settings-decorations/emoji-flask.webp' },
  { name: 'Funny', icon: '/game-settings-decorations/emoji-funny.webp' },
  { name: 'Deep', icon: '/game-settings-decorations/emoji-cloud.webp' },
  { name: 'Dreams', icon: '/game-settings-decorations/emoji-moon.webp' },
  { name: 'Fears', icon: '/game-settings-decorations/emoji-fears.webp' },
  { name: 'Random', icon: '/game-settings-decorations/emoji-dice-outline.webp' },
];

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Swipe-down to dismiss state (identical to ReminderTimeModal & LeaveDuoModal)
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);

  // Reset closing state when reopened
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setDragY(0);
      setIsDragging(false);
      triggerHaptic(12);
    }
  }, [isOpen]);

  // Smooth Closing Trigger (identical to ReminderTimeModal & LeaveDuoModal)
  const handleClose = useCallback(() => {
    triggerHaptic(10);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setDragY(0);
    }, 240);
  }, [onClose]);

  // Swipe / Drag Handlers (identical to ReminderTimeModal & LeaveDuoModal)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-scrollbar') || target.closest('[role="button"]')) return;
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
    if (target.closest('button') || target.closest('.no-scrollbar') || target.closest('[role="button"]')) return;
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

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Toggle Category selection
  const handleToggleCategory = (categoryName: string) => {
    triggerHaptic(10);
    const currentCategories = settings.categories || [];
    let updated: string[];

    if (currentCategories.includes(categoryName)) {
      if (currentCategories.length <= 1) return;
      updated = currentCategories.filter((c) => c !== categoryName);
    } else {
      updated = [...currentCategories, categoryName];
    }

    const newSettings: GameSettingsState = {
      ...settings,
      categories: updated,
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Mode cycling: Trivia -> Know me -> Mixed -> Trivia
  const handleCycleMode = () => {
    triggerHaptic(12);
    const modes: Array<'know-me' | 'trivia' | 'mixed'> = ['trivia', 'know-me', 'mixed'];
    const nextIdx = (modes.indexOf(settings.mode) + 1) % modes.length;
    const newSettings: GameSettingsState = {
      ...settings,
      mode: modes[nextIdx],
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Difficulty cycling: Easy -> Medium -> Hard -> Easy
  const handleCycleDifficulty = () => {
    triggerHaptic(12);
    const diffs: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];
    const nextIdx = (diffs.indexOf(settings.difficulty) + 1) % diffs.length;
    const newSettings: GameSettingsState = {
      ...settings,
      difficulty: diffs[nextIdx],
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Timer cycling: 10s -> 20s -> 30s -> Off -> 10s
  const handleCycleTimer = () => {
    triggerHaptic(12);
    const timers: Array<'10s' | '20s' | '30s' | 'Off'> = ['10s', '20s', '30s', 'Off'];
    const nextIdx = (timers.indexOf(settings.timer) + 1) % timers.length;
    const newSettings: GameSettingsState = {
      ...settings,
      timer: timers[nextIdx],
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Rounds cycling: 5 -> 10 -> 15 -> 5
  const handleCycleRounds = () => {
    triggerHaptic(12);
    const roundsList: Array<5 | 10 | 15> = [5, 10, 15];
    const nextIdx = (roundsList.indexOf(settings.rounds) + 1) % roundsList.length;
    const newSettings: GameSettingsState = {
      ...settings,
      rounds: roundsList[nextIdx],
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Speed Bonus toggle
  const handleToggleSpeedBonus = () => {
    triggerHaptic(10);
    const newSettings: GameSettingsState = {
      ...settings,
      speedBonus: !settings.speedBonus,
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Sound Effects toggle
  const handleToggleSoundEffects = () => {
    triggerHaptic(10);
    const newSettings: GameSettingsState = {
      ...settings,
      soundEffects: !settings.soundEffects,
    };
    onUpdateSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_game_settings', JSON.stringify(newSettings));
    }
  };

  // Mode display text & icon
  const getModeInfo = () => {
    if (settings.mode === 'trivia') {
      return {
        label: 'Trivia',
        icon: '/assets/lobby/emoji-brain.webp',
      };
    }
    if (settings.mode === 'know-me') {
      return {
        label: 'Know me',
        icon: '/game-settings-decorations/icon-wink.webp',
      };
    }
    return {
      label: 'Mixed',
      icon: '/game-settings-decorations/icon-dice-color.webp',
    };
  };

  const modeInfo = getModeInfo();
  const speedBonusActive = settings.speedBonus ?? true;
  const soundEffectsActive = settings.soundEffects ?? true;

  // Filter only categories selected by the host
  const selectedCategories = CATEGORY_ITEMS.filter((item) =>
    settings.categories?.some(
      (c) => c.toLowerCase() === item.name.toLowerCase()
    )
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game settings"
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
        className={`relative bg-[#FAF6EB] rounded-t-[36px] pt-3 pb-6 px-6 w-full max-w-none sm:max-w-[430px] mx-auto shadow-2xl select-none font-['Nunito',sans-serif] overflow-hidden max-h-[92vh] flex flex-col ${
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
          className="w-full py-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="w-[44px] h-[4.5px] rounded-full bg-[#17181B]/25 hover:bg-[#17181B]/40 transition-colors" />
        </div>

        {/* ── TITLE & SUBTITLE ── */}
        <h2 className="font-black text-[30px] text-[#17181B] tracking-tight text-center leading-tight mt-1">
          Game settings
        </h2>
        <p className="mt-1 text-[15px] font-bold text-[#17181B]/50 text-center">
          You&apos;re the host.
        </p>

        {/* ── SCROLLABLE SECTIONS BODY ── */}
        <div className="px-1 pb-4 pt-3 overflow-y-auto no-scrollbar flex flex-col gap-4">
          {/* 1. MODE SECTION (Only show selected mode) */}
          {settings.mode && (
            <div>
              <h3 className="font-['Nunito',sans-serif] font-black text-[#17181B] text-[17px] mb-2 leading-none">
                Mode
              </h3>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleCycleMode}
                  className="h-[36px] px-4 rounded-full bg-[#17181B] text-white flex items-center gap-2 font-['Nunito',sans-serif] font-extrabold text-[14px] shadow-xs active:scale-95 transition-transform cursor-pointer"
                  title="Tap to cycle game mode"
                >
                  <img
                    src={modeInfo.icon}
                    alt=""
                    className="w-[19px] h-[19px] object-contain shrink-0"
                    draggable={false}
                  />
                  <span>{modeInfo.label}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. CATEGORIES SECTION (Only show categories selected by the host) */}
          {selectedCategories.length > 0 && (
            <div>
              <h3 className="font-['Nunito',sans-serif] font-black text-[#17181B] text-[17px] mb-2.5 leading-none">
                Categories
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                {selectedCategories.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleToggleCategory(item.name)}
                    className="h-[36px] px-3.5 rounded-full flex items-center gap-1.5 font-['Nunito',sans-serif] font-extrabold text-[13.5px] bg-[#17181B] text-white shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
                    title={`Selected category: ${item.name}`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className="w-[19px] h-[19px] object-contain shrink-0"
                      draggable={false}
                    />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. DIFFICULTY SECTION (Only show selected difficulty) */}
          {settings.difficulty && (
            <div>
              <h3 className="font-['Nunito',sans-serif] font-black text-[#17181B] text-[17px] mb-2 leading-none">
                Difficulty
              </h3>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleCycleDifficulty}
                  className="h-[36px] px-5 rounded-full bg-[#17181B] text-white font-['Nunito',sans-serif] font-extrabold text-[14px] shadow-xs active:scale-95 transition-transform cursor-pointer"
                  title="Tap to cycle difficulty"
                >
                  {settings.difficulty}
                </button>
              </div>
            </div>
          )}

          {/* 4. TIMER SECTION (Only show selected timer if set) */}
          {settings.timer && settings.timer !== 'Off' && (
            <div>
              <h3 className="font-['Nunito',sans-serif] font-black text-[#17181B] text-[17px] mb-2 leading-none">
                Timer
              </h3>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleCycleTimer}
                  className="h-[36px] px-5 rounded-full bg-[#17181B] text-white font-['Nunito',sans-serif] font-extrabold text-[14px] shadow-xs active:scale-95 transition-transform cursor-pointer"
                  title="Tap to cycle timer"
                >
                  {settings.timer}
                </button>
              </div>
            </div>
          )}

          {/* 5. ROUNDS SECTION (Only show selected rounds) */}
          {settings.rounds && (
            <div>
              <h3 className="font-['Nunito',sans-serif] font-black text-[#17181B] text-[17px] mb-2 leading-none">
                Rounds
              </h3>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleCycleRounds}
                  className="h-[36px] px-5 rounded-full bg-[#17181B] text-white font-['Nunito',sans-serif] font-extrabold text-[14px] shadow-xs active:scale-95 transition-transform cursor-pointer"
                  title="Tap to cycle rounds"
                >
                  {settings.rounds} rounds
                </button>
              </div>
            </div>
          )}

          {/* 6. EXTRAS SECTION (Only show extras that are selected/enabled by host) */}
          {(speedBonusActive || soundEffectsActive) && (
            <div>
              <h3 className="font-['Nunito',sans-serif] font-black text-[#17181B] text-[17px] mb-2 leading-none">
                Extras
              </h3>
              <div className="flex flex-wrap gap-2.5 items-center">
                {/* Speed Bonus Pill - only if selected */}
                {speedBonusActive && (
                  <button
                    type="button"
                    onClick={handleToggleSpeedBonus}
                    className="h-[36px] px-4 rounded-full flex items-center gap-2 font-['Nunito',sans-serif] font-extrabold text-[13.5px] bg-[#17181B] text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
                  >
                    {/* Yellow Lightning Bolt */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="#FFC72C"
                      className="shrink-0"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <span>Speed bonus</span>
                  </button>
                )}

                {/* Sound Effects Pill - only if selected */}
                {soundEffectsActive && (
                  <button
                    type="button"
                    onClick={handleToggleSoundEffects}
                    className="h-[36px] px-4 rounded-full flex items-center gap-2 font-['Nunito',sans-serif] font-extrabold text-[13.5px] bg-[#17181B] text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
                  >
                    {/* Cyan Speaker with Waves */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <polygon
                        points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                        fill="#38BDF8"
                      />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    <span>Sound effects</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 7. FULL-WIDTH DONE BUTTON */}
          <div className="pt-3 pb-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-[52px] rounded-full bg-[#17181B] text-white font-['Nunito',sans-serif] font-black text-[18px] hover:bg-[#25272c] active:scale-[0.98] transition-all cursor-pointer focus:outline-none shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
