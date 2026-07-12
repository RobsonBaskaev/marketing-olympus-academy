"use client";
import { useEffect, useMemo, useState } from "react";

const cases = [
  { id: "coffee", company: "Кофейня «Север»", skill: "Исследование проблемы" },
  { id: "store", company: "Интернет-магазин «Линия»", skill: "Удержание и CRM" },
  { id: "saas", company: "SaaS-сервис «Пульс»", skill: "Активация продукта" },
  { id: "b2b", company: "B2B-производитель «Контур»", skill: "Стратегия сложной продажи" },
];

const rules = [
  { name: "Контекст и участник", pattern: /клиент|покупател|пользовател|гост|команд|закуп|инженер|директор/i, tip: "Назовите, для кого возникает проблема и в какой ситуации." },
  { name: "Данные и наблюдение", pattern: /данн|интервью|чек|аналит|когорт|опрос|crm|\d+\s?%|сравн/i, tip: "Укажите факт, источник данных или способ сравнения." },
  { name: "Проверяемая гипотеза", pattern: /гипотез|предполож|если.+то|ожида|провер/i, tip: "Сформулируйте предположение так, чтобы его можно было подтвердить или опровергнуть." },
  { name: "Конкретное действие", pattern: /провед|запущ|собер|создам|измен|покаж|раздел|упрост|протест/i, tip: "Опишите конкретное изменение или исследовательское действие." },
  { name: "Метрика решения", pattern: /метрик|конверси|удерж|повторн|выруч|марж|заказ|дол[яю]|срок|активац|win rate/i, tip: "Назовите показатель, по которому примете решение." },
  { name: "Риск или ограничение", pattern: /риск|огранич|контрол|допущ|защитн|искаж|марж|качество/i, tip: "Добавьте риск, ограничение или защитную метрику." },
];

export default function ReviewDashboard() {
  const [drafts, setDrafts] = useState({}), [active, setActive] = useState("coffee"), [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("olymp-case-lab") || "null"), nextDrafts = saved?.drafts || {};
      setDrafts(nextDrafts);
      setActive(cases.find((item) => String(nextDrafts[item.id] || "").trim())?.id || "coffee");
    } catch {}
    setLoaded(true);
  }, []);
  const item = cases.find((entry) => entry.id === active) || cases[0], text = drafts[active] || "",
    result = useMemo(() => rules.map((rule) => ({ ...rule, ok: rule.pattern.test(text) })), [text]),
    total = result.filter((rule) => rule.ok).length, missing = result.find((rule) => !rule.ok);
  return <main id="main-content" className="review-page"><header><a href="../cases/">← К практикуму кейсов</a><small>СТРУКТУРНАЯ ОБРАТНАЯ СВЯЗЬ</small><h1>Разбор вашего решения</h1><p>Тренажёр ищет наблюдаемые элементы профессиональной логики в сохранённом тексте. Он помогает улучшить структуру, но не оценивает истинность бизнес-выводов.</p></header><nav className="review-tabs" aria-label="Выбор письменного кейса">{cases.map((entry) => <button className={active === entry.id ? "active" : ""} onClick={() => setActive(entry.id)} key={entry.id}><b>{entry.company}</b><span>{String(drafts[entry.id] || "").trim() ? "Есть ответ" : "Нет ответа"}</span></button>)}</nav>{loaded && text.trim().length < 80 ? <section className="review-empty"><small>{item.skill}</small><h2>Сначала напишите решение кейса</h2><p>Для полезного разбора нужно минимум 80 символов собственного ответа.</p><a className="primary" href="../cases/">Открыть практикум →</a></section> : <><section className="review-summary"><div className="review-score"><strong>{total}/6</strong><span>элементов структуры</span></div><div><small>{item.skill}</small><h2>{item.company}</h2><p>{total >= 5 ? "Структура убедительная: проверьте качество доказательств и ограничения." : total >= 3 ? "Рабочая основа есть. Усильте недостающие звенья аргументации." : "Ответу нужна более явная профессиональная логика."}</p></div></section><section className="review-layout"><div className="review-rules">{result.map((rule) => <article className={rule.ok ? "passed" : ""} key={rule.name}><span>{rule.ok ? "✓" : "+"}</span><div><h3>{rule.name}</h3><p>{rule.ok ? "В тексте найден соответствующий смысловой маркер." : rule.tip}</p></div></article>)}</div><aside><small>СЛЕДУЮЩЕЕ УЛУЧШЕНИЕ</small><h2>{missing ? missing.name : "Проверьте доказательства"}</h2><p>{missing ? missing.tip : "Все шесть элементов обнаружены. Теперь проверьте достоверность данных, причинность и реалистичность плана."}</p><a href="../cases/">Вернуться и улучшить ответ →</a><div className="review-boundary"><b>Как работает проверка</b><p>Это прозрачная эвристика по словам и формулировкам. Она может пропустить необычную формулировку или принять упоминание за полноценное обоснование. Результат не является оценкой квалификации.</p></div></aside></section></>}</main>;
}
