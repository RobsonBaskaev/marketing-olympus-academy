import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const basePath = "/marketing-olympus-academy";
const requiredRoutes = [
  "index.html",
  "learn/index.html",
  "diagnostic/index.html",
  "skills/index.html",
  "review/index.html",
  "start/index.html",
  "curriculum/index.html",
  "library/index.html",
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
const caseLabSource = readFileSync(join(root, "app", "cases", "case-lab.js"), "utf8");
const backupSource = readFileSync(join(root, "app", "backup", "page.js"), "utf8");
const learnSource = readFileSync(join(root, "app", "learn", "page.js"), "utf8");
for (const marker of ["olymp-diagnostic", "olymp-diagnostic-history", "Результат входной диагностики", "Пройти диагностику"]) {
  if (!learnSource.includes(marker)) errors.push(`Учебный кабинет: отсутствует ${marker}`);
}
const olympusSource = readFileSync(join(root, "app", "olympus", "page.js"), "utf8");
const diagnosticSource = readFileSync(join(root, "app", "diagnostic", "diagnostic.js"), "utf8");
const skillsSource = readFileSync(join(root, "app", "skills", "skills-dashboard.js"), "utf8");
const reviewSource = readFileSync(join(root, "app", "review", "review-dashboard.js"), "utf8");
const caseRubricSource = readFileSync(join(root, "app", "lib", "case-rubric.mjs"), "utf8");
const startSource = readFileSync(join(root, "app", "start", "start-planner.js"), "utf8");
const curriculumSource = readFileSync(join(root, "app", "curriculum", "page.js"), "utf8");
const librarySource = readFileSync(join(root, "app", "library", "library-browser.js"), "utf8");
const libraryMethodsSource = readFileSync(join(root, "app", "library", "methods.mjs"), "utf8");
const sourcesSource = readFileSync(join(root, "app", "sources", "page.js"), "utf8");
const pagesWorkflow = readFileSync(join(root, ".github", "workflows", "pages.yml"), "utf8");
const lessonProgressSource = readFileSync(join(root, "app", "lib", "lesson-progress.mjs"), "utf8");
const strategySource = readFileSync(join(root, "app", "strategy", "page.js"), "utf8");
const acquisitionSource = readFileSync(join(root, "app", "acquisition", "page.js"), "utf8");
const analyticsSource = readFileSync(join(root, "app", "analytics", "page.js"), "utf8");
const analyticsValidationSource = readFileSync(join(root, "app", "lib", "analytics-validation.mjs"), "utf8");
if (!mainSource.includes('aria-modal="true"') || !mainSource.includes('event.key === "Escape"')) {
  errors.push("Учебный диалог: отсутствует модальное поведение или закрытие по Escape");
}
for (const marker of ["reconcileCompletedLessons", "nextIncompleteLesson", "MIN_LESSON_ANSWER"]) {
  if (!mainSource.includes(marker) || !lessonProgressSource.includes(marker)) {
    errors.push(`Прогресс уроков: отсутствует ${marker}`);
  }
}
for (const marker of ['href="research/"', 'href="strategy/"', 'href="acquisition/"', 'href="analytics/"', 'href="olympus/"', 'className="track-card"']) {
  if (!mainSource.includes(marker)) errors.push(`Главная траектория: отсутствует ${marker}`);
}
if (!mainSource.includes("disabled={done.length < lessons.length}")) {
  errors.push("Итоговый тест не заблокирован до завершения пяти работ");
}
for (const [label, source] of [["Стратегия", strategySource], ["Медиаплан", acquisitionSource]]) {
  for (const marker of ["evaluateCaseAnswer", "rationaleStrong", "quality-feedback"]) {
    if (!source.includes(marker)) errors.push(`${label}: отсутствует доказательная проверка ${marker}`);
  }
}
for (const marker of ["validateFunnel", "dataErrors", "Атрибутированная выручка", "Расчёт нельзя интерпретировать"]) {
  if (!analyticsSource.includes(marker) && !analyticsValidationSource.includes(marker)) {
    errors.push(`Аналитика: отсутствует ${marker}`);
  }
}
for (const selector of ["button:focus-visible", "a:focus-visible", "input:focus-visible", "textarea:focus-visible", "summary:focus-visible"]) {
  if (!accessibilityCss.includes(selector)) errors.push(`Доступность: отсутствует стиль ${selector}`);
}
if (!/button\s*\{[^}]*min-height:\s*44px/s.test(accessibilityCss)) {
  errors.push("Доступность: минимальная высота кнопки меньше 44px");
}
if (!/\.actions a\.primary\s*\{[^}]*color:\s*white/s.test(readFileSync(join(root, "app", "globals.css"), "utf8"))) {
  errors.push("Главная: текст основной ссылки hero не контрастен");
}
for (const marker of ["Новичок", "Начинающий", "Уверенный", "Профессионал", "olymp-case-lab", "strong-answer"]) {
  if (!caseLabSource.includes(marker)) errors.push(`Практикум кейсов: отсутствует ${marker}`);
}
if (!backupSource.includes('"olymp-case-lab"')) {
  errors.push("Резервная копия: не включён прогресс практикума кейсов");
}
if (!backupSource.includes('"olymp-diagnostic"')) {
  errors.push("Резервная копия: не включён результат диагностики");
}
for (const [label, source] of [["Учебный кабинет", learnSource], ["Выпускное досье", olympusSource]]) {
  if (!source.includes('"olymp-case-lab"') || !source.includes("caseCount")) {
    errors.push(`${label}: практикум кейсов не включён в прогресс`);
  }
}
if (!olympusSource.includes("${total}/9")) {
  errors.push("Выпускное досье: неверное число критериев готовности");
}
if ((diagnosticSource.match(/skill:/g) || []).length !== 3) {
  errors.push("Диагностика: должно быть ровно три мини-кейса");
}
for (const marker of ["olymp-diagnostic", "olymp-diagnostic-history", "История попыток", "Новичок", "Практик", "Системный маркетолог", "не подтверждение квалификации"]) {
  if (!diagnosticSource.includes(marker)) errors.push(`Диагностика: отсутствует ${marker}`);
}
for (const marker of ["Карта компетенций", "Подтверждено работой", "не является профессиональной сертификацией", "olymp-case-lab", "olymp-capstone"]) {
  if (!skillsSource.includes(marker)) errors.push(`Карта компетенций: отсутствует ${marker}`);
}
for (const marker of ["Разбор вашего решения", "Данные и наблюдение", "Проверяемая гипотеза", "Риск или ограничение", "не является оценкой квалификации", "olymp-case-lab"]) {
  if (!reviewSource.includes(marker) && !caseRubricSource.includes(marker)) errors.push(`Разбор кейсов: отсутствует ${marker}`);
}
if (!learnSource.includes("evaluateCaseAnswer") || !olympusSource.includes("evaluateCaseAnswer") || !skillsSource.includes("evaluateCaseAnswer")) {
  errors.push("Единая рубрика кейсов не используется во всех отчётах прогресса");
}
for (const marker of ["olymp-profile", "ПЛАН НА 4 НЕДЕЛИ", "Начать карьеру", "Развивать свой бизнес", "Обучать команду"]) {
  if (!startSource.includes(marker)) errors.push(`Персональный маршрут: отсутствует ${marker}`);
}
if (!backupSource.includes('"olymp-profile"') || !learnSource.includes('"olymp-profile"')) {
  errors.push("Профиль маршрута не включён в кабинет или резервную копию");
}
if (!learnSource.includes('6: "6 часов"')) {
  errors.push("Учебный кабинет: неверное склонение недельного темпа");
}
for (const marker of ["12", "РЕЗУЛЬТАТЫ ПРОГРАММЫ", "Кейс-семинар", "РЕКОМЕНДУЕМАЯ МОДЕЛЬ ОЦЕНКИ", "Академическая и продуктовая честность", "MIT OCW", "OpenStax"]) {
  if (!curriculumSource.includes(marker)) errors.push(`Академическая программа: отсутствует ${marker}`);
}
for (const marker of ["Что нужно решить?", "Все уровни", "methodCategories", "Типичная ошибка", "Сбросить фильтры"]) {
  if (!librarySource.includes(marker) && !libraryMethodsSource.includes(marker)) errors.push(`Библиотека методов: отсутствует ${marker}`);
}
if ((libraryMethodsSource.match(/title:/g) || []).length < 20) {
  errors.push("Библиотека методов: должно быть не менее 20 практических методов");
}
for (const marker of ["Marketing Management: Analytics, Frameworks, and Applications", "New Enterprises", "Marketing Strategy"]) {
  if (!sourcesSource.includes(marker)) errors.push(`Карта источников: отсутствует ${marker}`);
}
for (const marker of ["actions/checkout@v6", "pnpm/action-setup@v6", "actions/setup-node@v6", "node-version: 24"]) {
  if (!pagesWorkflow.includes(marker)) errors.push(`GitHub Pages workflow: отсутствует ${marker}`);
}

if (errors.length) {
  console.error(`Проверка сайта не пройдена (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Проверка пройдена: ${htmlFiles.length} HTML-страниц, внутренние ссылки, SEO и PWA-файлы корректны.`);
