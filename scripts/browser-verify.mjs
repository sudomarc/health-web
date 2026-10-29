/**
 * Vérification navigateur réelle du prototype via Playwright (chromium).
 * Dépend du paquet `playwright` installé dans ce dépôt (devDependency).
 * Usage : node scripts/browser-verify.mjs [port]
 * Prérequis CI : npx playwright install chromium (ou playwright install --with-deps chromium)
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium } from "playwright";

const root = resolve(process.cwd(), "dist");
const port = Number(process.argv[2] || 4180);

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
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const relativePath = pathname === "/" ? "index.html" : normalize(pathname).replace(/^([/\\])+/, "");
  const filePath = join(root, relativePath);
  if (!filePath.startsWith(root + sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Not Found");
  }
});

await new Promise((done) => server.listen(port, "127.0.0.1", done));
const base = "http://127.0.0.1:" + port + "/";

await mkdir(resolve(process.cwd(), "scripts", "shots"), { recursive: true });

const viewports = [
  { name: "320px", width: 320, height: 568 },
  { name: "375px", width: 375, height: 667 },
  { name: "430px", width: 430, height: 932 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1280px", width: 1280, height: 800 },
  { name: "1440px", width: 1440, height: 900 }
];

const localAppData = process.env.LOCALAPPDATA || resolve(process.env.USERPROFILE, "AppData", "Local");
const msPlaywrightDir = resolve(localAppData, "ms-playwright");
const launchOptions = { headless: true };
try {
  const revisions = await readdir(msPlaywrightDir);
  const revision = revisions.find((entry) => entry.startsWith("chromium-"));
  if (revision) {
    const shellExe = resolve(msPlaywrightDir, revision, "chrome-headless-shell-win64", "chrome-headless-shell.exe");
    const fullExe = resolve(msPlaywrightDir, revision, "chrome-win64", "chrome.exe");
    try {
      await stat(shellExe);
      launchOptions.executablePath = shellExe;
    } catch {
      try {
        await stat(fullExe);
        launchOptions.executablePath = fullExe;
      } catch {
        // Playwright utilisera son exécutable par défaut.
      }
    }
  }
} catch {
  // Répertoire ms-playwright introuvable : Playwright gérera l'erreur de lancement.
}
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext();
const failures = [];
const report = [];

for (const viewport of viewports) {
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));

  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(base, { waitUntil: "networkidle", timeout: 20000 });

  const measurements = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    brokenImages: Array.from(document.images)
      .filter((image) => image.getAttribute("src"))
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
  }));

  const overflow = measurements.scrollWidth > measurements.clientWidth + 1;
  if (overflow) failures.push(viewport.name + " : débordement horizontal (" + measurements.scrollWidth + " > " + measurements.clientWidth + ")");
  if (consoleErrors.length) failures.push(viewport.name + " : erreurs console : " + consoleErrors.join(" | "));
  if (failedRequests.length) failures.push(viewport.name + " : requêtes échouées : " + failedRequests.join(" | "));
  if (measurements.brokenImages.length) failures.push(viewport.name + " : images cassées : " + measurements.brokenImages.join(" | "));

  report.push(viewport.name + " overflow=" + overflow + " consoleErrors=" + consoleErrors.length + " brokenImages=" + measurements.brokenImages.length);

  // Capture d'écran pour inspection visuelle (desktop et mobile principaux).
  if (["320px", "375px", "768px", "1440px"].includes(viewport.name)) {
    await page.screenshot({ path: "scripts/shots/" + viewport.name + "-top.png", fullPage: false });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(700);
    await page.screenshot({ path: "scripts/shots/" + viewport.name + "-middle.png", fullPage: false });
  }
  await page.close();
}

/* ---------------- Comportements interactifs (desktop) ---------------- */
const page = await context.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(base, { waitUntil: "networkidle" });

// 1. Accordéon FAQ
const firstQuestion = page.locator(".faq-question").first();
await firstQuestion.click();
const expanded = await firstQuestion.getAttribute("aria-expanded");
const answerVisible = await page.locator("#faq-answer-1").isVisible();
if (expanded !== "true" || !answerVisible) failures.push("FAQ : l'accordéon ne s'ouvre pas correctement.");
await firstQuestion.click();
if ((await firstQuestion.getAttribute("aria-expanded")) !== "false") failures.push("FAQ : l'accordéon ne se referme pas.");

// 2. Filtre des spécialités
await page.locator('.filter-chip[data-filter="U"]').click();
const visibleAfterFilter = await page.locator("#service-grid .service-item:visible").count();
if (visibleAfterFilter !== 1) failures.push("Filtre : " + visibleAfterFilter + " cartes visibles au lieu de 1 pour la lettre U.");
const statusText = await page.locator("#filter-status").textContent();
if (!/1 spécialité affichée/.test(statusText)) failures.push("Filtre : statut incohérent (" + statusText + ").");
await page.locator('.filter-chip[data-filter="all"]').click();
const restored = await page.locator("#service-grid .service-item:visible").count();
if (restored !== 11) failures.push("Filtre : " + restored + " cartes après réinitialisation au lieu de 11.");

  // 6. Diaporama héros : changement automatique par fondu enchaîné (vérifié sur le viewport bureau)
  if (viewport.name === "1024px") {
    const slideCount = await page.locator(".hero-slide").count();
    if (slideCount < 2) failures.push("Héros : moins de deux images dans le diaporama.");
    const initial = page.locator(".hero-slide.is-current").first();
    const initialSrc = await initial.getAttribute("src");
    const initialOpacity = await initial.evaluate((element) => parseFloat(getComputedStyle(element).opacity || "0"));
    if (initialOpacity !== 1) failures.push("Héros : la première image doit être visible (opacité 1).");
    await page.waitForTimeout(3000);
    const current = page.locator(".hero-slide.is-current").first();
    const currentSrc = await current.getAttribute("src");
    const currentOpacity = await current.evaluate((element) => parseFloat(getComputedStyle(element).opacity || "0"));
    if (currentSrc === initialSrc) failures.push("Héros : le diaporama ne change pas d'image automatiquement.");
    if (currentOpacity < 0.5) failures.push("Héros : l'image affichée après la transition doit rester visible.");
  }

// 3. Visionneuse d'images
await page.locator(".gallery-item").first().click();
if (!(await page.locator("#lightbox").isVisible())) failures.push("Galerie : la visionneuse ne s'ouvre pas.");
const lightboxSrc = await page.locator("#lightbox-image").getAttribute("src");
if (!lightboxSrc || !lightboxSrc.includes("facility-exterior")) failures.push("Galerie : mauvaise image affichée.");
await page.keyboard.press("ArrowRight");
const nextSrc = await page.locator("#lightbox-image").getAttribute("src");
if (nextSrc === lightboxSrc) failures.push("Galerie : la navigation suivante ne fonctionne pas.");
await page.keyboard.press("Escape");
if (await page.locator("#lightbox").isVisible()) failures.push("Galerie : la touche Échap ne ferme pas la visionneuse.");

// 4. Préremplissage d'un service
await page.locator('[data-prefill-service="urologie"]').click();
await page.waitForTimeout(300);
const selected = await page.locator("#service").inputValue();
if (selected !== "urologie") failures.push("Préremplissage : le champ service vaut « " + selected + " » au lieu de « urologie ».");

// 5. Formulaire : date passée rejetée, message sans réservation
await page.locator("#preferred-date").fill("2030-06-15");
await page.selectOption("#period", "matin");
await page.locator(".form-submit").click();
await page.waitForTimeout(300);
const status = await page.locator("#form-status").textContent();
if (!/Aucune demande n'a été envoyée ni enregistrée/.test(status || "")) failures.push("Formulaire : message de confirmation inattendu (" + status + ").");
await page.close();

/* ---------------- Menu mobile ---------------- */
const mobile = await context.newPage();
await mobile.setViewportSize({ width: 375, height: 667 });
await mobile.goto(base, { waitUntil: "networkidle" });
await mobile.locator(".menu-toggle").click();
if ((await mobile.locator(".menu-toggle").getAttribute("aria-expanded")) !== "true") failures.push("Menu mobile : aria-expanded ne passe pas à true.");
if (!(await mobile.locator("#navigation-principale").isVisible())) failures.push("Menu mobile : le menu n'est pas visible après clic.");
await mobile.locator('#navigation-principale a[href="#informations"]').click();
await mobile.waitForTimeout(400);
if ((await mobile.locator(".menu-toggle").getAttribute("aria-expanded")) !== "false") failures.push("Menu mobile : le menu ne se ferme pas après navigation.");
await mobile.close();

await browser.close();
server.close();

console.log("=== Rapport de vérification navigateur ===");
report.forEach((line) => console.log("  " + line));
if (failures.length) {
  console.log("\nÉCHECS (" + failures.length + ") :");
  failures.forEach((failure) => console.log("  ✖ " + failure));
  process.exit(1);
}
console.log("\nToutes les vérifications navigateur sont passées.");
