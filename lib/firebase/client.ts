import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A function to check if the config is valid, focusing on the most critical keys
const isFirebaseConfigValid = (config: typeof firebaseConfig): boolean => {
    return !!(config.apiKey && config.authDomain && config.projectId);
};

// Conditionally initialize and export
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;


if (isFirebaseConfigValid(firebaseConfig)) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Firebase initialization error:", e);
    // If initialization fails, ensure all services remain null
    auth = null;
    firestore = null;
    storage = null;
  }
} else {
    // This warning will show in the browser console, guiding the developer
    if (typeof window !== 'undefined') {
      console.warn(
        "Firebase config is missing or incomplete in your .env file. " +
        "Firebase features will be disabled. " +
        "Please add your project credentials to use authentication, Firestore, and Storage."
      );
    }
}

export { app, auth, firestore, storage };
