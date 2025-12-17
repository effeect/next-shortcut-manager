import path from "path";
import { shell, IpcMainInvokeEvent } from "electron";

// Handles the opening of the files
export async function openFolder(event: IpcMainInvokeEvent, filePath: string) {
  try {
    // Normalize is needed in the Windows context from what I've found
    const normalizedPath = path.normalize(filePath);
    console.log("Main Process received and normalized path:", normalizedPath);

    // Shell command below will open the file path, needs to be the normalized path
    shell.showItemInFolder(normalizedPath);

    return true;
  } catch (error) {
    console.error("IPC Handler Error - Failed to open file location:", error);
    return false;
  }
}
