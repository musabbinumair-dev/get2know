import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from './sessionContext';
import {
  TRIVIA_QUESTIONS,
  KNOW_ME_QUESTIONS,
  TriviaQuestion,
  KnowMeQuestion,
  GameQuestion,
  generateKnowMeGuessOptions,
  shuffleTriviaOptions,
} from '../data/gameQuestions';
import {
  submitPlayerAnswer as apiSubmitAnswer,
  submitPlayerGuess as apiSubmitGuess,
  advanceToNextRound as apiAdvanceRound,
  sendRoomReaction as apiSendReaction,
  requestRematch as apiRequestRematch,
  startRoomGame as apiStartGame,
  RoomSettings,
} from './roomService';
import { triggerHaptic } from '../utils/haptics';

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
  currentTriviaOptions?: { id: 'pink' | 'yellow' | 'cream' | 'green'; text: string }[];
  currentTriviaCorrectId?: 'pink' | 'yellow' | 'cream' | 'green';
  currentKnowMeOptions?: { id: 'pink' | 'yellow' | 'cream' | 'green'; text: string }[];
  currentKnowMeCorrectId?: 'pink' | 'yellow' | 'cream' | 'green';
  myAnswer: string;
  friendAnswer: string;
  myGuess: string;
  friendGuess: string;
  isMyAnswerLocked: boolean;
  isFriendAnswerLocked: boolean;
  isMyGuessLocked: boolean;
  isFriendGuessLocked: boolean;
  isCorrect: boolean;
  isMatched: boolean;
  myScore: number;
  friendScore: number;
  myRoundPoints: number;
  friendRoundPoints: number;
  streak: number;
  matchesCount: number;
  history: RoundResult[];
  reactions: Array<{ id: string; emoji: string; fromUid: string; timestamp: number }>;
  rematchVotes: Record<string, boolean>;
  countdownStartTime?: number;
  partnerDisconnected: boolean;
  // Actions
  startNewGame: (overrideMode?: GameMode, overrideRounds?: number) => Promise<void>;
  submitAnswer: (answerText: string, optionId?: string) => Promise<void>;
  submitGuess: (optionId: 'pink' | 'yellow' | 'cream' | 'green', optionText: string) => Promise<void>;
  advanceFromWaiting: () => void;
  nextRound: () => Promise<void>;
  restartGame: () => Promise<void>;
  exitGame: () => void;
  sendReaction: (emoji: string) => Promise<void>;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

const GameSessionContext = createContext<GameSessionState | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room, roomCode, user } = useSession();

  const getTimerSecondsFromSetting = (timerSetting?: string, difficulty?: string) => {
    if (timerSetting === '10s') return 10;
    if (timerSetting === '20s') return 20;
    if (timerSetting === '30s') return 30;
    if (timerSetting === 'Off') return -1;
    // Default by difficulty if not explicitly set
    if (difficulty === 'Easy') return 20;
    if (difficulty === 'Hard') return 10;
    return 15;
  };

  const gs = room?.gameState;
  const isRoomGameActive = Boolean(
    room &&
    gs &&
    gs.status !== 'lobby'
  );

  // Determine active partner UID
  const partnerUid = useMemo(() => {
    if (!room || !user) return null;
    return room.playerUids.find((id) => id !== user.uid) || null;
  }, [room, user]);

  // Partner disconnected status
  const partnerDisconnected = useMemo(() => {
    if (!room || !partnerUid) return false;
    const p = room.players[partnerUid];
    if (!p) return true;
    if (p.online === false) return true;
    if (p.lastSeen && Date.now() - p.lastSeen > 45000) return true;
    return false;
  }, [room, partnerUid]);

  // Current mode
  const mode: GameMode = useMemo(() => {
    if (gs?.mode) {
      if (gs.mode === 'know-me') return 'Know Me';
      if (gs.mode === 'mixed') return 'Mixed';
      return 'Trivia';
    }
    return 'Trivia';
  }, [gs?.mode]);

  const totalRounds = gs?.totalRounds || room?.settings?.rounds || 10;
  const currentRound = gs?.round || 1;
  const currentRoundType: RoundType = gs?.roundType || 'trivia';

  // Current Question
  const currentQuestion = useMemo<GameQuestion>(() => {
    if (gs?.questionId) {
      const foundTrivia = TRIVIA_QUESTIONS.find((q) => q.id === gs.questionId);
      if (foundTrivia) return foundTrivia;
      const foundKnowMe = KNOW_ME_QUESTIONS.find((q) => q.id === gs.questionId);
      if (foundKnowMe) return foundKnowMe;
    }
    return currentRoundType === 'trivia' ? TRIVIA_QUESTIONS[0] : KNOW_ME_QUESTIONS[0];
  }, [gs?.questionId, currentRoundType]);

  // Shuffled Trivia options for current round
  const triviaOptionsData = useMemo(() => {
    if (currentRoundType !== 'trivia' || currentQuestion.type !== 'trivia') return null;
    const seed = `${gs?.seed || 12345}-r${currentRound}`;
    return shuffleTriviaOptions(currentQuestion as TriviaQuestion, seed);
  }, [currentRoundType, currentQuestion, gs?.seed, currentRound]);

  // Scores
  const myScore = (user && gs?.scores ? gs.scores[user.uid] : 0) || 0;
  const friendScore = (partnerUid && gs?.scores ? gs.scores[partnerUid] : 0) || 0;
  const myRoundPoints = (user && gs?.roundPointsEarned ? gs.roundPointsEarned[user.uid] : 0) || 0;
  const friendRoundPoints = (partnerUid && gs?.roundPointsEarned ? gs.roundPointsEarned[partnerUid] : 0) || 0;

  // Answers & lock states
  const myAnsObj = user && gs?.answers ? gs.answers[user.uid] : null;
  const friendAnsObj = partnerUid && gs?.answers ? gs.answers[partnerUid] : null;

  const isMyAnswerLocked = Boolean(myAnsObj?.locked);
  const isFriendAnswerLocked = Boolean(friendAnsObj?.locked);

  const myAnswer = myAnsObj?.text || '';
  // Friend's answer is only revealed when both have locked in!
  const friendAnswer = isMyAnswerLocked && isFriendAnswerLocked ? (friendAnsObj?.text || '') : '';

  // Guesses & lock states
  const myGuessObj = user && gs?.guesses ? gs.guesses[user.uid] : null;
  const friendGuessObj = partnerUid && gs?.guesses ? gs.guesses[partnerUid] : null;

  const isMyGuessLocked = Boolean(myGuessObj?.locked);
  const isFriendGuessLocked = Boolean(friendGuessObj?.locked);

  const myGuess = myGuessObj?.text || '';
  const friendGuess = isMyGuessLocked && isFriendGuessLocked ? (friendGuessObj?.text || '') : '';

  // Options for Know Me guessing phase (for me guessing partner's answer)
  const knowMeGuessOptionsData = useMemo(() => {
    if (currentRoundType !== 'know-me' || currentQuestion.type !== 'know-me') return null;
    // To guess partner's answer, we need partner's real answer
    const partnerAns = friendAnsObj?.text || (currentQuestion as KnowMeQuestion).player2Answer;
    const seed = `${gs?.seed || 12345}-guess-for-${partnerUid || 'partner'}-r${currentRound}`;
    return generateKnowMeGuessOptions(currentQuestion as KnowMeQuestion, partnerAns, seed);
  }, [currentRoundType, currentQuestion, friendAnsObj?.text, gs?.seed, partnerUid, currentRound]);

  // Results for current round
  const isCorrect = useMemo(() => {
    if (currentRoundType === 'trivia') {
      if (!triviaOptionsData || !myAnsObj?.optionId) return false;
      return myAnsObj.optionId === triviaOptionsData.correctOptionId;
    } else {
      if (!knowMeGuessOptionsData || !myGuessObj?.optionId) return false;
      return myGuessObj.optionId === knowMeGuessOptionsData.correctOptionId;
    }
  }, [currentRoundType, triviaOptionsData, knowMeGuessOptionsData, myAnsObj?.optionId, myGuessObj?.optionId]);

  const isMatched = useMemo(() => {
    return isCorrect && Boolean(friendRoundPoints > 0);
  }, [isCorrect, friendRoundPoints]);

  // Current Step
  const currentStep: GameStep = useMemo(() => {
    if (!gs || gs.status === 'lobby') return 'countdown';
    if (gs.status === 'countdown') return 'countdown';
    if (gs.status === 'question') {
      if (isMyAnswerLocked) return 'waiting';
      return 'question';
    }
    if (gs.status === 'guess') {
      if (isMyGuessLocked) return 'waiting';
      return 'guess';
    }
    if (gs.status === 'reveal') return 'reveal';
    if (gs.status === 'final') return 'final';
    return 'countdown';
  }, [gs, isMyAnswerLocked, isMyGuessLocked]);

  // Timer logic
  const initialTimerSecs = useMemo(() => {
    const timerSetting = room?.settings?.timer || '20s';
    const diff = room?.settings?.difficulty || 'Medium';
    return getTimerSecondsFromSetting(timerSetting, diff);
  }, [room?.settings?.timer, room?.settings?.difficulty]);

  const [timer, setTimer] = useState<number>(initialTimerSecs);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(initialTimerSecs > 0);

  // Reset timer on new question or guess step
  useEffect(() => {
    if (currentStep === 'question' || currentStep === 'guess') {
      setTimer(initialTimerSecs);
      setIsTimerActive(initialTimerSecs > 0);
    } else {
      setIsTimerActive(false);
    }
  }, [currentStep, currentRound, initialTimerSecs]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Auto-navigation driven by real-time Firestore room state
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomCode || !gs) return;
    const currentPath = location.pathname;
    const serverStatus = gs.status;

    if (prevStatusRef.current === serverStatus) return;
    prevStatusRef.current = serverStatus;

    if (serverStatus === 'countdown') {
      if (currentPath !== '/countdown') {
        navigate('/countdown');
      }
    } else if (serverStatus === 'question') {
      if (!isMyAnswerLocked) {
        if (gs.roundType === 'trivia') {
          if (currentPath !== '/trivia-question' && currentPath !== '/guess') {
            navigate('/trivia-question');
          }
        } else {
          if (currentPath !== '/today-question') {
            navigate('/today-question');
          }
        }
      }
    } else if (serverStatus === 'guess') {
      if (!isMyGuessLocked && currentPath !== '/guess') {
        navigate('/guess');
      }
    } else if (serverStatus === 'reveal') {
      if (currentPath !== '/reveal') {
        navigate('/reveal');
      }
    } else if (serverStatus === 'final') {
      if (currentPath !== '/game-final') {
        navigate('/game-final');
      }
    }
  }, [gs?.status, gs?.round, gs?.roundType, roomCode, location.pathname, isMyAnswerLocked, isMyGuessLocked, navigate]);

  // Handle Nudge received in real-time
  const lastNudgeTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!room?.nudge || !user) return;
    if (room.nudge.toUid === user.uid && room.nudge.timestamp > lastNudgeTimeRef.current) {
      lastNudgeTimeRef.current = room.nudge.timestamp;
      // Only fire if nudge was sent recently (last 10 seconds)
      if (Date.now() - room.nudge.timestamp < 10000) {
        triggerHaptic(35);
      }
    }
  }, [room?.nudge, user]);

  // Actions
  const startNewGame = useCallback(
    async (overrideMode?: GameMode, overrideRounds?: number) => {
      if (!roomCode) {
        // Local mode fallback
        return;
      }
      const newSettings: Partial<RoomSettings> = {};
      if (overrideMode) {
        newSettings.mode = (overrideMode === 'Know Me' ? 'know-me' : overrideMode === 'Mixed' ? 'mixed' : 'trivia');
      }
      if (overrideRounds) {
        newSettings.rounds = overrideRounds;
      }
      await apiStartGame(roomCode, newSettings);
    },
    [roomCode]
  );

  const submitAnswer = useCallback(
    async (answerText: string, optionId?: string) => {
      setIsTimerActive(false);
      if (roomCode) {
        await apiSubmitAnswer(roomCode, {
          text: answerText,
          optionId,
          timeRemaining: timer,
        });
      }
      navigate('/locked');
    },
    [roomCode, timer, navigate]
  );

  const submitGuess = useCallback(
    async (optionId: 'pink' | 'yellow' | 'cream' | 'green', optionText: string) => {
      setIsTimerActive(false);
      if (roomCode) {
        await apiSubmitGuess(roomCode, {
          optionId,
          text: optionText,
        });
      }
      // If waiting for partner, navigate to locked/waiting
      if (!isFriendGuessLocked) {
        navigate('/locked');
      } else {
        navigate('/reveal');
      }
    },
    [roomCode, isFriendGuessLocked, navigate]
  );

  const advanceFromWaiting = useCallback(() => {
    if (currentRoundType === 'trivia') {
      navigate('/reveal');
    } else {
      navigate('/guess');
    }
  }, [currentRoundType, navigate]);

  const nextRound = useCallback(async () => {
    if (roomCode) {
      await apiAdvanceRound(roomCode);
    }
  }, [roomCode]);

  const restartGame = useCallback(async () => {
    if (roomCode) {
      await apiRequestRematch(roomCode);
    } else {
      navigate('/countdown');
    }
  }, [roomCode, navigate]);

  const exitGame = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      if (roomCode) {
        await apiSendReaction(roomCode, emoji);
      }
    },
    [roomCode]
  );

  const pauseTimer = useCallback(() => setIsTimerActive(false), []);
  const resumeTimer = useCallback(() => setIsTimerActive(true), []);

  return (
    <GameSessionContext.Provider
      value={{
        isActive: isRoomGameActive,
        mode,
        totalRounds,
        currentRound,
        currentRoundType,
        currentStep,
        timer,
        isTimerActive,
        currentQuestion,
        currentTriviaOptions: triviaOptionsData?.options,
        currentTriviaCorrectId: triviaOptionsData?.correctOptionId,
        currentKnowMeOptions: knowMeGuessOptionsData?.options,
        currentKnowMeCorrectId: knowMeGuessOptionsData?.correctOptionId,
        myAnswer,
        friendAnswer,
        myGuess,
        friendGuess,
        isMyAnswerLocked,
        isFriendAnswerLocked,
        isMyGuessLocked,
        isFriendGuessLocked,
        isCorrect,
        isMatched,
        myScore,
        friendScore,
        myRoundPoints,
        friendRoundPoints,
        streak: room?.stats?.streak || 0,
        matchesCount: room?.stats?.matches || 0,
        history: [],
        reactions: gs?.reactions || [],
        rematchVotes: gs?.rematchVotes || {},
        countdownStartTime: gs?.countdownStartTime,
        partnerDisconnected,
        startNewGame,
        submitAnswer,
        submitGuess,
        advanceFromWaiting,
        nextRound,
        restartGame,
        exitGame,
        sendReaction,
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
