// imgBB API Key
const imgbbKey = "8ece3c1f959f2426083eee1699086c71";

// Multiple admins
const admins = ["ngogrant454@gmail.com"];

const provider = new firebase.auth.GoogleAuthProvider();
let currentUser;

// Login
function login() {
  auth.signInWithPopup(provider).then(result => {
    currentUser = result.user;
    document.getElementById("loginDiv").classList.add("hidden");
    document.getElementById("mainDiv").classList.remove("hidden");

    if(admins.includes(currentUser.email)){
      showAdminPanel();
    } else {
      showUserPanel();
      showMemberPanel();
    }
  });
}

// Panels
function showAdminPanel() { 
  document.getElementById("adminPanel").classList.remove("hidden"); 
  loadVotersAdmin(); 
  loadMemberSurveys(); 
}
function showUserPanel() { 
  document.getElementById("userPanel").classList.remove("hidden"); 
  loadVotersUser(); 
  setupSearch();
}
function showMemberPanel() { document.getElementById("memberPanel").classList.remove("hidden"); }

// CSV Import from Google Sheet
const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9fannLfFx7OH9_l8kmBEktXiJ_kzPQxA0uUmO8SoPV0tgYFUAfuCdanjWYlVQAg/pub?output=csv";

function importVotersFromSheet(){
  Papa.parse(sheetCsvUrl, {
    download: true,
    header: true,
    complete: function(results){
      results.data.forEach(row=>{
        if(row.EPIC && row.Name){
          db.ref("voters/"+row.EPIC).set({
            name: row.Name,
            voterID: row.EPIC,
            ward: row["AC No"] || "",
            partNo: row["Part No"] || "",
            state: row.State || "",
            district: row.District || "",
            status:"none"
          });
        }
      });
      alert("Voters Imported Successfully!");
    }
  });
}

// Admin: Load Voter List
function loadVotersAdmin(){
  db.ref("voters").on("value", snapshot=>{
    const voters = snapshot.val();
    let html = "<table class='table-auto border border-collapse w-full'><tr><th class='border p-1'>Name</th><th class='border p-1'>EPIC</th><th class='border p-1'>Ward</th></tr>";
    for(let key in voters){
      html+=`<tr><td class='border p-1'>${voters[key].name}</td><td class='border p-1'>${voters[key].voterID}</td><td class='border p-1'>${voters[key].ward}</td></tr>`;
    }
    html+="</table>";
    document.getElementById("voterListAdmin").innerHTML = html;
  });
}

// Admin: Load Member Surveys with Count
function loadMemberSurveys(){
  db.ref("surveys").on("value", snapshot=>{
    const surveys = snapshot.val() || {};
    let html="";
    for(let uid in surveys){
      const memberData = surveys[uid];
      const count = Object.keys(memberData).length;
      html+=`<div class='border p-2 m-1'>Member: ${memberData[Object.keys(memberData)[0]].name} - Surveys: ${count}</div>`;
    }
    document.getElementById("memberSurveys").innerHTML = html;
  });
}

// User: Voter List
let allVoters = {};
function loadVotersUser(){
  db.ref("voters").on("value", snapshot=>{
    allVoters = snapshot.val() || {};
    renderVoters(allVoters);
  });
}

function renderVoters(voters){
  let html="";
  for(let key in voters){
    let color = "lightgray";
    if(voters[key].status=="green") color="lightgreen";
    else if(voters[key].status=="yellow") color="yellow";
    else if(voters[key].status=="red") color="red";

    html+=`<div class='p-2 m-1 border rounded flex justify-between items-center' style='background-color:${color}'>
      <span>${voters[key].name} - ${voters[key].voterID} - ${voters[key].ward}</span>
      <div>
        <button onclick="updateStatus('${key}','green')">✅</button>
        <button onclick="updateStatus('${key}','yellow')">⚠️</button>
        <button onclick="updateStatus('${key}','red')">❌</button>
        <button onclick="shareVoter('${key}')">📤</button>
      </div>
    </div>`;
  }
  document.getElementById("voterListUser").innerHTML = html;
}

// Update Status
function updateStatus(voterID,status){ db.ref("voters/"+voterID).update({status}); }

// WhatsApp Share
function shareVoter(voterID){
  db.ref("voters/"+voterID).once("value", vSnap=>{
    const voter = vSnap.val();
    db.ref("users/"+currentUser.uid).once("value", uSnap=>{
      const user = uSnap.val() || {name:currentUser.displayName, party:"Unknown", mobile:""};
      const posterText = user.posterURL ? `Poster: ${user.posterURL}` : "";
      const msg = `👋 Namaste,
Main *${user.name}* 
*${user.party}* se hun.

Voter: ${voter.name}
EPIC: ${voter.voterID}
Ward: ${voter.ward}

Kripya support karein 🙏

📞 ${user.mobile}

${posterText}`;
      const link = "https://wa.me/?text="+encodeURIComponent(msg);
      window.open(link);
    });
  });
}

// Member Survey Form
document.getElementById("surveyForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const mobile = document.getElementById("memberMobile").value;
  const ward = document.getElementById("memberWard").value;
  const posterFile = document.getElementById("memberPoster").files[0];

  const formData = new FormData();
  formData.append("image", posterFile);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {method:"POST", body:formData});
    const imgData = await res.json();
    const posterURL = imgData.data.display_url;

    db.ref("users/"+currentUser.uid).set({name, mobile, ward, posterURL});
    db.ref("surveys/"+currentUser.uid).push({name, mobile, ward, posterURL});
    alert("Survey submitted!");
    document.getElementById("surveyForm").reset();
  } catch(err) {
    alert("Error uploading poster: "+err.message);
  }
});

// Search
function setupSearch(){
  document.getElementById("searchInput").addEventListener("input", e=>{
    const query = e.target.value.toLowerCase();
    const filtered = {};
    for(let key in allVoters){
      if(allVoters[key].name.toLowerCase().includes(query)){
        filtered[key] = allVoters[key];
      }
    }
    renderVoters(filtered);
  });
}
