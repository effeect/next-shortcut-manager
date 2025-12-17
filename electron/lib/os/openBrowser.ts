import { shell, IpcMainInvokeEvent } from "electron";

export async function openWebBrowser(event: IpcMainInvokeEvent, url: string) {
  try {
    await shell.openExternal(url);
    return true;
  } catch (error) {
    console.error("Failed to open external browser:", error);
    return false;
  }
}
