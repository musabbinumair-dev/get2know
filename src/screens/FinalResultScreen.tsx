import React, { useState, useMemo } from 'react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { useGameSession } from '../services/gameSessionContext';
import { useSession } from '../services/sessionContext';
import { getAvatarFromProfile } from './CountdownScreen';
import { addRoomMemory, MemoryEntry } from '../services/roomService';

export const FinalResultScreen: React.FC = () => {
  const {
    myScore,
    friendScore,
    totalRounds,
    matchesCount,
    history,
    rematchVotes,
    restartGame,
    exitGame,
  } = useGameSession();

  const { profile, partnerProfile, user, room, roomCode } = useSession();
  const [toastMessage, setToastMessage] = useState<string>('');

  const partnerUid = useMemo(() => {
    return room?.playerUids?.find((id) => id !== user?.uid);
  }, [room?.playerUids, user?.uid]);

  const hasIVoted = Boolean(user && rematchVotes?.[user.uid]);
  const hasFriendVoted = Boolean(partnerUid && rematchVotes?.[partnerUid]);

  // Get player profiles
  const myName = profile?.name?.trim() || 'You';
  const myAvatarId = profile?.avatarId ?? 1;
  const myColor = profile?.color || 'salmon';

  const friendData = partnerProfile || {
    name: 'Your friend',
    avatarId: 2,
    color: 'teal',
  };

  const myAvatar = getAvatarFromProfile(myAvatarId, myColor);
  const friendAvatar = getAvatarFromProfile(friendData.avatarId, friendData.color);

  // Winner logic
  const isTie = myScore === friendScore;
  const isMeWinner = myScore > friendScore;
  const winnerName = isTie ? null : isMeWinner ? myName : friendData.name;

  // Calculate sync %
  const syncPercentage = Math.round(
    Math.min(100, Math.max(50, ((matchesCount * 2 + (myScore > 0 ? 3 : 0)) / (totalRounds * 2)) * 100))
  );

  const handleSaveHighlights = async () => {
    const memoryItem: MemoryEntry = {
      id: `hl-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      category: 'Game Highlights',
      color: 'yellow',
      cardBg: '#FAF3DF',
      question: `Completed ${totalRounds} rounds of Duo Play!`,
      p1Answer: `${myScore} pts`,
      p2Answer: `${friendScore} pts`,
      p1Name: myName,
      p2Name: friendData.name,
      p1AvatarId: myAvatarId,
      p2AvatarId: friendData.avatarId,
      p1Color: myColor,
      p2Color: friendData.color,
      isMatched: isTie || isMeWinner,
      createdAt: new Date().toISOString(),
    };

    if (roomCode) {
      await addRoomMemory(roomCode, memoryItem);
    }

    if (typeof window !== 'undefined') {
      try {
        const savedCards = localStorage.getItem('game_memory_cards');
        const cards = savedCards ? JSON.parse(savedCards) : [];
        localStorage.setItem('game_memory_cards', JSON.stringify([memoryItem, ...cards]));
      } catch {}
    }

    setToastMessage('Highlights saved to Memory Wall! ✨');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <Screen bg="#FEE273" className="h-full min-h-[100dvh]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-pop pointer-events-none">
          <div className="bg-[#1C1F23] text-white px-5 py-2.5 rounded-full font-extrabold text-[14px] shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Decorative background stamps */}
      <img
        src="/countdown/deco-crescent-yellow-top-left-cropped.webp"
        alt=""
        className="absolute top-0 left-0 w-[55px] h-[72px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/countdown/deco-heart-pink-top-right-cropped.webp"
        alt=""
        className="absolute top-2 right-0 w-[55px] h-[60px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/countdown/deco-star-blue-bottom-left-cropped.webp"
        alt=""
        className="absolute bottom-0 left-0 w-[65px] h-[75px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />
      <img
        src="/countdown/deco-cross-olive-bottom-right.webp"
        alt=""
        className="absolute bottom-1 right-2 w-[55px] h-[60px] object-contain pointer-events-none select-none z-0"
        draggable={false}
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col justify-between h-full max-w-[390px] mx-auto px-6 py-6 select-none overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {/* Header Pill */}
        <div className="flex items-center justify-center pt-2">
          <div className="h-[32px] px-4 rounded-full bg-[#1B1D20] text-white flex items-center justify-center gap-1.5 shadow-sm font-['Nunito',sans-serif]">
            <span className="text-[12px] font-bold text-white/70 uppercase tracking-widest">
              Game Over
            </span>
            <span className="text-[14px] font-black text-white">· {totalRounds} Rounds</span>
          </div>
        </div>

        {/* Winner Hero Announcement */}
        <div className="flex flex-col items-center text-center my-3">
          <div className="relative mb-1">
            <img
              src="/countdown/badge-vs-starburst-yellow.webp"
              alt=""
              className="w-[84px] h-[80px] object-contain pointer-events-none select-none"
              draggable={false}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[34px]">
              🏆
            </span>
          </div>

          <h1 className="text-[34px] font-black text-[#1B1D20] leading-none tracking-tight font-['Nunito',sans-serif]">
            {isTie ? "It's a Tie!" : `${winnerName} Wins!`}
          </h1>

          <p className="text-[15px] font-bold text-[#1B1D20]/70 mt-1 font-['Nunito',sans-serif]">
            {isTie
              ? 'Incredible harmony! You two scored equally!'
              : `${winnerName} took the lead this match!`}
          </p>
        </div>

        {/* Scoreboard Cards */}
        <div className="grid grid-cols-2 gap-3.5 my-2">
          {/* Player ME Card */}
          <div
            className={`p-3.5 rounded-2xl flex flex-col items-center text-center relative border-[2.5px] ${
              isMeWinner
                ? 'bg-white border-[#1B1D20] shadow-md'
                : 'bg-white/80 border-[#1B1D20]/30 shadow-sm'
            }`}
          >
            {isMeWinner && (
              <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#1B1D20] text-[#FDE776] text-[10px] font-black uppercase tracking-wider">
                Winner
              </div>
            )}
            <div className="w-[72px] h-[72px] relative mb-1.5">
              <img
                src={myAvatar.blob}
                alt=""
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
              <img
                src={myAvatar.face}
                alt=""
                className="absolute inset-0 m-auto w-[74%] h-[74%] object-contain pointer-events-none"
                draggable={false}
              />
            </div>
            <span className="text-[16px] font-black text-[#1B1D20] font-['Nunito',sans-serif] truncate max-w-[120px]">
              {myName}
            </span>
            <div className="text-[32px] font-black text-[#1B1D20] leading-none mt-1 font-['Nunito',sans-serif]">
              {myScore}
              <span className="text-[13px] font-bold text-[#1B1D20]/60 ml-0.5">pts</span>
            </div>
          </div>

          {/* Player FRIEND Card */}
          <div
            className={`p-3.5 rounded-2xl flex flex-col items-center text-center relative border-[2.5px] ${
              !isTie && !isMeWinner
                ? 'bg-white border-[#1B1D20] shadow-md'
                : 'bg-white/80 border-[#1B1D20]/30 shadow-sm'
            }`}
          >
            {!isTie && !isMeWinner && (
              <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#1B1D20] text-[#FDE776] text-[10px] font-black uppercase tracking-wider">
                Winner
              </div>
            )}
            <div className="w-[72px] h-[72px] relative mb-1.5">
              <img
                src={friendAvatar.blob}
                alt=""
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
              <img
                src={friendAvatar.face}
                alt=""
                className="absolute inset-0 m-auto w-[74%] h-[74%] object-contain pointer-events-none"
                draggable={false}
              />
            </div>
            <span className="text-[16px] font-black text-[#1B1D20] font-['Nunito',sans-serif] truncate max-w-[120px]">
              {friendData.name}
            </span>
            <div className="text-[32px] font-black text-[#1B1D20] leading-none mt-1 font-['Nunito',sans-serif]">
              {friendScore}
              <span className="text-[13px] font-bold text-[#1B1D20]/60 ml-0.5">pts</span>
            </div>
          </div>
        </div>

        {/* Sync & Match Stats Banner */}
        <div className="bg-[#FAF6EA] border-[2px] border-[#1B1D20] rounded-2xl p-3 flex items-center justify-around my-2 shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-[#1B1D20]/60 uppercase tracking-wider">
              Sync Score
            </span>
            <span className="text-[20px] font-black text-[#1B1D20] font-['Nunito',sans-serif]">
              {syncPercentage}%
            </span>
          </div>
          <div className="h-[28px] w-[1.5px] bg-[#1B1D20]/15" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-[#1B1D20]/60 uppercase tracking-wider">
              Matches
            </span>
            <span className="text-[20px] font-black text-[#1B1D20] font-['Nunito',sans-serif]">
              {matchesCount}
            </span>
          </div>
          <div className="h-[28px] w-[1.5px] bg-[#1B1D20]/15" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-[#1B1D20]/60 uppercase tracking-wider">
              Rounds
            </span>
            <span className="text-[20px] font-black text-[#1B1D20] font-['Nunito',sans-serif]">
              {history.length}
            </span>
          </div>
        </div>

        {/* 3 Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {/* Rematch Button */}
          <PillButton
            onClick={restartGame}
            variant="black"
            className="w-full h-[50px] text-[16.5px] font-black tracking-tight shadow-md active:scale-98 disabled:opacity-80"
            disabled={hasIVoted}
          >
            {hasIVoted
              ? `Waiting for ${friendData.name}… (1/2)`
              : hasFriendVoted
              ? `${friendData.name} wants rematch! Accept 🔄`
              : 'Rematch 🔄'}
          </PillButton>

          {/* Save Highlights Button */}
          <button
            type="button"
            onClick={handleSaveHighlights}
            className="w-full h-[46px] rounded-full bg-[#FAF6EA] border-[2px] border-[#1B1D20] text-[#1B1D20] font-extrabold text-[15px] flex items-center justify-center gap-2 hover:bg-white active:scale-98 transition-all cursor-pointer font-['Nunito',sans-serif] shadow-sm"
          >
            <span>Save highlights</span>
            <span>⭐</span>
          </button>

          {/* Home Button */}
          <button
            type="button"
            onClick={exitGame}
            className="w-full h-[42px] rounded-full border-[1.8px] border-dashed border-[#1B1D20] text-[#1B1D20] font-bold text-[14px] flex items-center justify-center hover:bg-[#1B1D20]/5 active:scale-98 transition-all cursor-pointer font-['Nunito',sans-serif]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </Screen>
  );
};
