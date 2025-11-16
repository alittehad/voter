// ----------------------------
//  AUTH STATE LISTENER (VERY IMPORTANT)
// ----------------------------
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const emailKey = user.email.replace(/\./g, "_");

    firebase.database().ref("users/" + emailKey).once("value")
      .then(snapshot => {
        if (snapshot.exists()) {
          const role = snapshot.val().role;

          document.getElementById("loginDiv").style.display = "none";
          document.getElementById("mainDiv").style.display = "block";

          if (role === "admin") showAdminPanel();
          else if (role === "member") showMemberPanel();
          else showUserPanel();

        } else {
          alert("You are not authorized!");
          firebase.auth().signOut();
        }
      });

  } else {
    document.getElementById("loginDiv").style.display = "flex";
    document.getElementById("mainDiv").style.display = "none";
  }
});


// ----------------------------
//  LOGIN FUNCTION
// ----------------------------
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .catch(err => { console.error(err); alert("Login failed!"); });
}


// ----------------------------
//  SHOW PANELS
// ----------------------------
function showAdminPanel() {
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("memberPanel").style.display = "block";
}
function showMemberPanel() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("memberPanel").style.display = "block";
}
function showUserPanel() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("memberPanel").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
}


// ----------------------------
//  ADD USER / MEMBER
// ----------------------------
document.getElementById("addUserForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const role = document.getElementById("newUserRole").value;

  const safeEmail = email.replace(/\./g, "_");

  firebase.database().ref("users/" + safeEmail)
    .set({ name, email, role }, err => {
      if (err) alert(err);
      else alert(name + " added as " + role);

      document.getElementById("addUserForm").reset();
    });
});


// ----------------------------
//  IMPORT VOTERS
// ----------------------------
function importVotersFromSheet() {
  const url = document.getElementById("sheetCSV").value;
  if (!url) return alert("Enter CSV URL");

  Papa.parse(url, {
    download: true,
    header: true,
    complete: function (results) {
      const ref = firebase.database().ref("voters");

      results.data.forEach(row => {
        const key = row.EPIC || row.voterID || row["EPIC"];
        if (!key) return;

        const safeKey = key.replace(/[.$#[\]/]/g, "_");

        ref.child(safeKey).set({
          name: row.Name || row.name,
          voterID: key,
          ward: row.Ward || row.ward,
          status: "pending"
        });
      });

      alert("Voters imported!");
      loadVoters();
    }
  });
}


// ----------------------------
//  LOAD VOTERS WITH COLOR
// ----------------------------
function loadVoters() {
  const ref = firebase.database().ref("voters");
  const userList = document.getElementById("voterListUser");
  const adminList = document.getElementById("voterListAdmin");

  ref.on("value", snapshot => {
    userList.innerHTML = "";
    adminList.innerHTML = "";

    snapshot.forEach(snap => {
      const v = snap.val();

      let bg = "";
      if (v.status === "approved") bg = "bg-green-200";
      else if (v.status === "pending") bg = "bg-yellow-200";
      else if (v.status === "opponent") bg = "bg-red-200";

      const card = document.createElement("div");
      card.className = `border p-1 my-1 flex justify-between items-center ${bg}`;
      card.innerHTML =
        `<span><b>${v.name}</b> | EPIC: ${v.voterID} | Ward: ${v.ward} | Status: ${v.status}</span>`;

      const wa = document.createElement("button");
      wa.innerText = "WhatsApp";
      wa.className = "bg-green-500 text-white p-1 rounded ml-2";
      wa.onclick = () => {
        const msg = encodeURIComponent(
          `Voter: ${v.name}\nEPIC: ${v.voterID}\nWard: ${v.ward}\nStatus: ${v.status}`
        );
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      };

      card.appendChild(wa);
      userList.appendChild(card);

      // Copy for admin panel
      adminList.appendChild(card.cloneNode(true));
    });
  });
}


// ----------------------------
//  SEARCH FILTER
// ----------------------------
document.getElementById("searchInput").addEventListener("input", function () {
  const val = this.value.toLowerCase();
  const items = document.getElementById("voterListUser").children;

  Array.from(items).forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(val) ? "flex" : "none";
  });
});


// ----------------------------
//  MEMBER SURVEY (ImgBB Upload)
// ----------------------------
document.getElementById("surveyForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("memberName").value;
  const mobile = document.getElementById("memberMobile").value;
  const ward = document.getElementById("memberWard").value;
  const file = document.getElementById("memberPoster").files[0];

  if (!file) return alert("Upload poster");

  const formData = new FormData();
  formData.append("image", file);

  const imgbbKey = "8ece3c1f959f2426083eee1699086c71";

  fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      const posterURL = data.data.display_url;

      firebase.database().ref("memberSurveys").push({
        name, mobile, ward,
        poster: posterURL,
        timestamp: Date.now()
      });

      alert("Survey submitted!");
      document.getElementById("surveyForm").reset();
      loadMemberCounts();
    })
    .catch(() => alert("Upload failed"));
});


// ----------------------------
//  MEMBER SURVEY COUNTS
// ----------------------------
function loadMemberCounts() {
  const ref = firebase.database().ref("memberSurveys");
  const div = document.getElementById("memberCount");
  div.innerHTML = "";

  ref.once("value").then(snapshot => {
    const counts = {};

    snapshot.forEach(s => {
      const n = s.val().name;
      counts[n] = (counts[n] || 0) + 1;
    });

    for (let n in counts) {
      const d = document.createElement("div");
      d.innerText = `${n} → ${counts[n]} surveys`;
      div.appendChild(d);
    }
  });
}


// ----------------------------
//  INITIAL LOAD CALLS
// ----------------------------
loadVoters();
loadMemberCounts();
