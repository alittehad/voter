// ----------------------------
// Firebase Init
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getDatabase, 
    ref, 
    set, 
    push, 
    onValue 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getDatabase();

// ----------------------------
// UI Elements
// ----------------------------
const loginDiv = document.getElementById("loginDiv");
const panelDiv = document.getElementById("panelDiv");
const loginBtn = document.getElementById("googleLoginBtn");
const voterListDiv = document.getElementById("voterList");
const searchInput = document.getElementById("searchVoter");


// ----------------------------
// LOGIN
// ----------------------------
loginBtn.onclick = () => {
    signInWithPopup(auth, provider)
    .then(() => console.log("Login Success"))
    .catch(err => alert("Login Failed: " + err.message));
};


// ----------------------------
// Auto Login (Refresh par Logout Nahi Hoga)
// ----------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginDiv.classList.add("hidden");
        panelDiv.classList.remove("hidden");
        loadVoters();
    } else {
        panelDiv.classList.add("hidden");
        loginDiv.classList.remove("hidden");
    }
});


// ----------------------------
// LOAD VOTERS
// ----------------------------
let voterData = [];

function loadVoters() {
    const dbRef = ref(db, "voters");

    onValue(dbRef, (snapshot) => {
        voterData = [];

        snapshot.forEach(child => {
            voterData.push({ id: child.key, ...child.val() });
        });

        displayVoters(voterData);
    });
}


// ----------------------------
// DISPLAY TABLE
// ----------------------------
function displayVoters(list) {
    let html = `
        <table class="table-auto w-full border text-sm">
            <thead class="bg-blue-100">
                <tr>
                    <th class="border p-2">Name</th>
                    <th class="border p-2">EPIC</th>
                    <th class="border p-2">Relation</th>
                    <th class="border p-2">House</th>
                    <th class="border p-2">Booth</th>
                    <th class="border p-2">Polling Address</th>
                    <th class="border p-2">Room No</th>
                    <th class="border p-2">Mobile</th>
                    <th class="border p-2">Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    list.forEach(v => {
        const rel = v.relationType && v.relationName ? `${v.relationType}: ${v.relationName}` : "";

        html += `
            <tr>
                <td class="border p-2">${v.name || ''}</td>
                <td class="border p-2">${v.epic || ''}</td>
                <td class="border p-2">${rel}</td>
                <td class="border p-2">${v.houseNo || ''}</td>
                <td class="border p-2">${v.booth || ''}</td>
                <td class="border p-2">${v.pollingAddress || ''}</td>
                <td class="border p-2">${v.roomNo || ''}</td>
                <td class="border p-2">${v.mobile || ''}</td>

                <td class="border p-2">
                    <button class="sendBtn bg-green-600 text-white px-2 py-1 rounded"
                        data-id="${v.id}">
                        Send
                    </button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";

    voterListDiv.innerHTML = html;

    attachSendEvents();
}


// ----------------------------
// SEARCH SYSTEM
// ----------------------------
searchInput.addEventListener("input", () => {
    let q = searchInput.value.toLowerCase();

    const filtered = voterData.filter(v =>
        (v.name || '').toLowerCase().includes(q) ||
        (v.epic || '').toLowerCase().includes(q) ||
        (v.part || '').toLowerCase().includes(q) ||
        (v.mobile || '').toLowerCase().includes(q) ||
        (v.houseNo || '').toLowerCase().includes(q)
    );

    displayVoters(filtered);
});


// ----------------------------
// FIXED IMAGE URL (WhatsApp Preview Guaranteed)
// ----------------------------
const FIXED_SENDER_IMAGE = "https://i.ibb.co/LhDpnZXN/khatik-imase.jpg";


// ----------------------------
// SEND WHATSAPP
// ----------------------------
function attachSendEvents() {
    document.querySelectorAll(".sendBtn").forEach(btn => {
        btn.onclick = () => {
            let id = btn.getAttribute("data-id");
            let v = voterData.find(x => x.id === id);

            if (!v) return;

            const relationLine = v.relationType && v.relationName 
                ? `${v.relationType}: ${v.relationName}` 
                : "";

            let msg = document.getElementById("senderDesc").value.trim();
            if (msg) msg += "\n\n";

            msg += 
`Name: ${v.name}
${relationLine}
EPIC: ${v.epic}
House: ${v.houseNo}
Address: ${v.address}
Part: ${v.part}
Booth: ${v.booth}
Polling Address: ${v.pollingAddress}
Room No: ${v.roomNo}

Image: ${FIXED_SENDER_IMAGE}

(Preview automatically dikhega)`;

            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        };
    });
}


// ----------------------------
// ADD VOTER MANUALLY
// ----------------------------
document.getElementById("addVoterManual").onclick = () => {

    let data = {
        name: voterName.value,
        epic: voterEPIC.value,
        serial: voterSerial.value,
        relationType: relationType.value,
        relationName: relationName.value,
        gender: voterGender.value,
        houseNo: houseNo.value,
        roomNo: roomNo.value,
        age: voterAge.value,
        address: voterAddress.value,
        po: voterPO.value,
        ps: voterPS.value,
        state: voterState.value,
        district: voterDistrict.value,
        ac: voterAC.value,
        part: voterPart.value,
        booth: voterBooth.value,
        pollingAddress: pollingAddress.value,
        section: voterSection.value,
        mobile: voterMobile.value,
    };

    push(ref(db, "voters"), data);

    alert("Voter Added!");

    document.querySelectorAll("input").forEach(x => x.value = "");
    relationType.value = "";
};
