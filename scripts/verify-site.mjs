import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const basePath = "/marketing-olympus-academy";
const requiredRoutes = [
  "index.html",
  "learn/index.html",
  "research/index.html",
  "strategy/index.html",
  "acquisition/index.html",
  "analytics/index.html",
  "olympus/index.html",
  "backup/index.html",
  "cases/index.html",
  "glossary/index.html",
  "methodology/index.html",
  "sources/index.html",
  "faq/index.html"
];
const requiredPublicFiles = [
  "manifest.webmanifest",
  "sw.js",
  "icon.svg",
  "robots.txt",
  "sitemap.xml"
];
const errors = [];

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function expectFile(path, label = path) {
  if (!existsSync(join(dist, path))) errors.push(`Отсутствует ${label}: ${path}`);
}

if (!existsSync(dist)) {
  console.error("Каталог dist не найден. Сначала выполните сборку.");
  process.exit(1);
}

requiredRoutes.forEach((path) => expectFile(path, "обязательная страница"));
requiredPublicFiles.forEach((path) => expectFile(path, "публичный файл"));

const htmlFiles = filesUnder(dist).filter((path) => extname(path) === ".html");
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const label = relative(dist, file);
  if (!/<html[^>]+lang="ru"/i.test(html)) errors.push(`${label}: не указан русский язык`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${label}: отсутствует title`);
  if (!/<meta[^>]+name="description"/i.test(html)) errors.push(`${label}: отсутствует description`);
  if (!/<main[^>]+id="main-content"/i.test(html) && label !== "404.html") {
    errors.push(`${label}: отсутствует основная область main-content`);
  }
  if (!/class="skip-link"[^>]+href="#main-content"/i.test(html)) {
    errors.push(`${label}: отсутствует ссылка пропуска навигации`);
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (!value.startsWith(basePath)) continue;
    const clean = value.slice(basePath.length).split(/[?#]/)[0] || "/";
    const local = clean.endsWith("/") ? `${clean.slice(1)}index.html` : clean.slice(1);
    if (!existsSync(join(dist, local))) errors.push(`${label}: битая внутренняя ссылка ${value}`);
  }
}

try {
  const manifest = JSON.parse(readFileSync(join(dist, "manifest.webmanifest"), "utf8"));
  for (const field of ["name", "short_name", "start_url", "display", "icons"]) {
    if (!manifest[field] || (Array.isArray(manifest[field]) && manifest[field].length === 0)) {
      errors.push(`manifest.webmanifest: отсутствует ${field}`);
    }
  }
  if (!String(manifest.start_url).startsWith(basePath)) errors.push("manifest.webmanifest: неверный start_url");
} catch (error) {
  errors.push(`manifest.webmanifest: некорректный JSON (${error.message})`);
}

const serviceWorker = readFileSync(join(dist, "sw.js"), "utf8");
if (!serviceWorker.includes("fetch") || !serviceWorker.includes("caches")) {
  errors.push("sw.js: отсутствует обработка офлайн-кэша");
}

const mainSource = readFileSync(join(root, "app", "page.js"), "utf8");
const accessibilityCss = readFileSync(join(root, "app", "accessibility.css"), "utf8");
if (!mainSource.includes('aria-modal="true"') || !mainSource.includes('event.key === "Escape"')) {
  errors.push("Учебный диалог: отсутствует модальное поведение или закрытие по Escape");
}
for (const selector of ["button:focus-visible", "a:focus-visible", "input:focus-visible", "textarea:focus-visible", "summary:focus-visible"]) {
  if (!accessibilityCss.includes(selector)) errors.push(`Доступность: отсутствует стиль ${selector}`);
}
if (!/button\s*\{[^}]*min-height:\s*44px/s.test(accessibilityCss)) {
  errors.push("Доступность: минимальная высота кнопки меньше 44px");
}

if (errors.length) {
  console.error(`Проверка сайта не пройдена (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Проверка пройдена: ${htmlFiles.length} HTML-страниц, внутренние ссылки, SEO и PWA-файлы корректны.`);
