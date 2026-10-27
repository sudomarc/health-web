import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, relative, resolve, sep } from "node:path";

const root = resolve(process.argv[2] || ".");
const port = Number(process.argv[3] || process.env.PORT || 4173);
const host = "127.0.0.1";

const allowedFiles = new Set([
  "index.html", "styles.css", "robots.txt",
  "src/main.js", "src/appointment-demo.mjs", "src/clinic-info.mjs"
]);
// Assets autorisés : uniquement le manifeste et les images JPEG du dossier assets/img.
const allowedAssetPattern = /^assets\/img\/[a-z0-9-]+\.(jpg|json)$/;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8"
};

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad Request");
    return;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  if (relativePath.split("/").some((part) => part === "." || part === ".." || part.startsWith("."))) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  if (!allowedFiles.has(relativePath) && !allowedAssetPattern.test(relativePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not Found");
    return;
  }

  const filePath = resolve(root, relativePath);
  const rel = relative(root, filePath);
  if (rel.startsWith(".." + sep) || rel === "..") {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      response.writeHead(404).end("Not Found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Content-Length": info.size,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store"
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not Found");
  }
});

server.listen(port, host, () => {
  console.log("Prototype disponible sur http://" + host + ":" + port);
  console.log("Racine publique : " + root);
  console.log("Fichiers exposés par liste blanche : " + allowedFiles.size);
});
