const { contextBridge, ipcRenderer } = require("electron");

// Exposes the API route for the electron app
// Need to do some more testing and clamp it down maybe
contextBridge.exposeInMainWorld("electronAPI", {
  getInstalledSteamGames: () => ipcRenderer.invoke("get-installed-steam-games"),
});

console.log("Preload Script loaded");
