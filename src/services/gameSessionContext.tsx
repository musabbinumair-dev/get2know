import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TRIVIA_QUESTIONS,
  KNOW_ME_QUESTIONS,
  TriviaQuestion,
  KnowMeQuestion,
  GameQuestion,
} from '../data/gameQuestions';

export type GameMode = 'Trivia' | 'Know Me' | 'Mixed';
export type RoundType = 'trivia' | 'know-me';
export type GameStep = 'countdown' | 'question' | 'waiting' | 'guess' | 'reveal' | 'final';

export interface RoundResult {
  round: number;
  type: RoundType;
  question: string;
  myAnswer?: string;
  friendAnswer?: string;
  myGuess?: string;
  friendGuess?: string;
  isCorrect: boolean;
  isMatched?: boolean;
  pointsEarned: number;
  correctAnswerText: string;
}

export interface GameSessionState {
  isActive: boolean;
  mode: GameMode;
  totalRounds: number;
  currentRound: number;
  currentRoundType: RoundType;
  currentStep: GameStep;
  timer: number;
  isTimerActive: boolean;
  currentQuestion: GameQuestion;
  myAnswer: string;
  friendAnswer: string;
  myGuess: string;
  isCorrect: boolean;
  isMatched: boolean;
  myScore: number;
  friendScore: number;
  streak: number;
  matchesCount: number;
  history: RoundResult[];
  // Actions
  startNewGame: (overrideMode?: GameMode, overrideRounds?: number) => void;
  submitAnswer: (answer: string) => void;
  submitGuess: (optionId: 'pink' | 'yellow' | 'cream' | 'green', optionText: string) => void;
  advanceFromWaiting: () => void;
  nextRound: () => void;
  restartGame: () => void;
  exitGame: () => void;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

const GameSessionContext = createContext<GameSessionState | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // Mode and rounds initialized from localStorage settings
  const [mode, setMode] = useState<GameMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gty_game_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.mode === 'know-me') return 'Know Me';
          if (parsed.mode === 'mixed') return 'Mixed';
          return 'Trivia';
        } catch {}
      }
    }
    return 'Trivia';
  });

  const [totalRounds, setTotalRounds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gty_game_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.rounds) return parsed.rounds;
        } catch {}
      }
    }
    return 10;
  });

  const [isActive, setIsActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gty_active_game') === 'true';
    }
    return false;
  });

  const [currentRound, setCurrentRound] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const r = localStorage.getItem('gty_game_round');
      if (r) return parseInt(r, 10) || 1;
    }
    return 1;
  });

  // Determine round type for current round
  const getRoundTypeForRound = useCallback(
    (roundNum: number, gameMode: GameMode): RoundType => {
      if (gameMode === 'Trivia') return 'trivia';
      if (gameMode === 'Know Me') return 'know-me';
      // Mixed: alternate. Round 1: Trivia, Round 2: Know Me, Round 3: Trivia...
      return roundNum % 2 === 1 ? 'trivia' : 'know-me';
    },
    []
  );

  const [currentRoundType, setCurrentRoundType] = useState<RoundType>(() =>
    getRoundTypeForRound(currentRound, mode)
  );

  const [currentStep, setCurrentStep] = useState<GameStep>(() => {
    if (typeof window !== 'undefined') {
      const step = localStorage.getItem('gty_game_step') as GameStep;
      if (step) return step;
    }
    return 'countdown';
  });

  // Timer state
  const [timer, setTimer] = useState<number>(15);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Scores & Streak
  const [myScore, setMyScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('gty_game_myscore');
      if (s) return parseInt(s, 10) || 0;
    }
    return 0;
  });

  const [friendScore, setFriendScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('gty_game_friendscore');
      if (s) return parseInt(s, 10) || 0;
    }
    return 0;
  });

  const [streak] = useState<number>(12);
  const [matchesCount, setMatchesCount] = useState<number>(0);

  // Current answers & guesses
  const [myAnswer, setMyAnswer] = useState<string>('');
  const [friendAnswer, setFriendAnswer] = useState<string>('');
  const [myGuess, setMyGuess] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isMatched, setIsMatched] = useState<boolean>(false);

  // Round history
  const [history, setHistory] = useState<RoundResult[]>(() => {
    if (typeof window !== 'undefined') {
      const h = localStorage.getItem('gty_game_history');
      if (h) {
        try {
          return JSON.parse(h);
        } catch {}
      }
    }
    return [];
  });

  // Fetch question for current round
  const currentQuestion = React.useMemo<GameQuestion>(() => {
    const idx = (currentRound - 1);
    if (currentRoundType === 'trivia') {
      return TRIVIA_QUESTIONS[idx % TRIVIA_QUESTIONS.length];
    } else {
      return KNOW_ME_QUESTIONS[idx % KNOW_ME_QUESTIONS.length];
    }
  }, [currentRound, currentRoundType]);

  // Persist session markers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_active_game', isActive ? 'true' : 'false');
      localStorage.setItem('gty_game_round', currentRound.toString());
      localStorage.setItem('gty_game_step', currentStep);
      localStorage.setItem('gty_game_myscore', myScore.toString());
      localStorage.setItem('gty_game_friendscore', friendScore.toString());
      localStorage.setItem('gty_game_history', JSON.stringify(history));
    }
  }, [isActive, currentRound, currentStep, myScore, friendScore, history]);

  // Timer tick down
  useEffect(() => {
    if (!isTimerActive || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Time expired! Auto-handle step
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Start new game
  const startNewGame = useCallback(
    (overrideMode?: GameMode, overrideRounds?: number) => {
      const activeMode = overrideMode || mode;
      const activeRounds = overrideRounds || totalRounds;

      setMode(activeMode);
      setTotalRounds(activeRounds);
      setCurrentRound(1);
      const rType = getRoundTypeForRound(1, activeMode);
      setCurrentRoundType(rType);
      setIsActive(true);
      setMyScore(0);
      setFriendScore(0);
      setMatchesCount(0);
      setHistory([]);
      setMyAnswer('');
      setFriendAnswer('');
      setMyGuess('');
      setIsCorrect(false);
      setIsMatched(false);

      // In Trivia mode: first screen is Guess screen
      // In Know Me mode: first screen is Today's question screen
      if (rType === 'trivia') {
        setCurrentStep('guess');
        setTimer(15);
        setIsTimerActive(true);
        navigate('/guess');
      } else {
        setCurrentStep('question');
        setTimer(20);
        setIsTimerActive(true);
        navigate('/today-question');
      }
    },
    [mode, totalRounds, getRoundTypeForRound, navigate]
  );

  // Know Me: Submit my answer
  const submitAnswer = useCallback(
    (answerText: string) => {
      setMyAnswer(answerText);
      setIsTimerActive(false);

      const knowMeQ = currentQuestion as KnowMeQuestion;
      const fAns = knowMeQ.player2Answer || 'Done is better than perfect.';
      setFriendAnswer(fAns);

      // Advance to waiting
      setCurrentStep('waiting');
      navigate('/locked');
    },
    [currentQuestion, navigate]
  );

  // Waiting: Advance after both answered
  const advanceFromWaiting = useCallback(() => {
    if (currentRoundType === 'trivia') {
      // In Trivia: after waiting -> Reveal screen
      setCurrentStep('reveal');
      navigate('/reveal');
    } else {
      // In Know Me: after waiting -> Guess screen
      setCurrentStep('guess');
      setTimer(15);
      setIsTimerActive(true);
      navigate('/guess');
    }
  }, [currentRoundType, navigate]);

  // Guess: Submit guess
  const submitGuess = useCallback(
    (optionId: 'pink' | 'yellow' | 'cream' | 'green', optionText: string) => {
      setMyGuess(optionText);
      setIsTimerActive(false);

      let correct = false;
      let matched = false;
      let earned = 0;

      if (currentRoundType === 'trivia') {
        const triviaQ = currentQuestion as TriviaQuestion;
        correct = optionId === triviaQ.correctOptionId;
        earned = correct ? 10 : 0;

        // Friend also guesses (80% chance of guessing correct)
        const friendCorrect = Math.random() > 0.25;
        if (correct) setMyScore((s) => s + 10);
        if (friendCorrect) setFriendScore((s) => s + 10);

        if (correct && friendCorrect) {
          matched = true;
          setMatchesCount((m) => m + 1);
        }

        setIsCorrect(correct);
        setIsMatched(matched);

        // Record history
        const result: RoundResult = {
          round: currentRound,
          type: 'trivia',
          question: currentQuestion.question,
          myGuess: optionText,
          isCorrect: correct,
          isMatched: matched,
          pointsEarned: earned,
          correctAnswerText:
            triviaQ.options.find((o) => o.id === triviaQ.correctOptionId)?.text || '',
        };
        setHistory((h) => [...h, result]);

        // Trivia goes to waiting ("Answer locked in") briefly, then reveal
        setCurrentStep('waiting');
        navigate('/locked');
      } else {
        // Know Me: guess friend's answer
        const knowMeQ = currentQuestion as KnowMeQuestion;
        correct = optionId === knowMeQ.correctOptionId;
        earned = correct ? 15 : 0;

        // Check if both had same answer
        matched =
          myAnswer.trim().toLowerCase() === knowMeQ.player2Answer.trim().toLowerCase() ||
          correct;

        if (correct) setMyScore((s) => s + 15);
        // Friend also guessed
        const friendGuessedRight = Math.random() > 0.3;
        if (friendGuessedRight) setFriendScore((s) => s + 15);

        if (matched) {
          setMatchesCount((m) => m + 1);
        }

        setIsCorrect(correct);
        setIsMatched(matched);

        const result: RoundResult = {
          round: currentRound,
          type: 'know-me',
          question: currentQuestion.question,
          myAnswer: myAnswer || knowMeQ.player1DefaultAnswer,
          friendAnswer: knowMeQ.player2Answer,
          myGuess: optionText,
          isCorrect: correct,
          isMatched: matched,
          pointsEarned: earned,
          correctAnswerText: knowMeQ.player2Answer,
        };
        setHistory((h) => [...h, result]);

        // Know Me directly reveals
        setCurrentStep('reveal');
        navigate('/reveal');
      }
    },
    [currentQuestion, currentRound, currentRoundType, myAnswer, navigate]
  );

  // Advance to Next Round (or Final Screen if last round)
  const nextRound = useCallback(() => {
    if (currentRound >= totalRounds) {
      // Game Finished! Go to Final Results screen
      setCurrentStep('final');
      navigate('/game-final');
      return;
    }

    const nextR = currentRound + 1;
    setCurrentRound(nextR);
    const nextType = getRoundTypeForRound(nextR, mode);
    setCurrentRoundType(nextType);
    setMyAnswer('');
    setFriendAnswer('');
    setMyGuess('');
    setIsCorrect(false);
    setIsMatched(false);

    if (nextType === 'trivia') {
      setCurrentStep('guess');
      setTimer(15);
      setIsTimerActive(true);
      navigate('/guess');
    } else {
      setCurrentStep('question');
      setTimer(20);
      setIsTimerActive(true);
      navigate('/today-question');
    }
  }, [currentRound, totalRounds, mode, getRoundTypeForRound, navigate]);

  // Restart Game (Rematch)
  const restartGame = useCallback(() => {
    setIsActive(true);
    setCurrentRound(1);
    setMyScore(0);
    setFriendScore(0);
    setMatchesCount(0);
    setHistory([]);
    navigate('/countdown');
  }, [navigate]);

  // Exit Game back to Home
  const exitGame = useCallback(() => {
    setIsActive(false);
    setCurrentStep('countdown');
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_active_game', 'false');
    }
    navigate('/home');
  }, [navigate]);

  const pauseTimer = useCallback(() => setIsTimerActive(false), []);
  const resumeTimer = useCallback(() => setIsTimerActive(true), []);

  return (
    <GameSessionContext.Provider
      value={{
        isActive,
        mode,
        totalRounds,
        currentRound,
        currentRoundType,
        currentStep,
        timer,
        isTimerActive,
        currentQuestion,
        myAnswer,
        friendAnswer,
        myGuess,
        isCorrect,
        isMatched,
        myScore,
        friendScore,
        streak,
        matchesCount,
        history,
        startNewGame,
        submitAnswer,
        submitGuess,
        advanceFromWaiting,
        nextRound,
        restartGame,
        exitGame,
        setTimer,
        pauseTimer,
        resumeTimer,
      }}
    >
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = () => {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
};
