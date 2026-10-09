import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const resolvedConfig = {
  ...firebaseConfig,
  authDomain: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? window.location.hostname
    : firebaseConfig.authDomain,
};

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId;
export const authDomain = resolvedConfig.authDomain;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure auth session (sign in anonymously if not authenticated)
export async function ensureAuthUser(): Promise<FirebaseUser> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          // Fallback to local guest user if anonymous auth is restricted or disabled
          let guestUid = localStorage.getItem('gty_guest_uid');
          if (!guestUid) {
            guestUid = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
            localStorage.setItem('gty_guest_uid', guestUid);
          }
          const mockUser = {
            uid: guestUid,
            isAnonymous: true,
            email: null,
            emailVerified: false,
            displayName: 'Guest Player',
            providerData: [],
          } as unknown as FirebaseUser;
          resolve(mockUser);
        }
      }
    });
  });
}

// Initial connection test per skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
  }
}
testConnection();
