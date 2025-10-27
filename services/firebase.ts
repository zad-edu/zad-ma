import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration should be set as environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// A robust check to ensure all required environment variables are present.
export const isFirebaseConfigured = 
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.appId;

// Initialize Firebase only if the configuration is valid
// The 'db' export can be null if configuration is missing.
let db: Firestore | null = null;
if (isFirebaseConfigured) {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } catch (e) {
        console.error("Firebase initialization failed despite config being present:", e);
        // db remains null, app will run in local mode.
    }
}

// Export db which might be null. The app logic must handle this.
export { db };
