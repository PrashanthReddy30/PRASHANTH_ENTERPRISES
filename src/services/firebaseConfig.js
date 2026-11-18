// Firebase Client Configuration & SDK Initialization
// Prashanth Enterprises Enterprise HRMS

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyForIntranetOfflineUsage_PE_HRM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "prashanth-enterprises-hrm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "prashanth-enterprises-hrm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "prashanth-enterprises-hrm.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:abcdef9876543210"
};

export const isFirebaseConfigured = () => {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
};

// Initialize Firebase App gracefully
let app;
let auth;
let db;
let storage;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase client initialized with local intranet fallback:", error.message);
}

export { app, auth, db, storage };
