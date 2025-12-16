// Imports for the steam stuff
import { getSteamInstalledPaths } from "../lib/steam/readLibraryFolders";
import { getInstalledSteamGames } from "../lib/steam/readInstalledApps";

export const steam = async () => {
  // We will grab the libraries from the steam
  // Note for future we need to include a param for SteamInstalledPaths
  const libraries = getSteamInstalledPaths();
  // And then read the games in
  const games = getInstalledSteamGames(libraries);
  return games;
};
