import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove } from "firebase/database";

// ✅ Make sure databaseURL is correctly set
const firebaseConfig = {
  apiKey: "AIzaSyBGWFrXteigpLyIfiba73lYuX2AkwfrIu4",
  authDomain: "mindslot-bb616.firebaseapp.com",
  databaseURL: "https://mindslot-bb616-default-rtdb.firebaseio.com/", // ✅ Ensure this is set correctly
  projectId: "mindslot-bb616",
  storageBucket: "mindslot-bb616.appspot.com",
  messagingSenderId: "952281983210",
  appId: "1:952281983210:web:498bac3e73fc9884438f93",
  measurementId: "G-NNPKP303ST",
};

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
