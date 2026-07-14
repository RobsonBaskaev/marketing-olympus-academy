// Браузерный дымовой тест: собранный сайт (dist/) открывается в headless Chromium,
// проверяются сценарии, которые статический verify-site.mjs не может увидеть.
// Запуск: pnpm build && pnpm test:smoke. Требует playwright (локально или глобально);
// playwright входит в devDependencies: отсутствие браузерного раннера является ошибкой проверки.
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
    console.error("SMOKE FAILED: playwright не установлен.");
    process.exit(1);
  }
}

const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".png": "image/png", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer((req, res) => {
  const requested = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const clean = requested === "/marketing-olympus-academy" ? "/" : requested.startsWith("/marketing-olympus-academy/") ? requested.slice("/marketing-olympus-academy".length) : requested;
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

const executablePath = [
  "/opt/pw-browsers/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((path) => existsSync(path));
if (!executablePath) {
  console.error("SMOKE FAILED: не найден Chromium, Chrome или Edge.");
  server.close();
  process.exit(1);
}
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

// 5. Страница Pro: заявка собирается и активирует кнопку отправки.
await page.goto(`${base}/pro/`, { waitUntil: "load" });
check((await page.locator(".pro-actions a.disabled").count()) === 1, "Pro: кнопка отправки должна быть неактивна для пустой формы");
await page.locator(".pro-fields input").first().fill("Анна, маркетолог");
await page.locator(".pro-fields input").nth(1).fill("онлайн-школа английского");
await page.waitForTimeout(150);
const mailto = await page.locator(".pro-actions a").getAttribute("href");
check(mailto?.startsWith("mailto:") && mailto.includes(encodeURIComponent("Анна")), "Pro: письмо заявки не собирается из формы");

// 6. Service worker устанавливается и наполняет офлайн-кэш на этом хосте.
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

// 7. Фундамент v2: слабая попытка получает замечания, исправление повышает балл,
// защита обязательна, завершение и восстановление сохраняются.
await page.goto(`${base}/`, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await page.locator(".actions button.primary").click();
await page.locator(".provocation .foundation-options button").nth(1).click();
await page.locator(".reason-grid button").nth(0).click();
await page.locator(".reason-grid button").nth(1).click();
await page.locator(".lesson-stage .foundation-options").nth(1).locator("button").nth(2).click();
await page.locator(".project-grid button").nth(2).click();
await page.locator(".foundation-fields textarea").nth(0).fill("Еда для всех");
await page.getByRole("button", { name: "Проверить ответ →" }).click();
const weakScore = Number((await page.locator(".evaluation-head strong").textContent()).split("/")[0]);
check(weakScore < 65, `Фундамент: слабый ответ получил завышенный балл ${weakScore}`);
check((await page.locator(".feedback-grid article").nth(1).locator("li").count()) >= 1, "Фундамент: слабый ответ не получил конкретных замечаний");
await page.getByRole("button", { name: "Подставить учебный старт →" }).click();
await page.getByRole("button", { name: "Проверить ответ →" }).click();
const strongScore = Number((await page.locator(".evaluation-head strong").textContent()).split("/")[0]);
check(strongScore > weakScore, `Фундамент: исправление не повысило балл (${weakScore} → ${strongScore})`);
check(await page.getByRole("button", { name: "Завершить урок →" }).isDisabled(), "Фундамент: урок можно завершить без защиты");
await page.locator(".defense textarea").fill("Клиент не продолжит решать задачу готовкой, потому что после смены теряет 40 минут; защитная метрика — 90% заказов без опоздания.");
await page.locator(".review-question .foundation-options button").nth(1).click();
check(!(await page.getByRole("button", { name: "Завершить урок →" }).isDisabled()), "Фундамент: сильный ответ с защитой нельзя завершить");
await page.getByRole("button", { name: "Завершить урок →" }).click();
const savedFoundation = await page.evaluate(() => JSON.parse(localStorage.getItem("olymp-foundation-v2")));
check(savedFoundation.lessons["marketing-basics-1"].status === "completed", "Фундамент: завершение урока не сохранено");
await page.reload({ waitUntil: "load" });
check((await page.locator(".ring span").textContent()) === "20%", "Фундамент: прогресс не восстановился после обновления");

// 8. Адаптивность учебного интерфейса на обязательных размерах.
for (const viewport of [{width:320,height:568},{width:375,height:812},{width:768,height:1024},{width:1440,height:900}]) {
  await page.setViewportSize(viewport);
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.locator(".actions button.primary").click();
  const overflow = await page.evaluate(() => {
    const client = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll("*")]
      .map((element) => ({
        name: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
      }))
      .filter((element) => element.right > client + 1 || element.left < -1)
      .slice(0, 8);
    return { client, scroll: document.documentElement.scrollWidth, offenders };
  });
  check(overflow.scroll <= overflow.client, `Фундамент: горизонтальный скролл ${overflow.scroll}px при ширине ${viewport.width}px (${overflow.offenders.map((item) => `${item.name}:${item.left}..${item.right}`).join(", ")})`);
  check(await page.locator(".course-shell").isVisible(), `Фундамент: учебный экран недоступен при ${viewport.width}×${viewport.height}`);
  await page.locator(".course-shell .back").click();
}

check(pageErrors.length === 0, `Ошибки JS на страницах: ${pageErrors.join("; ")}`);

await browser.close();
server.close();

if (errors.length) {
  console.error(`Дымовой тест не пройден (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("Дымовой тест пройден: основные модули, фундамент v2, сохранение и четыре адаптивных размера работают.");
