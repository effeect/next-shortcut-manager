// Serves the static export (dist/renderer/out) the way electron-serve does,
// so Playwright can test the real build output in a normal browser.
// Usage: node tests/serve-static.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(import.meta.url), "../../dist/renderer/out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3100);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

const isFile = async (file) => (await stat(file).catch(() => null))?.isFile() ?? false;

// /add-game -> add-game.html, / -> index.html, /settings/ -> settings/index.html
async function resolveFile(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^([\\/])+/, "");
  const base = path.join(root, clean);
  if (!base.startsWith(root)) return null; // No escaping the export folder
  for (const candidate of [base, `${base}.html`, path.join(base, "index.html")]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const file = await resolveFile(url.pathname);
  if (!file) {
    res.writeHead(404, { "content-type": TYPES[".html"] });
    res.end(await readFile(path.join(root, "404.html")).catch(() => "Not found"));
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
  });
  res.end(await readFile(file));
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
