import { dialog } from "electron";
import Store from "electron-store";
import { GameManifest } from "../types/games";
import { IpcMainInvokeEvent } from "electron";

interface StoreSchema {
  customGames: GameManifest[];
}

const customGameStore: Store<StoreSchema> = new Store<StoreSchema>({
  defaults: {
    customGames: [],
  },
});

export const getCustomSavedGames = (): GameManifest[] => {
  return customGameStore.get("customGames") as GameManifest[];
};

export const saveCustomGame = (
  event: IpcMainInvokeEvent,
  game: GameManifest
) => {
  const existingGames = getCustomSavedGames();

  // To prevent duplicate ids
  if (existingGames.find((g) => g.appid === game.appid)) {
    return existingGames;
  }
  const updatedGames = [...existingGames, game];
  customGameStore.set("customGames", updatedGames);
  return updatedGames;
};

export const selectGamePath = async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Executables", extensions: ["exe", "lnk", "app"] }],
  });
  return result.filePaths[0];
};
