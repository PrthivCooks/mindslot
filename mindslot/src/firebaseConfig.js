import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove } from "firebase/database";

// ✅ Make sure databaseURL is correctly set


// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Services AFTER App Initialization
const auth = getAuth(app);
const rtdb = getDatabase(app); // ✅ Using only Realtime Database

// ✅ Export Firebase services
export {
  auth,
  rtdb,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  ref,
  set,
  get,
  update,
  remove
};
