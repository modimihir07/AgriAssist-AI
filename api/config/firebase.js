import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let isInitialized = false;

// Try multiple methods to get Firebase credentials
function getServiceAccount() {
  // Method 1: JSON string directly in env var (for Vercel serverless)
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonStr) {
    try {
      // Support both raw JSON and base64-encoded JSON
      if (jsonStr.startsWith('{')) {
        return JSON.parse(jsonStr);
      }
      return JSON.parse(Buffer.from(jsonStr, 'base64').toString('utf8'));
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
    }
  }

  // Method 2: File path (for local development)
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to read service account file:', e.message);
    }
  }

  return null;
}

const serviceAccount = getServiceAccount();

if (serviceAccount) {
  try {
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

