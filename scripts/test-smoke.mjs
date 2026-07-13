// Браузерный дымовой тест: собранный сайт (dist/) открывается в headless Chromium,
// проверяются сценарии, которые статический verify-site.mjs не может увидеть.
// Запуск: pnpm build && pnpm test:smoke. Требует playwright (локально или глобально);
// если playwright недоступен, тест явно помечается как пропущенный.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
if (!existsSync(dist)) {
  console.error("Каталог dist не найден. Сначала выполните pnpm build.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    ({ chromium } = require(require.resolve("playwright", { paths: [process.env.NODE_PATH || "", "/opt/node22/lib/node_modules"].filter(Boolean) })));
  } catch {
    console.log("SMOKE SKIPPED: playwright не установлен. Установите playwright, чтобы выполнить браузерный тест.");
    process.exit(0);
  }
}

const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".png": "image/png", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer((req, res) => {
  const clean = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let path = join(dist, clean.endsWith("/") ? `${clean}index.html` : clean);
  if (!existsSync(path) || statSync(path).isDirectory()) {
    if (existsSync(join(path, "index.html"))) path = join(path, "index.html");
    else {
      res.writeHead(404, { "content-type": "text/html" });
      res.end(readFileSync(join(dist, "404.html")));
      return;
    }
  }
  res.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream" });
  res.end(readFileSync(path));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

const executablePath = existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

const errors = [];
const check = (ok, label) => { if (!ok) errors.push(label); };

// 1. Главная рендерится и интерактивна.
await page.goto(`${base}/`, { waitUntil: "load" });
check((await page.locator("h1").first().textContent()).includes("маркетинг"), "Главная: заголовок не отрисован");

// 2. Аналитика: невозможные данные не ломают вёрстку (ширина бара ограничена).
await page.goto(`${base}/analytics/`, { waitUntil: "load" });
await page.locator("input[type=number]").nth(1).fill("10");
await page.waitForTimeout(150);
const barWidth = await page.locator(".funnel > div").nth(2).evaluate((el) => parseFloat(el.style.width));
check(barWidth <= 100, `Аналитика: бар воронки вышел за 100% (${barWidth}%)`);
check((await page.locator(".analytics-warning").count()) === 1, "Аналитика: нет предупреждения о противоречивых данных");

// 3. Практикум кейсов: рубрика оценивает содержание, а не только длину.
await page.goto(`${base}/cases/`, { waitUntil: "load" });
await page.locator(".case-writing textarea").fill("аааа ".repeat(20));
await page.waitForTimeout(150);
check((await page.locator(".quality-feedback").count()) === 1, "Кейсы: нет рубрики качества ответа");
check((await page.locator(".quality-feedback li.ok").count()) === 0, "Кейсы: бессодержательный текст прошёл рубрику");
check((await page.locator('a[href="../review/"]').count()) >= 1, "Кейсы: нет ссылки на детальный разбор");

// 4. Страница 404: ссылки восстановления ведут на живые адреса текущего хоста.
await page.goto(`${base}/no-such-page/`, { waitUntil: "load" });
await page.waitForTimeout(300);
const homeHref = await page.locator(".not-found-page a:not(.primary)").getAttribute("href");
const homeResponse = await page.request.get(`${base}${homeHref}`);
check(homeResponse.ok(), `404: ссылка «На главную» отвечает ${homeResponse.status()}`);

// 5. Service worker устанавливается и наполняет офлайн-кэш на этом хосте.
await page.goto(`${base}/`, { waitUntil: "load" });
const swState = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return { supported: false };
  const registration = await navigator.serviceWorker.register("/sw.js").catch((error) => ({ error: String(error) }));
  if (registration?.error) return { supported: true, error: registration.error };
  await new Promise((ok) => {
    const worker = registration.installing || registration.waiting || registration.active;
    if (!worker || worker.state === "activated") return ok();
    worker.addEventListener("statechange", () => worker.state === "activated" && ok());
  });
  const keys = await caches.keys();
  const cache = await caches.open(keys.find((k) => k.startsWith("marketing-olympus")) || "");
  return { supported: true, cached: (await cache.keys()).length };
});
if (swState.supported) {
  check(!swState.error, `Service worker: ошибка регистрации (${swState.error})`);
  check((swState.cached || 0) >= 20, `Service worker: офлайн-кэш заполнен частично (${swState.cached || 0} записей)`);
}

check(pageErrors.length === 0, `Ошибки JS на страницах: ${pageErrors.join("; ")}`);

await browser.close();
server.close();

if (errors.length) {
  console.error(`Дымовой тест не пройден (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("Дымовой тест пройден: вёрстка аналитики, рубрика кейсов, страница 404 и офлайн-кэш работают.");
