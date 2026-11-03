import { contextBridge, ipcRenderer } from "electron";
// Type-only import: the preload runs sandboxed and can't require our other files
import type { ElectronAPI } from "./types/api";

// Exposes the API route for the electron app.
// Typed as ElectronAPI so it always matches what the UI expects.
const electronAPI: ElectronAPI = {
  getLibrary: (options) => ipcRenderer.invoke("get-library", options),
  launchGame: (platform, appid) =>
    ipcRenderer.invoke("launch-game", platform, appid),
  openFileLocation: (filePath) =>
    ipcRenderer.invoke("show-item-in-folder", filePath),
  openExternal: (url) => ipcRenderer.invoke("open-web-browser", url),
  selectGamePath: () => ipcRenderer.invoke("select-game-path"),
  saveCustomGame: (game) => ipcRenderer.invoke("save-custom-game", game),
  updateCustomGame: (appid, game) =>
    ipcRenderer.invoke("update-custom-game", appid, game),
  removeCustomGame: (appid) => ipcRenderer.invoke("remove-custom-game", appid),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

console.log("Preload Script loaded");
