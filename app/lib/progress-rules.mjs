import { evaluateCaseAnswer } from "./case-rubric.mjs";
import { validateFunnel } from "./analytics-validation.mjs";
import { reconcileCompletedLessons } from "./lesson-progress.mjs";

export const PROGRESS_DATA_VERSION = 2;
export const LESSON_COUNT = 5;
export const QUIZ_PASS_SCORE = 2;
export const QUIZ_TOTAL = 3;
export const RESEARCH_FIELDS = ["decision", "problem", "audience", "exclude", "hypotheses", "signals", "questions", "output"];
export const RESEARCH_MIN_FIELDS = 6;
export const CASE_IDS = ["coffee", "store", "saas", "b2b"];
export const ACQUISITION_BUDGET = 300000;
export const CAPSTONE_LIMITS = { summary: 180, risk: 80, experiment: 120 };
export const RATIONALE_MIN_CRITERIA = 4;

const text = (value) => String(value ?? "");
const filledField = (value) => text(value).trim().length > 15;

// Проверка аналитического вывода: проблема, гипотеза, действие и метрика.
export const ANALYTICS_CONCLUSION_RULES = [
  { name: "Проблема", pattern: /проблем|узк|провал|паден|сниж|низк|мало|терял|не хват|просад/i, tip: "Назовите, какая метрика или этап воронки является проблемой." },
  { name: "Гипотеза", pattern: /гипотез|предполож|если.+то|ожида|возможн|вероятн|причин/i, tip: "Сформулируйте проверяемое предположение о причине." },
  { name: "Действие", pattern: /провед|запущ|собер|провер|измен|протест|сравн|сегментир|улучш|поговор/i, tip: "Опишите, что сделаете первым шагом." },
  { name: "Метрика", pattern: /метрик|конверси|cac|cpl|roas|romi|удерж|повторн|выруч|чек|дол[яю]|процент|%/i, tip: "Назовите показатель, по которому оцените результат." },
];

export function evaluateAnalyticsConclusion(note = "") {
  const value = text(note);
  const criteria = ANALYTICS_CONCLUSION_RULES.map((rule) => ({ name: rule.name, tip: rule.tip, ok: rule.pattern.test(value) }));
  return { criteria, score: criteria.filter((rule) => rule.ok).length, written: value.trim().length > 0 };
}

// ---------- Миграции сохранённых данных (старый формат поддерживается, ничего не удаляется) ----------

export function migrateResearch(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  return { ...base, v: base.v || PROGRESS_DATA_VERSION, completedAt: base.completedAt ?? null };
}

export function migrateStrategy(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  return {
    scenario: base.scenario || 0,
    answers: Array.isArray(base.answers) ? base.answers : [null, null, null, null],
    why: text(base.why),
    ...base,
    v: base.v || PROGRESS_DATA_VERSION,
    checked: Boolean(base.checked),
    checkedScore: Number.isFinite(Number(base.checkedScore)) ? Number(base.checkedScore) : null,
    checkedAt: base.checkedAt ?? null,
  };
}

export function migrateAcquisition(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  return {
    goal: base.goal || "",
    money: base.money && typeof base.money === "object" ? base.money : null,
    reason: text(base.reason),
    ...base,
    v: base.v || PROGRESS_DATA_VERSION,
    checked: Boolean(base.checked),
    checkedAt: base.checkedAt ?? null,
  };
}

export function migrateAnalytics(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  return { ...base, note: text(base.note), v: base.v || PROGRESS_DATA_VERSION, confirmedAt: base.confirmedAt ?? null };
}

export function migrateQuiz(raw) {
  if (!raw || typeof raw !== "object") return null;
  const score = Number(raw.score);
  if (!Number.isFinite(score)) return null;
  return { v: raw.v || 1, score, total: Number(raw.total) || QUIZ_TOTAL, passedAt: raw.passedAt ?? null };
}

export function migrateTrainerAnswers(raw) {
  if (typeof raw === "string") return { v: 1, answers: raw.trim() ? { 0: raw } : {} };
  const base = raw && typeof raw === "object" ? raw : {};
  return { v: base.v || 1, answers: base.answers && typeof base.answers === "object" ? base.answers : {} };
}

// ---------- Единый формат результата ----------

function buildResult(requirements, { started = false, details = [] } = {}) {
  const completedRequirements = requirements.filter((item) => item.ok).map((item) => item.name);
  const missingRequirements = requirements.filter((item) => !item.ok).map((item) => item.name);
  const score = completedRequirements.length;
  const maxScore = requirements.length;
  const completed = maxScore > 0 && score === maxScore;
  return {
    status: completed ? "completed" : started || score > 0 ? "in_progress" : "not_started",
    completed,
    percent: maxScore ? Math.round((score / maxScore) * 100) : 0,
    score,
    maxScore,
    requirements: requirements.map((item) => item.name),
    completedRequirements,
    missingRequirements,
    details: requirements.map((item) => ({ name: item.name, ok: item.ok, detail: item.detail || "" })).concat(details),
  };
}

// ---------- Правила модулей ----------

export function evaluateFoundationProgress({ progress = [], answers = {}, quiz = null } = {}) {
  const validLessons = reconcileCompletedLessons(progress, answers, LESSON_COUNT);
  const quizState = migrateQuiz(quiz);
  const quizPassed = Boolean(quizState && quizState.score >= QUIZ_PASS_SCORE);
  const requirements = [
    { name: "Выполнены все 5 уроков с осмысленными ответами", ok: validLessons.length === LESSON_COUNT, detail: `${validLessons.length}/${LESSON_COUNT} работ` },
    { name: "Пройден итоговый тест", ok: quizPassed, detail: quizState ? `${quizState.score}/${quizState.total}` : "тест не сдавался" },
  ];
  const started = validLessons.length > 0 || Object.values(answers || {}).some((value) => text(value).trim());
  return buildResult(requirements, { started });
}

export function evaluateResearchProgress(raw) {
  const research = migrateResearch(raw);
  const filled = RESEARCH_FIELDS.filter((key) => filledField(research[key])).length;
  const hypothesesCount = text(research.hypotheses).split("\n").filter((line) => line.trim()).length;
  const requirements = [
    { name: "Заполнено минимум 6 из 8 полей брифа", ok: filled >= RESEARCH_MIN_FIELDS, detail: `${filled}/${RESEARCH_FIELDS.length} полей` },
    { name: "Указано бизнес-решение", ok: text(research.decision).trim().length > 20 },
    { name: "Аудитория описана через поведение", ok: text(research.audience).trim().length > 25 },
    { name: "Записано не менее трёх гипотез", ok: hypothesesCount >= 3, detail: `${hypothesesCount} гипотез` },
    { name: "Определён формат результата", ok: filledField(research.output) },
    { name: "Модуль завершён кнопкой «Завершить модуль»", ok: Boolean(research.completedAt) },
  ];
  return buildResult(requirements, { started: filled > 0 });
}

export function evaluateStrategyProgress(raw) {
  const strategy = migrateStrategy(raw);
  const choices = (strategy.answers || []).filter((value) => value !== null && value !== undefined).length;
  const rationale = evaluateCaseAnswer(strategy.why);
  const rationaleStrong = rationale.ready && rationale.score >= RATIONALE_MIN_CRITERIA;
  const requirements = [
    { name: "Выбраны все четыре решения", ok: choices === 4, detail: `${choices}/4 решений` },
    { name: "Нажата кнопка проверки стратегии", ok: strategy.checked },
    { name: "Обоснование прошло минимум 4 из 6 критериев", ok: rationaleStrong, detail: `${rationale.score}/6` },
    { name: "Результат проверки сохранён", ok: Boolean(strategy.checkedAt) },
  ];
  return buildResult(requirements, { started: choices > 0 || text(strategy.why).trim().length > 0 });
}

export function evaluateAcquisitionProgress(raw) {
  const acquisition = migrateAcquisition(raw);
  const budget = acquisition.money ? Object.values(acquisition.money).reduce((sum, value) => sum + Number(value || 0), 0) : 0;
  const rationale = evaluateCaseAnswer(acquisition.reason);
  const rationaleStrong = rationale.ready && rationale.score >= RATIONALE_MIN_CRITERIA;
  const requirements = [
    { name: "Выбрана цель кампании", ok: Boolean(acquisition.goal) },
    { name: "Распределено ровно 300 000 ₽", ok: budget === ACQUISITION_BUDGET, detail: `${budget.toLocaleString("ru-RU")} ₽` },
    { name: "Медиаплан проверен", ok: acquisition.checked && Boolean(acquisition.checkedAt) },
    { name: "Аргументация прошла минимум 4 из 6 критериев", ok: rationaleStrong, detail: `${rationale.score}/6` },
  ];
  return buildResult(requirements, { started: Boolean(raw) });
}

export function evaluateAnalyticsProgress(raw) {
  const analytics = migrateAnalytics(raw);
  const data = analytics.data && typeof analytics.data === "object" ? analytics.data : null;
  const dataErrors = data ? validateFunnel(data) : [];
  const dataValid = Boolean(data) && Number(data.visits) > 0 && dataErrors.length === 0;
  const conclusion = evaluateAnalyticsConclusion(analytics.note);
  const requirements = [
    { name: "Данные воронки логически корректны", ok: dataValid, detail: dataErrors[0] || "" },
    { name: "Написан аналитический вывод", ok: conclusion.written },
    { name: "В выводе есть проблема, гипотеза, действие и метрика", ok: conclusion.score === ANALYTICS_CONCLUSION_RULES.length, detail: `${conclusion.score}/${ANALYTICS_CONCLUSION_RULES.length}` },
    { name: "Завершение подтверждено", ok: Boolean(analytics.confirmedAt) },
  ];
  return buildResult(requirements, { started: Boolean(raw) });
}

export function evaluateCasesProgress(raw) {
  const caseLab = raw && typeof raw === "object" ? raw : { selected: {}, drafts: {} };
  const selected = caseLab.selected || {};
  const drafts = caseLab.drafts || {};
  const completedCases = CASE_IDS.filter((id) => {
    if (selected[id] === undefined || selected[id] === null) return false;
    const draft = text(drafts[id]);
    if (draft.trim().length < 80) return false;
    return evaluateCaseAnswer(draft).score >= RATIONALE_MIN_CRITERIA;
  }).length;
  const writtenCases = CASE_IDS.filter((id) => text(drafts[id]).trim().length >= 80).length;
  const requirements = [
    { name: "Минимум один кейс: выбор, ответ от 80 символов и 4 из 6 критериев", ok: completedCases >= 1, detail: `${completedCases}/${CASE_IDS.length} кейсов · ${writtenCases}/${CASE_IDS.length} написано` },
  ];
  return buildResult(requirements, { started: writtenCases > 0 || Object.keys(selected).length > 0 });
}

export function evaluateCapstoneProgress(rawCapstone, modulesCompleted = 0, modulesTotal = 6) {
  const capstone = rawCapstone && typeof rawCapstone === "object" ? rawCapstone : {};
  const requirements = [
    { name: "Завершены обязательные модули", ok: modulesCompleted === modulesTotal, detail: `${modulesCompleted}/${modulesTotal}` },
    { name: "Резюме стратегии заполнено", ok: text(capstone.summary).length >= CAPSTONE_LIMITS.summary, detail: `${text(capstone.summary).length}/${CAPSTONE_LIMITS.summary}` },
    { name: "Ключевой риск описан", ok: text(capstone.risk).length >= CAPSTONE_LIMITS.risk, detail: `${text(capstone.risk).length}/${CAPSTONE_LIMITS.risk}` },
    { name: "Следующий эксперимент сформулирован", ok: text(capstone.experiment).length >= CAPSTONE_LIMITS.experiment, detail: `${text(capstone.experiment).length}/${CAPSTONE_LIMITS.experiment}` },
  ];
  const started = ["summary", "risk", "experiment"].some((key) => text(capstone[key]).trim());
  return buildResult(requirements, { started });
}

export function evaluateOverallProgress(raw = {}) {
  const foundation = evaluateFoundationProgress({ progress: raw.progress, answers: raw.answers, quiz: raw.quiz });
  const research = evaluateResearchProgress(raw.research);
  const strategy = evaluateStrategyProgress(raw.strategy);
  const acquisition = evaluateAcquisitionProgress(raw.acquisition);
  const analytics = evaluateAnalyticsProgress(raw.analytics);
  const cases = evaluateCasesProgress(raw.caseLab);
  const coreModules = { foundation, research, strategy, acquisition, analytics, cases };
  const modulesCompleted = Object.values(coreModules).filter((module) => module.completed).length;
  const capstone = evaluateCapstoneProgress(raw.capstone, modulesCompleted, Object.keys(coreModules).length);
  const modules = { ...coreModules, capstone };
  const names = { foundation: "Фундамент", research: "Исследования", strategy: "Стратегия", acquisition: "Привлечение", analytics: "Аналитика", cases: "Практикум кейсов", capstone: "Олимп" };
  const requirements = Object.entries(modules).map(([key, module]) => ({ name: names[key], ok: module.completed, detail: `${module.score}/${module.maxScore}` }));
  const started = Object.values(modules).some((module) => module.status !== "not_started");
  return { ...buildResult(requirements, { started }), modules };
}
