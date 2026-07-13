"use client";
import { useEffect, useState } from "react";
import { evaluateOverallProgress, CAPSTONE_LIMITS } from "../lib/progress-rules.mjs";

const safeParse = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
};

export default function Olympus() {
  const [artifacts, setArtifacts] = useState(null),
    [final, setFinal] = useState({ summary: "", risk: "", experiment: "" }),
    [storageError, setStorageError] = useState(false);
  useEffect(() => {
    setArtifacts({
      progress: safeParse("olymp-progress", []),
      answers: safeParse("olymp-answers", {}),
      quiz: safeParse("olymp-quiz", null),
      research: safeParse("olymp-research", {}),
      strategy: safeParse("olymp-strategy", {}),
      acquisition: safeParse("olymp-acquisition", {}),
      analytics: safeParse("olymp-analytics", {}),
      caseLab: safeParse("olymp-case-lab", { selected: {}, drafts: {} }),
    });
    const savedFinal = safeParse("olymp-capstone", {});
    setFinal({
      summary: String(savedFinal.summary || ""),
      risk: String(savedFinal.risk || ""),
      experiment: String(savedFinal.experiment || ""),
    });
  }, []);
  const update = (k, v) => {
    const next = { ...final, [k]: v };
    setFinal(next);
    try {
      localStorage.setItem("olymp-capstone", JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };
  // Статусы модулей считаются едиными правилами из progress-rules.mjs —
  // те же, что в учебном кабинете и на карте компетенций.
  const overall = evaluateOverallProgress({ ...(artifacts || {}), capstone: final }),
    moduleOrder = [
      ["01", "Фундамент", "foundation"],
      ["02", "Исследования", "research"],
      ["03", "Стратегия", "strategy"],
      ["04", "Привлечение", "acquisition"],
      ["05", "Аналитика", "analytics"],
      ["P", "Практикум кейсов", "cases"],
    ],
    modules = moduleOrder.map(([n, name, key]) => {
      const rules = overall.modules[key];
      const caseCount = rules.details[0]?.detail || "";
      return {
        n,
        name,
        ready: rules.completed,
        detail: rules.completed
          ? caseCount || "Все требования выполнены"
          : `${caseCount ? `${caseCount} · ` : ""}далее: ${rules.missingRequirements[0] || ""}`,
      };
    }),
    readyCount = modules.filter((x) => x.ready).length,
    defence = [
      final.summary.length >= CAPSTONE_LIMITS.summary,
      final.risk.length >= CAPSTONE_LIMITS.risk,
      final.experiment.length >= CAPSTONE_LIMITS.experiment,
    ],
    total = readyCount + defence.filter(Boolean).length;
  const exportDossier = () => {
    const text = [
        "МАРКЕТИНГ ОЛИМП — ВЫПУСКНОЕ ДОСЬЕ",
        `Готовность: ${total}/9`,
        "",
        "ИТОГОВОЕ РЕЗЮМЕ",
        final.summary || "—",
        "",
        "КЛЮЧЕВОЙ РИСК",
        final.risk || "—",
        "",
        "СЛЕДУЮЩИЙ ЭКСПЕРИМЕНТ",
        final.experiment || "—",
        "",
        "АРТЕФАКТЫ ОБУЧЕНИЯ",
        ...modules.map(
          (m) => `${m.name}: ${m.ready ? "завершён" : "не завершён"} (${m.detail})`,
        ),
        "",
        "Черновые данные проекта",
        JSON.stringify(artifacts, null, 2),
      ].join("\n"),
      blob = new Blob([text], { type: "text/plain;charset=utf-8" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "marketing-olympus-dossier.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main id="main-content" className="olympus-page">
      <header>
        <a href="../">← На главную</a>
        <small>УРОВЕНЬ 06 · ОЛИМП</small>
        <h1>Защитите проект</h1>
        <p>
          Соберите решения из всех модулей в единое маркетинговое досье и
          покажите, что умеете связывать клиента, стратегию, каналы и цифры.
        </p>
        <div className="summit-score">
          <strong>{total}/9</strong>
          <span>готовность к защите</span>
        </div>
      </header>
      {storageError && (
        <div className="storage-warning" role="alert">
          <b>Не удалось сохранить ответ</b>
          <span>
            Хранилище браузера недоступно. Скопируйте текст защиты, чтобы не
            потерять его.
          </span>
        </div>
      )}
      <section className="readiness">
        <div className="sectionhead">
          <div>
            <small>КАРТА ГОТОВНОСТИ</small>
            <h2>Ваш путь к вершине</h2>
          </div>
          <p>
            Платформа видит только результаты, сохранённые в этом браузере.
            Данные не отправляются на сервер.
          </p>
        </div>
        <div className="readiness-grid">
          {modules.map((x) => (
            <article className={x.ready ? "ready" : ""} key={x.n}>
              <span>{x.ready ? "✓" : x.n}</span>
              <h3>{x.name}</h3>
              <p>{x.detail}</p>
              <a
                href={
                  x.n === "01"
                    ? "../"
                    : x.n === "02"
                      ? "../research/"
                      : x.n === "03"
                        ? "../strategy/"
                        : x.n === "04"
                          ? "../acquisition/"
                          : x.n === "05"
                            ? "../analytics/"
                            : "../cases/"
                }
              >
                {x.ready ? "Пересмотреть" : "Завершить"} →
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="defence">
        <small>ФИНАЛЬНАЯ ЗАЩИТА</small>
        <h2>Три ответа руководителю</h2>
        <label>
          <b>1. Резюме стратегии</b>
          <p>
            Кто клиент, какую проблему решаем, в чём ценность и как создаём
            рост?
          </p>
          <textarea
            value={final.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder="Сформулируйте цельную стратегию…"
          />
          <span className={defence[0] ? "done" : ""}>
            {final.summary.length}/180
          </span>
        </label>
        <label>
          <b>2. Ключевой риск</b>
          <p>Какое предположение может разрушить всю стратегию?</p>
          <textarea
            value={final.risk}
            onChange={(e) => update("risk", e.target.value)}
            placeholder="Главный риск и почему он критичен…"
          />
          <span className={defence[1] ? "done" : ""}>
            {final.risk.length}/80
          </span>
        </label>
        <label>
          <b>3. Следующий эксперимент</b>
          <p>
            Что проверяем, на какой аудитории, за какой срок и по какой метрике?
          </p>
          <textarea
            value={final.experiment}
            onChange={(e) => update("experiment", e.target.value)}
            placeholder="Гипотеза, действие, период, метрика и критерий успеха…"
          />
          <span className={defence[2] ? "done" : ""}>
            {final.experiment.length}/120
          </span>
        </label>
      </section>
      <section className="summit-result">
        <div className="mountain-mark">▲</div>
        <h2>
          {total === 9
            ? "Вы готовы к защите"
            : total >= 5
              ? "Вершина близко"
              : "Продолжайте собирать доказательства"}
        </h2>
        <p>
          {total === 9
            ? "Все основные артефакты и ответы собраны. Скачайте досье и проведите внешнюю экспертную проверку."
            : "Вернитесь к незавершённым модулям и усилите финальные ответы."}
        </p>
        <button
          className="primary"
          disabled={total < 5}
          onClick={exportDossier}
        >
          Скачать выпускное досье ↓
        </button>
        <small>
          Сертификат пока не выдаётся: для него потребуется идентификация
          ученика и подтверждённая система оценки.
        </small>
      </section>
    </main>
  );
}
