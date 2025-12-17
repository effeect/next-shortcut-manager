// Reading the locally installed Ubisoft Games are a bit of pain
// For this to work, we will simply use the regedit keys

import { IpcMainInvokeEvent } from "electron";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

type Game = {
  appid: string;
  name: string;
  installdir: string;
  path: string;
};

const execPromise = promisify(exec);

// Ubisoft Installer game path, should be the same across systems
const UBI_GAMES_REG_PATH =
  "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs";

// Note, might be worth putting this into its own function as EA uses this
async function runRegQuery(command: string): Promise<string> {
  try {
    const { stdout } = await execPromise(command, { encoding: "utf8" });
    return stdout;
  } catch (error) {
    if (error.code === 1) {
      return "";
    }
    throw new Error(`Registry query failed: ${error.message}`);
  }
}

export async function getInstalledUbiGames(event: IpcMainInvokeEvent) {
  const ubiGames: Game[] = [];
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
    let name = "";

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
      name = `Ubisoft Game ${appid}`;
      const extractedName = path.basename(pathValue);
      ubiGames.push({
        name: extractedName,
        installdir: pathValue,
        path: pathValue,
        appid: appid,
      });
    }
  }

  //   console.log("Ubisoft Games Result ", ubiGames);
  return ubiGames;
}
