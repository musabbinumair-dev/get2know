import React, { useState, useEffect } from 'react';

interface CountdownScreenProps {
  onBackToLobby: () => void;
  onGoHome: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({ onBackToLobby, onGoHome }) => {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center select-none font-['Nunito',sans-serif]"
      style={{ backgroundColor: '#F6EFDD' }}
    >
      <div className="relative text-center px-6 max-w-sm">
        <div className="w-24 h-24 rounded-full bg-[#161B1E] text-white text-5xl font-black flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
          {seconds > 0 ? seconds : '🚀'}
        </div>
        <h1 className="text-3xl font-black text-[#161B1E] mb-3 tracking-tight">
          {seconds > 0 ? 'Starting Game!' : 'Countdown coming next'}
        </h1>
        <p className="text-base font-semibold text-[#161B1E]/60 mb-8 leading-relaxed">
          Both players are locked in and ready. The game engine is preparing your questions.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onBackToLobby}
            className="w-full py-3 px-6 rounded-full bg-[#161B1E] text-white font-extrabold text-sm shadow-md active:scale-95 transition-transform"
          >
            Back to Lobby
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-3 px-6 rounded-full bg-[#FCF7EB] text-[#161B1E] font-bold text-sm active:scale-95 transition-transform"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
};
