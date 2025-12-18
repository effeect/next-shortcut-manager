export const handleSearchOnline = (name: string) => {
  if (!name) return;
  const query = encodeURIComponent(name);
  const url = `https://www.google.com/search?q=${query}`;
  // Use the Electron API to trigger the OS Default browser
  // EG, search for "Beat Saber" on "Google Chrome"
  if (window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url);
  } else {
    window.open(url, "_blank");
  }
};
