import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const resolvedConfig = {
  ...firebaseConfig,
  authDomain: `${firebaseConfig.projectId}.firebaseapp.com`,
};

const app = initializeApp(resolvedConfig);
export const db =
  !firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)'
    ? getFirestore(app)
    : getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || '(default)';
export const authDomain = resolvedConfig.authDomain;
export const projectId = resolvedConfig.projectId;

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
  const fbErr = error as { code?: string; message?: string };
  const errInfo: FirestoreErrorInfo = {
    error: fbErr?.message || (error instanceof Error ? error.message : String(error)),
    operationType,
    path,
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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  const err: any = new Error(errInfo.error);
  err.code = fbErr?.code || 'permission-denied';
  err.details = errInfo;
  throw err;
}

// Ensure auth session (sign in anonymously if not authenticated, never use fake IDs)
export async function ensureAuthUser(): Promise<FirebaseUser> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // 1. Wait for initial auth state if Firebase Auth is restoring saved session
  const initialUser = await new Promise<FirebaseUser | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

  if (initialUser) {
    return initialUser;
  }

  // 2. Not authenticated: call signInAnonymously and wait for onAuthStateChanged
  await signInAnonymously(auth);

  return new Promise<FirebaseUser>((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });

    setTimeout(() => {
      if (auth.currentUser) {
        resolve(auth.currentUser);
      } else {
        unsubscribe();
        reject(new Error('Timed out waiting for onAuthStateChanged after sign in'));
      }
    }, 4000);
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
