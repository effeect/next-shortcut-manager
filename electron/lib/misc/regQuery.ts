import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type RegKey = {
  // Full key path, as printed by reg.exe (e.g. HKEY_LOCAL_MACHINE\SOFTWARE\...)
  key: string;
  // Value name (lower-cased, registry names are case-insensitive) -> data
  values: Record<string, string>;
};

// reg.exe prints values as: 4 spaces, name, 4 spaces, type, 4 spaces, data.
// Names can contain spaces ("Install Dir") and data can be empty.
const VALUE_LINE = /^ {4}(.+?) {4}(REG_[A-Z_]+)(?: {4}(.*))?$/;

export function parseRegQuery(output: string): RegKey[] {
  const keys: RegKey[] = [];
  let current: RegKey | undefined;

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("HKEY_")) {
      current = { key: line.trim(), values: {} };
      keys.push(current);
      continue;
    }
    if (!current) continue;

    const match = VALUE_LINE.exec(line);
    if (match) {
      current.values[match[1].toLowerCase()] = (match[3] ?? "").trim();
    }
  }

  return keys;
}

// Runs `reg query` on a key and returns what it found.
// Returns [] when the key/value doesn't exist, or when we're not on Windows.
export async function queryRegistry(
  key: string,
  options: { recursive?: boolean; value?: string } = {}
): Promise<RegKey[]> {
  if (process.platform !== "win32") return [];

  const args = [`"${key}"`];
  if (options.value) args.push("/v", `"${options.value}"`);
  if (options.recursive) args.push("/s");

  // reg.exe writes to a pipe in the console's OEM code page, which mangles anything
  // non-ASCII ("Battlefield™ 6" comes back as "BattlefieldT 6", accents get garbled).
  // Switching the console to UTF-8 first makes it write UTF-8 instead.
  const command = `chcp 65001 >nul && reg query ${args.join(" ")}`;

  try {
    const { stdout } = await execAsync(command, {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
    });
    return parseRegQuery(stdout);
  } catch (error) {
    // reg.exe exits with 1 when the key or value doesn't exist
    if ((error as { code?: unknown }).code === 1) return [];
    throw new Error(
      `Registry query failed for ${key}: ${(error as Error).message}`
    );
  }
}

// Reads a single value, or undefined if it's missing or empty.
export async function readRegistryValue(
  key: string,
  value: string
): Promise<string | undefined> {
  const [entry] = await queryRegistry(key, { value });
  return entry?.values[value.toLowerCase()] || undefined;
}

// For a key like <root>\Battlefield 6 returns "Battlefield 6".
// Returns undefined for the root itself and for deeper sub-keys (DLC, settings, etc).
export function childKeyName(key: string, root: string): string | undefined {
  const prefix = root.toLowerCase() + "\\";
  if (!key.toLowerCase().startsWith(prefix)) return undefined;
  const rest = key.slice(prefix.length);
  return rest && !rest.includes("\\") ? rest : undefined;
}

// Removes one pair of surrounding double quotes, e.g. "C:\Games\x.exe" -> C:\Games\x.exe.
// Apostrophes are left alone so names like Mirror's Edge survive.
export const stripQuotes = (value: string): string =>
  value.replace(/^"(.*)"$/, "$1");
