import path from "path";
import { childKeyName, queryRegistry, stripQuotes } from "../misc/regQuery";
import { GameManifest, LaunchTarget } from "../types/games";

const GOG_REG_PATH =
  "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\GOG.com\\Games";

// Splits launch parameters into arguments, keeping "quoted parts" together
const splitArgs = (params: string): string[] =>
  (params.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((arg) =>
    arg.replace(/"/g, "")
  );

export async function getInstalledGOGGames(): Promise<GameManifest[]> {
  const gogGames: GameManifest[] = [];
  const keys = await queryRegistry(GOG_REG_PATH, { recursive: true });

  for (const entry of keys) {
    if (!childKeyName(entry.key, GOG_REG_PATH)) continue;

    const values = entry.values;
    const name = values["gamename"];
    const gameId = values["gameid"];
    const installPath = stripQuotes(values["path"] ?? "");
    if (!name || !gameId || !installPath) continue;
    // DLC and add-ons point at the game they belong to
    if (values["dependson"]) continue;

    // GOG games are DRM-free, so run them the same way GOG's own shortcuts do.
    // Fall back to the Galaxy game page if the registry has no executable.
    const exe = stripQuotes(values["exe"] ?? "");
    const launch: LaunchTarget = exe
      ? {
          type: "exe",
          path: exe,
          args: splitArgs(values["launchparam"] ?? ""),
          cwd: stripQuotes(values["workingdir"] ?? "") || path.dirname(exe),
        }
      : { type: "url", url: `goggalaxy://openGameView/${gameId}` };

    gogGames.push({
      name,
      path: installPath.endsWith("\\") ? installPath : installPath + "\\",
      appid: gameId,
      platform: "gog",
      launch,
    });
  }

  return gogGames;
}
