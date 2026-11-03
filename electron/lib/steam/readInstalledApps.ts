import fs from "fs/promises";
import path from "path";
import vdf from "vdf-parser";
import { GameManifest } from "../types/games";
import { VDF_OPTIONS } from "./readLibraryFolders";

type AppManifestVdf = {
  AppState?: {
    appid?: string;
    name?: string;
    installdir?: string;
    StateFlags?: string;
  };
};

// Steam installs these like apps, but they're runtimes/redistributables, not games.
// (Steamworks Common Redistributables, Steam Linux Runtime x.x, Proton Experimental, ...)
const NON_GAME_APPIDS = new Set(["228980"]);
const NON_GAME_NAMES =
  /^(Steamworks Common Redistributables|Steam Linux Runtime\b|Proton\b)/i;

// StateFlags bit 4 = fully installed. Games still on their first download don't have it yet.
const STATE_FULLY_INSTALLED = 4;

async function readManifest(
  steamapps: string,
  file: string
): Promise<GameManifest | undefined> {
  const manifestPath = path.join(steamapps, file);
  try {
    const { AppState: game } = vdf.parse<AppManifestVdf>(
      await fs.readFile(manifestPath, "utf-8"),
      VDF_OPTIONS
    );
    if (!game?.appid || !game.name || !game.installdir) return undefined;
    if (NON_GAME_APPIDS.has(game.appid) || NON_GAME_NAMES.test(game.name)) {
      return undefined;
    }
    if (
      game.StateFlags !== undefined &&
      (Number(game.StateFlags) & STATE_FULLY_INSTALLED) === 0
    ) {
      return undefined;
    }

    return {
      appid: game.appid,
      name: game.name,
      path: path.join(steamapps, "common", game.installdir),
      platform: "steam",
      launch: { type: "url", url: `steam://run/${game.appid}` },
    };
  } catch (err) {
    // Corrupt manifests happen (e.g. after a crash mid-download), skip just that one.
    // Only the first line is logged, the rest can be the file's binary contents.
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to parse ${manifestPath}: ${message.split("\n")[0]}`);
    return undefined;
  }
}

async function readLibrary(libPath: string): Promise<GameManifest[]> {
  // All the library paths should have a "steamapps" folder which is what we will use to grab info
  const steamapps = path.join(libPath, "steamapps");

  let files: string[];
  try {
    files = await fs.readdir(steamapps);
  } catch {
    // libraryfolders.vdf can point at drives that have since been removed
    console.warn(`Skipping missing library: ${steamapps}`);
    return [];
  }

  const manifests = files.filter(
    (file) => file.startsWith("appmanifest_") && file.endsWith(".acf")
  );
  const games = await Promise.all(
    manifests.map((file) => readManifest(steamapps, file))
  );
  return games.filter((game): game is GameManifest => game !== undefined);
}

export async function getInstalledSteamGames(
  libraryPaths: string[]
): Promise<GameManifest[]> {
  const libraries = await Promise.all(libraryPaths.map(readLibrary));
  return libraries.flat();
}
