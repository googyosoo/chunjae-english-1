/**
 * 심인고등학교 AI 디지털 교과서 Firebase 인프라 레이어 (동적 코드 분할 적용)
 */
import type { FirebaseApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
}

let firebaseInstancesPromise: Promise<FirebaseInstances> | null = null;

export function isFirebaseConfigured(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return Boolean(apiKey && projectId && !apiKey.includes('DUMMY'));
}

export async function getFirebase(): Promise<FirebaseInstances> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase 환경 변수(VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID)가 설정되지 않았습니다.');
  }

  if (firebaseInstancesPromise) {
    return firebaseInstancesPromise;
  }

  firebaseInstancesPromise = (async () => {
    // 동적 import로 번들 분할
    const [{ initializeApp, getApps, getApp }, { getAuth, GoogleAuthProvider }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const googleProvider = new GoogleAuthProvider();
    // 심인고등학교 도메인 강제 지정 (OAuth hd 파라미터)
    googleProvider.setCustomParameters({
      hd: 'simin.hs.kr',
      prompt: 'select_account',
    });

    return { app, auth, db, googleProvider };
  })();

  return firebaseInstancesPromise;
}
