
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Usamos import.meta.env para compatibilidad con el build de Vite
// Fix: Use type assertion to access Vite's environment variables and resolve the 'env' does not exist on type 'ImportMeta' error.
const env = (import.meta as any).env;
const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || "TU_API_KEY",
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || "TU_PROJECT_ID.firebaseapp.com",
  databaseURL: env?.VITE_FIREBASE_DATABASE_URL || "https://TU_PROJECT_ID.firebaseio.com",
  projectId: env?.VITE_FIREBASE_PROJECT_ID || "TU_PROJECT_ID",
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || "TU_PROJECT_ID.appspot.com",
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "TU_MESSAGING_SENDER_ID",
  appId: env?.VITE_FIREBASE_APP_ID || "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
