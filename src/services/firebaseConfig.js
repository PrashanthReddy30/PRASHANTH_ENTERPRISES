// Firebase Client Configuration & SDK Initialization
// Prashanth Enterprises Enterprise HRMS

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDc4RV2LJXPsUYUgqnHeKQ3me2FQxeK3d4",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "prashanth-enterprises.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "prashanth-enterprises",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "prashanth-enterprises.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "464052439818",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:464052439818:web:0ca9ae4103a2045b10c8f3",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-N0XGGDK3Q6"
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.projectId && 
    !firebaseConfig.apiKey.includes("FakeKey")
  );
};

// Initialize Firebase App gracefully
let app;
let auth;
let db;
let storage;
let analytics = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize Analytics only in client browser environment where supported
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch (error) {
  console.warn("Firebase client initialization warning:", error.message);
}

export { app, auth, db, storage, analytics };
