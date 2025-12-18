import { runRegQuery } from "../misc/regQuery";
import { GameManifest } from "../types/games";

const GOG_REG_PATH =
  "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\GOG.com\\Games";

export async function getInstalledGOGGames(): Promise<GameManifest[]> {
  const gogGames: GameManifest[] = [];
  const command = `reg query "${GOG_REG_PATH}" /s`;

  const output = await runRegQuery(command);
  if (!output.trim()) return gogGames;

  const blocks = output
    .split(new RegExp(`\r\n\r\n`, "g"))
    .filter((block) => block.trim().startsWith(GOG_REG_PATH));

  for (const block of blocks) {
    const blockLines = block.trim().split("\r\n");

    let name = "";
    let installPath = "";
    let gameId = "";

    // Reading the regex results below
    for (const line of blockLines) {
      const match = line.match(
        /^\s*(\S[\s\S]*?)\s+(REG_SZ|REG_DWORD)\s+([^\s].*)/i
      );
      if (match) {
        const valueName = match[1].trim().toLowerCase();
        const valueData = match[3].trim().replace(/['"]+/g, "");

        if (valueName === "gamename") name = valueData;
        if (valueName === "path") installPath = valueData;
        if (valueName === "gameid") gameId = valueData;
      }
    }

    if (name && installPath && gameId) {
      gogGames.push({
        name: name,
        path: installPath.endsWith("\\") ? installPath : installPath + "\\",
        appid: gameId,
        platform: "gog",
      });
    }
  }

  return gogGames;
}
