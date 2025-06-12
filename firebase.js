import admin from 'firebase-admin';
// Hapus impor langsung dari file JSON
// import serviceAccount from './serviceAccountKey.json' with { type: 'json' };
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import CONFIG from './config.js'; // Pastikan CONFIG juga diatur melalui env vars jika perlu di Render
import { getFirestore, doc, setDoc, collection, query, where } from "firebase/firestore";

// Ambil service account dari environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let serviceAccount;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY from environment variable:", e);
    // Handle error, mungkin keluar atau menggunakan fallback jika ada
    process.exit(1); // Keluar jika service account tidak bisa di-parse
  }
} else {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  // Handle error
  process.exit(1); // Keluar jika service account tidak diset
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Gunakan objek yang sudah di-parse
  });
}

const firebaseConfig = {
  apiKey: process.env.API_KEY || CONFIG.API_KEY, // Prioritaskan env var
  authDomain: process.env.DOMAIN || CONFIG.DOMAIN,
  projectId: process.env.PROJECTID || CONFIG.PROJECTID,
  appId: process.env.APPID || CONFIG.APPID,
};

const app = initializeApp(firebaseConfig);
const authUser = getAuth(app);
const dbUser = getFirestore(app);
const auth = admin.auth();
const db = admin.firestore();

export { auth, db, getAuth, signInWithEmailAndPassword, authUser, dbUser, app, getFirestore, collection, doc, setDoc, query, where };