// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { setupFirebaseAuthMiddleware } from '@/middleware/firebaseAuth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAHcVYLECm8TQfR63dTwDc-vQ8V48xjsp0',
  authDomain: 'jaivier-ec0c1.firebaseapp.com',
  projectId: 'jaivier-ec0c1',
  storageBucket: 'jaivier-ec0c1.firebasestorage.app',
  messagingSenderId: '687977714678',
  appId: '1:687977714678:web:33c4e1c975abae85d52dd7',
  measurementId: 'G-Q56ZLFN8X5',
};

// Initialize Firebase if it hasn't been initialized
let firebaseApp;
let analytics;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);

  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    // Check if analytics is supported before initializing
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(firebaseApp);
      }
    });

    // Setup auth middleware for API requests
    setupFirebaseAuthMiddleware();
  }
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase Authentication
const auth = getAuth(firebaseApp);

export { firebaseApp, auth, analytics };
