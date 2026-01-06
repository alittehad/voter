let voters = [];

function loadCSV() {
  const file = document.getElementById("csvFile").files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const rows = e.target.result.split("\n");
    rows.shift();

    rows.forEach(r => {
      const cols = r.split(",");
      voters.push({
        name: cols[0],
        epic: cols[1],
        age: cols[2],
        gender: cols[3]
      });
    });

    localStorage.setItem("voters", JSON.stringify(voters));
    alert("CSV Loaded Offline");
  };

  reader.readAsText(file);
}

function searchVoter() {
  const key = document.getElementById("search").value.toLowerCase();
  const data = JSON.parse(localStorage.getItem("voters")) || [];

  let html = "";
  data.filter(v => 
    v.name.toLowerCase().includes(key) || 
    v.epic.toLowerCase().includes(key)
  ).forEach(v => {
    html += `<div>
      <b>${v.name}</b><br>
      EPIC: ${v.epic} | Age: ${v.age} | ${v.gender}
    </div><hr>`;
  });

  document.getElementById("result").innerHTML = html;
}
