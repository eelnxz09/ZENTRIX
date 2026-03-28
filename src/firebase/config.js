import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || 'mock-key',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock-domain',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:123',
};

// If no real key is provided, we will initialize a real app but it will fail.
// So we use useMockFallback in contexts.
const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
