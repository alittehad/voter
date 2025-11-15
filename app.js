const provider = new firebase.auth.GoogleAuthProvider();
let currentUser;

// Panels show/hide
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
function showMemberPanel() { 
  document.getElementById("memberPanel").classList.remove("hidden"); 
}

// Login
function login() {
  firebase.auth().signInWithPopup(provider).then(result => {
    currentUser = result.user;

    document.getElementById("loginDiv").classList.add("hidden");
    document.getElementById("mainDiv").classList.remove("hidden");

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

// Import voters from Google Sheet CSV
function importVotersFromSheet() {
  const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9fannLfFx7OH9_l8kmBEktXiJ_kzPQxA0uUmO8SoPV0tgYFUAfuCdanjWYlVQAg/pub?output=csv";
  Papa.parse(sheetCsvUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results){
      results.data.forEach(row=>{
        const epic = row["EPIC"]?.trim();
        const name = row["Name"]?.trim();
        const acNo = row["AC No"]?.trim();
        const partNo = row["Part No"]?.trim();
        const state = row["State"]?.trim();
        const district = row["District"]?.trim();

        if(epic && name){
          firebase.database().ref("voters/"+epic).set({
            name: name,
            voterID: epic,
            ward: acNo,
            partNo: partNo,
            state: state,
            district: district,
            status:"none"
          });
        }
      });
      alert("Voters Imported Successfully!");
      loadVotersAdmin();
    }
  });
}

// Load Voters for Admin
function loadVotersAdmin() {
  const db = firebase.database().ref("voters");
  db.once("value", snapshot=>{
    const voters = snapshot.val();
    let html = `<table class="table-auto border-collapse border border-gray-300 w-full">
      <tr class="bg-gray-200"><th>Name</th><th>EPIC</th><th>Ward</th></tr>`;
    for(let key in voters){
      const v = voters[key];
      html += `<tr class="border border-gray-300">
        <td>${v.name}</td><td>${v.voterID}</td><td>${v.ward}</td>
      </tr>`;
    }
    html += `</table>`;
    document.getElementById("voterListAdmin").innerHTML = html;
  });
}

// Load Voters for User
function loadVotersUser() {
  const db = firebase.database().ref("voters");
  db.once("value", snapshot=>{
    const voters = snapshot.val();
    let html = `<table class="table-auto border-collapse border border-gray-300 w-full">
      <tr class="bg-gray-200"><th>Name</th><th>EPIC</th><th>Ward</th></tr>`;
    for(let key in voters){
      const v = voters[key];
      html += `<tr class="border border-gray-300 ${v.status}">
        <td>${v.name}</td><td>${v.voterID}</td><td>${v.ward}</td>
      </tr>`;
    }
    html += `</table>`;
    document.getElementById("voterListUser").innerHTML = html;
  });
}

// Setup Search
function setupSearch(){
  const input = document.getElementById("searchInput");
  input.addEventListener("keyup", ()=>{
    const filter = input.value.toUpperCase();
    const rows = document.querySelectorAll("#voterListUser tr");
    rows.forEach((row,i)=>{
      if(i===0) return; // skip header
      const nameCell = row.cells[0].textContent.toUpperCase();
      row.style.display = nameCell.indexOf(filter)>-1 ? "" : "none";
    });
  });
}

// Member Survey Submit
document.getElementById("surveyForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const mobile = document.getElementById("memberMobile").value;
  const ward = document.getElementById("memberWard").value;
  const posterFile = document.getElementById("memberPoster").files[0];

  if(!posterFile){ alert("Upload poster"); return; }

  const reader = new FileReader();
  reader.onload = function(){
    const dataUrl = reader.result;
    const surveyRef = firebase.database().ref("memberSurveys").push();
    surveyRef.set({
      name, mobile, ward, poster:dataUrl, submittedBy: currentUser.email
    });
    alert("Survey Submitted!");
    document.getElementById("surveyForm").reset();
  };
  reader.readAsDataURL(posterFile);
});

// Load Member Surveys (Admin)
function loadMemberSurveys(){
  const db = firebase.database().ref("memberSurveys");
  db.once("value", snapshot=>{
    const surveys = snapshot.val();
    let html = `<table class="table-auto border-collapse border border-gray-300 w-full">
      <tr class="bg-gray-200"><th>Name</th><th>Mobile</th><th>Ward</th><th>Submitted By</th></tr>`;
    for(let key in surveys){
      const s = surveys[key];
      html += `<tr class="border border-gray-300">
        <td>${s.name}</td><td>${s.mobile}</td><td>${s.ward}</td><td>${s.submittedBy}</td>
      </tr>`;
    }
    html += `</table>`;
    document.getElementById("memberSurveys").innerHTML = html;
  });
}
