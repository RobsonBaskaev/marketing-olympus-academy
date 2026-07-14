import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const basePath = "/marketing-olympus-academy";
const publicBase = "https://robsonbaskaev.github.io/marketing-olympus-academy/";
const requiredRoutes = [
  "index.html",
  "learn/index.html",
  "diagnostic/index.html",
  "skills/index.html",
  "review/index.html",
  "start/index.html",
  "curriculum/index.html",
  "library/index.html",
  "business-diagnostic/index.html",
  "teams/index.html",
  "research/index.html",
  "strategy/index.html",
  "acquisition/index.html",
  "analytics/index.html",
  "olympus/index.html",
  "backup/index.html",
  "pro/index.html",
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
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "og.png",
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
  if (label !== "404.html" && label.replace(/\\/g, "/") !== "404/index.html") {
    const route = label === "index.html" ? "" : label.replace(/index\.html$/, "");
    const expectedCanonical = `${publicBase}${route.replace(/\\/g, "/")}`;
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1];
    if (canonical !== expectedCanonical) errors.push(`${label}: canonical ${canonical || "отсутствует"}, ожидался ${expectedCanonical}`);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1];
    const ogUrl = html.match(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/i)?.[1];
    if (ogTitle !== title) errors.push(`${label}: og:title не совпадает с title`);
    if (ogUrl !== expectedCanonical) errors.push(`${label}: og:url ${ogUrl || "отсутствует"}, ожидался ${expectedCanonical}`);
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
    if (ogImage !== `${publicBase}og.png`) errors.push(`${label}: og:image ${ogImage || "отсутствует"}, ожидался ${publicBase}og.png`);
    if (!/<link[^>]+rel="icon"/i.test(html)) errors.push(`${label}: отсутствует favicon`);
    if (!/<link[^>]+rel="apple-touch-icon"/i.test(html)) errors.push(`${label}: отсутствует apple-touch-icon`);
  }
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
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
if (sitemap.includes("/backup/")) errors.push("sitemap.xml: техническая noindex-страница backup не должна индексироваться");

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
const businessDiagnosticSource = readFileSync(join(root, "app", "business-diagnostic", "planner.js"), "utf8");
const businessDiagnosticLogic = readFileSync(join(root, "app", "lib", "business-diagnostic.mjs"), "utf8");
const teamsSource = readFileSync(join(root, "app", "teams", "page.js"), "utf8");
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
if ((mainSource.match(/why: "/g) || []).length < 8) {
  errors.push("Итоговый тест: должно быть не менее 8 вопросов с объяснениями");
}
for (const marker of ["Перейти к исследованиям", "quiz-review", "Разбор ответов", "isQuizPassed"]) {
  if (!mainSource.includes(marker)) errors.push(`Итоговый тест: отсутствует ${marker}`);
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
if (!learnSource.includes("progress-rules.mjs") || !olympusSource.includes("progress-rules.mjs") || !skillsSource.includes("progress-rules.mjs")) {
  errors.push("Единые правила прогресса (progress-rules.mjs) не используются во всех отчётах прогресса");
}
if (!learnSource.includes("evaluateOverallProgress") || !olympusSource.includes("evaluateOverallProgress") || !skillsSource.includes("evaluateOverallProgress")) {
  errors.push("Кабинет, Олимп и карта компетенций должны считать статусы через evaluateOverallProgress");
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
if ((libraryMethodsSource.match(/title:/g) || []).length < 28) {
  errors.push("Библиотека методов: должно быть не менее 28 практических методов");
}
for (const marker of ["MethodVisual", "Визуальная инструкция", "Примеры применения в бизнесе", "Россия · учебный сценарий", "США · учебный сценарий", "methodSources"]) {
  if (!librarySource.includes(marker) && !libraryMethodsSource.includes(marker)) errors.push(`Визуальная библиотека: отсутствует ${marker}`);
}
if ((libraryMethodsSource.match(/ru:"/g) || []).length !== 28 || (libraryMethodsSource.match(/us:"/g) || []).length !== 28) {
  errors.push("Библиотека: каждому из 28 методов нужны примеры РФ и США");
}
for (const marker of ["buildBusinessMethodPlans", "businessProfileReady", "28 инструментов", "olymp-business-diagnostic", "Оплата пока не подключена"]) {
  if (!businessDiagnosticSource.includes(marker) && !businessDiagnosticLogic.includes(marker)) errors.push(`Диагностика бизнеса: отсутствует ${marker}`);
}
for (const marker of ["ПИЛОТНАЯ МЕТОДИЧКА", "ДОСТУПНО СЕЙЧАС", "ТРЕБУЕТ СЕРВЕРНОЙ ВЕРСИИ", "СЦЕНАРИЙ КЕЙС-СЕМИНАРА", "КАК ОЦЕНИТЬ ПИЛОТ"]) {
  if (!teamsSource.includes(marker)) errors.push(`Пилот для команд: отсутствует ${marker}`);
}
if (!backupSource.includes('"olymp-business-diagnostic"')) errors.push("Резервная копия: не включён профиль диагностики бизнеса");
for (const marker of ["Marketing Management: Analytics, Frameworks, and Applications", "New Enterprises", "Marketing Strategy", "Высшая школа экономики", "U.S. Small Business Administration", "Корпорация «МСП»", "Роскомнадзор"]) {
  if (!sourcesSource.includes(marker)) errors.push(`Карта источников: отсутствует ${marker}`);
}
for (const marker of ["actions/checkout@v6", "pnpm/action-setup@v6", "actions/setup-node@v6", "node-version: 24"]) {
  if (!pagesWorkflow.includes(marker)) errors.push(`GitHub Pages workflow: отсутствует ${marker}`);
}
if (serviceWorker.includes('"/marketing-olympus-academy"') || !serviceWorker.includes("registration.scope")) {
  errors.push("sw.js: базовый путь должен вычисляться из registration.scope, а не задаваться жёстко");
}
const notFoundSource = readFileSync(join(root, "app", "not-found.js"), "utf8");
if (!notFoundSource.includes("github.io")) {
  errors.push("Страница 404: ссылки восстановления должны учитывать хост (github.io против локального запуска)");
}
if (!analyticsSource.includes("Math.min(100")) {
  errors.push("Аналитика: ширина баров воронки должна быть ограничена сверху (Math.min)");
}
if (!caseLabSource.includes("evaluateCaseAnswer") || !caseLabSource.includes('href="../review/"')) {
  errors.push("Практикум кейсов: нужна рубрика evaluateCaseAnswer и ссылка на детальный разбор /review/");
}
const globalsCss = readFileSync(join(root, "app", "globals.css"), "utf8");
if (globalsCss.includes("fonts.googleapis.com") || !globalsCss.includes("@font-face")) {
  errors.push("Шрифты должны быть локальными (@font-face), без блокирующего запроса к fonts.googleapis.com");
}
if (!mainSource.includes("menu-toggle") || !globalsCss.includes(".navlinks.open")) {
  errors.push("Главная: на мобильной ширине нужно раскрывающееся меню навигации");
}
const proSource = readFileSync(join(root, "app", "pro", "pro-offer.js"), "utf8");
for (const marker of ["olymp-pro-request", "РАННИЙ ДОСТУП · ОПЛАТА ПОКА НЕ ПОДКЛЮЧЕНА", "mailto:", "Заявка ни к чему не обязывает", "Честные границы"]) {
  if (!proSource.includes(marker)) errors.push(`Страница Pro: отсутствует ${marker}`);
}
if (!backupSource.includes('"olymp-pro-request"')) errors.push("Резервная копия: не включена заявка на Pro");
for (const [label, source] of [["Главная", mainSource], ["Диагностика бизнеса", businessDiagnosticSource], ["Пилот для команд", teamsSource]]) {
  if (!source.includes('pro/"')) errors.push(`${label}: нет ссылки на страницу раннего доступа Pro`);
}
if (!sitemap.includes("/pro/")) errors.push("sitemap.xml: отсутствует страница pro");
if (!reviewSource.includes("ВАШ ОТВЕТ")) errors.push("Разбор кейсов: сохранённый ответ ученика должен отображаться рядом с оценкой");
const researchSource = readFileSync(join(root, "app", "research", "page.js"), "utf8");
for (const marker of ["Завершить модуль", "Скачать черновик", "Вернуться к редактированию", "Перейти к стратегии", "progress-rules.mjs", "storage-warning"]) {
  if (!researchSource.includes(marker)) errors.push(`Исследования: отсутствует ${marker}`);
}
for (const [label, source] of [["Стратегия", strategySource], ["Медиаплан", acquisitionSource], ["Аналитика", analyticsSource]]) {
  for (const marker of ["Скачать черновик", "Завершить и скачать", "progress-rules.mjs"]) {
    if (!source.includes(marker)) errors.push(`${label}: нет разделения черновика и завершённой работы (${marker})`);
  }
}
for (const marker of ["olymp-trainer-answers", "Очистить ответ", "olymp-quiz", "storage-warning-inline", "migrateTrainerAnswers"]) {
  if (!mainSource.includes(marker)) errors.push(`Главная: отсутствует ${marker}`);
}
if (!backupSource.includes('"olymp-quiz"') || !backupSource.includes('"olymp-trainer-answers"')) {
  errors.push("Резервная копия: не включены результат теста и ответы демонстрационного тренажёра");
}
if (!existsSync(join(root, "scripts", "test-progress-rules.mjs"))) {
  errors.push("Нет тестов единых правил прогресса (scripts/test-progress-rules.mjs)");
}

if (errors.length) {
  console.error(`Проверка сайта не пройдена (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Проверка пройдена: ${htmlFiles.length} HTML-страниц, внутренние ссылки, SEO и PWA-файлы корректны.`);
