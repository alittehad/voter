import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref as dbRef, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdjqVFKOQ1dtaXCGFUUtsJWbFdGNTo-xw",
  authDomain: "voter-25c94.firebaseapp.com",
  databaseURL: "https://voter-25c94-default-rtdb.firebaseio.com",
  projectId: "voter-25c94",
  storageBucket: "voter-25c94.appspot.com",
  messagingSenderId: "297773534400",
  appId: "1:297773534400:web:3722c487b8c83e9b787125"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginDiv = document.getElementById("loginDiv");
const panelDiv = document.getElementById("panelDiv");

// LOGIN BUTTON FIX
document.getElementById("googleLoginBtn").onclick = () => {
  signInWithPopup(auth, provider)
    .then(res => {
      let emailKey = res.user.email.replace(/\./g, "_");

      const admins = ["ngogrant454@gmail_com"];
      const users  = ["zarafix3@gmail_com"];

      if (admins.includes(emailKey) || users.includes(emailKey)) {
        alert("Welcome " + res.user.displayName);
      } else {
        alert("Access Denied!");
        auth.signOut();
      }
    })
    .catch(err => {
      console.error(err);
      alert("Login Failed!");
    });
};

// LISTEN LOGIN STATE
auth.onAuthStateChanged(user => {
  if (user) {
    let emailKey = user.email.replace(/\./g, "_");

    const admins = ["ngogrant454@gmail_com"];
    const users  = ["zarafix3@gmail_com"];

    if (admins.includes(emailKey) || users.includes(emailKey)) {
      loginDiv.classList.add("hidden");
      panelDiv.classList.remove("hidden");
    } else {
      auth.signOut();
    }
  } else {
    loginDiv.classList.remove("hidden");
    panelDiv.classList.add("hidden");
  }
});
