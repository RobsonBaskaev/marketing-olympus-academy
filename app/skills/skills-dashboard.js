"use client";
import { useEffect, useState } from "react";
import { evaluateOverallProgress } from "../lib/progress-rules.mjs";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
  catch { return fallback; }
};
const levelName = ["Начать", "В работе", "Подтверждено работой"];

export default function SkillsDashboard() {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    // Статусы считаются едиными правилами прогресса (progress-rules.mjs) —
    // теми же, что в учебном кабинете и на странице «Олимп».
    const overall = evaluateOverallProgress({
      progress: read("olymp-progress", []),
      answers: read("olymp-answers", {}),
      quiz: read("olymp-quiz", null),
      research: read("olymp-research", {}),
      strategy: read("olymp-strategy", {}),
      acquisition: read("olymp-acquisition", {}),
      analytics: read("olymp-analytics", {}),
      caseLab: read("olymp-case-lab", { selected: {}, drafts: {} }),
      capstone: read("olymp-capstone", {}),
    });
    const m = overall.modules;
    const level = (module) => (module.completed ? 2 : module.status === "in_progress" ? 1 : 0);
    const capAnswers = m.capstone.details.filter((item) => item.name !== "Завершены обязательные модули");
    const capCount = capAnswers.filter((item) => item.ok).length;
    setSkills([
      { name: "Клиент и проблема", score: level(m.foundation), evidence: `${m.foundation.details[0]?.detail} · тест ${m.foundation.details[1]?.ok ? "пройден" : "впереди"}`, next: "Опишите клиента, его задачу и наблюдаемый барьер, затем сдайте итоговый тест.", href: "../#module" },
      { name: "Исследование", score: level(m.research), evidence: `${m.research.details[0]?.detail}${m.research.completed ? " · модуль завершён" : ""}`, next: "Сформулируйте решение, гипотезы и вопросы, затем завершите модуль.", href: "../research/" },
      { name: "Стратегическая связность", score: level(m.strategy), evidence: `${m.strategy.details[0]?.detail} · обоснование ${m.strategy.details[2]?.detail}`, next: "Свяжите сегмент, ценность, канал и метрику и проверьте стратегию.", href: "../strategy/" },
      { name: "Привлечение и бюджет", score: level(m.acquisition), evidence: `${m.acquisition.details[1]?.detail} · аргументация ${m.acquisition.details[3]?.detail}`, next: "Соберите медиамикс под цель и проверьте план.", href: "../acquisition/" },
      { name: "Маркетинговая аналитика", score: level(m.analytics), evidence: m.analytics.completed ? "Воронка и вывод зафиксированы" : `вывод ${m.analytics.details[2]?.detail || "0/4"}`, next: "Введите корректные данные, напишите вывод и подтвердите завершение.", href: "../analytics/" },
      { name: "Решение кейсов", score: level(m.cases), evidence: m.cases.details[0]?.detail || "", next: "Обоснуйте действие через данные, гипотезу, метрику и риск.", href: m.cases.status === "not_started" ? "../cases/" : "../review/" },
      { name: "Защита проекта", score: capCount === capAnswers.length ? 2 : capCount ? 1 : 0, evidence: `${capCount}/3 элементов защиты`, next: "Соберите вывод, главный риск и следующий эксперимент.", href: "../olympus/" },
    ]);
  }, []);
  const points = skills.reduce((sum, skill) => sum + skill.score, 0), percent = skills.length ? Math.round((points / (skills.length * 2)) * 100) : 0, nextSkill = skills.find((skill) => skill.score < 2);
  return <main id="main-content" className="skills-page"><header><a href="../learn/">← В учебный кабинет</a><small>ДОКАЗАТЕЛЬСТВА ОБУЧЕНИЯ</small><h1>Карта компетенций</h1><p>Каждый статус опирается на сохранённую работу, а не на просмотр страницы. Карта показывает учебный прогресс и не является профессиональной сертификацией.</p><div className="skills-total"><strong>{percent}%</strong><div><i style={{ width: `${percent}%` }} /></div><span>{points} из {skills.length * 2 || 14} баллов доказательств</span></div></header>{nextSkill && <section className="skills-next"><div><small>СЛЕДУЮЩЕЕ УСИЛЕНИЕ</small><h2>{nextSkill.name}</h2><p>{nextSkill.next}</p></div><a className="primary" href={nextSkill.href}>Перейти к практике →</a></section>}<section className="skills-grid" aria-label="Маркетинговые компетенции">{skills.map((skill, index) => <article className={`skill-level-${skill.score}`} key={skill.name}><div className="skill-top"><span>0{index + 1}</span><b>{levelName[skill.score]}</b></div><h2>{skill.name}</h2><p>{skill.evidence}</p><div className="skill-scale" aria-label={`${skill.score} из 2`}><i /><i /><i /></div><p className="skill-next-copy">{skill.next}</p><a href={skill.href}>{skill.score === 2 ? "Пересмотреть работу" : "Усилить навык"} →</a></article>)}</section><section className="skills-method"><div><h2>Как считается статус</h2><p><b>Начать</b> — подтверждающей работы ещё нет. <b>В работе</b> — заполнена часть задания. <b>Подтверждено работой</b> — выполнены все требования модуля из единых правил прогресса.</p></div><div><h2>Граница оценки</h2><p>Карта проверяет наличие и структуру учебных артефактов. Она не подтверждает достоверность бизнес-выводов и не заменяет проверку наставником или результатами реального проекта.</p></div></section></main>;
}
