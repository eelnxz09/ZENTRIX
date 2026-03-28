import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAufqAXmRXZjc81aR6jTZlMbmss96RysF8",
  authDomain: "zentrix-e5a7c.firebaseapp.com",
  projectId: "zentrix-e5a7c",
  storageBucket: "zentrix-e5a7c.firebasestorage.app",
  messagingSenderId: "878573994076",
  appId: "1:878573994076:web:5201433780cc84de232699"
};

// If no real key is provided, we will initialize a real app but it will fail.
// So we use useMockFallback in contexts.
const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
