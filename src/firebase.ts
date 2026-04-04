// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your custom Firebase project configuration (from Vercel env vars)
const customFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Decide which config to use
// On Vercel, the custom apiKey will be defined and not 'undefined'
const useCustomConfig = customFirebaseConfig.apiKey && customFirebaseConfig.apiKey !== 'undefined';

let app;
let auth;
let db;
let storage;
let googleProvider;

if (useCustomConfig) {
  // Use your own Firebase project (for Vercel)
  app = initializeApp(customFirebaseConfig);
  console.log('🔥 Firebase initialized with CUSTOM config (Vercel)');
} else {
  // In AI Studio, Firebase is auto-injected; we initialize with an empty object
  // The Firebase SDK will pick up the default project provided by the environment
  app = initializeApp({});
  console.log('🔥 Firebase initialized with DEFAULT config (AI Studio)');
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);
googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
