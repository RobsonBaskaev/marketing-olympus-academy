"use client";
import { useEffect, useState } from "react";
import { evaluateCaseAnswer } from "../lib/case-rubric.mjs";

const parse = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
};
const modules = [
  {
    n: "01",
    name: "Фундамент",
    href: "../",
    skill: "Клиент, рынок, ценность и позиционирование",
  },
  {
    n: "02",
    name: "Исследования",
    href: "../research/",
    skill: "Бриф, гипотезы и интервью",
  },
  {
    n: "03",
    name: "Стратегия",
    href: "../strategy/",
    skill: "Сегмент, ценность, канал и метрика",
  },
  {
    n: "04",
    name: "Привлечение",
    href: "../acquisition/",
    skill: "Бюджет, медиамикс и прогноз",
  },
  {
    n: "05",
    name: "Аналитика",
    href: "../analytics/",
    skill: "Воронка, CAC, CPL и ROAS",
  },
  {
    n: "P",
    name: "Практикум кейсов",
    href: "../cases/",
    skill: "Решения от новичка до профессионала",
  },
  {
    n: "06",
    name: "Олимп",
    href: "../olympus/",
    skill: "Итоговая защита проекта",
  },
];

export default function Learn() {
  const [state, setState] = useState({
    loaded: false,
    ready: [],
    details: [],
    diagnostic: null,
    diagnosticHistory: [],
  });
  useEffect(() => {
    const notes = parse("olymp-answers", {}),
      research = parse("olymp-research", {}),
      strategy = parse("olymp-strategy", {}),
      acq = parse("olymp-acquisition", {}),
      analytics = parse("olymp-analytics", {}),
      caseLab = parse("olymp-case-lab", { selected: {}, drafts: {} }),
      diagnostic = parse("olymp-diagnostic", null),
      diagnosticHistory = parse("olymp-diagnostic-history", []),
      cap = parse("olymp-capstone", {}),
      noteCount = Object.values(notes).filter(
        (v) => String(v || "").length >= 30,
      ).length,
      researchCount = Object.values(research).filter(
        (v) => String(v || "").length > 15,
      ).length,
      strategyCount = (strategy.answers || []).filter(
        (v) => v !== null && v !== undefined,
      ).length,
      acqBudget = acq.money
        ? Object.values(acq.money).reduce((a, b) => a + Number(b || 0), 0)
        : 0,
      analyticsReady = Number(analytics.data?.sales || 0) > 0,
      caseCount = Object.keys(caseLab.selected || {}).filter(
        (id) => String(caseLab.drafts?.[id] || "").trim().length >= 80,
      ).length,
      strongCaseCount = Object.keys(caseLab.drafts || {}).filter(
        (id) => evaluateCaseAnswer(caseLab.drafts[id]).ready && evaluateCaseAnswer(caseLab.drafts[id]).score >= 4,
      ).length,
      capCount = [
        cap.summary?.length >= 180,
        cap.risk?.length >= 80,
        cap.experiment?.length >= 120,
      ].filter(Boolean).length;
    setState({
      loaded: true,
      ready: [
        noteCount >= 3,
        researchCount >= 6,
        strategyCount === 4,
        acqBudget === 300000,
        analyticsReady,
        strongCaseCount >= 1,
        capCount === 3,
      ],
      details: [
        `${noteCount}/5 работ`,
        `${researchCount}/8 полей`,
        `${strategyCount}/4 решений`,
        acqBudget
          ? `${acqBudget.toLocaleString("ru-RU")} ₽ распределено`
          : "Нет медиаплана",
        analyticsReady ? "Воронка сохранена" : "Нет данных",
        `${strongCaseCount}/4 кейса подтверждено структурой · ${caseCount}/4 написано`,
        `${capCount}/3 ответов защиты`,
      ],
      diagnostic:
        diagnostic?.finished && Number.isFinite(Number(diagnostic.score))
          ? diagnostic
          : null,
      diagnosticHistory: Array.isArray(diagnosticHistory)
        ? diagnosticHistory.slice(-10)
        : [],
    });
  }, []);
  const done = state.ready.filter(Boolean).length,
    percent = Math.round((done / modules.length) * 100),
    next = Math.max(
      0,
      state.ready.findIndex((x) => !x),
    ),
    recommended = state.ready.every(Boolean) ? modules.length - 1 : next;
  const diagnosticLevel = state.diagnostic
    ? state.diagnostic.score <= 2
      ? { name: "Новичок", route: "Начните с фундамента", href: "../#module" }
      : state.diagnostic.score <= 4
        ? { name: "Практик", route: "Продолжите с исследований", href: "../research/" }
        : { name: "Системный маркетолог", route: "Переходите к стратегии", href: "../strategy/" }
    : null;
  const previousDiagnostic =
    state.diagnosticHistory.length > 1
      ? state.diagnosticHistory[state.diagnosticHistory.length - 2]
      : null;
  return (
    <main id="main-content" className="learn-page">
      <header>
        <a href="../">← На главную</a>
        <small>УЧЕБНЫЙ КАБИНЕТ</small>
        <h1>Ваш маршрут</h1>
        <p>
          Все результаты собираются на этом устройстве. Продолжайте с первого
          незавершённого уровня или вернитесь к любому тренажёру.
        </p>
        <div className="overall-progress">
          <div>
            <i style={{ width: `${percent}%` }} />
          </div>
          <strong>{state.loaded ? percent : 0}%</strong>
          <span>{done} из {modules.length} этапов завершено</span>
        </div>
      </header>
      <section className="diagnostic-summary" aria-label="Результат входной диагностики">
        {diagnosticLevel ? (
          <>
            <div>
              <small>ВАША СТАРТОВАЯ ТОЧКА</small>
              <h2>{diagnosticLevel.name}</h2>
              <p>
                {state.diagnostic.score}/6 баллов · {diagnosticLevel.route}. Результат
                предварительный и уточняется по практическим работам.
                {state.diagnosticHistory.length > 0 &&
                  ` Сохранено попыток: ${state.diagnosticHistory.length}.`}
                {previousDiagnostic &&
                  ` Изменение: ${Number(state.diagnostic.score) - Number(previousDiagnostic.score) >= 0 ? "+" : ""}${Number(state.diagnostic.score) - Number(previousDiagnostic.score)}.`}
              </p>
            </div>
            <div className="diagnostic-summary-actions">
              <a href={diagnosticLevel.href}>Открыть рекомендованный модуль →</a>
              <a href="../diagnostic/">Посмотреть разбор</a>
            </div>
          </>
        ) : (
          <>
            <div>
              <small>ПЕРСОНАЛЬНЫЙ СТАРТ</small>
              <h2>Определите свой уровень</h2>
              <p>Три коротких кейса помогут выбрать подходящую точку входа в обучение.</p>
            </div>
            <a className="primary" href="../diagnostic/">
              Пройти диагностику →
            </a>
          </>
        )}
      </section>
      <section className="skills-entry">
        <div>
          <small>ДОКАЗАТЕЛЬСТВА НАВЫКОВ</small>
          <h2>Не только прогресс, но и компетенции</h2>
          <p>Посмотрите, какие навыки уже подтверждены выполненными работами и что усилить дальше.</p>
        </div>
        <div className="skills-entry-actions">
          <a href="../skills/">Открыть карту компетенций →</a>
          <a href="../review/">Разобрать письменный кейс</a>
        </div>
      </section>
      <section className="next-step">
        <div>
          <small>РЕКОМЕНДУЕМЫЙ ШАГ</small>
          <h2>
            {state.ready.every(Boolean)
              ? "Повторите защиту и улучшите досье"
              : modules[recommended].name}
          </h2>
          <p>
            {state.ready.every(Boolean)
              ? "Все уровни пройдены. Усильте аргументацию и проведите внешнюю экспертную проверку."
              : modules[recommended].skill}
          </p>
        </div>
        <a className="primary" href={modules[recommended].href}>
          Продолжить обучение →
        </a>
      </section>
      <section className="cabinet-grid">
        {modules.map((m, i) => (
          <article className={state.ready[i] ? "complete" : ""} key={m.n}>
            <div className="module-number">{state.ready[i] ? "✓" : m.n}</div>
            <small>УРОВЕНЬ {m.n}</small>
            <h2>{m.name}</h2>
            <p>{m.skill}</p>
            <div className="module-state">
              <b>{state.ready[i] ? "Завершён" : "В процессе"}</b>
              <span>{state.details[i] || "Проверяем…"}</span>
            </div>
            <a href={m.href}>{state.ready[i] ? "Пересмотреть" : "Открыть"} →</a>
          </article>
        ))}
      </section>
      <section className="cabinet-info">
        <div>
          <h2>Что сохраняется</h2>
          <p>
            Ответы уроков, кейсы, бриф исследования, стратегия, медиаплан,
            аналитика и итоговая защита.
          </p>
        </div>
        <div>
          <h2>Где хранятся данные</h2>
          <p>
            Только в локальном хранилище браузера. Они не синхронизируются между
            устройствами и могут исчезнуть после очистки данных сайта.
          </p>
        </div>
        <div>
          <h2>Следующий продуктовый этап</h2>
          <p>
            Личный аккаунт, защищённая синхронизация, история попыток и кабинет
            наставника.
          </p>
        </div>
      </section>
    </main>
  );
}
