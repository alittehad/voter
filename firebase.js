import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLCUAiPz-sqhFDskG9g9AwyUI1RdTQWfk",
  authDomain: "zaracrimefiles.firebaseapp.com",
  databaseURL: "https://zaracrimefiles-default-rtdb.firebaseio.com",
  projectId: "zaracrimefiles",
  storageBucket: "zaracrimefiles.appspot.com",
  messagingSenderId: "957627078663",
  appId: "1:957627078663:web:546f6a8c77b91f72c35ccc"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getDatabase(app);
