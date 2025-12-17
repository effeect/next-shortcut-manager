import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { GameManifest } from "../types/games";
const execPromise = promisify(exec);

const EA_GAMES_REG_PATH = "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\EA Games";

// Run a regedit query to search for the EA Games
async function runRegQuery(command: string): Promise<string> {
  try {
    const { stdout } = await execPromise(command, { encoding: "utf8" });
    return stdout;
  } catch (error: any) {
    if (error.code === 1) {
      return "";
    }
    throw new Error(`Registry query failed: ${error.message}`);
  }
}

function getAppIdFromXML(installDir: string): string | null {
  // Should be the default path for every origin/ea game.
  const xmlPath = path.join(installDir, "__Installer", "installerdata.xml");
  if (!fs.existsSync(xmlPath)) {
    console.warn(`EA XML not found at: ${xmlPath}`);
    return null;
  }
  try {
    const content = fs.readFileSync(xmlPath, "utf-8");
    // Specifically we are looking for <contentID>......</contentID>
    const match = content.match(/<contentID>(.*?)<\/contentID>/i);
    return match ? match[1].trim() : null;
  } catch (err) {
    console.error(`Failed to read EA XML for ${installDir}:`, err);
    return null;
  }
}

export async function getInstalledEAGames(): Promise<GameManifest[]> {
  const eaGames: GameManifest[] = [];
  const command = `reg query "${EA_GAMES_REG_PATH}" /s`;

  const output = await runRegQuery(command);
  //   console.log(output);
  if (!output.trim()) {
    console.log("No EA Games registry output found.");
    return eaGames;
  }

  const blocks = output
    .split(new RegExp(`\r\n\r\n`, "g")) // Split by the double newline used between keys
    .filter((block) => block.trim().startsWith(EA_GAMES_REG_PATH));

  for (const block of blocks) {
    const blockLines = block
      .trim()
      .split("\r\n")
      .filter((line) => line.trim().length > 0);

    const fullKeyPathLine = blockLines[0]?.trim() || "";

    const pathSuffix = fullKeyPathLine.replace(EA_GAMES_REG_PATH + "\\", "");

    if (pathSuffix.includes("\\")) {
      console.log(`Skipping sub-folder/DLC key: ${pathSuffix}`);
      continue;
    }

    const gameKeyName = pathSuffix;

    let name = gameKeyName;
    let path = "";
    let launchId = "";
    for (let i = 1; i < blockLines.length; i++) {
      const line = blockLines[i];

      const match = line.match(
        /^\s*(\S[\s\S]*?)\s+(REG_SZ|REG_DWORD)\s+([^\s].*)/i
      );

      if (match) {
        const valueName = match[1].trim().toLowerCase();
        const valueData = match[3].trim().replace(/['"]+/g, ""); // Remove quotes

        if (valueName === "displayname") {
          name = valueData;
        } else if (valueName === "install dir") {
          // CRITICAL: Must match "Install Dir" exactly from the screenshot
          path = valueData;
        } else if (valueName === "product guid") {
          // Match the Product GUID for launching
          launchId = valueData;
        }
      }
    }

    // --- Final Validation ---
    if (name && path) {
      const realAppId = getAppIdFromXML(path);
      eaGames.push({
        name: name || "No Name Detected",
        // Ensure path ends with a backslash
        path: path.endsWith("\\") ? path : path + "\\",
        // Use Product GUID for the most reliable App ID
        appid: realAppId || `EA_${name.replace(/[^a-zA-Z0-9]/g, "_")}`,
        platform: "ea",
      });
    }
  }

  console.log("EA Games Result ", eaGames);
  return eaGames;
}
