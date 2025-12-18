// Reading the locally installed Ubisoft Games are a bit of pain
// For this to work, we will simply use the regedit keys
import path from "path";
import { GameManifest } from "../types/games";
import { runRegQuery } from "../misc/regQuery";

// Ubisoft Installer game path, should be the same across systems
const UBI_GAMES_REG_PATH =
  "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs";

export async function getInstalledUbiGames() {
  const ubiGames: GameManifest[] = [];
  const command = `reg query "${UBI_GAMES_REG_PATH}" /s`;
  const output = await runRegQuery(command);

  // Will return an empty array if there are no Ubisoft games
  if (!output.trim()) {
    console.log("No Ubisoft Games registry output found.");
    return ubiGames;
  }

  const blocks = output
    .split(new RegExp(`\r\n\r\n`, "g"))
    .filter((block) => block.trim().startsWith(UBI_GAMES_REG_PATH));

  for (const block of blocks) {
    const blockLines = block
      .trim()
      .split("\r\n")
      .filter((line) => line.trim().length > 0);

    const fullKeyPathLine = blockLines[0]?.trim() || "";
    const pathSuffix = fullKeyPathLine.replace(UBI_GAMES_REG_PATH + "\\", "");
    const appid = pathSuffix.split("\\")[0].trim();

    // Double check to make sure its a valid appid
    if (!/^\d+$/.test(appid)) {
      continue;
    }

    let pathValue = "";

    for (let i = 1; i < blockLines.length; i++) {
      const line = blockLines[i];
      const match = line.match(
        /^\s*(\S[\s\S]*?)\s+(REG_SZ|REG_DWORD)\s+([^\s].*)/i
      );

      if (match) {
        const valueName = match[1].trim().toLowerCase();
        const valueData = match[3].trim().replace(/["]+/g, ""); // Remove double quotes, do not remove single quotes (eg : Assassin's Creed)

        if (valueName === "installdir") {
          pathValue = valueData;
        }
      }
    }

    // Only push to the array if the Ubisoft stuff is present
    if (appid && pathValue) {
      // name = `Ubisoft Game ${appid}`;
      const extractedName = path.basename(pathValue);
      ubiGames.push({
        name: extractedName,
        path: pathValue,
        appid: appid,
        platform: "ubi",
      });
    }
  }

  //   console.log("Ubisoft Games Result ", ubiGames);
  return ubiGames;
}
