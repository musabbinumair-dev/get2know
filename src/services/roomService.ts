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

// Unambiguous alphabet: no 0, O, 1, I, L
const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export interface RoomPlayer {
  uid: string;
  name: string;
  avatarId: number;
  color: string;
  joinedAt: string;
  isReady?: boolean;
}

export interface RoomSettings {
  mode: 'know-me' | 'trivia' | 'mixed';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rounds: number;
}

export interface RoomStats {
  streak: number;
  syncScore: number;
  gamesPlayed: number;
  matches: number;
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
  gameState?: Record<string, unknown>;
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
      },
    },
    settings: {
      mode: 'mixed',
      category: 'all',
      difficulty: 'Medium',
      rounds: 10,
    },
    stats: {
      streak: 0,
      syncScore: 0,
      gamesPlayed: 0,
      matches: 0,
    },
    memories: [],
    lastGame: null,
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
 * Update ready status in room
 */
export async function setPlayerReady(code: string, isReady: boolean): Promise<void> {
  const user = await ensureAuthUser();
  const roomPath = `rooms/${code}`;
  try {
    await updateDoc(doc(db, 'rooms', code), {
      [`players.${user.uid}.isReady`]: isReady,
    });
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
        // Remove player from room
        const updatedPlayers = { ...room.players };
        delete updatedPlayers[user.uid];
        await updateDoc(doc(db, 'rooms', code), {
          playerUids: remainingUids,
          players: updatedPlayers,
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
  }
}
