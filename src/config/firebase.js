import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDZJLBLaX27UG4aOCKXfREQ5LQ1qrX4XuI",
  authDomain: "websitem-a7faa.firebaseapp.com",
  projectId: "websitem-a7faa",
  storageBucket: "websitem-a7faa.firebasestorage.app",
  messagingSenderId: "885800676003",
  appId: "1:885800676003:web:42411a2a9777bca690ad16"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;