// Reading the locally installed Ubisoft Games are a bit of pain
// For this to work, we will simply use the regedit keys
import path from "path";
import { GameManifest } from "../types/games";
import { childKeyName, queryRegistry, stripQuotes } from "../misc/regQuery";

// Ubisoft Installer game path, should be the same across systems
const UBI_GAMES_REG_PATH =
  "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs";

export async function getInstalledUbiGames(): Promise<GameManifest[]> {
  const ubiGames: GameManifest[] = [];
  const keys = await queryRegistry(UBI_GAMES_REG_PATH, { recursive: true });

  for (const entry of keys) {
    const appid = childKeyName(entry.key, UBI_GAMES_REG_PATH);
    // Double check to make sure its a valid appid
    if (!appid || !/^\d+$/.test(appid)) continue;

    const installDir = stripQuotes(entry.values["installdir"] ?? "");
    if (!installDir) continue;

    // Ubisoft stores forward slashes (E:/ubisoft/The Crew Motorfest/)
    const gamePath = path.normalize(installDir);
    ubiGames.push({
      name: path.basename(gamePath),
      path: gamePath,
      appid,
      platform: "ubi",
      launch: { type: "url", url: `uplay://launch/${appid}/0` },
    });
  }

  return ubiGames;
}
