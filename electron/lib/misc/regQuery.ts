import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);

export async function runRegQuery(command: string): Promise<string> {
  try {
    const { stdout } = await execPromise(command, { encoding: "utf8" });
    return stdout;
  } catch (error: any) {
    if (error.code === 1) return "";
    throw new Error(`Registry query failed: ${error.message}`);
  }
}
