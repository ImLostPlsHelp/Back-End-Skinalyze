import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import CONFIG from './config.js';
import { getFirestore, doc, setDoc, collection, query, where,} from "firebase/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firebaseConfig = {
  apiKey: CONFIG.API_KEY,
  authDomain: CONFIG.DOMAIN,
  projectId: CONFIG.PROJECTID,
  appId: CONFIG.APPID,
};

const app = initializeApp(firebaseConfig);
const authUser = getAuth(app);
const dbUser = getFirestore(app);
const auth = admin.auth();
const db = admin.firestore();

export { auth, db, getAuth, signInWithEmailAndPassword, authUser, dbUser, app, getFirestore , collection, doc, setDoc, query, where};