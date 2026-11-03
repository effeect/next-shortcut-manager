import { shell, IpcMainInvokeEvent } from "electron";

// Only ever hand normal web links to the OS. Anything else (file:, custom protocols, ...)
// could be used to run programs on the user's machine.
export const isWebUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

export async function openWebBrowser(event: IpcMainInvokeEvent, url: unknown) {
  if (!isWebUrl(url)) {
    console.warn("Refusing to open a non-web URL:", url);
    return false;
  }
  try {
    await shell.openExternal(url);
    return true;
  } catch (error) {
    console.error("Failed to open external browser:", error);
    return false;
  }
}
