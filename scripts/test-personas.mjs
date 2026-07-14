import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { chromium } from "playwright";
import { foundationLessons } from "../app/lib/foundation-curriculum.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
if (!existsSync(dist)) {
  console.error("PERSONAS FAILED: каталог dist не найден. Сначала выполните pnpm build.");
  process.exit(1);
}

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

const server = createServer((request, response) => {
  const requested = decodeURIComponent(new URL(request.url, "http://x").pathname);
  const clean = requested === "/marketing-olympus-academy" ? "/" : requested.startsWith("/marketing-olympus-academy/") ? requested.slice("/marketing-olympus-academy".length) : requested;
  let path = join(dist, clean.endsWith("/") ? `${clean}index.html` : clean);
  if (!existsSync(path) || statSync(path).isDirectory()) {
    if (existsSync(join(path, "index.html"))) path = join(path, "index.html");
    else {
      response.writeHead(404, { "content-type": "text/html" });
      response.end(readFileSync(join(dist, "404.html")));
      return;
    }
  }
  response.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream" });
  response.end(readFileSync(path));
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const base = `http://127.0.0.1:${server.address().port}`;

const executablePath = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/opt/pw-browsers/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((path) => existsSync(path));
if (!executablePath) {
  server.close();
  console.error("PERSONAS FAILED: не найден Chrome, Chromium или Edge.");
  process.exit(1);
}

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const errors = [];
const check = (condition, label) => {
  if (!condition) errors.push(label);
};

function watchRuntime(page, role) {
  page.on("pageerror", (error) => errors.push(`${role}: ошибка JavaScript — ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) {
      errors.push(`${role}: ошибка в консоли — ${message.text()}`);
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 500) errors.push(`${role}: ${response.status()} при загрузке ${response.url()}`);
    if (response.status() === 404 && !response.url().endsWith("/favicon.ico") && !response.url().includes("/no-such-page")) errors.push(`${role}: отсутствует ресурс ${response.url()}`);
  });
}

async function openTrainer(page) {
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.locator(".actions button.primary").click();
  await page.locator(".course-shell").waitFor();
}

async function chooseCoreStages(page, lessonIndex, { wrongCase = false } = {}) {
  const lesson = foundationLessons[lessonIndex];
  await page.locator(".provocation .foundation-options button").nth(lesson.provocation.best).click();
  await page.locator(".reason-grid button").nth(0).click();
  await page.locator(".reason-grid button").nth(1).click();
  const caseOptions = page.locator(".lesson-stage .foundation-options").nth(1).locator("button");
  await caseOptions.nth(wrongCase ? (lesson.miniCase.best === 0 ? 1 : 0) : lesson.miniCase.best).click();
}

const professionalAnswers = [
  [
    "Сервис доставки горячих семейных рационов по недельной подписке для занятых родителей",
    "Родитель с полной рабочей сменой, который возвращается домой после 20:00 и кормит семью",
    "После поздней смены дома нет готового ужина, а до сна детей остаётся менее 90 минут",
    "Накормить семью горячим ужином за 30 минут без закупки продуктов и самостоятельной готовки",
    "Получить предсказуемый ужин до 21:00 и освободить не менее 40 минут семейного времени",
    "Не менее 90% заказов доставлены за 30 минут, повторная подписка измеряется через 14 дней",
  ],
  [
    "Родители после поздней рабочей смены, которым нужно накормить семью горячим ужином за 30 минут",
    "Спрос возникает после 20:00, когда дома нет готовой еды и дети должны лечь спать через 90 минут",
    "Задача повторяется от двух до четырёх раз в неделю в зависимости от графика рабочих смен",
    "Сейчас клиент готовит сам, покупает полуфабрикаты или заказывает отдельные блюда в агрегаторе",
    "Самостоятельная готовка занимает 40 минут, а агрегатор не гарантирует совместимый семейный рацион",
    "Клиент уже платит 1800–2600 рублей в неделю и готов оформить подписку при соблюдении времени доставки",
    "Провести 15 интервью и тест на 30 заказах: не менее 40% семей выбирают повторную неделю",
  ],
  [
    "Родители после поздней смены с детьми младше семи лет и ужином не позднее 21:00",
    "Семьи с двумя работающими родителями, заказывающие готовую еду минимум три раза в неделю",
    "Родители с нерегулярным графиком, которым нужен резервный рацион в конкретные дни смены",
    "Родители после поздней смены с детьми младше семи лет и ужином не позднее 21:00",
    "Сегмент испытывает задачу четыре раза в неделю, ограничен временем сна детей и уже платит агрегаторам",
    "Предложить недельный рацион с доставкой до 21:00 и компенсацией при опоздании более 30 минут",
  ],
  [
    "Родители после поздней смены с детьми младше семи лет и ужином не позднее 21:00",
    "После 20:00 дома нет готовой еды, а ребёнку нужно лечь спать в течение следующих 90 минут",
    "Горячий семейный ужин оказывается дома до 21:00 и сохраняет минимум 40 минут времени родителей",
    "Вместо самостоятельной готовки, полуфабрикатов или непредсказуемого заказа через агрегатор",
    "Рацион совместим для семьи, доставляется за 30 минут и компенсируется при нарушении обещанного срока",
    "На пилоте 90% из 30 заказов доставлены вовремя, а 40% семей повторили недельную подписку",
    "Для родителей после поздней смены сервис обеспечивает горячий семейный ужин до 21:00 за 30 минут вместо готовки и непредсказуемого агрегатора; обещание подтверждает пилот на 30 заказах",
  ],
  [
    "Родители после поздней смены с детьми младше семи лет и ужином не позднее 21:00",
    "Сервис недельной доставки совместимых горячих семейных рационов с гарантированным временем",
    "Самостоятельная готовка, полуфабрикаты и непредсказуемая доставка отдельных блюд через агрегатор",
    "Гарантия горячего совместимого ужина до 21:00 не позднее чем через 30 минут после заказа",
    "Единый семейный рацион, фиксированное окно и компенсация при опоздании уменьшают риск для родителя",
    "На пилоте 27 из 30 заказов доставлены вовремя, а 12 семей повторили подписку через 14 дней",
    "Для родителей после поздней смены это сервис семейных рационов, который доставляет горячий ужин до 21:00 за 30 минут, в отличие от готовки и агрегаторов; результат подтверждён пилотом",
    "Горячий семейный ужин до 21:00 за 30 минут с гарантией срока и компенсацией опоздания",
  ],
];

const professionalDefense = "Решение опирается на повторяющуюся задачу после поздней смены и пилот из 30 заказов. Главный риск — спрос недостаточно частый; контраргумент проверяем долей повторной подписки за 14 дней. Защитная метрика: минимум 40% семей оформляют следующую неделю без скидки.";
const boardChallenge = "Главный риск — родители не захотят недельную подписку. Контраргумент проверяем на пилоте; защитная метрика — повторная покупка минимум 40% семей за 14 дней без дополнительной скидки.";

// Новичок: теория открывается последовательно, ошибка объясняется, подсказки помогают завершить первый урок.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  watchRuntime(page, "Новичок");
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await page.locator(".actions button.primary").click();
  check((await page.locator(".lesson-stage").count()) === 1, "Новичок: теория показана до ответа на провокацию");
  await chooseCoreStages(page, 0, { wrongCase: true });
  check((await page.locator(".case-explanation.good").count()) === 0, "Новичок: ошибочный мини-кейс отмечен как правильный");
  check(await page.locator(".case-explanation").isVisible(), "Новичок: нет объяснения ошибки мини-кейса");
  check((await page.getByRole("button", { name: "Проверить ответ →" }).count()) === 0, "Новичок: практика доступна до выбора проекта");
  await page.locator(".project-grid button").nth(2).click();
  check((await page.locator(".foundation-fields small").count()) >= 6, "Новичок: не показаны подсказки к полям");
  await page.getByRole("button", { name: "Подставить учебный старт →" }).click();
  await page.getByRole("button", { name: "Проверить ответ →" }).click();
  check(await page.getByRole("button", { name: "Завершить урок →" }).isDisabled(), "Новичок: урок можно завершить без защиты решения");
  await page.locator(".defense textarea").fill("Клиент экономит не менее 40 минут после смены; результат проверяем долей заказов, доставленных за 7 минут, и повторной покупкой в течение 14 дней.");
  await page.locator(".review-question .foundation-options button").nth(foundationLessons[0].review.best).click();
  await page.getByRole("button", { name: "Завершить урок →" }).click();
  await page.locator(".foundation-lesson > h1").filter({ hasText: foundationLessons[1].title }).waitFor();
  check((await page.locator(".mini-progress i").first().getAttribute("style"))?.includes("20%"), "Новичок: после урока не показан прогресс 20%");
  await page.locator(".course-shell .back").click();
  check((await page.locator(".ring span").textContent()) === "20%", "Новичок: прогресс не виден на главной");
  await context.close();
  console.log("✓ Новичок: последовательное обучение, подсказки, исправление и сохранение работают.");
}

// Профессиональный маркетолог: пять связанных решений, высокий порог, защита, итоговый документ.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  watchRuntime(page, "Профессионал");
  await openTrainer(page);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await page.locator(".actions button.primary").click();

  for (let lessonIndex = 0; lessonIndex < foundationLessons.length; lessonIndex += 1) {
    await chooseCoreStages(page, lessonIndex);
    if (lessonIndex === 0) {
      await page.locator(".project-grid button").nth(0).click();
      await page.locator(".field-label input").fill("Семейный рацион «Вечер дома»");
      await page.locator(".difficulty-row button").nth(2).click();
    }
    const fields = page.locator(".foundation-fields textarea");
    check((await fields.count()) === professionalAnswers[lessonIndex].length, `Профессионал: неверное число полей в уроке ${lessonIndex + 1}`);
    for (let fieldIndex = 0; fieldIndex < professionalAnswers[lessonIndex].length; fieldIndex += 1) {
      await fields.nth(fieldIndex).fill(professionalAnswers[lessonIndex][fieldIndex]);
    }
    await page.locator(".pro-challenge textarea").fill(boardChallenge);
    await page.getByRole("button", { name: "Проверить ответ →" }).click();
    await page.locator(".defense textarea").fill(professionalDefense);
    await page.locator(".review-question .foundation-options button").nth(foundationLessons[lessonIndex].review.best).click();
    const score = Number((await page.locator(".evaluation-head strong").textContent()).split("/")[0]);
    check(score >= 80, `Профессионал: сильное решение урока ${lessonIndex + 1} получило только ${score}/100`);
    const finish = page.getByRole("button", { name: "Завершить урок →" });
    const finishDisabled = await finish.isDisabled();
    check(!finishDisabled, `Профессионал: нельзя завершить сильный ответ в уроке ${lessonIndex + 1}`);
    if (finishDisabled) {
      const blocker = await page.locator(".lesson-result > p").last().textContent();
      const issues = await page.locator(".feedback-grid article").nth(1).locator("li").allTextContents();
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("olymp-foundation-v2")));
      throw new Error(`Профессиональный урок ${lessonIndex + 1} заблокирован при ${score}/100: ${blocker}; ${issues.join(" | ")}; предыдущая задача: ${saved.lessons?.["marketing-basics-1"]?.answers?.job}; текущая группа: ${saved.lessons?.["marketing-basics-2"]?.answers?.group}`);
    }
    await finish.click();
    if (lessonIndex < foundationLessons.length - 1) {
      await page.locator(".foundation-lesson > h1").filter({ hasText: foundationLessons[lessonIndex + 1].title }).waitFor();
    }
  }

  await page.locator(".quiz-page").waitFor();
  await page.locator(".course-shell .back").click();
  check((await page.locator(".ring span").textContent()) === "100%", "Профессионал: пять уроков не дали прогресс 100%");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать маркетинговый фундамент ↓" }).click();
  const download = await downloadPromise;
  check(download.suggestedFilename() === "marketing-foundation.txt", "Профессионал: неверное имя итогового документа");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const documentText = Buffer.concat(chunks).toString("utf8");
  check(documentText.includes("МАРКЕТИНГОВЫЙ ФУНДАМЕНТ ПРОЕКТА"), "Профессионал: скачанный документ не содержит итоговый фундамент");
  check(documentText.includes("Вечер дома") && documentText.includes("ПОЗИЦИОНИРОВАНИЕ"), "Профессионал: документ не собрал проект и пять уроков");

  // Программист: смена проекта обязана инвалидировать результаты и синхронизировать старый индикатор.
  await page.locator(".actions button.primary").click();
  await page.locator(".project-grid button").nth(2).click();
  const switched = await page.evaluate(() => ({
    foundation: JSON.parse(localStorage.getItem("olymp-foundation-v2")),
    legacyProgress: JSON.parse(localStorage.getItem("olymp-progress")),
  }));
  check(Object.values(switched.foundation.lessons).every((lesson) => lesson.status !== "completed"), "Программист: после смены проекта остались завершённые уроки");
  check(switched.legacyProgress.length === 0, "Программист: смена проекта не сбросила общий индикатор прогресса");
  await context.close();
  console.log("✓ Профессионал: пять уроков, связи, защита и итоговый документ работают.");
  console.log("✓ Программист: смена проекта корректно инвалидирует несопоставимые результаты.");
}

// Программист: приложение восстанавливается после повреждённых локальных данных; модалка доступна с клавиатуры.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  watchRuntime(page, "Программист");
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.evaluate(() => {
    localStorage.setItem("olymp-foundation-v2", "{broken");
    localStorage.setItem("olymp-progress", "not-json");
    localStorage.setItem("olymp-answers", "not-json");
  });
  await page.reload({ waitUntil: "load" });
  check((await page.locator(".ring span").textContent()) === "0%", "Программист: повреждённое хранилище создаёт ложный прогресс");
  const opener = page.locator(".actions button.primary");
  await opener.focus();
  await opener.click();
  check((await page.evaluate(() => document.body.style.overflow)) === "hidden", "Программист: фон прокручивается под учебным окном");
  check(await page.locator(".course-shell .back").evaluate((element) => element === document.activeElement), "Программист: фокус не перенесён в учебное окно");
  await page.locator(".provocation .foundation-options button").nth(0).click();
  const repaired = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem("olymp-foundation-v2")).version === 2; } catch { return false; }
  });
  check(repaired, "Программист: тренажёр не восстановил повреждённое хранилище после нового действия");
  await page.keyboard.press("Escape");
  check((await page.locator(".course-shell").count()) === 0, "Программист: Escape не закрывает учебное окно");
  check(await opener.evaluate((element) => element === document.activeElement), "Программист: после закрытия фокус не вернулся к кнопке запуска");
  await context.close();
  console.log("✓ Программист: повреждённое хранилище, фокус, Escape и блокировка фона обработаны.");
}

// Веб-дизайнер: все экспортированные страницы не имеют горизонтального скролла на узком и широком экране.
{
  const htmlFiles = [];
  const collect = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name === "index.html") htmlFiles.push(full);
    }
  };
  collect(dist);
  const routes = [...new Set(htmlFiles.map((file) => {
    const folder = relative(dist, file.slice(0, -"index.html".length)).split(sep).join("/");
    return folder ? `/${folder}` : "/";
  }))].sort();
  const context = await browser.newContext();
  const page = await context.newPage();
  watchRuntime(page, "Веб-дизайнер");
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: width === 320 ? 700 : 900 });
    for (const route of routes) {
      await page.goto(`${base}${route}`, { waitUntil: "load" });
      const layout = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        unnamedButtons: [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label") && !button.getAttribute("title")).length,
        offenders: [...document.querySelectorAll("*")].map((element) => ({
          name: `${element.tagName.toLowerCase()}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
        })).filter((element) => element.left < -1 || element.right > document.documentElement.clientWidth + 1).slice(0, 6),
        wideContent: [...document.querySelectorAll("*")].map((element) => ({
          name: `${element.tagName.toLowerCase()}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
          client: element.clientWidth,
          scroll: element.scrollWidth,
        })).filter((element) => element.scroll > element.client + 1).sort((left, right) => right.scroll - left.scroll).slice(0, 6),
      }));
      check(layout.scroll <= layout.client, `Веб-дизайнер: горизонтальный скролл ${layout.scroll}px на ${route} при ${width}px (${layout.offenders.map((item) => `${item.name}:${item.left}..${item.right}`).join(", ")}; внутреннее содержимое: ${layout.wideContent.map((item) => `${item.name}:${item.client}/${item.scroll}`).join(", ")})`);
      check(layout.unnamedButtons === 0, `Веб-дизайнер: кнопка без доступного имени на ${route}`);
    }
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/`, { waitUntil: "load" });
  const menu = page.locator(".menu-toggle");
  await menu.click();
  check((await menu.getAttribute("aria-expanded")) === "true", "Веб-дизайнер: мобильное меню не сообщает открытое состояние");
  check(await page.locator(".navlinks").isVisible(), "Веб-дизайнер: мобильное меню не видно после открытия");
  await page.locator(".navlinks a").first().click();
  check((await menu.getAttribute("aria-expanded")) === "false", "Веб-дизайнер: меню не закрывается после выбора раздела");
  await page.locator(".actions button.primary").click();
  await page.locator(".provocation .foundation-options button").nth(1).click();
  const lessonTop = await page.locator(".foundation-lesson > h1").evaluate((element) => element.getBoundingClientRect().top);
  check(lessonTop < 500, `Веб-дизайнер: на телефоне содержание урока начинается слишком низко (${Math.round(lessonTop)}px)`);
  check((await page.locator(".course-shell").evaluate((element) => element.scrollWidth <= element.clientWidth)), "Веб-дизайнер: учебное окно имеет горизонтальный скролл на 375px");
  await context.close();
  console.log(`✓ Веб-дизайнер: ${routes.length} страниц проверены на 320 и 1440px; мобильное меню и урок доступны.`);
}

await browser.close();
server.close();

if (errors.length) {
  console.error(`PERSONAS FAILED (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Проверка четырёх ролей пройдена: новичок, профессиональный маркетолог, программист и веб-дизайнер.");
