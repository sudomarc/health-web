/**
 * Diagnostic : identifie les éléments qui débordent horizontalement.
 * Dépend du paquet `playwright` installé dans ce dépôt (devDependency).
 * Usage : node scripts/diagnose-overflow.mjs [port]
 * Prérequis CI : npx playwright install chromium
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium } from "playwright";

const root = resolve(process.cwd(), "dist");
const port = Number(process.argv[2] || 4181);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8"
};
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const relativePath = pathname === "/" ? "index.html" : normalize(pathname).replace(/^([/\\])+/, "");
  const filePath = join(root, relativePath);
  if (!filePath.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  try {
    const info = await stat(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch { response.writeHead(404).end("Not Found"); }
});
await new Promise((done) => server.listen(port, "127.0.0.1", done));
const base = "http://127.0.0.1:" + port + "/";

const browser = await chromium.launch({ headless: true });
for (const width of [320, 768]) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 800 });
  await page.goto(base, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    window.scrollTo(200, 0);
    const scrolledTo = window.scrollX;
    window.scrollTo(0, 0);
    return {
      vw,
      scrollWidth: document.documentElement.scrollWidth,
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      scrolledTo
    };
  });
  console.log("=== " + width + "px ===");
  console.log(JSON.stringify(result, null, 2));
  await page.close();
}
await browser.close();
server.close();
