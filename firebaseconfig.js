// Firebase initialization logic lives here.  Import this module
// anywhere you need to talk to Firebase services (auth, database, etc.).
// You can either hard‑code the config (shown below) or, preferably, keep it
// in environment variables and load them via `import.meta.env`.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";

// Replace the values below with your own Firebase project configuration.
// For security, store these in a `.env` file and reference with VITE_* vars.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDyrtvObg0m9unSdksjJtX55A_YO2azucI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "digiprohub-1a2d5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "digiprohub-1a2d5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "digiprohub-1a2d5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1095730350443",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1095730350443:web:eda81f8a655530f32de42e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E16D7SW54W",
};

// initialize the app once
const app = initializeApp(firebaseConfig);

// export the services you need elsewhere in the app
export const auth = getAuth(app);
export const db = getFirestore(app);

// analytics is optional and only available in supported browsers
export const analytics = analyticsSupported().then(supported => (supported ? getAnalytics(app) : null));
