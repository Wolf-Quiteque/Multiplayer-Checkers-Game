import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// These values will be pulled from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with mock implementations for development
let app;
let auth: Auth;
let db: Firestore;

// Create development mock to circumvent Firebase errors
const createMocks = () => {
  console.warn("Using Firebase mock implementation for development");
  
  const mockApp = { 
    name: "[DEFAULT]",
    options: { ...firebaseConfig }
  };
  
  const mockAuth = {
    currentUser: null,
    app: mockApp,
  } as unknown as Auth;
  
  const mockDb = {} as unknown as Firestore;
  
  return { app: mockApp, auth: mockAuth, db: mockDb };
};

try {
  // Check if Firebase has already been initialized
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization error:", error);
  const mocks = createMocks();
  app = mocks.app;
  auth = mocks.auth;
  db = mocks.db;
}

export { app, auth, db };
