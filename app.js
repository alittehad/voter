<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Voter Management Panel</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root{--bg:#eef2ff;--card:#fff}
  body{background:var(--bg);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}
  .container{max-width:1100px;margin:24px auto;padding:12px;}
  /* 3D heading */
  .heading {
    font-size:clamp(1.6rem,3vw,2.2rem);
    font-weight:800;
    text-align:center;
    margin-bottom:18px;
    color:#0f172a;
    transform: perspective(500px) rotateX(8deg);
    text-shadow:
      0 1px 0 rgba(255,255,255,0.5),
      0 6px 12px rgba(2,6,23,0.12),
      0 18px 36px rgba(2,6,23,0.10);
    letter-spacing:0.6px;
  }
  .subhead{ text-align:center;color:#334155;margin-bottom:18px;font-weight:600;}
  .card{background:var(--card);border-radius:12px;padding:12px;margin-bottom:12px;box-shadow:6px 6px 18px rgba(2,6,23,0.06);}
  .img-sender{width:56px;height:56px;border-radius:999px;object-fit:cover;margin-right:8px}
  .btn {cursor:pointer;padding:8px 12px;border-radius:8px;font-weight:600}
  .btn-blue{background:#2563eb;color:white}
  .btn-green{background:#16a34a;color:white}
  .btn-yellow{background:#facc15;color:#111}
  .btn-red{background:#dc2626;color:white}
  .btn-gray{background:#6b7280;color:white}
  .table-container{overflow:auto}
  table{width:100%;border-collapse:collapse;min-width:900px;background:white;border-radius:6px;overflow:hidden}
  th,td{padding:8px;border:1px solid #e6e9ef;text-align:left;white-space:nowrap}
  thead tr{background:#ebf8ff;font-weight:700}
  tr:hover{background:#f7f9ff}
  .card-approved{background:#dcfce7}
  .card-opponent{background:#fef9c3}
  .card-anti{background:#fee2e2}
  .badge{display:inline-block;padding:4px 8px;border-radius:8px;font-weight:700}
  .actions button{margin-right:6px}
  /* responsive */
  @media (max-width:900px){ table{min-width:700px} }
</style>
</head>
<body>
  <div class="container">
    <h1 class="heading">Voter Management Panel</h1>
    <p class="subhead">Search, view, send WhatsApp & manage voters — with fixed sender image preview</p>

    <!-- Login -->
    <div id="loginDiv" class="card text-center">
      <h2 class="text-xl font-bold text-blue-700">Login to Access Voter Panel</h2>
      <button id="googleLoginBtn" class="btn btn-blue mt-4">Login with Google</button>
    </div>

    <!-- Panel -->
    <div id="panelDiv" class="hidden">

      <!-- top controls -->
      <div class="card flex gap-4 items-center">
        <div style="flex:1">
          <input id="searchVoter" placeholder="Search by Name, EPIC, Part No, House No, Mobile..." class="w-full border p-2 rounded" />
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div style="display:flex;align-items:center;">
            <!-- Show fixed sender image -->
            <img id="fixedSenderImg" class="img-sender" src="https://i.ibb.co/LhDpnZFn/khatik-imase.jpg" alt="Sender">
          </div>
          <div style="width:320px">
            <textarea id="senderDesc" placeholder="Sender Description (this will be sent above voter info)" class="w-full border p-2 rounded" rows="2"></textarea>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div id="voterList" class="mt-4 table-container card"></div>

      <!-- Add Voter -->
      <div class="card mt-4">
        <h3 class="text-lg font-bold text-blue-700 mb-2">Add Voter Manually</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input id="voterName" placeholder="Name" class="border p-2 rounded" />
          <input id="voterEPIC" placeholder="EPIC" class="border p-2 rounded" />
          <input id="voterSerial" placeholder="Serial No (optional)" class="border p-2 rounded" />
          <select id="relationType" class="border p-2 rounded">
            <option value="">Relation Type</option><option value="Father">Father</option><option value="Husband">Husband</option>
          </select>
          <input id="relationName" placeholder="Father/Husband Name" class="border p-2 rounded" />
          <input id="voterGender" placeholder="Gender" class="border p-2 rounded" />
          <input id="houseNo" placeholder="House No / Building" class="border p-2 rounded" />
          <input id="roomNo" placeholder="Room No (Polling Room)" class="border p-2 rounded" />
          <input id="voterAge" placeholder="Age" class="border p-2 rounded" />
          <input id="voterAddress" placeholder="Address (Street / Mohalla / Village)" class="border p-2 rounded" />
          <input id="voterPO" placeholder="Post Office" class="border p-2 rounded" />
          <input id="voterPS" placeholder="Police Station" class="border p-2 rounded" />
          <input id="voterState" placeholder="State" class="border p-2 rounded" />
          <input id="voterDistrict" placeholder="District" class="border p-2 rounded" />
          <input id="voterAC" placeholder="AC No" class="border p-2 rounded" />
          <input id="voterPart" placeholder="Part No" class="border p-2 rounded" />
          <input id="voterBooth" placeholder="Booth No / Location" class="border p-2 rounded" />
          <input id="pollingAddress" placeholder="Polling Address (Govt School...)" class="border p-2 rounded" />
          <input id="voterSection" placeholder="Section No (optional)" class="border p-2 rounded" />
          <input id="voterMobile" placeholder="Mobile" class="border p-2 rounded" />
        </div>
        <div class="mt-3">
          <button id="addVoterManual" class="btn btn-green w-full">Add Voter</button>
        </div>
      </div>

    </div>
  </div>

<script type="module">
/* ============================
   Full JS: Firebase + UI
   ============================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref as dbRef, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ---------- Firebase config (your config) ---------- */
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
const db = getDatabase(app);

/* ---------- UI refs ---------- */
const loginDiv = document.getElementById("loginDiv");
const panelDiv = document.getElementById("panelDiv");
const loginBtn = document.getElementById("googleLoginBtn");
const voterListDiv = document.getElementById("voterList");
const searchInput = document.getElementById("searchVoter");
const senderDescEl = document.getElementById("senderDesc");

/* Fixed sender image URL (public) */
const FIXED_SENDER_IMAGE = "https://i.ibb.co/LhDpnZFn/khatik-imase.jpg";

/* ---------- Auth ---------- */
loginBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then(res => {
      // allow only specific emails (same logic as before)
      const emailKey = res.user.email.replace(/\./g,'_');
      const admins = ["ngogrant454@gmail_com"];
      const users = ["zarafix3@gmail_com"];
      if(!(admins.includes(emailKey) || users.includes(emailKey))){
        alert("Access Denied");
        auth.signOut();
      }
    })
    .catch(err => { console.error(err); alert("Login failed: "+err.message); });
};

onAuthStateChanged(auth, user => {
  if(user){
    // toggle UI
    loginDiv.classList.add("hidden");
    panelDiv.classList.remove("hidden");
    loadVoters();
  } else {
    loginDiv.classList.remove("hidden");
    panelDiv.classList.add("hidden");
  }
});

/* ---------- Data ---------- */
let voterData = []; // cache

function loadVoters(){
  const r = dbRef(db, "voters");
  onValue(r, snap => {
    voterData = [];
    snap.forEach(child => voterData.push({ id: child.key, ...child.val() }));
    renderTable(voterData);
  });
}

/* ---------- Helpers ---------- */
function updateRowColorClass(tr, status){
  tr.classList.remove("card-approved","card-opponent","card-anti");
  if(status==="approved") tr.classList.add("card-approved");
  else if(status==="opponent") tr.classList.add("card-opponent");
  else tr.classList.add("card-anti");
}

/* ---------- Render Table ---------- */
function renderTable(list){
  // build table HTML
  let html = `<table><thead><tr>
    <th>Name</th><th>EPIC</th><th>Relation</th><th>House No</th><th>Polling Address</th><th>Room No</th><th>Part No</th><th>Booth</th><th>Age</th><th>Mobile</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody></tbody></table>`;
  voterListDiv.innerHTML = html;
  const tbody = voterListDiv.querySelector("tbody");
  list.forEach(v => {
    const relationDisplay = (v.fatherName && v.fatherName.trim()) ? `Father: ${v.fatherName}` : (v.husbandName && v.husbandName.trim() ? `Husband: ${v.husbandName}` : (v.relationType && v.relationName ? `${v.relationType}: ${v.relationName}` : ''));
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${v.name||''}</td>
      <td>${(v.voterID||v.epic||'')}</td>
      <td>${relationDisplay}</td>
      <td>${v.houseNo||''}</td>
      <td>${v.pollingAddress||''}</td>
      <td>${v.roomNo||''}</td>
      <td>${v.partNo||v.part||''}</td>
      <td>${v.booth||''}</td>
      <td>${v.age||''}</td>
      <td>${v.mobile||''}</td>
      <td>${v.status||''}</td>
      <td class="actions">
        <button class="btn btn-blue viewBtn">View</button>
        <button class="btn btn-gray editBtn">Edit</button>
        <button class="btn btn-red deleteBtn">Delete</button>
      </td>`;
    // color classes
    updateRowColorClass(tr, v.status);
    tbody.appendChild(tr);

    // events
    tr.querySelector(".viewBtn").onclick = ()=> showVoterDetail(v, tr);
    tr.querySelector(".deleteBtn").onclick = ()=> {
      if(confirm(`Delete ${v.name||'this voter'}?`)){
        remove(dbRef(db, "voters/" + v.id));
        // tr.remove(); // onValue will update
        const card = document.getElementById("voterDetailCard");
        if(card) card.remove();
      }
    };
    tr.querySelector(".editBtn").onclick = ()=> {
      // quick edit: populate add form for convenience
      document.getElementById("voterName").value = v.name||'';
      document.getElementById("voterEPIC").value = (v.voterID||v.epic||'');
      document.getElementById("voterSerial").value = v.serial||'';
      document.getElementById("relationType").value = v.relationType||'';
      document.getElementById("relationName").value = v.relationName||v.fatherName||v.husbandName||'';
      document.getElementById("voterGender").value = v.gender||'';
      document.getElementById("houseNo").value = v.houseNo||'';
      document.getElementById("roomNo").value = v.roomNo||'';
      document.getElementById("voterAge").value = v.age||'';
      document.getElementById("voterAddress").value = v.address||'';
      document.getElementById("voterPO").value = v.po||'';
      document.getElementById("voterPS").value = v.ps||'';
      document.getElementById("voterState").value = v.state||'';
      document.getElementById("voterDistrict").value = v.district||'';
      document.getElementById("voterAC").value = v.acNo||v.ac||'';
      document.getElementById("voterPart").value = v.partNo||v.part||'';
      document.getElementById("voterBooth").value = v.booth||'';
      document.getElementById("pollingAddress").value = v.pollingAddress||'';
      document.getElementById("voterSection").value = v.section||'';
      document.getElementById("voterMobile").value = v.mobile||'';
      window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'});
    };
  });
}

/* ---------- Show Detail Card (View) ---------- */
function showVoterDetail(v, tr){
  const existing = document.getElementById("voterDetailCard");
  if(existing) existing.remove();

  const div = document.createElement("div");
  div.id = "voterDetailCard";
  div.className = "card";
  const relationLine = (v.fatherName && v.fatherName.trim()) ? `Father: ${v.fatherName}` : ((v.husbandName && v.husbandName.trim()) ? `Husband: ${v.husbandName}` : (v.relationType && v.relationName ? `${v.relationType}: ${v.relationName}` : ''));

  div.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center">
        <img src="${FIXED_SENDER_IMAGE}" class="img-sender">
        <div>
          <h3 style="margin:0;font-weight:800">${v.name||''}</h3>
          <div style="color:#475569;font-size:13px">${relationLine} • EPIC: ${v.voterID||v.epic||''}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="margin-bottom:8px">${v.status === 'approved' ? '<span class=\"badge\" style=\"background:#dcfce7\">Approved</span>' : v.status === 'opponent' ? '<span class=\"badge\" style=\"background:#fef9c3\">Opponent</span>' : '<span class=\"badge\" style=\"background:#fee2e2\">Anti</span>'}</div>
        <button id="closeDetailBtn" class="btn btn-red">Close</button>
      </div>
    </div>

    <div style="margin-top:10px">
      <p style="margin:2px 0"><strong>Address:</strong> ${v.address||''}</p>
      <p style="margin:2px 0"><strong>House:</strong> ${v.houseNo||''} ${v.roomNo ? '| Room:' + v.roomNo : ''}</p>
      <p style="margin:2px 0"><strong>Polling:</strong> ${v.pollingAddress||''} | <strong>Booth:</strong> ${v.booth||''}</p>
      <p style="margin:2px 0"><strong>Part:</strong> ${v.partNo||v.part||''} | <strong>AC:</strong> ${v.acNo||v.ac||''}</p>
      <p style="margin:2px 0"><strong>Age:</strong> ${v.age||''} | <strong>Mobile:</strong> ${v.mobile||''}</p>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-yellow approveBtn">Approve</button>
      <button class="btn btn-yellow opponentBtn">Opponent</button>
      <button class="btn btn-red antiBtn">Anti</button>
      <button class="btn btn-gray deleteBtn">Delete</button>
      <button class="btn btn-blue sendBtn">Send WhatsApp</button>
      <button class="btn btn-green printBtn">Print</button>
    </div>
  `;

  voterListDiv.prepend(div);

  // Close
  div.querySelector("#closeDetailBtn").onclick = ()=> div.remove();

  // Update status
  function updateStatus(newStatus){
    set(dbRef(db, "voters/" + v.id), {...v, status:newStatus});
    // updateRowColorClass(tr,newStatus); // onValue will update table
  }
  div.querySelector(".approveBtn").onclick = ()=> updateStatus("approved");
  div.querySelector(".opponentBtn").onclick = ()=> updateStatus("opponent");
  div.querySelector(".antiBtn").onclick = ()=> updateStatus("anti");

  // Delete
  div.querySelector(".deleteBtn").onclick = ()=> {
    if(confirm("Delete this voter?")){
      remove(dbRef(db, "voters/" + v.id));
      div.remove();
    }
  };

  // Print
  div.querySelector(".printBtn").onclick = ()=> {
    let html = `<div style="font-family:Arial,Helvetica,sans-serif;padding:12px">`;
    html += `<img src="${FIXED_SENDER_IMAGE}" style="width:60px;height:60px;border-radius:50%;float:right;margin-left:8px">`;
    html += `<h2 style="margin-top:0">${v.name||''}</h2>`;
    html += `<p><b>${relationLine||''}</b></p>`;
    html += `<p>EPIC: ${v.voterID||v.epic||''} | Serial: ${v.serial||''}</p>`;
    html += `<p>House: ${v.houseNo||''} ${v.roomNo ? '| Room: '+v.roomNo : ''}</p>`;
    html += `<p>Polling Address: ${v.pollingAddress||''}</p>`;
    html += `<p>Address: ${v.address||''} ${v.po ? ', PO:'+v.po : ''} ${v.ps ? ', PS:'+v.ps : ''}</p>`;
    html += `<p>AC: ${v.acNo||v.ac||''} | Part: ${v.partNo||v.part||''} | Booth: ${v.booth||''}</p>`;
    html += `<hr><p>Mobile: ${v.mobile||''}</p></div>`;
    const w = window.open();
    w.document.write(html);
    w.print();
    w.close();
  };

  // Send WhatsApp (with senderDesc + fixed image URL)
  div.querySelector(".sendBtn").onclick = ()=> {
    const senderDesc = senderDescEl.value.trim();
    const rel = relationLine ? relationLine + " | " : "";
    let message = "";
    if(senderDesc) message += senderDesc + "\n\n";
    message += `Voter Details\nName: ${v.name||''}\n${rel}EPIC: ${v.voterID||v.epic||''}\nHouse: ${v.houseNo||''}\nAddress: ${v.address||''}\nPart: ${v.partNo||v.part||''} | Booth: ${v.booth||''}\nPolling Address: ${v.pollingAddress||''}\nRoom No: ${v.roomNo||''}\nMobile: ${v.mobile||''}\n\nImage: ${FIXED_SENDER_IMAGE}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };
}

/* ---------- Search live ---------- */
document.getElementById("searchVoter").addEventListener("input", (e)=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q) renderTable(voterData);
  else renderTable(voterData.filter(v=>{
    const combined = `${v.name||''} ${(v.voterID||v.epic||'')} ${v.partNo||v.part||''} ${v.houseNo||''} ${v.mobile||''} ${v.pollingAddress||''}`.toLowerCase();
    return combined.includes(q);
  }));
});

/* ---------- Add Voter ---------- */
document.getElementById("addVoterManual").onclick = ()=>{
  const name = document.getElementById("voterName").value.trim();
  const epic = document.getElementById("voterEPIC").value.trim();
  if(!name || !epic) return alert("Name & EPIC required!");

  const payload = {
    name,
    voterID: epic,
    epic,
    serial: document.getElementById("voterSerial").value.trim(),
    relationType: document.getElementById("relationType").value,
    relationName: document.getElementById("relationName").value.trim(),
    fatherName: '',
    husbandName: '',
    gender: document.getElementById("voterGender").value.trim(),
    houseNo: document.getElementById("houseNo").value.trim(),
    roomNo: document.getElementById("roomNo").value.trim(),
    age: document.getElementById("voterAge").value.trim(),
    address: document.getElementById("voterAddress").value.trim(),
    po: document.getElementById("voterPO").value.trim(),
    ps: document.getElementById("voterPS").value.trim(),
    state: document.getElementById("voterState").value.trim(),
    district: document.getElementById("voterDistrict").value.trim(),
    acNo: document.getElementById("voterAC").value.trim(),
    partNo: document.getElementById("voterPart").value.trim(),
    part: document.getElementById("voterPart").value.trim(),
    booth: document.getElementById("voterBooth").value.trim(),
    pollingAddress: document.getElementById("pollingAddress").value.trim(),
    section: document.getElementById("voterSection").value.trim(),
    mobile: document.getElementById("voterMobile").value.trim(),
    status: "anti",
    createdAt: Date.now()
  };

  // map relation
  const rType = payload.relationType;
  const rName = payload.relationName;
  if(rType==="Father") payload.fatherName = rName;
  else if(rType==="Husband") payload.husbandName = rName;
  else if(rName) payload.fatherName = rName;

  push(dbRef(db,"voters"), payload).then(()=>{
    alert("Voter added!");
    // clear inputs
    const ids = ["voterName","voterEPIC","voterSerial","relationType","relationName","voterGender","houseNo","roomNo","voterAge","voterAddress","voterPO","voterPS","voterState","voterDistrict","voterAC","voterPart","voterBooth","pollingAddress","voterSection","voterMobile"];
    ids.forEach(id=>{ const el = document.getElementById(id); if(el) el.value=''; });
  }).catch(err=>{ console.error(err); alert("Error saving voter"); });
};

</script>
</body>
</html>
