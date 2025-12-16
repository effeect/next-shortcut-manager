import { app, BrowserWindow } from "electron";
// import isDev from "electron-is-dev";
import { ipcMain } from "electron";
// Imports for handles for game launchers
import { steam } from "./handles/steam";
//IPC Handles
// Steam
import path from "node:path";

// Way to determine if the electron app is packaged or not
const isDev = process.env.NODE_ENV === "development";

console.log(isDev);
console.log(process.env.NODE_ENV);
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 2. URL/File to Load
  if (isDev) {
    console.log("here");
    // DEVELOPMENT: Load the Next.js development server URL
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools(); // Optional: open dev tools in development
  } else {
    // PRODUCTION: Load the built Next.js index.html file
    // The path must point to your built Next.js renderer files.
    // Assuming your Next.js build output goes into a standard location like 'out' or '.next'
    const indexPath = path.join(
      __dirname,
      "..",
      "renderer",
      "out",
      "index.html"
    );

    // Fallback URL if using the next export command, otherwise use this:
    // win.loadFile(indexPath);
    console.log(`Loading production file: ${indexPath}`); // 🏆 USE win.loadFile() for static files

    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  ipcMain.handle("get-installed-steam-games", steam);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/* 

Use an environment switch:

ts
Copy code
const isDev = !app.isPackaged;

const preloadPath = isDev
  ? path.join(__dirname, "preload.ts")
  : path.join(__dirname, "preload.js");
Then:

ts
Copy code
new BrowserWindow({
  webPreferences: {
    preload: preloadPath,
  },
});
*/
