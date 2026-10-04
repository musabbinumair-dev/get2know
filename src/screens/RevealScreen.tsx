import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavTab } from '../components/BottomNav';
import { QuestionData } from '../data/gameData';
import { useGameSession } from '../services/gameSessionContext';
import { useSession } from '../services/sessionContext';
import { TriviaQuestion } from '../data/gameQuestions';
import { GameHeader } from '../components/GameHeader';

export interface RevealScreenProps {
  player1Name?: string;
  player1AvatarId?: number;
  player1Color?: string;
  player2Name?: string;
  player2AvatarId?: number;
  player2Color?: string;
  questionData?: QuestionData;
  player1Answer?: string;
  player2Answer?: string;
  syncScore?: number;
  isMatched?: boolean;
  selectedReaction?: string | null;
  onSelectReaction?: (reactionId: string) => void;
  onSaveToMemoryWall?: () => void;
  onNextQuestion?: () => void;
  onBack?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onOpenSettings?: () => void;
}

const DATE_DAYS = [
  { key: 'mon', day: 'MON', num: '12' },
  { key: 'tue', day: 'TUE', num: '13' },
  { key: 'wed', day: 'WED', num: '14' },
  { key: 'thu', day: 'THU', num: '15' },
  { key: 'fri', day: 'FRI', num: '16' },
  { key: 'sat', day: 'SAT', num: '17' },
  { key: 'sun', day: 'SUN', num: '18', isActive: true },
];

const REACTION_EMOJIS = [
  { id: 'smile', file: '/assets/reveal/emoji-smile.webp', alt: 'Smile' },
  { id: 'heart', file: '/assets/reveal/emoji-heart.webp', alt: 'Heart' },
  { id: 'laugh', file: '/assets/reveal/emoji-laugh.webp', alt: 'Laugh' },
  { id: 'surprised', file: '/assets/reveal/emoji-surprised.webp', alt: 'Surprised' },
  { id: 'smirk', file: '/assets/reveal/emoji-smirk.webp', alt: 'Smirk' },
  { id: 'cry', file: '/assets/reveal/emoji-cry.webp', alt: 'Cry' },
];

export const RevealScreen: React.FC<RevealScreenProps> = ({
  player1Name = 'Player 1',
  player1AvatarId: _p1AvatarId = 1,
  player2Name = 'Player 2',
  player2AvatarId: _p2AvatarId = 2,
  questionData,
  player1Answer = 'Anchovies on pizza.',
  player2Answer = 'Anchovies on pizza.',
  syncScore = 74,
  isMatched,
  selectedReaction: controlledReaction,
  onSelectReaction,
  onSaveToMemoryWall,
  onNextQuestion,
  onBack: _onBack,
  onOpenSettings,
}) => {
  const navigate = useNavigate();
  const session = useSession();
  const gameSession = useGameSession();
  const isInGame = gameSession.isActive;

  // Sync background color to pastel pink and ensure scrolling
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.backgroundColor = '#F5CCE2';
    document.documentElement.style.backgroundColor = '#F5CCE2';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const [internalReaction, setInternalReaction] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reveal_selected_reaction');
    }
    return null;
  });
  const [bouncingEmojiId, setBouncingEmojiId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Inspect full answer modal
  const [inspectingPlayer, setInspectingPlayer] = useState<{
    name: string;
    avatarSrc: string;
    answer: string;
    blobBg: string;
  } | null>(null);

  const activeReaction =
    controlledReaction !== undefined ? controlledReaction : internalReaction;

  const rawQuestion = isInGame
    ? gameSession.currentQuestion.question
    : questionData?.question || "What’s the worst food you’ve ever tried?";

  const questionLines = isInGame
    ? (gameSession.currentQuestion.questionLines || [gameSession.currentQuestion.question])
    : (questionData?.questionLines || [
        "What’s the worst",
        "food you’ve ever",
        "tried?",
      ]);

  // Dynamic values based on game session
  const isTriviaRound = isInGame && gameSession.currentRoundType === 'trivia';
  const isKnowMeRound = isInGame && gameSession.currentRoundType === 'know-me';

  // Username: strictly show user's username below avatar instead of "Your Pick"
  const currentUsername =
    session.profile?.name ||
    session.user?.displayName ||
    (player1Name && player1Name !== 'Player 1' && player1Name !== 'Your Pick' ? player1Name : '') ||
    (typeof window !== 'undefined'
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem('gty_profile') || '{}').name;
          } catch {
            return null;
          }
        })()
      : null) ||
    'Player 1';

  const p1LabelText = currentUsername;

  const partnerUsername =
    player2Name && player2Name !== 'Player 2'
      ? player2Name
      : (typeof window !== 'undefined'
          ? (() => {
              try {
                return JSON.parse(localStorage.getItem('partner_profile') || '{}').name;
              } catch {
                return null;
              }
            })()
          : null) || 'Alex';

  const p2LabelText = isTriviaRound ? 'Correct Answer' : partnerUsername;

  const p1AvatarSrc = session.profile?.avatarId
    ? `/assets/avatars/avatar-${session.profile.avatarId}.png`
    : _p1AvatarId
    ? `/assets/avatars/avatar-${_p1AvatarId}.png`
    : '/assets/avatars/avatar-1.png';

  const p2AvatarSrc = _p2AvatarId
    ? `/assets/avatars/avatar-${_p2AvatarId}.png`
    : '/assets/avatars/avatar-2.png';

  const resolvedP1Answer = isTriviaRound
    ? gameSession.myGuess || 'Anchovies on pizza.'
    : isInGame
    ? gameSession.myAnswer || player1Answer
    : player1Answer;

  const resolvedP2Answer = isTriviaRound
    ? (gameSession.currentQuestion as TriviaQuestion)?.options?.find(
        (o) => o.id === (gameSession.currentQuestion as TriviaQuestion).correctOptionId
      )?.text || 'Anchovies on pizza.'
    : isInGame
    ? gameSession.friendAnswer || player2Answer
    : player2Answer;

  const isSuccess = isTriviaRound
    ? gameSession.isCorrect
    : isKnowMeRound
    ? gameSession.isMatched
    : isMatched !== undefined
    ? isMatched
    : resolvedP1Answer.trim().toLowerCase() === resolvedP2Answer.trim().toLowerCase();

  const handleEmojiClick = (emojiId: string) => {
    setInternalReaction(emojiId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reveal_selected_reaction', emojiId);
    }
    onSelectReaction?.(emojiId);
    setBouncingEmojiId(emojiId);
    setTimeout(() => {
      setBouncingEmojiId((prev) => (prev === emojiId ? null : prev));
    }, 280);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reveal_saved_to_memory_wall', 'true');
    }
    onSaveToMemoryWall?.();
    setToastMessage('Saved to Memory Wall! ✨');
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const handleNextClick = () => {
    if (isInGame) {
      gameSession.nextRound();
    } else if (onNextQuestion) {
      onNextQuestion();
    }
  };

  return (
    <div
      id="reveal-scroll-viewport"
      className="fixed inset-0 w-full h-full bg-[#F5CCE2] overflow-y-auto overflow-x-hidden flex justify-center items-start select-none font-['Nunito',sans-serif] z-40"
      style={{
        backgroundColor: '#F5CCE2',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1B1D20] text-white px-5 py-2.5 rounded-full font-black text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Full-Width Content Container starting cleanly from the top */}
      <div className="w-full max-w-[390px] flex flex-col px-5 pt-4 pb-14 relative min-h-max">
        {/* =========================================================================
            1. TOP BAR: Exact Same Unified GameHeader (Rounds pill in center, Settings icon on right, no back button)
           ========================================================================= */}
        <GameHeader
          showLogo={true}
          roundPillPosition="center"
          currentRound={isInGame ? gameSession.currentRound : 1}
          totalRounds={isInGame ? gameSession.totalRounds : 10}
          showTimer={false}
          showBack={false}
          showSettings={true}
          onOpenSettings={onOpenSettings || (() => navigate('/profile'))}
          className="-mx-5 mb-4"
        />

        {/* =========================================================================
            2. 7-DAY CALENDAR ROW (MON 12 - SUN 18)
           ========================================================================= */}
        <div className="w-full flex items-center justify-between mb-6 px-1">
          {DATE_DAYS.map((day) => {
            if (day.isActive) {
              return (
                <div
                  key={day.key}
                  className="w-[43px] h-[43px] rounded-full bg-[#1B1D20] text-white flex flex-col items-center justify-center shadow-md select-none -my-1"
                >
                  <span className="text-[10px] font-bold text-white/85 tracking-wider leading-none">
                    {day.day}
                  </span>
                  <span className="text-[17px] font-black text-white leading-none mt-[2px]">
                    {day.num}
                  </span>
                </div>
              );
            }
            return (
              <div
                key={day.key}
                className="flex flex-col items-center justify-center w-[36px] select-none text-center"
              >
                <span className="text-[10.5px] font-bold text-[#1B1D20]/45 tracking-wider leading-none">
                  {day.day}
                </span>
                <span className="text-[16.5px] font-extrabold text-[#1B1D20]/75 leading-none mt-[3px]">
                  {day.num}
                </span>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. QUESTION HEADLINE (Responsive typography preventing overflow onto cards/decorations)
           ========================================================================= */}
        <div className="mb-6 px-1 select-none">
          {(() => {
            const qLen = rawQuestion.length;
            const revealHeadingClass =
              qLen > 75
                ? 'text-[20px] sm:text-[23px] leading-[1.2]'
                : qLen > 48
                ? 'text-[24px] sm:text-[28px] leading-[1.15]'
                : 'text-[30px] sm:text-[34px] leading-[1.1]';

            if (qLen <= 48 && questionLines && questionLines.length > 1) {
              return (
                <h2 className={`font-black ${revealHeadingClass} text-[#1B1D20] tracking-[-0.03em] m-0 break-words`}>
                  {questionLines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < questionLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h2>
              );
            }

            return (
              <h2 className={`font-black ${revealHeadingClass} text-[#1B1D20] tracking-[-0.03em] m-0 break-words`}>
                {rawQuestion}
              </h2>
            );
          })()}
        </div>

        {/* =========================================================================
            4. PLAYER ANSWER BLOBS & MATCH STARBURST
           ========================================================================= */}
        <div className="relative w-full flex items-center justify-between mb-8 select-none">
          {/* Left Card: Pink Organic Blob */}
          <div
            onClick={() =>
              setInspectingPlayer({
                name: p1LabelText,
                avatarSrc: p1AvatarSrc,
                answer: resolvedP1Answer,
                blobBg: '#FCA0D1',
              })
            }
            className="relative w-[48%] max-w-[172px] aspect-[456/468] flex flex-col items-center justify-center p-3 cursor-pointer active:scale-[0.98] transition-transform z-10"
            title="Click to view full answer"
          >
            {/* Pink Blob Image as Background */}
            <img
              src="/assets/reveal/card-blob-pink.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              draggable={false}
            />

            {/* Inner Content Centered Inside Blob */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1 pt-1 pb-1">
              {/* Avatar (Personalized Avatar for Player) */}
              <img
                src={p1AvatarSrc}
                alt={p1LabelText}
                className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] object-contain mb-1 flex-shrink-0"
                draggable={false}
              />
              {/* Username strictly below avatar instead of "Your Pick" */}
              <span className="text-[11.5px] font-bold text-[#1B1D20]/60 tracking-tight leading-none mb-1 flex-shrink-0 max-w-[124px] truncate">
                {p1LabelText}
              </span>
              {/* Answer */}
              <p className="font-black text-[15px] sm:text-[16.5px] leading-[1.12] text-[#1B1D20] tracking-tight m-0 line-clamp-2 break-words max-w-[128px]">
                {resolvedP1Answer}
              </p>
            </div>
          </div>

          {/* Center Intersecting Badge: Points Blob (Solid Yellow if correct, Solid Black if incorrect) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92px] h-[94px] z-20 pointer-events-none select-none flex items-center justify-center filter drop-shadow-md">
            {/* Starburst Image: Yellow when correct, Solid Black when incorrect */}
            <img
              src={
                isSuccess
                  ? '/assets/reveal/match-starburst.webp'
                  : '/assets/reveal/match-starburst-black.webp'
              }
              alt={isSuccess ? 'Matched Starburst' : 'Not Matched Starburst'}
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            {/* Starburst Text: Dark text on Yellow, White text on Black */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center pt-1 ${
                isSuccess ? 'text-[#1B1D20]' : 'text-white'
              }`}
            >
              <span className="text-[11.5px] font-black leading-[1.05] tracking-tight">
                {isSuccess ? (isTriviaRound ? 'Correct!' : 'You') : isTriviaRound ? 'Not' : 'No'}
              </span>
              <span className="text-[11.5px] font-black leading-[1.05] tracking-tight">
                {isSuccess ? (isTriviaRound ? 'answer' : 'matched!') : isTriviaRound ? 'quite!' : 'match!'}
              </span>
              <span
                className={`text-[15px] font-black leading-none mt-0.5 ${
                  isSuccess ? 'text-[#1B1D20]' : 'text-white'
                }`}
              >
                {isSuccess ? `+${isKnowMeRound ? 15 : 10}` : '+0'}
              </span>
            </div>
          </div>

          {/* Right Card: Blue Organic Blob */}
          <div
            onClick={() =>
              setInspectingPlayer({
                name: p2LabelText,
                avatarSrc: p2AvatarSrc,
                answer: resolvedP2Answer,
                blobBg: '#8EAFFD',
              })
            }
            className="relative w-[48%] max-w-[172px] aspect-[456/468] flex flex-col items-center justify-center p-3 cursor-pointer active:scale-[0.98] transition-transform z-10"
            title="Click to view full answer"
          >
            {/* Blue Blob Image as Background */}
            <img
              src="/assets/reveal/card-blob-blue.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              draggable={false}
            />

            {/* Inner Content Centered Inside Blob */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full pointer-events-none px-1 pt-1 pb-1">
              {/* Avatar (Partner/Opponent) */}
              <img
                src={p2AvatarSrc}
                alt={p2LabelText}
                className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] object-contain mb-1 flex-shrink-0"
                draggable={false}
              />
              {/* Label */}
              <span className="text-[11.5px] font-bold text-[#1B1D20]/60 tracking-tight leading-none mb-1 flex-shrink-0 max-w-[124px] truncate">
                {p2LabelText}
              </span>
              {/* Answer */}
              <p className="font-black text-[15px] sm:text-[16.5px] leading-[1.12] text-[#1B1D20] tracking-tight m-0 line-clamp-2 break-words max-w-[128px]">
                {resolvedP2Answer}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. MIDDLE SYNC SCORE SECTION & 4 ORBITING DECORATIONS
           ========================================================================= */}
        <div className="relative w-full flex flex-col items-center mb-7 py-2">
          {/* Label "Sync score" */}
          <span className="text-[14px] font-bold text-[#1B1D20]/60 tracking-tight mb-0.5">
            Sync score
          </span>

          {/* Giant Number "74%" */}
          <span className="font-black text-[74px] sm:text-[78px] leading-none text-[#1B1D20] tracking-[-0.04em] my-1">
            {syncScore}%
          </span>

          {/* 1. Yellow Crescent Moon (Top-Left of 74%) */}
          <img
            src="/assets/reveal/crescent-yellow.webp"
            alt=""
            className="absolute left-[12%] sm:left-[14%] top-[12px] w-[42px] h-[46px] object-contain pointer-events-none select-none z-10"
            draggable={false}
          />

          {/* 2. Soft Pink Heart (Bottom-Left of 74%) */}
          <img
            src="/assets/reveal/heart-pink-small.webp"
            alt=""
            className="absolute left-[8%] sm:left-[10%] bottom-[20px] w-[38px] h-[35px] object-contain pointer-events-none select-none z-10"
            draggable={false}
          />

          {/* 3. Soft Blue Starburst (Top-Right of 74%) */}
          <img
            src="/assets/reveal/starburst-blue.webp"
            alt=""
            className="absolute right-[12%] sm:right-[14%] top-[8px] w-[46px] h-[50px] object-contain pointer-events-none select-none z-10"
            draggable={false}
          />

          {/* 4. Olive Green Cross (Bottom-Right of 74%) */}
          <img
            src="/assets/reveal/cross-olive.webp"
            alt=""
            className="absolute right-[10%] sm:right-[12%] bottom-[16px] w-[40px] h-[42px] object-contain pointer-events-none select-none z-10"
            draggable={false}
          />

          {/* Caption "you know each other better today" */}
          <p className="text-[14px] sm:text-[14.5px] font-bold text-[#1B1D20]/70 tracking-tight m-0 mt-1">
            you know each other better today
          </p>
        </div>

        {/* =========================================================================
            6. REACTION EMOJIS ROW (6 Dashed Circles)
           ========================================================================= */}
        <div className="w-full flex items-center justify-between mb-7 px-1">
          {REACTION_EMOJIS.map((emoji) => {
            const isSelected = activeReaction === emoji.id;
            const isBouncing = bouncingEmojiId === emoji.id;

            return (
              <button
                key={emoji.id}
                type="button"
                onClick={() => handleEmojiClick(emoji.id)}
                aria-label={emoji.alt}
                aria-pressed={isSelected}
                className={`w-[44px] h-[44px] rounded-full border-[1.5px] border-dashed flex items-center justify-center cursor-pointer transition-all focus:outline-none p-0 bg-transparent ${
                  isSelected
                    ? 'border-[#1B1D20] bg-white/40 scale-105'
                    : 'border-[#1B1D20]/45 hover:border-[#1B1D20]/75 active:scale-95'
                } ${isBouncing ? 'animate-avatar-bounce' : ''}`}
              >
                <img
                  src={emoji.file}
                  alt={emoji.alt}
                  className="w-[25px] h-[25px] object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            7. ACTION BUTTONS: "Save to memory wall" & "Next question tomorrow"
           ========================================================================= */}
        <div className="w-full flex flex-col gap-3 mb-6 relative z-10">
          {/* Button 1: Save to Memory Wall */}
          <button
            type="button"
            onClick={handleSave}
            className="btn-press w-full h-[48px] sm:h-[50px] rounded-full bg-[#1B1D20] hover:bg-[#282B30] text-white font-extrabold text-[16.5px] tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-md focus:outline-none active:scale-[0.98] transition-transform"
          >
            {/* Bookmark Ribbon Icon */}
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Save to memory wall</span>
          </button>

          {/* Button 2: Next Question Tomorrow / Next Round */}
          <button
            type="button"
            onClick={handleNextClick}
            className="btn-press w-full h-[48px] sm:h-[50px] rounded-full bg-[#D5C7D7] hover:bg-[#C9B9CB] text-[#7A7380] font-extrabold text-[16px] tracking-tight flex items-center justify-center cursor-pointer focus:outline-none active:scale-[0.98] transition-transform"
          >
            <span>
              {isInGame
                ? gameSession.currentRound < gameSession.totalRounds
                  ? `Next question (${gameSession.currentRound + 1}/${gameSession.totalRounds}) ➔`
                  : 'See final results 🏆 ➔'
                : 'Next question tomorrow'}
            </span>
          </button>
        </div>

        {/* =========================================================================
            8. BOTTOM CORNER DECORATIONS (Peeking at the bottom corners)
           ========================================================================= */}
        {/* Bottom-Left Yellow Star */}
        <img
          src="/assets/reveal/deco-bottom-left.webp"
          alt=""
          className="absolute -left-[10px] bottom-[10px] w-[54px] h-[50px] object-contain pointer-events-none select-none z-0"
          draggable={false}
        />

        {/* Bottom-Right Pink Heart / Blob */}
        <img
          src="/assets/reveal/deco-bottom-right.webp"
          alt=""
          className="absolute -right-[8px] bottom-[8px] w-[50px] h-[48px] object-contain pointer-events-none select-none z-0"
          draggable={false}
        />
      </div>

      {/* =========================================================================
          FULL ANSWER INSPECTION MODAL (When clicking on blob answer)
         ========================================================================= */}
      {inspectingPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1D20]/60 backdrop-blur-xs select-auto"
          onClick={() => setInspectingPlayer(null)}
        >
          <div
            className="relative w-full max-w-[320px] bg-[#FAF6EB] rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center animate-pop border-2 border-[#1B1D20]/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Avatar on Color Blob */}
            <div
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center mb-3 shadow-inner"
              style={{ backgroundColor: inspectingPlayer.blobBg }}
            >
              <img
                src={inspectingPlayer.avatarSrc}
                alt={inspectingPlayer.name}
                className="w-[54px] h-[54px] object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>

            <span className="text-[13px] font-bold text-[#1B1D20]/60 uppercase tracking-wider">
              {inspectingPlayer.name}’s answer
            </span>

            <h3 className="mt-2 text-[20px] sm:text-[22px] font-black text-[#1B1D20] leading-snug tracking-tight break-words max-h-[220px] overflow-y-auto px-1">
              “{inspectingPlayer.answer}”
            </h3>

            <button
              type="button"
              onClick={() => setInspectingPlayer(null)}
              className="mt-5 w-full h-[46px] rounded-full bg-[#1B1D20] hover:bg-[#2A2D32] text-white font-bold text-[16px] tracking-tight cursor-pointer btn-press"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
