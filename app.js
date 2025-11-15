// --- Admin Screen Image ---
function setAdminScreenImage() {
  const file = document.getElementById("adminScreenImage").files[0];
  if (!file) return alert("Select an image first!");
  const reader = new FileReader();
  reader.onload = function (e) {
    showFullImage(e.target.result);
    alert("Admin image set!");
  };
  reader.readAsDataURL(file);
}

function showFullImage(src) {
  const fullDiv = document.getElementById("fullscreenImg");
  const img = document.getElementById("fullImg");
  img.src = src;
  fullDiv.style.display = "flex";
}

// --- Login ---
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;
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
          }
        });
    }).catch(err => { console.error(err); alert("Login failed!"); });
}

// --- Panels ---
function showAdminPanel() {
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("memberPanel").style.display = "block";
  document.getElementById("adminImageUploadDiv").style.display = "flex";
}
function showMemberPanel() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("memberPanel").style.display = "block";
  document.getElementById("adminImageUploadDiv").style.display = "none";
}
function showUserPanel() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("memberPanel").style.display = "none";
  document.getElementById("userPanel").style.display = "block";
  document.getElementById("adminImageUploadDiv").style.display = "none";
}

// --- Add User / Member ---
document.getElementById("addUserForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const role = document.getElementById("newUserRole").value;

  const usersRef = firebase.database().ref("users");
  const safeEmail = email.replace(/\./g, "_");

  usersRef.child(safeEmail).set({ name, email, role }, err => {
    if (err) alert(err); else alert(name + " added as " + role);
    document.getElementById("addUserForm").reset();
  });
});

// --- Import Voters ---
function importVotersFromSheet() {
  const url = document.getElementById("sheetCSV").value;
  if (!url) { alert("Enter CSV URL"); return; }

  Papa.parse(url, {
    download: true, header: true,
    complete: function (results) {
      const data = results.data;
      const ref = firebase.database().ref("voters");

      data.forEach(row => {
        const keyRaw = row.EPIC || row.voterID || row["EPIC"];
        if (!keyRaw) return;
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

// --- Load Voters & Color Coding ---
function loadVoters() {
  const ref = firebase.database().ref("voters");
  const userList = document.getElementById("voterListUser");
  const adminList = document.getElementById("voterListAdmin");
  userList.innerHTML = "";
  adminList.innerHTML = "";

  ref.on("value", snapshot => {
    snapshot.forEach(snap => {
      const voter = snap.val();
      let bg = "";
      if (voter.status === "approved") bg = "bg-green-200";
      else if (voter.status === "pending") bg = "bg-yellow-200";
      else if (voter.status === "opponent") bg = "bg-red-200";

      const div = document.createElement("div");
      div.className = `border p-1 my-1 flex justify-between items-center ${bg}`;
      const voterInfo = `<span><b>${voter.name}</b> | EPIC: ${voter.voterID} | Ward: ${voter.ward} | Status: ${voter.status}</span>`;

      const waBtn = document.createElement("button");
      waBtn.innerText = "Share WhatsApp";
      waBtn.className = "btn-3d ml-2";
      waBtn.onclick = () => {
        const msg = encodeURIComponent(`Voter: ${voter.name}\nEPIC: ${voter.voterID}\nWard: ${voter.ward}\nStatus: ${voter.status}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
      };

      div.innerHTML = voterInfo;
      div.appendChild(waBtn);
      userList.appendChild(div);

      // Admin panel copy
      const divAdmin = div.cloneNode(true);
      adminList.appendChild(divAdmin);
    });
  });
}

// --- Search ---
document.getElementById("searchInput").addEventListener("input", function () {
  const val = this.value.toLowerCase();
  const items = document.getElementById("voterListUser").children;
  Array.from(items).forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(val) ? "flex" : "none";
  });
});

// --- Member Survey with ImgBB ---
document.getElementById("surveyForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const mobile = document.getElementById("memberMobile").value;
  const ward = document.getElementById("memberWard").value;
  const poster = document.getElementById("memberPoster").files[0];
  if (!poster) return alert("Upload poster");

  const formData = new FormData();
  formData.append("image", poster);
  const imgbbKey = "8ece3c1f959f2426083eee1699086c71";

  fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      const posterURL = data.data.display_url;
      const surveysRef = firebase.database().ref("memberSurveys");
      surveysRef.push({ name, mobile, ward, poster: posterURL, timestamp: Date.now() }, err => {
        if (err) alert(err);
        else alert("Survey submitted!");
        document.getElementById("surveyForm").reset();
        loadMemberCounts();
      });
    }).catch(err => { console.error(err); alert("Poster upload failed"); });
});

// --- Member Count ---
function loadMemberCounts() {
  const ref = firebase.database().ref("memberSurveys");
  const countDiv = document.getElementById("memberCount");
  countDiv.innerHTML = "";
  const counts = {};

  ref.once("value").then(snapshot => {
    snapshot.forEach(snap => {
      const mem = snap.val().name;
      counts[mem] = (counts[mem] || 0) + 1;
    });

    for (let mem in counts) {
      const d = document.createElement("div");
      d.innerText = mem + " -> " + counts[mem] + " surveys";
      countDiv.appendChild(d);
    }
  });
}

// --- Initial Load ---
loadVoters();
loadMemberCounts();
