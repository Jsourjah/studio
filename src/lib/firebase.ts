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

// --- Firebase Config Check ---
// The following log helps you verify that your .env configuration is being loaded correctly.
// Compare these values with your Firebase project settings.
console.group("Firebase Config Check");
console.log("Project ID:", firebaseConfig.projectId);
console.log("API Key:", firebaseConfig.apiKey);
if (!firebaseConfig.projectId) {
  console.error("CRITICAL: Firebase projectId is missing. Your .env file might not be configured correctly.");
}
console.groupEnd();
// -----------------------------


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig as FirebaseOptions) : getApp();
const db: Firestore = getFirestore(app);

export { db };
