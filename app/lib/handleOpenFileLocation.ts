export const handleOpenFileLocation = (filePath: string) => {
  if (window.electronAPI && filePath) {
    void window.electronAPI.openFileLocation(filePath);
  }
};
