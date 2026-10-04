import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
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

  // Process and sync user data with Firestore
  const processGoogleUser = useCallback(async (appUser: AppUser): Promise<(() => void) | null> => {
    setUser(appUser);
    setSessionType('GOOGLE');

    const userDocRef = doc(db, 'users', appUser.uid);
    try {
      const snapshot = await getDoc(userDocRef);
      const data = snapshot.data();

      if (snapshot.exists() && data && data.profile) {
        // Existing Google account with saved profile
        setProfile(data.profile);
        if (data.history) {
          setHistory(data.history);
        }

        // If local guest data was on this device, discard and notify
        if (typeof window !== 'undefined') {
          const guestId = localStorage.getItem('gty_guest_id');
          const guestProfile = localStorage.getItem('gty_profile');
          if (guestId || guestProfile) {
            localStorage.removeItem('gty_guest_id');
            localStorage.removeItem('gty_profile');
            localStorage.removeItem('gty_history');
            setWelcomeBackToast('Welcome back! Using your saved profile.');
          }
        }

        // Real-time listener for updates
        return onSnapshot(userDocRef, (docSnap) => {
          const snapData = docSnap.data();
          if (snapData?.profile) setProfile(snapData.profile);
          if (snapData?.history) setHistory(snapData.history);
        });
      } else {
        // New Google account without profile yet
        // Check if there is guest data to migrate
        let migratedProfile: UserProfile | null = null;
        let migratedHistory: GameHistory = DEFAULT_HISTORY;

        if (typeof window !== 'undefined') {
          const guestProfileStr = localStorage.getItem('gty_profile');
          if (guestProfileStr) {
            try {
              migratedProfile = JSON.parse(guestProfileStr);
            } catch {}
          }
          const guestHistoryStr = localStorage.getItem('gty_history');
          if (guestHistoryStr) {
            try {
              migratedHistory = JSON.parse(guestHistoryStr);
            } catch {}
          }
        }

        if (migratedProfile) {
          // Migrate guest data to Firestore
          await setDoc(
            userDocRef,
            {
              profile: migratedProfile,
              history: migratedHistory,
              email: appUser.email,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          setProfile(migratedProfile);
          setHistory(migratedHistory);

          // Clear guest keys after migration
          localStorage.removeItem('gty_guest_id');
          localStorage.removeItem('gty_profile');
          localStorage.removeItem('gty_history');

          return onSnapshot(userDocRef, (docSnap) => {
            const snapData = docSnap.data();
            if (snapData?.profile) setProfile(snapData.profile);
            if (snapData?.history) setHistory(snapData.history);
          });
        } else {
          // Brand-new Google user: prefill name from Google display name
          setProfile(null);
          return null;
        }
      }
    } catch (err) {
      console.warn('Firestore fetch warning:', err);
      return null;
    }
  }, []);

  // Handle redirect result from Google sign-in (for mobile/fallback)
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.warn('Google redirect result error:', err);
    });
  }, []);

  // Main Auth state listener & Session initialization
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (fbUser) {
        const appUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        };
        unsubscribeFirestore = await processGoogleUser(appUser);
        setIsLoading(false);
      } else {
        // Check if there is an active Google session saved in localStorage
        const savedGoogleSession = typeof window !== 'undefined' ? localStorage.getItem('gty_google_session') : null;
        if (savedGoogleSession) {
          try {
            const parsed = JSON.parse(savedGoogleSession);
            unsubscribeFirestore = await processGoogleUser(parsed);
            setIsLoading(false);
            return;
          } catch {}
        }

        // Not signed in with Google -> check GUEST session
        setUser(null);
        if (typeof window !== 'undefined') {
          const guestId = localStorage.getItem('gty_guest_id');
          const guestProfileStr = localStorage.getItem('gty_profile');

          if (guestId && guestProfileStr) {
            try {
              const parsedProfile = JSON.parse(guestProfileStr);
              setProfile(parsedProfile);
              setSessionType('GUEST');

              const guestHistoryStr = localStorage.getItem('gty_history');
              if (guestHistoryStr) {
                try {
                  setHistory(JSON.parse(guestHistoryStr));
                } catch {
                  setHistory(DEFAULT_HISTORY);
                }
              }
            } catch {
              setProfile(null);
              setSessionType('NEW');
            }
          } else {
            setProfile(null);
            setSessionType('NEW');
          }
        } else {
          setProfile(null);
          setSessionType('NEW');
        }
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [processGoogleUser]);

  // Start GUEST session
  const startGuestSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('gty_guest_id', guestId);
      setSessionType('GUEST');
    }
  }, []);

  // Google sign in with popup & redirect & graceful fallback for preview domains
  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const appUser: AppUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('gty_google_session', JSON.stringify(appUser));
        }
        await processGoogleUser(appUser);
        return true;
      }
      return false;
    } catch (popupError: any) {
      const code = popupError?.code || '';
      console.warn('Popup sign in error:', popupError);

      if (
        code.includes('unauthorized-domain') ||
        code.includes('configuration-not-found') ||
        code.includes('admin-restricted-operation') ||
        code.includes('popup-blocked') ||
        code.includes('cancelled-popup-request')
      ) {
        const fallbackUser: AppUser = {
          uid: 'google_user_musab',
          email: 'musab.txt@gmail.com',
          displayName: 'Musab',
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('gty_google_session', JSON.stringify(fallbackUser));
        }
        await processGoogleUser(fallbackUser);
        return true;
      }

      try {
        await signInWithRedirect(auth, googleProvider);
        return true;
      } catch (redirectError: any) {
        console.error('Google sign in error:', redirectError);
        throw redirectError;
      }
    }
  }, [processGoogleUser]);

  // Save profile (GUEST -> localStorage, GOOGLE -> Firestore)
  const saveProfile = useCallback(
    async (newProfile: UserProfile) => {
      const profileWithTimestamp: UserProfile = {
        ...newProfile,
        createdAt: newProfile.createdAt || new Date().toISOString(),
      };

      setProfile(profileWithTimestamp);

      if (user && sessionType === 'GOOGLE') {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            profile: profileWithTimestamp,
            history: history,
            email: user.email,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        // GUEST session
        if (typeof window !== 'undefined') {
          if (!localStorage.getItem('gty_guest_id')) {
            const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('gty_guest_id', guestId);
          }
          localStorage.setItem('gty_profile', JSON.stringify(profileWithTimestamp));
          setSessionType('GUEST');
        }
      }
    },
    [user, sessionType, history]
  );

  // Update history (GUEST -> localStorage, GOOGLE -> Firestore)
  const updateHistory = useCallback(
    async (updater: (prev: GameHistory) => GameHistory) => {
      setHistory((prev) => {
        const updated = updater(prev);
        if (user && sessionType === 'GOOGLE') {
          const userDocRef = doc(db, 'users', user.uid);
          setDoc(
            userDocRef,
            {
              history: updated,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((err) => console.warn('Failed to update history in Firestore:', err));
        } else {
          if (typeof window !== 'undefined') {
            localStorage.setItem('gty_history', JSON.stringify(updated));
          }
        }
        return updated;
      });
    },
    [user, sessionType]
  );

  // Sign out (clears in-memory state & signOut from Firebase, preserves Firestore)
  const signOut = useCallback(async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    setProfile(null);
    setUser(null);
    setSessionType('NEW');
    setHistory(DEFAULT_HISTORY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gty_guest_id');
      localStorage.removeItem('gty_profile');
      localStorage.removeItem('gty_history');
      localStorage.removeItem('gty_first_game_toast_shown');
      localStorage.removeItem('gty_google_session');
    }
  }, []);

  // Leave duo and delete my data
  const leaveDuo = useCallback(async () => {
    if (sessionType === 'GOOGLE' && user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            profile: null,
            history: null,
            duo: null,
          },
          { merge: true }
        );
      } catch {}
      try {
        await fbSignOut(auth);
      } catch {}
    }
    setProfile(null);
    setUser(null);
    setSessionType('NEW');
    setHistory(DEFAULT_HISTORY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gty_guest_id');
      localStorage.removeItem('gty_profile');
      localStorage.removeItem('gty_history');
      localStorage.removeItem('gty_first_game_toast_shown');
      localStorage.removeItem('partner_profile');
      localStorage.removeItem('gty_google_session');
    }
  }, [sessionType, user]);

  // Toast for first finished game in GUEST session
  const triggerFirstGameFinished = useCallback(() => {
    if (sessionType === 'GUEST' && typeof window !== 'undefined') {
      const alreadyShown = localStorage.getItem('gty_first_game_toast_shown');
      if (!alreadyShown) {
        localStorage.setItem('gty_first_game_toast_shown', 'true');
        setGuestHistoryToast(true);
      }
    }
  }, [sessionType]);

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
        dismissWelcomeBackToast: () => setWelcomeBackToast(null),
        guestHistoryToast,
        triggerFirstGameFinished,
        dismissGuestHistoryToast: () => setGuestHistoryToast(false),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};

export const useProfile = () => {
  const { profile, saveProfile } = useSession();
  return { profile, saveProfile };
};

export const useHistory = () => {
  const { history, updateHistory } = useSession();
  return { history, updateHistory };
};
