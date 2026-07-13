import assert from "node:assert/strict";
import {
  evaluateFoundationProgress,
  evaluateResearchProgress,
  evaluateStrategyProgress,
  evaluateAcquisitionProgress,
  evaluateAnalyticsProgress,
  evaluateCasesProgress,
  evaluateCapstoneProgress,
  evaluateOverallProgress,
  evaluateAnalyticsConclusion,
  migrateResearch,
  migrateStrategy,
  migrateAcquisition,
  migrateAnalytics,
  migrateQuiz,
  migrateTrainerAnswers,
} from "../app/lib/progress-rules.mjs";

const longAnswer = "Клиент — офисный сотрудник утром; ему нужен быстрый напиток по дороге на работу.";
const strongRationale =
  "Сегмент — клиенты после первого заказа: данные CRM показывают падение возврата. Гипотеза: письмо с персональной подборкой вернёт часть базы. Проведём тест и измерим повторный заказ за 30 дней. Риск — сезонность.";

// ---------- Единый формат ----------
for (const result of [evaluateFoundationProgress(), evaluateResearchProgress(null), evaluateStrategyProgress(null), evaluateAcquisitionProgress(null), evaluateAnalyticsProgress(null), evaluateCasesProgress(null), evaluateCapstoneProgress(null), evaluateOverallProgress({})]) {
  for (const key of ["status", "completed", "percent", "score", "maxScore", "requirements", "completedRequirements", "missingRequirements", "details"]) {
    assert.ok(key in result, `в результате нет поля ${key}`);
  }
  assert.equal(result.status, "not_started");
  assert.equal(result.completed, false);
}

// ---------- Фундамент ----------
const notes = { 0: longAnswer, 1: longAnswer, 2: longAnswer, 3: longAnswer, 4: longAnswer };
assert.equal(evaluateFoundationProgress({ progress: [0, 1, 2, 3, 4], answers: notes, quiz: null }).completed, false, "фундамент не завершён без теста");
assert.equal(evaluateFoundationProgress({ progress: [0, 1, 2, 3, 4], answers: notes, quiz: { score: 1 } }).completed, false, "тест на 1/3 не проходной");
assert.equal(evaluateFoundationProgress({ progress: [0, 1, 2, 3, 4], answers: notes, quiz: { score: 2 } }).completed, true);
assert.equal(evaluateFoundationProgress({ progress: [0, 1, 2, 3, 4], answers: { 0: "коротко" }, quiz: { score: 3 } }).completed, false, "уроки без осмысленных ответов не считаются");

// ---------- Исследования ----------
const researchFilled = {
  decision: "Выбрать сегмент для запуска нового тарифа в следующем квартале",
  problem: "Непонятно, какие сегменты готовы платить",
  audience: "Пользователи, создавшие проект, но не вернувшиеся за 7 дней",
  exclude: "Регистрации по акции без реальной задачи",
  hypotheses: "1. Сложный старт\n2. Нет команды\n3. Разовая задача",
  signals: "Частота возврата и глубина настройки",
  questions: "Расскажите о последнем случае планирования недели",
  output: "Таблица инсайтов и карта причин ухода",
};
const researchNoButton = evaluateResearchProgress(researchFilled);
assert.equal(researchNoButton.completed, false, "исследования не завершены без явной кнопки");
assert.ok(researchNoButton.missingRequirements.some((name) => name.includes("Завершить модуль")));
assert.equal(evaluateResearchProgress({ ...researchFilled, completedAt: "2026-07-13" }).completed, true);
const longJunk = { ...researchFilled, decision: "х".repeat(400), audience: "коротко", hypotheses: "одна гипотеза" };
assert.equal(evaluateResearchProgress({ ...longJunk, completedAt: "2026-07-13" }).completed, false, "общая длина текста не заменяет ключевые проверки");

// ---------- Стратегия ----------
assert.equal(evaluateStrategyProgress({ scenario: 0, answers: [0, 1, 2, 0], why: "" }).completed, false, "четыре выбора без проверки и обоснования не завершают модуль");
const strategyDone = { scenario: 0, answers: [1, 1, 1, 1], why: strongRationale, checked: true, checkedScore: 5, checkedAt: "2026-07-13" };
assert.equal(evaluateStrategyProgress(strategyDone).completed, true);
assert.equal(evaluateStrategyProgress({ ...strategyDone, why: "просто нравится" }).completed, false, "слабое обоснование не проходит");

// ---------- Привлечение ----------
const money = { search: 120000, social: 90000, content: 60000, crm: 30000 };
assert.equal(evaluateAcquisitionProgress({ goal: "retention", money, reason: strongRationale, checked: true, checkedAt: "2026-07-13" }).completed, true);
assert.equal(evaluateAcquisitionProgress({ goal: "retention", money: { ...money, crm: 20000 }, reason: strongRationale, checked: true, checkedAt: "x" }).completed, false, "бюджет должен сходиться ровно в 300000");
assert.equal(evaluateAcquisitionProgress({ goal: "retention", money, reason: strongRationale }).completed, false, "без проверки медиаплан не завершён");

// ---------- Аналитика ----------
const funnel = { visits: 20000, leads: 1200, sales: 180, revenue: 900000, spend: 300000 };
const goodNote = "Проблема в конверсии из заявки в продажу. Гипотеза: лиды не квалифицируются. Проведём разбор звонков и измерим конверсию за месяц.";
assert.equal(evaluateAnalyticsProgress({ data: funnel, note: goodNote, confirmedAt: "2026-07-13" }).completed, true);
assert.equal(evaluateAnalyticsProgress({ data: funnel, note: goodNote }).completed, false, "без подтверждения завершения аналитика не закрыта");
assert.equal(evaluateAnalyticsProgress({ data: { ...funnel, leads: 30000 }, note: goodNote, confirmedAt: "x" }).completed, false, "противоречивые данные блокируют завершение");
assert.equal(evaluateAnalyticsProgress({ data: funnel, note: "всё нормально", confirmedAt: "x" }).completed, false, "sales > 0 недостаточно: нужен вывод с 4 элементами");
assert.equal(evaluateAnalyticsConclusion(goodNote).score, 4);

// ---------- Кейсы ----------
assert.equal(evaluateCasesProgress({ selected: { coffee: 1 }, drafts: { coffee: strongRationale } }).completed, true);
assert.equal(evaluateCasesProgress({ selected: {}, drafts: { coffee: strongRationale } }).completed, false, "без выбранного направления кейс не засчитан");
assert.equal(evaluateCasesProgress({ selected: { coffee: 1 }, drafts: { coffee: "коротко" } }).completed, false);

// ---------- Олимп ----------
const capstone = { summary: "с".repeat(180), risk: "р".repeat(80), experiment: "э".repeat(120) };
assert.equal(evaluateCapstoneProgress(capstone, 6, 6).completed, true);
assert.equal(evaluateCapstoneProgress(capstone, 5, 6).completed, false, "без обязательных модулей защита не принимается");
assert.equal(evaluateCapstoneProgress({ ...capstone, risk: "мало" }, 6, 6).completed, false);

// ---------- Общий прогресс ----------
const overall = evaluateOverallProgress({
  progress: [0, 1, 2, 3, 4],
  answers: notes,
  quiz: { score: 3 },
  research: { ...researchFilled, completedAt: "2026-07-13" },
  strategy: strategyDone,
  acquisition: { goal: "retention", money, reason: strongRationale, checked: true, checkedAt: "x" },
  analytics: { data: funnel, note: goodNote, confirmedAt: "x" },
  caseLab: { selected: { coffee: 1 }, drafts: { coffee: strongRationale } },
  capstone,
});
assert.equal(overall.completed, true, "полный набор данных даёт полный прогресс");
assert.equal(overall.maxScore, 7);
assert.equal(overall.modules.capstone.completed, true);
const partial = evaluateOverallProgress({ progress: [0], answers: { 0: longAnswer } });
assert.equal(partial.status, "in_progress");
assert.equal(partial.modules.foundation.status, "in_progress");
assert.equal(partial.modules.research.status, "not_started");

// ---------- Миграции: старые форматы читаются, данные не теряются ----------
const oldResearch = { decision: "старое решение о запуске", audience: "старая аудитория с поведением и контекстом" };
const migratedResearch = migrateResearch(oldResearch);
assert.equal(migratedResearch.decision, oldResearch.decision, "старые поля исследований сохраняются");
assert.equal(migratedResearch.completedAt, null, "старый бриф не считается завершённым автоматически");
assert.ok(migratedResearch.v >= 2);

const oldStrategy = { scenario: 1, answers: [1, 1, 1, 1], why: strongRationale };
const migratedStrategy = migrateStrategy(oldStrategy);
assert.equal(migratedStrategy.why, strongRationale);
assert.equal(migratedStrategy.checked, false, "старая стратегия без проверки не завершена");
assert.equal(evaluateStrategyProgress(oldStrategy).completed, false);
assert.equal(evaluateStrategyProgress(oldStrategy).status, "in_progress", "старые данные видны как прогресс, а не потеряны");

const oldAcquisition = { goal: "leads", money, reason: strongRationale };
assert.equal(migrateAcquisition(oldAcquisition).goal, "leads");
assert.equal(evaluateAcquisitionProgress(oldAcquisition).completed, false);

const oldAnalytics = { data: funnel, note: goodNote };
assert.equal(migrateAnalytics(oldAnalytics).confirmedAt, null);
assert.equal(migrateAnalytics(oldAnalytics).note, goodNote);

assert.equal(migrateQuiz(null), null);
assert.equal(migrateQuiz({ score: 2 }).score, 2);
assert.equal(migrateQuiz({ score: "нет" }), null);

const legacyTrainer = migrateTrainerAnswers("мой старый ответ");
assert.equal(legacyTrainer.answers[0], "мой старый ответ", "строковый формат тренажёра мигрирует без потери");
assert.deepEqual(migrateTrainerAnswers(null).answers, {});
assert.equal(migrateTrainerAnswers({ v: 1, answers: { 1: "ответ" } }).answers[1], "ответ");

console.log("Правила прогресса: единый формат, завершение модулей и миграции работают корректно.");
