import { app, BrowserWindow } from "electron";
// import isDev from "electron-is-dev";
import { ipcMain } from "electron";
// Imports for handles for game launchers
import { steam } from "./handles/steam.ts";
//IPC Handles
// Steam
import { fileURLToPath } from "node:url";
import path from "node:path";

import { getSteamInstalledPaths } from "../lib/steam/readLibraryFolders.ts";
import { getInstalledSteamGames } from "../lib/steam/readInstalledApps.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });

  // Need to change to a path.join in the next build/dev stuff
  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
  ipcMain.handle("get-installed-steam-games", async () => {
    // We will grab the libraries from the steam
    // Note for future we need to include a param for SteamInstalledPaths
    const libraries = getSteamInstalledPaths();
    // And then read the games in
    const games = getInstalledSteamGames(libraries);
    console.log(games);
    return games;
  });
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
