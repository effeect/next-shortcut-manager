const { contextBridge, ipcRenderer } = require("electron");
// Exposes the API route for the electron app
// Need to do some more testing and clamp it down maybe
contextBridge.exposeInMainWorld("electronAPI", {
  getInstalledSteamGames: () => ipcRenderer.invoke("get-installed-steam-games"),
  getInstalledEpicGames: () => ipcRenderer.invoke("get-installed-epic-games"),
  getInstalledEAGames: () => ipcRenderer.invoke("get-installed-ea-games"),
  getInstalledUbiGames: () => ipcRenderer.invoke("get-installed-ubi-games"),
  getInstalledGOGGames: () => ipcRenderer.invoke("get-installed-gog-games"),
  openFileLocation: (filePath: string) => {
    ipcRenderer.invoke("show-item-in-folder", filePath);
  },
  openExternal: (url: string) => ipcRenderer.invoke("open-web-browser", url),
});

console.log("Preload Script loaded");
