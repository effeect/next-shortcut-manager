import path from "path";
import { shell, IpcMainInvokeEvent } from "electron";

// Handles the opening of the files
export async function openFolder(event: IpcMainInvokeEvent, filePath: unknown) {
  if (typeof filePath !== "string" || !filePath) return false;
  try {
    // Normalize is needed in the Windows context from what I've found
    const normalizedPath = path.normalize(filePath);

    // Shell command below will open the file path, needs to be the normalized path
    shell.showItemInFolder(normalizedPath);

    return true;
  } catch (error) {
    console.error("IPC Handler Error - Failed to open file location:", error);
    return false;
  }
}
