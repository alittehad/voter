// ===============================
// SAMPLE DATA (Replace with Firebase later)
// ===============================
let voterData = [
  {
    name: "Rahim Khan",
    epic: "ABC1234567",
    part: "56",
    serial: "120",
    relationType: "Father",
    relationName: "Karim Khan",
    house: "H.No 45",
    room: "Room 12",
    address: "Main Road, Mohalla Qureshi",
    pollingAddress: "Govt School Building, Main Road",
    mobile: "9876543210"
  },
  {
    name: "Saira Begum",
    epic: "XYZ9876543",
    part: "56",
    serial: "121",
    relationType: "Husband",
    relationName: "Nasir Ali",
    house: "H.No 46",
    room: "Room 12",
    address: "Main Road, Mohalla Qureshi",
    pollingAddress: "Govt School Building, Main Road",
    mobile: "9876549999"
  }
];

// ===============================
// Render Function
// ===============================
function renderVoterTable(data) {
  let tableHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full border text-sm">
        <thead class="bg-blue-600 text-white">
          <tr>
            <th class="p-2 border">Part</th>
            <th class="p-2 border">EPIC</th>
            <th class="p-2 border">Name</th>
            <th class="p-2 border">Father/Husband</th>
            <th class="p-2 border">House No</th>
            <th class="p-2 border">Room No</th>
            <th class="p-2 border">Address</th>
            <th class="p-2 border">Polling Address</th>
            <th class="p-2 border">Mobile</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(v => {
    tableHTML += `
      <tr class="hover:bg-gray-100">
        <td class="p-2 border">${v.part}</td>
        <td class="p-2 border">${v.epic}</td>
        <td class="p-2 border">${v.name}</td>
        <td class="p-2 border">${v.relationType}: ${v.relationName}</td>
        <td class="p-2 border">${v.house}</td>
        <td class="p-2 border">${v.room}</td>
        <td class="p-2 border">${v.address}</td>
        <td class="p-2 border">${v.pollingAddress}</td>
        <td class="p-2 border">${v.mobile}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("voterList").innerHTML = tableHTML;
}

// First render
renderVoterTable(voterData);


// ===============================
// Search Function
// ===============================
document.getElementById("searchVoter").addEventListener("input", function () {
  let q = this.value.toLowerCase();

  let filtered = voterData.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.epic.toLowerCase().includes(q) ||
    v.part.toLowerCase().includes(q) ||
    v.house.toLowerCase().includes(q) ||
    v.mobile.toLowerCase().includes(q)
  );

  renderVoterTable(filtered);
});
