// imgBB API Key
const imgbbKey = "8ece3c1f959f2426083eee1699086c71";

const provider = new firebase.auth.GoogleAuthProvider();
let currentUser;

// Login
function login() {
  auth.signInWithPopup(provider).then(result => {
    currentUser = result.user;
    document.getElementById("loginDiv").classList.add("hidden");
    document.getElementById("mainDiv").classList.remove("hidden");

    if(currentUser.email === "ngogrant454@gmail.com"){
      showAdminPanel();
    } else {
      showUserPanel();
      showMemberPanel();
    }
  });
}

// Show Panels
function showAdminPanel() { document.getElementById("adminPanel").classList.remove("hidden"); loadVotersAdmin(); loadMemberSurveys(); }
function showUserPanel() { document.getElementById("userPanel").classList.remove("hidden"); loadVotersUser(); }
function showMemberPanel() { document.getElementById("memberPanel").classList.remove("hidden"); }

// Google Sheet CSV Import
const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9fannLfFx7OH9_l8kmBEktXiJ_kzPQxA0uUmO8SoPV0tgYFUAfuCdanjWYlVQAg/pub?output=csv";

async function importVotersFromSheet(){
  const res = await fetch(sheetCsvUrl);
  const csvText = await res.text();
  const rows = csvText.split("\n").slice(1);
  rows.forEach(row=>{
    const [state,district,acNo,partNo,epic,name] = row.split(",");
    db.ref("voters/"+epic).set({name, voterID:epic, ward:acNo, partNo, state, district, status:"none"});
  });
  alert("Voters Imported Successfully!");
}

// Admin: Load Voter List
function loadVotersAdmin(){
  db.ref("voters").on("value", snapshot=>{
    const voters = snapshot.val();
    let html = "<table class='table-auto border'><tr><th>Name</th><th>EPIC</th><th>Ward</th></tr>";
    for(let key in voters){
      html+=`<tr><td>${voters[key].name}</td><td>${voters[key].voterID}</td><td>${voters[key].ward}</td></tr>`;
    }
    html+="</table>";
    document.getElementById("voterListAdmin").innerHTML = html;
  });
}

// User: Load Voter List
function loadVotersUser(){
  db.ref("voters").on("value", snapshot=>{
    const voters = snapshot.val();
    let html="";
    for(let key in voters){
      let color = "gray";
      if(voters[key].status=="green") color="green";
      else if(voters[key].status=="yellow") color="yellow";
      else if(voters[key].status=="red") color="red";

      html+=`<div class='p-2 m-1 border' style='background-color:${color}'>
        ${voters[key].name} - ${voters[key].voterID} - ${voters[key].ward}
        <button onclick="updateStatus('${key}','green')">✅</button>
        <button onclick="updateStatus('${key}','yellow')">⚠️</button>
        <button onclick="updateStatus('${key}','red')">❌</button>
        <button onclick="shareVoter('${key}')">📤 Share</button>
      </div>`;
    }
    document.getElementById("voterListUser").innerHTML = html;
  });
}

// Update Status
function updateStatus(voterID,status){ db.ref("voters/"+voterID).update({status}); }

// WhatsApp Share
function shareVoter(voterID){
  db.ref("voters/"+voterID).once("value", vSnap=>{
    const voter = vSnap.val();
    db.ref("users/"+currentUser.uid).once("value", uSnap=>{
      const user = uSnap.val() || {name:currentUser.displayName, party:"Unknown", mobile:""};
      const msg = `👋 Namaste,

Main *${user.name}* 
*${user.party}* se hun.

Voter: ${voter.name}
EPIC: ${voter.voterID}
Ward: ${voter.ward}

Kripya support karein 🙏

📞 ${user.mobile}

Poster: ${user.posterURL || ''}`;
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

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {method:"POST", body:formData});
  const imgData = await res.json();
  const posterURL = imgData.data.display_url;

  db.ref("users/"+currentUser.uid).set({name, mobile, ward, posterURL});
  db.ref("surveys/"+currentUser.uid).push({name, mobile, ward, posterURL});
  alert("Survey submitted!");
  document.getElementById("surveyForm").reset();
});
