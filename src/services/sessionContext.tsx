import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, ensureAuthUser } from '../lib/firebase';
import { UserProfile } from '../screens/CreateProfileScreen';
import {
  RoomData,
  createRoom as apiCreateRoom,
  validateAndJoinRoom as apiJoinRoom,
  subscribeToRoom,
  saveUserProfile as apiSaveUserProfile,
  loadUserProfile as apiLoadUserProfile,
  leaveRoomAndDeleteData as apiLeaveRoomAndDeleteData,
  addRoomMemory,
  MemoryEntry,
} from './roomService';

export type SessionType = 'NEW' | 'GUEST' | 'GOOGLE';
export type { UserProfile };

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface GameStats {
  syncScore: number;
  streak: number;
  matches: number;
  guessWins: number;
  gamesPlayed: number;
}

export interface GameHistory {
  games: unknown[];
  stats: GameStats;
}

const EMPTY_STATS: GameStats = {
  syncScore: 0,
  streak: 0,
  matches: 0,
  guessWins: 0,
  gamesPlayed: 0,
};

const EMPTY_HISTORY: GameHistory = {
  games: [],
  stats: EMPTY_STATS,
};

interface SessionContextValue {
  sessionType: SessionType;
  isLoading: boolean;
  user: AppUser | null;
  profile: UserProfile | null;
  partnerProfile: UserProfile | null;
  room: RoomData | null;
  roomCode: string | null;
  isHost: boolean;
  friendJoined: boolean;
  history: GameHistory;
  memories: MemoryEntry[];
  pendingInviteCode: string | null;
  setPendingInviteCode: (code: string | null) => void;
  startGuestSession: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  saveProfile: (newProfile: UserProfile) => Promise<void>;
  createRoom: (profile: UserProfile) => Promise<string>;
  joinRoom: (code: string, profile: UserProfile) => Promise<RoomData>;
  leaveDuo: () => Promise<void>;
  signOut: () => Promise<void>;
  saveMemory: (memory: MemoryEntry) => Promise<void>;
  welcomeBackToast: string | null;
  dismissWelcomeBackToast: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gty_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });
  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gty_room_code') || null;
    }
    return null;
  });
  const [sessionType, setSessionType] = useState<SessionType>('NEW');
  const [welcomeBackToast, setWelcomeBackToast] = useState<string | null>(null);

  // Invite code from URL e.g. ?join=ABC-123 or ?code=ABC-123
  const [pendingInviteCode, setPendingInviteCodeState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('join') || params.get('code');
      if (urlCode) {
        localStorage.setItem('gty_pending_invite_code', urlCode);
        return urlCode;
      }
      return localStorage.getItem('gty_pending_invite_code');
    }
    return null;
  });

  const setPendingInviteCode = useCallback((code: string | null) => {
    setPendingInviteCodeState(code);
    if (typeof window !== 'undefined') {
      if (code) {
        localStorage.setItem('gty_pending_invite_code', code);
      } else {
        localStorage.removeItem('gty_pending_invite_code');
      }
    }
  }, []);

  // Initialize Firebase Auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const appUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        };
        setUser(appUser);
        setSessionType(fbUser.isAnonymous ? 'GUEST' : 'GOOGLE');

        // Check if user has saved profile in Firestore
        try {
          const userDoc = await apiLoadUserProfile();
          if (userDoc) {
            const p: UserProfile = {
              name: userDoc.name,
              avatarId: userDoc.avatarId,
              color: (userDoc.color as UserProfile['color']) || 'salmon',
            };
            setProfile(p);
            if (userDoc.roomCode && !roomCode) {
              setRoomCode(userDoc.roomCode);
              localStorage.setItem('gty_room_code', userDoc.roomCode);
            }
          }
        } catch (e) {
          console.warn('Could not load user profile from Firestore:', e);
        }
      } else {
        // Sign in anonymously by default so every visitor has a real Firebase UID
        try {
          const anonUser = await ensureAuthUser();
          setUser({
            uid: anonUser.uid,
            email: null,
            displayName: null,
          });
          setSessionType('GUEST');
        } catch (e) {
          console.warn('Anonymous sign-in error:', e);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Real-time listener for current room
  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }

    const unsubscribe = subscribeToRoom(
      roomCode,
      (updatedRoom) => {
        if (updatedRoom) {
          setRoom(updatedRoom);
        } else {
          // Room deleted or left
          setRoom(null);
          setRoomCode(null);
          localStorage.removeItem('gty_room_code');
        }
      },
      (err) => {
        console.warn('Room listener error:', err);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  // Derive partner profile dynamically from the other player in the room
  const partnerProfile: UserProfile | null = React.useMemo(() => {
    if (!room || !user) return null;
    const players = Object.values(room.players || {});
    const partner = players.find((p) => p.uid !== user.uid);
    if (partner) {
      return {
        name: partner.name,
        avatarId: partner.avatarId,
        color: (partner.color as UserProfile['color']) || 'teal',
      };
    }
    return null;
  }, [room, user]);

  const isHost = Boolean(room && user && room.hostUid === user.uid);
  const friendJoined = Boolean(room && room.playerUids && room.playerUids.length >= 2);

  // Real stats from room, or 0 if no games played yet
  const history: GameHistory = React.useMemo(() => {
    if (room && room.stats) {
      return {
        games: [],
        stats: {
          streak: room.stats.streak || 0,
          syncScore: room.stats.syncScore || 0,
          matches: room.stats.matches || 0,
          guessWins: room.stats.guessWins || 0,
          gamesPlayed: room.stats.gamesPlayed || 0,
        },
      };
    }
    return EMPTY_HISTORY;
  }, [room]);

  const memories: MemoryEntry[] = React.useMemo(() => {
    return room?.memories || [];
  }, [room]);

  const startGuestSession = useCallback(async () => {
    const anonUser = await ensureAuthUser();
    setUser({
      uid: anonUser.uid,
      email: null,
      displayName: null,
    });
    setSessionType('GUEST');
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const appUser: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      };
      setUser(appUser);
      setSessionType('GOOGLE');
      return true;
    } catch (err) {
      console.warn('Google sign in error:', err);
      // Fallback: stay with anonymous auth
      await startGuestSession();
      return true;
    }
  }, [startGuestSession]);

  const saveProfile = useCallback(
    async (newProfile: UserProfile) => {
      setProfile(newProfile);
      localStorage.setItem('gty_profile', JSON.stringify(newProfile));
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
      await apiSaveUserProfile(newProfile, roomCode);
    },
    [roomCode]
  );

  const createRoom = useCallback(
    async (prof: UserProfile): Promise<string> => {
      const newRoom = await apiCreateRoom(prof);
      setRoom(newRoom);
      setRoomCode(newRoom.code);
      localStorage.setItem('gty_room_code', newRoom.code);
      return newRoom.code;
    },
    []
  );

  const joinRoom = useCallback(
    async (code: string, prof: UserProfile): Promise<RoomData> => {
      const joined = await apiJoinRoom(code, prof);
      setRoom(joined);
      setRoomCode(joined.code);
      localStorage.setItem('gty_room_code', joined.code);
      setPendingInviteCode(null);
      return joined;
    },
    [setPendingInviteCode]
  );

  const saveMemory = useCallback(
    async (memory: MemoryEntry) => {
      if (!roomCode) return;
      await addRoomMemory(roomCode, memory);
    },
    [roomCode]
  );

  const leaveDuo = useCallback(async () => {
    if (roomCode) {
      await apiLeaveRoomAndDeleteData(roomCode);
    }
    setRoom(null);
    setRoomCode(null);
    setProfile(null);
    localStorage.removeItem('gty_room_code');
    localStorage.removeItem('gty_profile');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('partner_profile');
  }, [roomCode]);

  const signOut = useCallback(async () => {
    await leaveDuo();
    await firebaseSignOut(auth);
    setUser(null);
    setSessionType('NEW');
    // Re-initialize anonymous user
    await startGuestSession();
  }, [leaveDuo, startGuestSession]);

  return (
    <SessionContext.Provider
      value={{
        sessionType,
        isLoading,
        user,
        profile,
        partnerProfile,
        room,
        roomCode,
        isHost,
        friendJoined,
        history,
        memories,
        pendingInviteCode,
        setPendingInviteCode,
        startGuestSession,
        signInWithGoogle,
        saveProfile,
        createRoom,
        joinRoom,
        leaveDuo,
        signOut,
        saveMemory,
        welcomeBackToast,
        dismissWelcomeBackToast: () => setWelcomeBackToast(null),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
