import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeKkyuK50sQASz4h7_M72vYqsEYsDSiIw",
  authDomain: "mediprechecks.firebaseapp.com",
  databaseURL: "https://mediprechecks-default-rtdb.firebaseio.com",
  projectId: "mediprechecks",
  storageBucket: "mediprechecks.firebasestorage.app",
  messagingSenderId: "844295634275",
  appId: "1:844295634275:web:fef61d5eedeb19fe6da756",
  measurementId: "G-XS5967GQXZ"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
