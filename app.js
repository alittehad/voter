// Existing login, firebase config and panels remain same

// Admin Dashboard Stats
function loadAdminDashboard() {
  const voterRef = firebase.database().ref("voters");
  const surveyRef = firebase.database().ref("memberSurveys");

  voterRef.once("value", snap=>{
    const voters = snap.val() || {};
    let total = 0, confirmed=0, pending=0, opposed=0;
    for(let k in voters){
      total++;
      if(voters[k].status==="confirmed") confirmed++;
      else if(voters[k].status==="pending") pending++;
      else if(voters[k].status==="opposed") opposed++;
    }

    surveyRef.once("value", sSnap=>{
      const surveys = sSnap.val() || {};
      let memberCount = {};
      for(let k in surveys){
        let member = surveys[k].submittedBy;
        memberCount[member] = (memberCount[member] || 0) + 1;
      }

      const statsHTML = `
        <h2 class="mt-4 font-bold">Dashboard</h2>
        <div>Total Voters: ${total}</div>
        <div>Confirmed: ${confirmed}, Pending: ${pending}, Opposed: ${opposed}</div>
        <h3 class="mt-2 font-semibold">Member Survey Counts:</h3>
        <ul>
          ${Object.keys(memberCount).map(m=>`<li>${m} → ${memberCount[m]}</li>`).join("")}
        </ul>
      `;
      document.getElementById("adminPanel").insertAdjacentHTML("afterbegin", statsHTML);
    });
  });
}

// Member survey submission with poster
document.getElementById("surveyForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const mobile = document.getElementById("memberMobile").value;
  const ward = document.getElementById("memberWard").value;
  const posterFile = document.getElementById("memberPoster").files[0];
  if(!posterFile){ alert("Upload poster"); return; }

  const reader = new FileReader();
  reader.onload = function(){
    const posterData = reader.result;
    const surveyRef = firebase.database().ref("memberSurveys").push();
    surveyRef.set({
      name, mobile, ward, poster: posterData,
      submittedBy: currentUser.email,
      timestamp: Date.now()
    });
    alert("Survey Submitted!");
    document.getElementById("surveyForm").reset();
    loadMemberSurveys();
    loadAdminDashboard();
  };
  reader.readAsDataURL(posterFile);
});

// WhatsApp Share with Poster
function shareVoter(epic){
  firebase.database().ref("voters/"+epic).once("value").then(snapshot=>{
    const v = snapshot.val();
    // Find last member who submitted for this voter (optional)
    firebase.database().ref("memberSurveys").orderByChild("ward").equalTo(v.ward).limitToLast(1).once("value").then(msnap=>{
      let memberName="", poster="";
      msnap.forEach(m=>{
        memberName = m.val().name;
        poster = m.val().poster;
      });
      let msg = `Voter Info:\nName: ${v.name}\nEPIC: ${v.voterID}\nWard: ${v.ward}\nShared by: ${memberName}`;
      if(poster){
        // For WhatsApp, images cannot be preloaded in web link. Use text + instruct user to attach poster manually
        msg += `\n[Poster uploaded by ${memberName}, attach manually if needed]`;
      }
      const waLink = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(waLink,"_blank");
    });
  });
}

// Load dashboard initially for admin
if(admins.includes(currentUser?.email)){
  loadAdminDashboard();
}
