import fs from "fs/promises";
import path from "path";
import { childKeyName, queryRegistry, stripQuotes } from "../misc/regQuery";
import { GameManifest } from "../types/games";

const EA_GAMES_REG_PATH = "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EA Games";

async function getAppIdFromXML(installDir: string): Promise<string | undefined> {
  // Should be the default path for every origin/ea game.
  const xmlPath = path.join(installDir, "__Installer", "installerdata.xml");
  try {
    const content = await fs.readFile(xmlPath, "utf-8");
    // Specifically we are looking for <contentID>......</contentID>
    const match = content.match(/<contentID>(.*?)<\/contentID>/i);
    return match?.[1].trim() || undefined;
  } catch (err) {
    console.warn(`Couldn't read EA XML at ${xmlPath}:`, err);
    return undefined;
  }
}

export async function getInstalledEAGames(): Promise<GameManifest[]> {
  const keys = await queryRegistry(EA_GAMES_REG_PATH, { recursive: true });

  const games = await Promise.all(
    keys.map(async (entry): Promise<GameManifest | undefined> => {
      // Only direct children are games, deeper keys are DLC / install options
      const gameKeyName = childKeyName(entry.key, EA_GAMES_REG_PATH);
      if (!gameKeyName) return undefined;

      const name = entry.values["displayname"] || gameKeyName;
      const installDir = stripQuotes(entry.values["install dir"] ?? "");
      if (!installDir) return undefined;

      const contentId = await getAppIdFromXML(installDir);
      const appid = contentId || `EA_${name.replace(/[^a-zA-Z0-9]/g, "_")}`;

      return {
        name,
        // Ensure path ends with a backslash
        path: installDir.endsWith("\\") ? installDir : installDir + "\\",
        appid,
        platform: "ea",
        launch: {
          type: "url",
          url: `origin://launchgame/${encodeURIComponent(appid)}`,
        },
      };
    })
  );

  return games.filter((game): game is GameManifest => game !== undefined);
}
