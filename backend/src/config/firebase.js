import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

let isInitialized = false;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully');
    isInitialized = true;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
  }
}

export const db = isInitialized ? admin.firestore() : null;
export const auth = isInitialized ? admin.auth() : null;
export const isFirebaseReady = isInitialized;

