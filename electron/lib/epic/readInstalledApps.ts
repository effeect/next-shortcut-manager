/*
  Epic Games Fetcher :
  This use reg keys in order to identify the game installed and what to do about them

  This simply reads the manfiest file that Epic games provides and running with it.

  Note the following :
  - Currently reliant on the ManifestDir being the same on each system. Should be but never know
*/

import fs from "fs";
import path from "path";
type EpicGameManifest = {
  DisplayName: string;
  InstallLocation: string;
  LaunchExecutable: string;
  AppName: string;
  CatalogNamespace: string;
  CatalogItemId: string;
};

const manifestDir = "C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests";

export function getEpicInstalledGames(): EpicGameManifest[] {
  const games: EpicGameManifest[] = [];

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

      games.push(parsed);
    } catch (err) {
      console.warn(`Failed to parse Epic manifest ${file}:`, err);
    }
  }

  return games;
}
