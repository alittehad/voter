// ==============================
// FIREBASE CONFIG
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdjqVFKOQ1dtaXCGFUUtsJWbFdGNTo-xw",
  authDomain: "voter-25c94.firebaseapp.com",
  databaseURL: "https://voter-25c94-default-rtdb.firebaseio.com",
  projectId: "voter-25c94",
  storageBucket: "voter-25c94.firebasestorage.app",
  messagingSenderId: "297773534400",
  appId: "1:297773534400:web:3722c487b8c83e9b787125"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==============================
// UI ELEMENTS
// ==============================
const loginDiv = document.getElementById("loginDiv");
const panelDiv = document.getElementById("panelDiv");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const searchInput = document.getElementById("searchVoter");
const voterListDiv = document.getElementById("voterList");

// Sender fields
const senderDesc = document.getElementById("senderDesc");
const senderImageInput = document.getElementById("senderImage");
const senderImgPreview = document.getElementById("senderImgPreview");

// Base64 sender image
let senderImageURL = "";

// ==============================
// GOOGLE LOGIN
// ==============================
googleLoginBtn.onclick = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    loginDiv.classList.add("hidden");
    panelDiv.classList.remove("hidden");

    loadVoters();

  } catch (err) {
    alert("Login Failed: " + err.message);
  }
};

// ==============================
// SENDER IMAGE BASE64 CONVERT
// ==============================
senderImageInput.addEventListener("change", () => {
  const file = senderImageInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    senderImageURL = e.target.result;
    senderImgPreview.src = senderImageURL;
    senderImgPreview.classList.remove("hidden");
  };

  reader.readAsDataURL(file);
});

// ==============================
// FETCH & RENDER VOTERS
// ==============================
let allVoters = [];

async function loadVoters() {
  allVoters = [];
  voterListDiv.innerHTML = "Loading...";

  const querySnapshot = await getDocs(collection(db, "voters"));
  querySnapshot.forEach((doc) => {
    allVoters.push({ id: doc.id, ...doc.data() });
  });

  renderVoterList(allVoters);
}

// ==============================
// SEARCH
// ==============================
searchInput.addEventListener("keyup", () => {
  const q = searchInput.value.toLowerCase();

  const filtered = allVoters.filter(v =>
    (v.name || "").toLowerCase().includes(q) ||
    (v.voterID || "").toLowerCase().includes(q) ||
    (v.partNo || "").toLowerCase().includes(q) ||
    (v.houseNo || "").toLowerCase().includes(q) ||
    (v.mobile || "").toLowerCase().includes(q)
  );

  renderVoterList(filtered);
});

// ==============================
// RENDER TABLE
// ==============================
function renderVoterList(list) {
  let html = `
    <table class="w-full border text-sm">
      <thead class="bg-blue-100 font-bold">
        <tr>
          <th class="border p-2">Part</th>
          <th class="border p-2">EPIC</th>
          <th class="border p-2">Name</th>
          <th class="border p-2">Father/Husband</th>
          <th class="border p-2">House</th>
          <th class="border p-2">Room</th>
          <th class="border p-2">Polling Address</th>
          <th class="border p-2">Mobile</th>
          <th class="border p-2">Send</th>
        </tr>
      </thead>
      <tbody>
  `;

  list.forEach(v => {
    const relationLine = v.relationType ? `${v.relationType}: ${v.relationName}` : "";

    html += `
      <tr class="border">
        <td class="border p-2">${v.partNo || ""}</td>
        <td class="border p-2">${v.voterID || ""}</td>
        <td class="border p-2">${v.name || ""}</td>
        <td class="border p-2">${relationLine}</td>
        <td class="border p-2">${v.houseNo || ""}</td>
        <td class="border p-2">${v.roomNo || ""}</td>
        <td class="border p-2">${v.pollingAddress || ""}</td>
        <td class="border p-2">${v.mobile || ""}</td>

        <td class="border p-2">
          <button class="sendBtn bg-green-500 text-white px-3 py-1 rounded"
            data-id="${v.id}">
            Send
          </button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";

  voterListDiv.innerHTML = html;

  attachSendButtons(list);
}

// ==============================
// SEND WHATSAPP
// ==============================
function attachSendButtons(list) {
  document.querySelectorAll(".sendBtn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const v = list.find(x => x.id === id);

      const relationLine = v.relationType ? `${v.relationType}: ${v.relationName}` : "";

      let msg = senderDesc.value.trim();
      if (msg) msg += "\n\n";

      msg += `${v.name || ''}\n${relationLine}\nEPIC: ${v.voterID}\nHouse: ${v.houseNo}${v.roomNo ? ' / Room: ' + v.roomNo : ''}\nAddress: ${v.address}\nPart: ${v.partNo} | Booth: ${v.booth}\nPolling Address: ${v.pollingAddress}`;

      if (senderImageURL) {
        msg += "\n\nSender Image:\n" + senderImageURL;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    };
  });
}

// ==============================
// ADD VOTER MANUALLY
// ==============================
document.getElementById("addVoterManual").onclick = async () => {
  const v = {
    name: voterName.value.trim(),
    voterID: voterEPIC.value.trim(),
    serial: voterSerial.value.trim(),
    relationType: relationType.value,
    relationName: relationName.value.trim(),

    gender: voterGender.value,
    houseNo: houseNo.value.trim(),
    roomNo: roomNo.value.trim(),
    age: voterAge.value.trim(),

    address: voterAddress.value,
    po: voterPO.value,
    ps: voterPS.value,

    state: voterState.value,
    district: voterDistrict.value,
    acNo: voterAC.value,

    partNo: voterPart.value,
    booth: voterBooth.value,
    pollingAddress: pollingAddress.value,

    section: voterSection.value,
    mobile: voterMobile.value,
  };

  await addDoc(collection(db, "voters"), v);
  alert("Voter Added!");
  loadVoters();
};
