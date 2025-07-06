import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import type { FirebaseOptions } from "firebase/app";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log the configuration to help with debugging.
// You can check your browser's developer console to see these values.
console.log("Attempting to connect with Firebase config:", firebaseConfig);
if (!firebaseConfig.projectId) {
    console.error("CRITICAL: Firebase project ID is missing. Check your .env file and ensure it's loaded correctly.");
}


const config: FirebaseOptions = firebaseConfig;
// Initialize Firebase
const app = !getApps().length ? initializeApp(config) : getApp();
const db: Firestore = getFirestore(app);

export { db };
