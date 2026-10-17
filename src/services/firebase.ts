import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_SIMIN_DUMMY_KEY_FOR_LOCAL",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "simin-aidt.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "simin-aidt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "simin-aidt.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
// 학교 도메인(@simin.hs.kr) 강제 지정 (OAuth hd 파라미터)
googleProvider.setCustomParameters({
  hd: 'simin.hs.kr',
  prompt: 'select_account',
});
