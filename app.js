const provider = new firebase.auth.GoogleAuthProvider();
let currentUser;

function login() {
  firebase.auth().signInWithPopup(provider).then(result => {
    currentUser = result.user;

    // ✅ Hide login button div
    document.getElementById("loginDiv").style.display = "none";

    // ✅ Show main app
    document.getElementById("mainDiv").style.display = "block";

    // Check if admin
    const admins = ["ngogrant454@gmail.com"];
    if(admins.includes(currentUser.email)){
      showAdminPanel();
    } else {
      showUserPanel();
      showMemberPanel();
    }
  }).catch(err => {
    alert("Login Error: " + err.message);
  });
}
