import fs from "fs";
import path from "path";
import vdf from "vdf-parser";

export function getInstalledSteamGames(libraryPaths: string[]) {
  const games = [];

  // For loop to handle the Steam Library path
  // Normally defaults to the default C Drive location
  for (const libPath of libraryPaths) {
    // All the library paths should have a "steamapps" folder which is what we will use to grab info
    const steamapps = path.join(libPath, "steamapps");
    try {
      // Steamvdf can have dead drive links eg: removed storage drive
      if (!fs.existsSync(steamapps)) {
        console.warn(`Skipping missing library: ${steamapps}`);
        continue;
      }

      // Check if the directory exists
      let files: string[] = [];
      try {
        files = fs.readdirSync(steamapps);
      } catch (err) {
        console.warn(`Cannot read directory ${steamapps}:`, err);
        continue;
      }

      // Where the magic happens
      for (const file of files) {
        // Looking at the individual manifests
        const manifestPath = path.join(steamapps, file);

        if (file.startsWith("appmanifest_") && file.endsWith(".acf")) {
          try {
            const acfFileRaw = fs.readFileSync(manifestPath, "utf-8");
            const acfFile = vdf.parse(acfFileRaw) as any;
            const game = acfFile.AppState;
            console.log(game);
            games.push({
              appid: game.appid,
              name: game.name,
              installdir: game.installdir,
              path: path.join(steamapps, "common", game.installdir),
              debug_info: game,
            });
          } catch (err) {
            console.warn(`Failed to parse ${manifestPath}:`, err);
          }
        }
      }
    } catch (err) {
      console.warn(`Error processing library ${libPath}:`, err);
    }
  }
}
