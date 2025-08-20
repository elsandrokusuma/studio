// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDa0mHjrTK1O73yosGLrE7I5Q51eoNa3sg",
  authDomain: "stationery-inventory.firebaseapp.com",
  projectId: "stationery-inventory",
  storageBucket: "stationery-inventory.firebasestorage.app",
  messagingSenderId: "812550241868",
  appId: "1:812550241868:web:056174a385b1539456fee9",
};

// Check if all required config values are present
const firebaseEnabled =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId;

// Initialize Firebase only if the config is valid
const app = firebaseEnabled ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const db = app ? getFirestore(app) : null;

if (!firebaseEnabled) {
  console.warn("Firebase config is missing or incomplete. Firebase services are disabled.");
}

export { db, firebaseEnabled };
