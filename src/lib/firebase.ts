// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmfh03rnUjzXEtqr51m1ImXbUfR1MUjqY",
  authDomain: "rentspotmoz-gdl8j.firebaseapp.com",
  databaseURL: "https://rentspotmoz-gdl8j-default-rtdb.firebaseio.com",
  projectId: "rentspotmoz-gdl8j",
  storageBucket: "rentspotmoz-gdl8j.firebasestorage.app",
  messagingSenderId: "173504909126",
  appId: "1:173504909126:web:d051d7346173e3625ddf47"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app); // Firestore remains for potential future use or other features
const rtdb = getDatabase(app); // Realtime Database
const googleProvider = new GoogleAuthProvider(); // Centralized Google Provider

export { app, auth, storage, db, rtdb, googleProvider };
