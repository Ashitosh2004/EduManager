import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID', 
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase environment variables:', missing);
    throw new Error(`Missing required Firebase environment variables: ${missing.join(', ')}`);
  }
};

// Validate before initializing
validateFirebaseConfig();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return signOut(auth);
};


// Domain validation function
export const validateEmailDomain = (email: string, instituteDomain: string): boolean => {
  const emailDomain = email.substring(email.indexOf('@'));
  return emailDomain === instituteDomain;
};

export default app;
