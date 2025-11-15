// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCdjqVFKOQ1dtaXCGFUUtsJWbFdGNTo-xw",
  authDomain: "voter-25c94.firebaseapp.com",
  databaseURL: "https://voter-25c94-default-rtdb.firebaseio.com",
  projectId: "voter-25c94",
  storageBucket: "voter-25c94.appspot.com",
  messagingSenderId: "297773534400",
  appId: "1:297773534400:web:3722c487b8c83e9b787125"
};
firebase.initializeApp(firebaseConfig);

// --- Login ---
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const emailKey = user.email.replace(/\./g, "_");

      // Check role from database
      firebase.database().ref("users/" + emailKey).once("value")
        .then(snapshot => {
          if(snapshot.exists()){
            const role = snapshot.val().role;
            document.getElementById("loginDiv").style.display = "none";
            document.getElementById("mainDiv").style.display = "block";

            if(role === "admin") showAdminPanel();
            else if(role === "member") showMemberPanel();
            else showUserPanel();
          } else {
            alert("You are not authorized!");
          }
        });
    })
    .catch(err => {
      console.error(err);
      alert("Login failed!");
    });
}

// --- Panels ---
function showAdminPanel(){
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("memberPanel").style.display = "block";
}

function showMemberPanel(){
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("memberPanel").style.display = "block";
}

function showUserPanel(){
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("memberPanel").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
}

// --- Add User / Member ---
document.getElementById("addUserForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const role = document.getElementById("newUserRole").value;

  const usersRef = firebase.database().ref("users");
  const safeEmail = email.replace(/\./g,"_");

  usersRef.child(safeEmail).set({
    name: name,
    email: email,
    role: role
  }, err => {
    if(err) alert(err);
    else alert(name + " added as " + role);
    document.getElementById("addUserForm").reset();
  });
});

// --- Import Voters ---
function importVotersFromSheet(){
  const url = document.getElementById("sheetCSV").value;
  if(!url){ alert("Enter CSV URL"); return; }

  Papa.parse(url, {
    download: true,
    header: true,
    complete: function(results){
      const data = results.data;
      const ref = firebase.database().ref("voters");

      data.forEach(row => {
        const keyRaw = row.EPIC || row.voterID || row["EPIC"];
        if(!keyRaw) return;
        const safeKey = keyRaw.replace(/\./g, "_")
                              .replace(/\$/g, "_")
                              .replace(/#/g, "_")
                              .replace(/\[/g, "_")
                              .replace(/\]/g, "_")
                              .replace(/\//g, "_");
        ref.child(safeKey).set({
          name: row.Name || row.name,
          voterID: keyRaw,
          ward: row.Ward || row.ward,
          status: "pending"
        });
      });

      alert("Voters imported successfully!");
      loadVoters();
    }
  });
}

// --- Load Voters ---
function loadVoters(){
  const ref = firebase.database().ref("voters");
  const userList = document.getElementById("voterListUser");
  const adminList = document.getElementById("voterListAdmin");
  userList.innerHTML = "";
  adminList.innerHTML = "";

  ref.on("value", snapshot => {
    snapshot.forEach(snap => {
      const voter = snap.val();
      const div = document.createElement("div");
      div.className = "border p-1 my-1";
      div.innerHTML = `<b>${voter.name}</b> | EPIC: ${voter.voterID} | Ward: ${voter.ward} | Status: ${voter.status}`;
      userList.appendChild(div);

      const divAdmin = div.cloneNode(true);
      adminList.appendChild(divAdmin);
    });
  });
}

// --- Search ---
document.getElementById("searchInput").addEventListener("input", function(){
  const val = this.value.toLowerCase();
  const items = document.getElementById("voterListUser").children;
  Array.from(items).forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(val) ? "block" : "none";
  });
});

// --- Member Survey Form ---
document.getElementById("surveyForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const mobile = document.getElementById("memberMobile").value;
  const ward = document.getElementById("memberWard").value;
  const poster = document.getElementById("memberPoster").files[0];

  if(!poster) return alert("Upload poster");

  // Upload poster to ImgBB or Firebase Storage here (placeholder)
  const posterURL = "https://i.ibb.co/placeholder.png"; // replace with actual upload logic

  const surveysRef = firebase.database().ref("memberSurveys");
  surveysRef.push({
    name, mobile, ward, poster: posterURL, timestamp: Date.now()
  }, err => {
    if(err) alert(err);
    else alert("Survey submitted!");
    document.getElementById("surveyForm").reset();
  });
});

// --- Initial Load ---
loadVoters();
