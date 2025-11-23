// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Admin emails
const ADMINS = ["ngogrant454@gmail.com","zarafix3@gmail.com"];
let isAdminUser = false;
let currentVoterId = null;

// Login
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  if (ADMINS.includes(user.email)) isAdminUser = true;
  document.getElementById("loginDiv").style.display = "none";
  if(isAdminUser) document.getElementById("adminPanel").style.display = "block";
  loadVoters();
});

// Load voters table
async function loadVoters() {
  const tbody = document.querySelector("#voterTable tbody");
  tbody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "voters"));
  snapshot.forEach(docSnap => {
    const v = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${v.name}</td>
      <td class="border px-2 py-1">${v.EPIC}</td>
      <td class="border px-2 py-1">${v.booth}</td>
      <td class="border px-2 py-1">
        <a href="voter.html?id=${docSnap.id}" class="bg-blue-500 px-2 py-1 text-white rounded">View</a>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Manual add voter
document.getElementById("voterForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = document.getElementById("name").value;
  const epic = document.getElementById("epic").value;
  const booth = document.getElementById("booth").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  await setDoc(doc(db, "voters", epic), {name, EPIC:epic, booth, phone, address, images:[]});
  alert("Voter added!");
  document.getElementById("voterForm").reset();
});

// Extra Images
async function uploadImageToImgBB(file, voterId){
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=5735107daf1af173af2008a3899a2496`, {method:"POST", body: formData});
  const result = await response.json();
  if(result.success){
    const imageUrl = result.data.url;
    await updateDoc(doc(db, "voters", voterId), {images: arrayUnion(imageUrl)});
    alert("Image uploaded!");
    loadVoterDetails(voterId);
  }else alert("Upload failed!");
}

async function deleteImage(voterId, imgURL){
  if(!confirm("Delete this image?")) return;
  await updateDoc(doc(db,"voters",voterId), {images: arrayRemove(imgURL)});
  alert("Image deleted!");
  loadVoterDetails(voterId);
}

// Voter details page
async function loadVoterDetails(voterId){
  currentVoterId = voterId;
  const docSnap = await doc(db,"voters",voterId).get();
  if(!docSnap.exists()) return;
  const v = docSnap.data();
  document.getElementById("voterName").innerText = v.name;
  document.getElementById("voterEpic").innerText = "EPIC: "+v.EPIC;
  document.getElementById("voterBooth").innerText = "Booth: "+v.booth;
  document.getElementById("voterPhone").innerText = "Phone: "+v.phone;
  document.getElementById("voterAddress").innerText = "Address: "+v.address;

  if(isAdminUser) document.getElementById("uploadDiv").style.display="block";
  displayImages(v.images || [], voterId);
}

function displayImages(imgArray, voterId){
  const container = document.getElementById("extraImages");
  container.innerHTML="";
  imgArray.forEach(url=>{
    const div = document.createElement("div");
    div.innerHTML = `<img src="${url}" width="120" style="border-radius:10px;margin:5px;">
      ${isAdminUser?`<button onclick="deleteImage('${voterId}','${url}')">Delete</button>`:""}`;
    container.appendChild(div);
  });
}

function startUpload(){
  if(!isAdminUser) return alert("Only admins can upload!");
  const file = document.getElementById("fileUpload").files[0];
  if(!file) return alert("Select image!");
  uploadImageToImgBB(file,currentVoterId);
}

// Sheet upload (CSV) for admin
function uploadSheet(){
  const file = document.getElementById("sheetUpload").files[0];
  if(!file) return alert("Select CSV!");
  const reader = new FileReader();
  reader.onload = async e=>{
    const text = e.target.result;
    const rows = text.split("\n").slice(1);
    for(const row of rows){
      const cols = row.split(",");
      const [name,EPIC,booth,phone,address] = cols;
      await setDoc(doc(db,"voters",EPIC), {name,EPIC,booth,phone,address,images:[]});
    }
    alert("CSV imported!");
    loadVoters();
  }
  reader.readAsText(file);
}
