import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId
  );
}

let cachedDb: Database | null = null;

export function getRoomsDb(): Database {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  }
  if (!cachedDb) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cachedDb = getDatabase(app);
  }
  return cachedDb;
}
