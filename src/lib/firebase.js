import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDry0kEHGwSTGiEIEeTT0Hy12QeOlK3XVc",
  authDomain: "mediprecheck-94e70.firebaseapp.com",
  databaseURL: "https://mediprecheck-94e70-default-rtdb.firebaseio.com",
  projectId: "mediprecheck-94e70",
  storageBucket: "mediprecheck-94e70.firebasestorage.app",
  messagingSenderId: "687846162011",
  appId: "1:687846162011:web:7f757a693a51d4b293097e"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
