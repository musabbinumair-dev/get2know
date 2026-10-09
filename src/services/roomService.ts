import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db, ensureAuthUser, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../screens/CreateProfileScreen';
import {
  selectQuestionsForGame,
  TRIVIA_QUESTIONS,
  KNOW_ME_QUESTIONS,
  generateKnowMeGuessOptions,
  shuffleTriviaOptions,
} from '../data/gameQuestions';

// Unambiguous alphabet: no 0, O, 1, I, L
const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export interface RoomPlayer {
  uid: string;
  name: string;
  avatarId: number;
  color: string;
  joinedAt: string;
  isReady?: boolean;
  online?: boolean;
  lastSeen?: number;
}

export interface RoomSettings {
  mode: 'know-me' | 'trivia' | 'mixed';
  categories: string[];
  category?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rounds: 5 | 10 | 15 | number;
  timer: '10s' | '20s' | '30s' | 'Off';
  speedBonus: boolean;
  soundEffects: boolean;
}

export interface RoomStats {
  streak: number;
  syncScore: number;
  gamesPlayed: number;
  matches: number;
  guessWins?: number;
}

export interface MemoryEntry {
  id: string;
  category: string;
  color: string;
  cardBg?: string;
  date: string;
  question: string;
  p1Answer: string;
  p2Answer: string;
  p1Name: string;
  p2Name: string;
  p1AvatarId: number;
  p2AvatarId: number;
  p1Color: string;
  p2Color: string;
  isMatched: boolean;
  reactions?: { emoji: string; count: number }[];
  createdAt: string;
}

export interface PlayerRoundAnswer {
  text?: string;
  optionId?: string;
  locked: boolean;
  answeredAt?: number | null;
  timeRemaining?: number;
}

export interface PlayerRoundGuess {
  text?: string;
  optionId?: string;
  locked: boolean;
  guessedAt?: number | null;
}

export interface RoomReaction {
  id: string;
  emoji: string;
  fromUid: string;
  timestamp: number;
}

export interface RoomGameState {
  status: 'lobby' | 'countdown' | 'question' | 'waiting' | 'guess' | 'reveal' | 'final';
  round: number;
  totalRounds: number;
  mode: 'know-me' | 'trivia' | 'mixed';
  roundType: 'trivia' | 'know-me';
  questionId: string;
  questionIds: string[];
  seed: number;
  countdownStartTime?: number;
  answers: Record<string, PlayerRoundAnswer>;
  guesses: Record<string, PlayerRoundGuess>;
  scores: Record<string, number>;
  roundPointsEarned?: Record<string, number>;
  reactions: RoomReaction[];
  rematchVotes: Record<string, boolean>;
  usedQuestionIds: string[];
  lastActionAt: number;
}

export interface RoomNudge {
  fromUid: string;
  toUid: string;
  timestamp: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  mode: string;
  rounds: number;
  scores: Record<string, number>;
  winnerUid?: string | null;
  syncPercentage: number;
  matches: number;
}

export interface RoomData {
  code: string;
  createdAt: string;
  hostUid: string;
  status: 'waiting' | 'active' | 'finished';
  playerUids: string[];
  players: Record<string, RoomPlayer>;
  settings: RoomSettings;
  stats: RoomStats;
  memories: MemoryEntry[];
  lastGame?: {
    title: string;
    category: string;
    result: string;
    score: string;
  } | null;
  gameState?: RoomGameState;
  nudge?: RoomNudge | null;
  gameHistory?: GameHistoryEntry[];
}

export interface UserDocument {
  uid: string;
  name: string;
  avatarId: number;
  color: string;
  roomCode?: string | null;
  settings?: {
    haptics: boolean;
    reminderTime: string;
    soundEffects: boolean;
  };
  updatedAt: string;
}

/**
 * Format any input to ABC-123 pattern (uppercase, stripped, 6 chars with middle dash)
 */
export function formatRoomCode(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
}

/**
 * Normalize any input code to ABC-123
 */
export function normalizeRoomCode(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
  }
  return cleaned;
}

/**
 * Generate 6-char random code in ABC-123 format using unambiguous alphabet
 */
export function generateUnambiguousCode(): string {
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 3; i++) {
    part1 += UNAMBIGUOUS_CHARS.charAt(Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length));
  }
  for (let i = 0; i < 3; i++) {
    part2 += UNAMBIGUOUS_CHARS.charAt(Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length));
  }
  return `${part1}-${part2}`;
}

/**
 * Save user profile to Firestore `users/{uid}`
 */
export async function saveUserProfile(profile: UserProfile, roomCode?: string | null): Promise<void> {
  const user = await ensureAuthUser();
  const path = `users/${user.uid}`;
  try {
    const userDoc: UserDocument = {
      uid: user.uid,
      name: profile.name.trim() || 'Player',
      avatarId: profile.avatarId || 1,
      color: profile.color || 'salmon',
      roomCode: roomCode || null,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_user_uid', user.uid);
      localStorage.setItem('gty_profile', JSON.stringify(profile));
      if (roomCode) {
        localStorage.setItem('gty_room_code', roomCode);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load user profile from Firestore `users/{uid}`
 */
export async function loadUserProfile(): Promise<UserDocument | null> {
  const user = await ensureAuthUser();
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      return snap.data() as UserDocument;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Create a new two-player room in Firestore with uniqueness verification
 */
export async function createRoom(profile: UserProfile): Promise<RoomData> {
  const user = await ensureAuthUser();

  let code = '';
  let unique = false;
  let attempts = 0;

  // Uniqueness check
  while (!unique && attempts < 10) {
    attempts++;
    code = generateUnambiguousCode();
    const path = `rooms/${code}`;
    try {
      const snap = await getDoc(doc(db, 'rooms', code));
      if (!snap.exists()) {
        unique = true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  if (!unique) {
    throw new Error('Could not generate a unique room code. Please try again.');
  }

  const roomPath = `rooms/${code}`;
  const now = new Date().toISOString();
  const defaultSettings: RoomSettings = {
    mode: 'mixed',
    categories: ['Food', 'Movies', 'Music'],
    difficulty: 'Medium',
    timer: '20s',
    rounds: 10,
    speedBonus: true,
    soundEffects: true,
  };

  const roomData: RoomData = {
    code,
    createdAt: now,
    hostUid: user.uid,
    status: 'waiting',
    playerUids: [user.uid],
    players: {
      [user.uid]: {
        uid: user.uid,
        name: profile.name.trim() || 'Host',
        avatarId: profile.avatarId || 1,
        color: profile.color || 'salmon',
        joinedAt: now,
        isReady: false,
        online: true,
        lastSeen: Date.now(),
      },
    },
    settings: defaultSettings,
    stats: {
      streak: 0,
      syncScore: 0,
      gamesPlayed: 0,
      matches: 0,
      guessWins: 0,
    },
    memories: [],
    lastGame: null,
    gameHistory: [],
  };

  try {
    await setDoc(doc(db, 'rooms', code), roomData);
    await saveUserProfile(profile, code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_room_code', code);
    }
    return roomData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, roomPath);
  }
}

/**
 * Validate and join an existing room
 */
export async function validateAndJoinRoom(rawCode: string, profile: UserProfile): Promise<RoomData> {
  const user = await ensureAuthUser();
  const code = normalizeRoomCode(rawCode);

  if (!code || code.length < 7) {
    throw new Error('Please enter a full 6-character room code (e.g. ABC-123).');
  }

  const roomPath = `rooms/${code}`;
  let snap;
  try {
    snap = await getDoc(doc(db, 'rooms', code));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, roomPath);
  }

  if (!snap.exists()) {
    throw new Error("Invalid code. We couldn't find a room with that code.");
  }

  const data = snap.data() as RoomData;

  // Check expiration (24h limit)
  if (data.createdAt) {
    const createdTime = new Date(data.createdAt).getTime();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (now - createdTime > TWENTY_FOUR_HOURS && data.status === 'waiting') {
      throw new Error('This room invite has expired (24-hour limit). Please ask for a new code.');
    }
  }

  const isAlreadyMember = data.playerUids?.includes(user.uid);

  if (!isAlreadyMember) {
    if (data.playerUids && data.playerUids.length >= 2) {
      throw new Error('This room is already full (maximum 2 players).');
    }

    const now = new Date().toISOString();
    const newPlayerData: RoomPlayer = {
      uid: user.uid,
      name: profile.name.trim() || 'Player 2',
      avatarId: profile.avatarId || 2,
      color: profile.color || 'teal',
      joinedAt: now,
      isReady: false,
      online: true,
      lastSeen: Date.now(),
    };

    try {
      await updateDoc(doc(db, 'rooms', code), {
        playerUids: arrayUnion(user.uid),
        [`players.${user.uid}`]: newPlayerData,
      });
      data.playerUids.push(user.uid);
      data.players[user.uid] = newPlayerData;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, roomPath);
    }
  }

  await saveUserProfile(profile, code);
  if (typeof window !== 'undefined') {
    localStorage.setItem('gty_room_code', code);
  }

  return data;
}

/**
 * Subscribe to realtime room updates
 */
export function subscribeToRoom(
  code: string,
  onUpdate: (room: RoomData | null) => void,
  onError?: (err: unknown) => void
): () => void {
  const roomPath = `rooms/${code}`;
  const unsubscribe = onSnapshot(
    doc(db, 'rooms', code),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as RoomData);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, roomPath);
    }
  );

  return unsubscribe;
}

/**
 * Host updates room settings
 */
export async function updateRoomSettings(code: string, newSettings: Partial<RoomSettings>): Promise<void> {
  const roomPath = `rooms/${code}`;
  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    const mergedSettings: RoomSettings = {
      ...room.settings,
      ...newSettings,
    };
    await updateDoc(doc(db, 'rooms', code), {
      settings: mergedSettings,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Update ready status in room
 */
export async function setPlayerReady(code: string, isReady: boolean, targetUid?: string): Promise<void> {
  const user = await ensureAuthUser();
  const uid = targetUid || user.uid;
  const roomPath = `rooms/${code}`;
  try {
    await updateDoc(doc(db, 'rooms', code), {
      [`players.${uid}.isReady`]: isReady,
      [`players.${uid}.lastSeen`]: Date.now(),
      [`players.${uid}.online`]: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Send live nudge to partner in room
 */
export async function sendRoomNudge(code: string, toUid: string): Promise<void> {
  const user = await ensureAuthUser();
  const roomPath = `rooms/${code}`;
  try {
    await updateDoc(doc(db, 'rooms', code), {
      nudge: {
        fromUid: user.uid,
        toUid,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Host starts the game: sets countdown server timestamp and draws questions
 */
export async function startRoomGame(code: string, customSettings?: Partial<RoomSettings>): Promise<void> {
  await ensureAuthUser();
  const roomPath = `rooms/${code}`;
  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;

    const effectiveSettings: RoomSettings = {
      ...room.settings,
      ...(customSettings || {}),
    };

    const seed = Date.now();
    const usedIds = room.gameState?.usedQuestionIds || [];
    const questions = selectQuestionsForGame(effectiveSettings, usedIds, seed);
    const questionIds = questions.map((q) => q.id);
    const firstQ = questions[0];
    const initialRoundType = firstQ.type === 'know-me' ? 'know-me' : 'trivia';

    const initialAnswers: Record<string, PlayerRoundAnswer> = {};
    const initialGuesses: Record<string, PlayerRoundGuess> = {};
    const initialScores: Record<string, number> = {};

    room.playerUids.forEach((uid) => {
      initialAnswers[uid] = { locked: false };
      initialGuesses[uid] = { locked: false };
      initialScores[uid] = 0;
    });

    const newGameState: RoomGameState = {
      status: 'countdown',
      round: 1,
      totalRounds: effectiveSettings.rounds,
      mode: effectiveSettings.mode,
      roundType: initialRoundType,
      questionId: firstQ.id,
      questionIds,
      seed,
      countdownStartTime: Date.now(),
      answers: initialAnswers,
      guesses: initialGuesses,
      scores: initialScores,
      roundPointsEarned: {},
      reactions: [],
      rematchVotes: {},
      usedQuestionIds: [...usedIds, ...questionIds],
      lastActionAt: Date.now(),
    };

    await updateDoc(doc(db, 'rooms', code), {
      status: 'active',
      settings: effectiveSettings,
      gameState: newGameState,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Submit player's answer (Free text for Know Me, optionId for Trivia)
 */
export async function submitPlayerAnswer(
  code: string,
  answerPayload: { text?: string; optionId?: string; timeRemaining?: number }
): Promise<void> {
  const user = await ensureAuthUser();
  const roomPath = `rooms/${code}`;

  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    if (!room.gameState) return;

    const gs = { ...room.gameState };
    const myAnswer: PlayerRoundAnswer = {
      text: answerPayload.text,
      optionId: answerPayload.optionId,
      locked: true,
      answeredAt: Date.now(),
      timeRemaining: answerPayload.timeRemaining,
    };

    gs.answers[user.uid] = myAnswer;

    // Check if both players in room have locked in
    const allAnswered = room.playerUids.every((uid) => gs.answers[uid]?.locked);

    if (allAnswered) {
      if (gs.roundType === 'know-me') {
        // Both free texts locked in -> move to Guess phase
        gs.status = 'guess';
        // Reset guesses for both players
        room.playerUids.forEach((uid) => {
          gs.guesses[uid] = { locked: false };
        });
      } else {
        // Trivia: both options locked in -> evaluate score and move to Reveal
        const currentQ = TRIVIA_QUESTIONS.find((q) => q.id === gs.questionId);
        const { correctOptionId } = currentQ
          ? shuffleTriviaOptions(currentQ, `${gs.seed}-r${gs.round}`)
          : { correctOptionId: 'pink' };

        const roundEarned: Record<string, number> = {};

        room.playerUids.forEach((uid) => {
          const ans = gs.answers[uid];
          const isCorrect = ans?.optionId === correctOptionId;
          let earned = 0;
          if (isCorrect) {
            let basePoints = 15;
            let speedBonus = 0;
            if (room.settings.speedBonus && ans.timeRemaining && ans.timeRemaining > 0) {
              speedBonus = Math.min(5, Math.floor(ans.timeRemaining / 3));
            }
            earned = basePoints + speedBonus;
          }
          roundEarned[uid] = earned;
          gs.scores[uid] = (gs.scores[uid] || 0) + earned;
        });

        gs.roundPointsEarned = roundEarned;
        gs.status = 'reveal';
      }
    }

    gs.lastActionAt = Date.now();

    await updateDoc(doc(db, 'rooms', code), {
      gameState: gs,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Submit player's guess in Know Me mode
 */
export async function submitPlayerGuess(
  code: string,
  guessPayload: { text?: string; optionId?: string }
): Promise<void> {
  const user = await ensureAuthUser();
  const roomPath = `rooms/${code}`;

  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    if (!room.gameState) return;

    const gs = { ...room.gameState };
    const myGuess: PlayerRoundGuess = {
      text: guessPayload.text,
      optionId: guessPayload.optionId,
      locked: true,
      guessedAt: Date.now(),
    };

    gs.guesses[user.uid] = myGuess;

    // Check if both players have submitted guesses
    const allGuessed = room.playerUids.every((uid) => gs.guesses[uid]?.locked);

    if (allGuessed) {
      // Evaluate Know Me guesses: each player guesses the OTHER player's answer
      const knowMeQ = KNOW_ME_QUESTIONS.find((q) => q.id === gs.questionId);
      const roundEarned: Record<string, number> = {};

      const u1 = room.playerUids[0];
      const u2 = room.playerUids[1] || u1;

      // For u1 guessing u2's answer:
      if (knowMeQ) {
        const u2RealAnswer = gs.answers[u2]?.text || knowMeQ.player2Answer;
        const u2Options = generateKnowMeGuessOptions(knowMeQ, u2RealAnswer, `${gs.seed}-guess-for-${u2}`);
        const u1Correct = gs.guesses[u1]?.optionId === u2Options.correctOptionId;
        const u1Earned = u1Correct ? 15 : 0;
        roundEarned[u1] = u1Earned;
        gs.scores[u1] = (gs.scores[u1] || 0) + u1Earned;

        // For u2 guessing u1's answer:
        const u1RealAnswer = gs.answers[u1]?.text || knowMeQ.player1DefaultAnswer;
        const u1Options = generateKnowMeGuessOptions(knowMeQ, u1RealAnswer, `${gs.seed}-guess-for-${u1}`);
        const u2Correct = gs.guesses[u2]?.optionId === u1Options.correctOptionId;
        const u2Earned = u2Correct ? 15 : 0;
        roundEarned[u2] = u2Earned;
        gs.scores[u2] = (gs.scores[u2] || 0) + u2Earned;
      }

      gs.roundPointsEarned = roundEarned;
      gs.status = 'reveal';
    }

    gs.lastActionAt = Date.now();

    await updateDoc(doc(db, 'rooms', code), {
      gameState: gs,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Send emoji reaction on Reveal screen
 */
export async function sendRoomReaction(code: string, emoji: string): Promise<void> {
  const user = await ensureAuthUser();
  const roomPath = `rooms/${code}`;

  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    if (!room.gameState) return;

    const reaction: RoomReaction = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emoji,
      fromUid: user.uid,
      timestamp: Date.now(),
    };

    const existing = room.gameState.reactions || [];
    // Keep last 20 reactions to prevent bloat
    const updated = [...existing.slice(-19), reaction];

    await updateDoc(doc(db, 'rooms', code), {
      'gameState.reactions': updated,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Advance to next question or to Final Results
 */
export async function advanceToNextRound(code: string): Promise<void> {
  const roomPath = `rooms/${code}`;

  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    if (!room.gameState) return;

    const gs = { ...room.gameState };

    if (gs.round >= gs.totalRounds) {
      // Game finished!
      gs.status = 'final';

      // Update room stats & game history
      const u1 = room.playerUids[0];
      const u2 = room.playerUids[1] || u1;
      const s1 = gs.scores[u1] || 0;
      const s2 = gs.scores[u2] || 0;
      const winner = s1 === s2 ? null : s1 > s2 ? u1 : u2;

      const historyEntry: GameHistoryEntry = {
        id: `game-${Date.now()}`,
        date: new Date().toISOString(),
        mode: gs.mode,
        rounds: gs.totalRounds,
        scores: gs.scores,
        winnerUid: winner,
        syncPercentage: Math.min(100, Math.round(((s1 + s2) / (gs.totalRounds * 30)) * 100)),
        matches: Math.floor(gs.totalRounds / 2),
      };

      const updatedHistory = [historyEntry, ...(room.gameHistory || [])];
      const newStreak = (room.stats?.streak || 0) + 1;
      const newSyncScore = Math.min(100, Math.round((s1 + s2) / (gs.totalRounds * 0.3)));

      await updateDoc(doc(db, 'rooms', code), {
        gameState: gs,
        gameHistory: updatedHistory,
        stats: {
          streak: newStreak,
          syncScore: newSyncScore,
          gamesPlayed: (room.stats?.gamesPlayed || 0) + 1,
          matches: (room.stats?.matches || 0) + historyEntry.matches,
          guessWins: (room.stats?.guessWins || 0) + (winner ? 1 : 0),
        },
      });
      return;
    }

    // Next round
    const nextRound = gs.round + 1;
    const nextQId = gs.questionIds[nextRound - 1];

    let nextRoundType: 'trivia' | 'know-me' = 'trivia';
    if (gs.mode === 'trivia') nextRoundType = 'trivia';
    else if (gs.mode === 'know-me') nextRoundType = 'know-me';
    else nextRoundType = nextRound % 2 === 1 ? 'trivia' : 'know-me';

    const freshAnswers: Record<string, PlayerRoundAnswer> = {};
    const freshGuesses: Record<string, PlayerRoundGuess> = {};
    room.playerUids.forEach((uid) => {
      freshAnswers[uid] = { locked: false };
      freshGuesses[uid] = { locked: false };
    });

    gs.round = nextRound;
    gs.roundType = nextRoundType;
    gs.questionId = nextQId;
    gs.status = 'question';
    gs.answers = freshAnswers;
    gs.guesses = freshGuesses;
    gs.reactions = [];
    gs.roundPointsEarned = {};
    gs.lastActionAt = Date.now();

    await updateDoc(doc(db, 'rooms', code), {
      gameState: gs,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Vote for Rematch
 */
export async function requestRematch(code: string): Promise<void> {
  const user = await ensureAuthUser();
  const roomPath = `rooms/${code}`;

  try {
    const snap = await getDoc(doc(db, 'rooms', code));
    if (!snap.exists()) return;
    const room = snap.data() as RoomData;
    if (!room.gameState) return;

    const votes = { ...(room.gameState.rematchVotes || {}), [user.uid]: true };

    // Check if both players voted
    const bothVoted = room.playerUids.every((uid) => votes[uid] === true);

    if (bothVoted) {
      // Restart game with identical settings!
      await startRoomGame(code, room.settings);
    } else {
      await updateDoc(doc(db, 'rooms', code), {
        'gameState.rematchVotes': votes,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Save new memory entry into room
 */
export async function addRoomMemory(code: string, memory: MemoryEntry): Promise<void> {
  const roomPath = `rooms/${code}`;
  try {
    const roomSnap = await getDoc(doc(db, 'rooms', code));
    if (roomSnap.exists()) {
      const existing = (roomSnap.data()?.memories || []) as MemoryEntry[];
      const updated = [memory, ...existing.filter((m) => m.id !== memory.id)];
      await updateDoc(doc(db, 'rooms', code), {
        memories: updated,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
}

/**
 * Update player presence / online heartbeat
 */
export async function updatePlayerHeartbeat(code: string, isOnline: boolean = true): Promise<void> {
  const user = await ensureAuthUser();
  try {
    await updateDoc(doc(db, 'rooms', code), {
      [`players.${user.uid}.online`]: isOnline,
      [`players.${user.uid}.lastSeen`]: Date.now(),
    });
  } catch (error) {
    // Non-critical, ignore
  }
}

/**
 * Leave room and delete user data completely
 */
export async function leaveRoomAndDeleteData(code: string): Promise<void> {
  const user = await ensureAuthUser();

  try {
    const roomSnap = await getDoc(doc(db, 'rooms', code));
    if (roomSnap.exists()) {
      const room = roomSnap.data() as RoomData;
      const remainingUids = room.playerUids.filter((id) => id !== user.uid);
      if (remainingUids.length === 0) {
        // Last player leaves -> delete entire room
        await deleteDoc(doc(db, 'rooms', code));
      } else {
        // Remove player from room and notify friend
        const updatedPlayers = { ...room.players };
        delete updatedPlayers[user.uid];
        await updateDoc(doc(db, 'rooms', code), {
          playerUids: remainingUids,
          players: updatedPlayers,
          status: 'finished',
        });
      }
    }
  } catch (err) {
    console.warn('Error updating room on leave:', err);
  }

  try {
    await deleteDoc(doc(db, 'users', user.uid));
  } catch (err) {
    console.warn('Error deleting user doc:', err);
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('gty_room_code');
    localStorage.removeItem('gty_profile');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('partner_profile');
    localStorage.removeItem('gty_google_user');
    localStorage.removeItem('gty_google_profile');
    localStorage.removeItem('game_memory_cards');
    localStorage.removeItem('gty_active_game');
  }
}
