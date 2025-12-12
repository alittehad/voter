const { app, BrowserWindow, BrowserView } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const headerHeight = 80;
  const footerHeight = 70;

  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setBrowserView(view);

  const [w, h] = win.getSize();
  view.setBounds({
    x: 0,
    y: headerHeight,
    width: w,
    height: h - headerHeight - footerHeight,
  });

  view.webContents.loadURL("https://www.google.com");

  win.on("resize", () => {
    const [newW, newH] = win.getSize();
    view.setBounds({
      x: 0,
      y: headerHeight,
      width: newW,
      height: newH - headerHeight - footerHeight,
    });
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(createWindow);
