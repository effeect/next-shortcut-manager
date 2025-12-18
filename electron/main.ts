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
import { getInstalledEAGames } from "./handles/ea";
import { getInstalledUbiGames } from "./handles/ubisoft";
import { openWebBrowser } from "./handles/openBrowser";
import { getInstalledGOGGames } from "./handles/gog";
import {
  getCustomSavedGames,
  saveCustomGame,
  selectGamePath,
} from "./handles/custom";
import serve from "electron-serve";

// Way to determine if the electron app is packaged or not
const isDev = process.env.NODE_ENV === "development";
const loadURL = serve({
  directory: path.join(__dirname, "..", "..", "renderer", "out"),
});

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
    // Below to get rid of the task bar
    // Could tie it to the Dev Mode just keeping it always enabled for now
    // titleBarStyle: "hidden",
  });

  if (isDev) {
    win.setMenuBarVisibility(true);
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools(); // Optional: open dev tools in development
  } else {
    console.log("Loading this");
    win.setMenuBarVisibility(false);
    loadURL(win);
  }
}

app.whenReady().then(() => {
  // Need to wrap these below in there own function I feel...
  ipcMain.handle("get-installed-steam-games", steam);
  ipcMain.handle("get-installed-epic-games", epic);
  ipcMain.handle("get-installed-ea-games", getInstalledEAGames);
  ipcMain.handle("get-installed-ubi-games", getInstalledUbiGames);
  ipcMain.handle("get-installed-gog-games", getInstalledGOGGames);
  // Below are two methods for System related activites
  ipcMain.handle("show-item-in-folder", openFolder);
  ipcMain.handle("open-web-browser", openWebBrowser);
  // Custom Game stuff below
  ipcMain.handle("get-custom-games", getCustomSavedGames);
  ipcMain.handle("save-custom-game", saveCustomGame);
  ipcMain.handle("select-game-path", selectGamePath);

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
