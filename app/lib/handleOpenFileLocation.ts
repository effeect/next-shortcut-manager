export const handleOpenFileLocation = (filePath: string) => {
  if (window.electronAPI && filePath) {
    console.log(filePath);
    window.electronAPI.openFileLocation(filePath);
  }
};
