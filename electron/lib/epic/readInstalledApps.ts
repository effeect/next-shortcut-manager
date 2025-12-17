/*
  Epic Games Fetcher :
  This use reg keys in order to identify the game installed and what to do about them

  This simply reads the manfiest file that Epic games provides and running with it.

  Note the following :
  - Currently reliant on the ManifestDir being the same on each system. Should be but never know
*/

import fs from "fs";
import path from "path";
import { GameManifest } from "../types/games";

// Need just for this parsing, no need to have it as an export
type EpicGameManifest = {
  DisplayName: string;
  InstallLocation: string;
  LaunchExecutable: string;
  AppName: string;
};

const manifestDir = "C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests";

export function getEpicInstalledGames(): GameManifest[] {
  const games: GameManifest[] = [];

  if (!fs.existsSync(manifestDir)) {
    console.warn(`Epic manifest directory not found: ${manifestDir}`);
    return games;
  }

  const files = fs.readdirSync(manifestDir).filter((f) => f.endsWith(".item"));

  for (const file of files) {
    const fullPath = path.join(manifestDir, file);

    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const parsed = JSON.parse(raw) as EpicGameManifest;

      games.push({
        name: parsed.DisplayName,
        appid: parsed.AppName,
        path: parsed.InstallLocation,
        platform: "Epic", // Hardcoded since we know the source
      });
    } catch (err) {
      console.warn(`Failed to parse Epic manifest ${file}:`, err);
    }
  }

  return games;
}
