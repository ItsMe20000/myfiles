
// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config (replace with your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyCr6tMKVqNkL2oDiACtRkQFJIfl-BwGlNM",
  authDomain: "messenger-cd.firebaseapp.com",
  projectId: "messenger-cd",
  storageBucket: "messenger-cd.firebasestorage.app",
  messagingSenderId: "906562647955",
  appId: "1:906562647955:web:5b5aefe3352300e5061a66",
  measurementId: "G-PYG98DE79W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export services so other files can use them
export const auth = getAuth(app);
export const db = getFirestore(app);