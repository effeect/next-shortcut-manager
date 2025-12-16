import { getEpicInstalledGames } from "../lib/epic/readInstalledApps";

export const epic = async () => {
  const installedGames = getEpicInstalledGames();
  return installedGames;
};
