import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Firebase configuration - using public/non-sensitive values only
// API keys are intentionally public for client-side Firebase SDKs
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAX3fD47iA2W-t1DqiJDyhYC8X67H16L2k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'darb-61805.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'darb-61805',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'darb-61805.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '384626052024',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:384626052024:web:b445b3e0d4390fb422dd4d'
};

// Initialize Firebase
let app;
let auth;
let googleProvider;
let facebookProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Initialize social providers
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
}

export { app, auth, googleProvider, facebookProvider };
