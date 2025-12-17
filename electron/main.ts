import { app, BrowserWindow } from "electron";
// import isDev from "electron-is-dev";
import { ipcMain } from "electron";
// Imports for handles for game launchers
import { steam } from "./handles/steam";
//IPC Handles
// Steam
import path from "node:path";
import { epic } from "./handles/epic";
import { openFolder } from "./handles/openFolder";

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
      contextIsolation: true,
    },
  });

  if (isDev) {
    console.log("here");
    // DEVELOPMENT: Load the Next.js development server URL
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools(); // Optional: open dev tools in development
  } else {
    const indexPath = path.join(
      __dirname,
      "..",
      "renderer",
      "out",
      "index.html"
    );
    console.log(`Loading production file: ${indexPath}`);
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  ipcMain.handle("get-installed-steam-games", steam);
  ipcMain.handle("get-installed-epic-games", epic);
  ipcMain.handle("show-item-in-folder", openFolder);
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
