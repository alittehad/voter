/* Open new print page with 4 buttons */
function openPrintWindow(){
  const win = window.open("", "_blank");

  win.document.write(`
    <html>
    <head>
      <title>Print Page</title>
      <link rel="stylesheet" href="style.css">
      <style>
        /* Mini Logout Button for print page */
        .print-logout {
          position: fixed;
          top: 15px;
          right: 15px;
          padding: 6px 14px;
          font-size: 11px;
          border-radius: 8px;
          background: linear-gradient(145deg,#ff6666,#cc0000);
          box-shadow: 0 4px #990000;
          color: white;
          cursor: pointer;
          border: none;
          z-index: 9999;
        }
        .print-logout:active {
          transform: translateY(2px);
          box-shadow: 0 2px #990000;
        }
      </style>
    </head>

    <body class="dash-bg" style="display:flex; justify-content:center; align-items:center; height:100vh;">

      <!-- TOP RIGHT LOGOUT BUTTON -->
      <button class="print-logout" onclick="window.location.href='index.html'">Logout</button>

      <!-- 4 Main Buttons -->
      <div class="button-container">
        <button class="btn3d blinking" onclick="window.open('https://mahasecvoterlist.in/ObjectionOnClick/SearchVoterName','_blank')">Download</button>

        <button class="btn3d" onclick="window.open('https://electoralsearch.eci.gov.in/','_blank')">Election Search</button>

        <button class="btn3d" onclick="window.location.href='pdf.html'">Whatsapp Send</button>

        <button class="btn3d" onclick="window.print()">Print</button>
      </div>

    </body>
    </html>
  `);
}
