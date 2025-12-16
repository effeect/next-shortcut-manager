import fs from "fs";
import path from "path";
import vdf from "vdf-parser"; // Need the VDF parser to read the steam files

/* 
    Notes :
    - STEAM_PATH is a environment variable
    - STEAM_PATH will likely default to C but user may have it installed
*/

export function getSteamInstalledPaths() {
  // STEAM_PATH will either be the .env or the default, most likely the default
  const steamPath = process.env.STEAM_PATH || "C:\\Program Files (x86)\\Steam";
  const vdfPath = path.join(steamPath, "steamapps", "libraryfolders.vdf");

  // VDF file handling
  const vdfFileRaw = fs.readFileSync(vdfPath, "utf-8");
  const vdfFile = vdf.parse(vdfFileRaw) as any;

  const folders: string[] = [];

  for (const key in vdfFile.libraryfolders) {
    const entry = vdfFile.libraryfolders[key];
    if (typeof entry === "object" && entry.path) {
      folders.push(entry.path);
    }
  }

  return folders;
}
