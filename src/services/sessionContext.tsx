import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile } from '../screens/CreateProfileScreen';

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
  weekly: any[];
  categories: Record<string, any>;
}

export interface GameHistory {
  games: any[];
  stats: GameStats;
}

const DEFAULT_STATS: GameStats = {
  syncScore: 74,
  streak: 12,
  matches: 38,
  guessWins: 21,
  weekly: [
    { day: 'M', score: 65 },
    { day: 'T', score: 70 },
    { day: 'W', score: 85 },
    { day: 'T', score: 90 },
    { day: 'F', score: 75 },
    { day: 'S', score: 80 },
    { day: 'S', score: 74 },
  ],
  categories: {
    Food: 85,
    Movies: 70,
    Music: 90,
  },
};

const DEFAULT_HISTORY: GameHistory = {
  games: [],
  stats: DEFAULT_STATS,
};

interface SessionContextValue {
  sessionType: SessionType;
  isLoading: boolean;
  user: AppUser | null;
  profile: UserProfile | null;
  history: GameHistory;
  pendingInviteCode: string | null;
  setPendingInviteCode: (code: string | null) => void;
  startGuestSession: () => void;
  signInWithGoogle: () => Promise<boolean>;
  saveProfile: (newProfile: UserProfile) => Promise<void>;
  updateHistory: (updater: (prev: GameHistory) => GameHistory) => Promise<void>;
  signOut: () => Promise<void>;
  leaveDuo: () => Promise<void>;
  welcomeBackToast: string | null;
  dismissWelcomeBackToast: () => void;
  guestHistoryToast: boolean;
  triggerFirstGameFinished: () => void;
  dismissGuestHistoryToast: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<GameHistory>(DEFAULT_HISTORY);
  const [sessionType, setSessionType] = useState<SessionType>('NEW');
  const [welcomeBackToast, setWelcomeBackToast] = useState<string | null>(null);
  const [guestHistoryToast, setGuestHistoryToast] = useState(false);

  // Invite code preserved across welcome -> create profile -> join flow
  const [pendingInviteCode, setPendingInviteCodeState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlCode = new URLSearchParams(window.location.search).get('code');
      if (urlCode) {
        localStorage.setItem('gty_pending_invite_code', urlCode);
        return urlCode;
      }
      return localStorage.getItem('gty_pending_invite_code');
    }
    return null;
  });

  const setPendingInviteCode = (code: string | null) => {
    setPendingInviteCodeState(code);
    if (typeof window !== 'undefined') {
      if (code) {
        localStorage.setItem('gty_pending_invite_code', code);
      } else {
        localStorage.removeItem('gty_pending_invite_code');
      }
    }
  };

  // Initialize session from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGoogleUser = localStorage.getItem('gty_google_user');
      const savedGoogleProfile = localStorage.getItem('gty_google_profile');
      const guestId = localStorage.getItem('gty_guest_id');
      const guestProfile = localStorage.getItem('gty_profile');
      const savedHistory = localStorage.getItem('gty_history');

      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch {}
      }

      if (savedGoogleUser) {
        try {
          const parsedUser = JSON.parse(savedGoogleUser);
          setUser(parsedUser);
          setSessionType('GOOGLE');
          if (savedGoogleProfile) {
            setProfile(JSON.parse(savedGoogleProfile));
          }
        } catch {}
      } else if (guestId && guestProfile) {
        try {
          setSessionType('GUEST');
          setProfile(JSON.parse(guestProfile));
        } catch {}
      } else {
        const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const defaultProfile: UserProfile = { avatarId: 1, name: 'Player 1', color: 'salmon' };
        localStorage.setItem('gty_guest_id', newGuestId);
        localStorage.setItem('gty_profile', JSON.stringify(defaultProfile));
        setSessionType('GUEST');
        setProfile(defaultProfile);
      }
    }
    setIsLoading(false);
  }, []);

  const startGuestSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('gty_guest_id', guestId);
      setSessionType('GUEST');
    }
  }, []);

  // Static Google Sign-in simulation
  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    // Simulate a brief professional loading delay (e.g. 600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockGoogleUser: AppUser = {
      uid: `google_${Date.now()}`,
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_google_user', JSON.stringify(mockGoogleUser));
    }
    setUser(mockGoogleUser);
    setSessionType('GOOGLE');
    return true;
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gty_profile', JSON.stringify(newProfile));
      if (sessionType === 'GOOGLE') {
        localStorage.setItem('gty_google_profile', JSON.stringify(newProfile));
      }
    }
  }, [sessionType]);

  const updateHistory = useCallback(async (updater: (prev: GameHistory) => GameHistory) => {
    setHistory((prev) => {
      const next = updater(prev);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gty_history', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gty_google_user');
      localStorage.removeItem('gty_google_profile');
      localStorage.removeItem('gty_guest_id');
      localStorage.removeItem('gty_profile');
      localStorage.removeItem('gty_history');
    }
    setUser(null);
    setProfile(null);
    setSessionType('NEW');
    setHistory(DEFAULT_HISTORY);
  }, []);

  const leaveDuo = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const dismissWelcomeBackToast = useCallback(() => {
    setWelcomeBackToast(null);
  }, []);

  const triggerFirstGameFinished = useCallback(() => {
    setGuestHistoryToast(true);
  }, []);

  const dismissGuestHistoryToast = useCallback(() => {
    setGuestHistoryToast(false);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessionType,
        isLoading,
        user,
        profile,
        history,
        pendingInviteCode,
        setPendingInviteCode,
        startGuestSession,
        signInWithGoogle,
        saveProfile,
        updateHistory,
        signOut,
        leaveDuo,
        welcomeBackToast,
        dismissWelcomeBackToast,
        guestHistoryToast,
        triggerFirstGameFinished,
        dismissGuestHistoryToast,
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
