import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import serve from "electron-serve";
// True when the Squirrel installer runs the app with --squirrel-install/updated/uninstall etc.
// It creates/removes the Start menu + desktop shortcuts for us, then we just need to quit.
import squirrelStartup from "electron-squirrel-startup";
//IPC Handles
import { handleGetLibrary, handleLaunchGame, warmLibraryCache } from "./handles/library";
import { openFolder } from "./handles/openFolder";
import { openWebBrowser } from "./handles/openBrowser";
import {
  handleRemoveCustomGame,
  handleSaveCustomGame,
  handleSelectGamePath,
  handleUpdateCustomGame,
} from "./handles/custom";
import { isWebUrl } from "./lib/os/openBrowser";

if (squirrelStartup) {
  app.quit();
}

// Way to determine if the electron app is packaged or not
const isDev = process.env.NODE_ENV === "development";
const loadURL = serve({
  directory: path.join(__dirname, "..", "..", "renderer", "out"),
});

console.log(isDev);
console.log(process.env.NODE_ENV);

// Compares protocol + host rather than origin, because app:// (electron-serve) has a "null" origin
function isSameApp(url: string, currentUrl: string) {
  try {
    const target = new URL(url);
    const current = new URL(currentUrl);
    return target.protocol === current.protocol && target.host === current.host;
  } catch {
    return false;
  }
}

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

  // Never open extra Electron windows (they'd get the preload API too).
  // Web links go to the user's browser instead.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) void shell.openExternal(url);
    return { action: "deny" };
  });

  // Same idea for the main window: it should only ever show the app itself
  win.webContents.on("will-navigate", (event, url) => {
    if (isSameApp(url, win.webContents.getURL())) return;
    event.preventDefault();
    if (isWebUrl(url)) void shell.openExternal(url);
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
  if (squirrelStartup) return;

  // Library
  ipcMain.handle("get-library", handleGetLibrary);
  ipcMain.handle("launch-game", handleLaunchGame);
  // Below are two methods for System related activites
  ipcMain.handle("show-item-in-folder", openFolder);
  ipcMain.handle("open-web-browser", openWebBrowser);
  // Custom Game stuff below
  ipcMain.handle("save-custom-game", handleSaveCustomGame);
  ipcMain.handle("update-custom-game", handleUpdateCustomGame);
  ipcMain.handle("remove-custom-game", handleRemoveCustomGame);
  ipcMain.handle("select-game-path", handleSelectGamePath);

  // Start scanning launchers while the window loads
  warmLibraryCache();
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
