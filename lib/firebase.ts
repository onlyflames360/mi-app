
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Estas variables deben configurarse en el panel de Vercel (Environment Variables)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "dummy-key",
  authDomain: `${process.env.FIREBASE_PROJECT_ID || "carrito-ppoc"}.firebaseapp.com`,
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || "carrito-ppoc"}-default-rtdb.firebaseio.com`,
  projectId: process.env.FIREBASE_PROJECT_ID || "carrito-ppoc",
  storageBucket: `${process.env.FIREBASE_PROJECT_ID || "carrito-ppoc"}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "000000000",
  appId: process.env.FIREBASE_APP_ID || "1:0000:web:0000"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
