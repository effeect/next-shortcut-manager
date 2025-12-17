// Launch Button Handler
import { GameManifest } from "@/electron/lib/types/games";
export const launchGame = (params: GameManifest): string => {
  if (!params.appid) {
    console.warn("No App ID provided for the launch of the app");
  }

  let url = "";

  switch (params.platform) {
    case "steam":
      url = `steam://run/${params.appid}`;
      break;
    case "epic":
      url = `com.epicgames.launcher://apps/${params.appid}?action=launch&silent=true`;
      break;
    case "ubi":
      url = `uplay://launch/${params.appid}/0`;
      break;
    case "ea":
      //url = `origin2://game/launch?offerIds=${params.appid}`;
      url = `origin://launchgame/${params.appid}`;
      break;
    default:
      console.warn("No Launch Protocol defined");
      return `No Launch Protocol Defined`;
  }
  // Uncomment below to see the URL entered in :
  console.log(url);
  return url;
};
