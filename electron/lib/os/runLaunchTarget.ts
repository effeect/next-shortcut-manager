import { spawn } from "child_process";
import { shell } from "electron";
import { LaunchTarget } from "../types/games";

// Starts the game and returns once it's running (not when it exits).
function spawnDetached(file: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { cwd, detached: true, stdio: "ignore" });
    child.once("error", reject);
    child.once("spawn", () => {
      // Let the game keep running if this app is closed
      child.unref();
      resolve();
    });
  });
}

export async function runLaunchTarget(target: LaunchTarget): Promise<void> {
  switch (target.type) {
    case "url":
      return shell.openExternal(target.url);
    case "open": {
      // openPath resolves with an error message instead of rejecting
      const error = await shell.openPath(target.path);
      if (error) throw new Error(error);
      return;
    }
    case "exe":
      return spawnDetached(target.path, target.args, target.cwd);
    default: {
      const unknownTarget: never = target;
      throw new Error(`Unknown launch target: ${JSON.stringify(unknownTarget)}`);
    }
  }
}
