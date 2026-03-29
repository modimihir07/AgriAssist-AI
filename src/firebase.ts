import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Use FIREBASE_API_KEY from .env if the config file has an empty apiKey
const apiKey = firebaseConfig.apiKey || (process.env as any).FIREBASE_API_KEY || '';

try {
  if (apiKey) {
    const config = { ...firebaseConfig, apiKey };
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

export { auth, db, storage, googleProvider };
