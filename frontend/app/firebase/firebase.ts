// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPv6j0ZhMizpotbFGg_qFfmj676oEk8zo",
  authDomain: "tripgen-2301e.firebaseapp.com",
  projectId: "tripgen-2301e",
  storageBucket: "tripgen-2301e.firebasestorage.app",
  messagingSenderId: "321790330163",
  appId: "1:321790330163:web:95033fbcb59b760af66a46",
  measurementId: "G-15XKCFX9BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}
  
/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export function getTripGenFunctions() {
    return getFunctions(app, "us-west1");
}