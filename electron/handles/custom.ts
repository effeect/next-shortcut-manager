import { BrowserWindow, dialog, IpcMainInvokeEvent } from "electron";
import {
  addCustomGame,
  CUSTOM_GAME_EXTENSIONS,
  removeCustomGame,
  updateCustomGame,
} from "../lib/custom/saveCustomGames";

export const handleSaveCustomGame = (event: IpcMainInvokeEvent, game: unknown) =>
  addCustomGame(game);

export const handleUpdateCustomGame = (
  event: IpcMainInvokeEvent,
  appid: unknown,
  game: unknown
) => updateCustomGame(appid, game);

export const handleRemoveCustomGame = (event: IpcMainInvokeEvent, appid: unknown) =>
  removeCustomGame(appid);

export async function handleSelectGamePath(event: IpcMainInvokeEvent) {
  const options: Electron.OpenDialogOptions = {
    properties: ["openFile"],
    filters: [{ name: "Games and shortcuts", extensions: CUSTOM_GAME_EXTENSIONS }],
  };
  // Attach the dialog to the app window so it stays on top of it
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options);
  return result.canceled ? undefined : result.filePaths[0];
}
