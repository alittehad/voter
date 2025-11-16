// --- Login ---
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).catch(err => alert("Login failed"));
}

// --- Auth State Listener ---
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    document.getElementById("loginDiv").classList.remove("hidden");
    document.getElementById("mainDiv").classList.add("hidden");
    return;
  }

  document.getElementById("loginDiv").classList.add("hidden");
  document.getElementById("mainDiv").classList.remove("hidden");

  const emailKey = user.email.replace(/\./g, "_");

  firebase.database().ref("users/" + emailKey).once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        alert("Not Authorized!");
        firebase.auth().signOut();
        return;
      }

      const role = snapshot.val().role;

      if (role === "admin") showAdminPanel();
      else if (role === "member") showMemberPanel();
      else showUserPanel();
    });

  loadHomeImage();
});

// --- Panels ---
function showAdminPanel() {
  adminPanel.style.display = "block";
  adminImagePanel.style.display = "block";
  userPanel.style.display = "block";
  memberPanel.style.display = "block";
}
function showMemberPanel() {
  adminPanel.style.display = "none";
  adminImagePanel.style.display = "none";
  userPanel.style.display = "block";
  memberPanel.style.display = "block";
}
function showUserPanel() {
  adminPanel.style.display = "none";
  adminImagePanel.style.display = "none";
  memberPanel.style.display = "none";
  userPanel.style.display = "block";
}

// --- Upload Home Image (Admin Only) ---
function uploadHomeImage() {
  const file = document.getElementById("homeImage").files[0];
  if (!file) return alert("Select image");

  const reader = new FileReader();
  reader.onload = function () {
    firebase.database().ref("homeImage").set(reader.result, err => {
      if (err) alert(err);
      else loadHomeImage();
    });
  };
  reader.readAsDataURL(file);
}

function loadHomeImage() {
  firebase.database().ref("homeImage").once("value").then(snap => {
    if (snap.exists()) {
      document.getElementById("homeScreenImage").src = snap.val();
    }
  });
}

// --- Add User ---
document.getElementById("addUserForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = newUserName.value;
  const email = newUserEmail.value;
  const role = newUserRole.value;

  const safe = email.replace(/\./g, "_");
  firebase.database().ref("users/" + safe).set({ name, email, role });

  alert("User Added");
  addUserForm.reset();
});

// --- Import CSV ---
function importVotersFromSheet() {
  const url = sheetCSV.value;
  if (!url) return alert("Enter CSV URL");

  Papa.parse(url, {
    download: true,
    header: true,
    complete: function (results) {
      const ref = firebase.database().ref("voters");

      results.data.forEach(row => {
        if (!row.EPIC) return;

        const key = row.EPIC.replace(/[.#$/\[\]]/g, "_");

        ref.child(key).set({
          name: row.Name,
          voterID: row.EPIC,
          ward: row.Ward,
          status: "pending"
        });
      });

      alert("Imported");
      loadVoters();
    }
  });
}

// --- Load Voters ---
function loadVoters() {
  const ref = firebase.database().ref("voters");
  voterListUser.innerHTML = "";
  voterListAdmin.innerHTML = "";

  ref.on("value", snap => {
    voterListUser.innerHTML = "";
    voterListAdmin.innerHTML = "";

    snap.forEach(s => {
      const v = s.val();

      let bg = "bg-yellow-200";
      if (v.status === "approved") bg = "bg-green-200";
      if (v.status === "opponent") bg = "bg-red-200";

      const div = document.createElement("div");
      div.className = `p-2 border rounded my-1 flex justify-between ${bg}`;
      div.innerHTML = `
        <span><b>${v.name}</b> | EPIC: ${v.voterID} | Ward: ${v.ward} | Status: ${v.status}</span>
      `;

      const w = document.createElement("button");
      w.innerText = "Share WhatsApp";
      w.className = "btn-3d ml-2";
      w.onclick = () => {
        const msg = encodeURIComponent(`Voter: ${v.name}\nEPIC: ${v.voterID}\nWard: ${v.ward}\nStatus: ${v.status}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      };

      div.appendChild(w);
      voterListUser.appendChild(div);

      voterListAdmin.appendChild(div.cloneNode(true));
    });
  });
}

// --- Search ---
searchInput.addEventListener("input", function () {
  const val = this.value.toLowerCase();
  [...voterListUser.children].forEach(div => {
    div.style.display = div.innerText.toLowerCase().includes(val) ? "" : "none";
  });
});

// --- Member Survey ---
surveyForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = memberName.value;
  const mobile = memberMobile.value;
  const ward = memberWard.value;
  const poster = memberPoster.files[0];

  if (!poster) return alert("Upload poster");

  const fd = new FormData();
  fd.append("image", poster);

  const key = "8ece3c1f959f2426083eee1699086c71";

  fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: fd
  })
    .then(r => r.json())
    .then(d => {
      firebase.database().ref("memberSurveys").push({
        name, mobile, ward,
        poster: d.data.display_url
      });

      alert("Survey Submitted");
      surveyForm.reset();
      loadMemberCounts();
    });
});

function loadMemberCounts() {
  const ref = firebase.database().ref("memberSurveys");
  memberCount.innerHTML = "";
  const count = {};

  ref.once("value").then(s => {
    s.forEach(r => {
      const n = r.val().name;
      count[n] = (count[n] || 0) + 1;
    });

    for (let n in count) {
      const div = document.createElement("div");
      div.innerText = `${n} → ${count[n]} surveys`;
      memberCount.appendChild(div);
    }
  });
}
