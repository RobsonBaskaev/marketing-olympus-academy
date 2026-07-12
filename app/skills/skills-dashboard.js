"use client";
import { useEffect, useState } from "react";
import { evaluateCaseAnswer } from "../lib/case-rubric.mjs";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
  catch { return fallback; }
};
const levelName = ["Начать", "В работе", "Подтверждено работой"];

export default function SkillsDashboard() {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const answers = read("olymp-answers", {}), research = read("olymp-research", {}),
      strategy = read("olymp-strategy", {}), acquisition = read("olymp-acquisition", {}),
      analytics = read("olymp-analytics", {}), caseLab = read("olymp-case-lab", { selected: {}, drafts: {} }),
      capstone = read("olymp-capstone", {}),
      answerCount = Object.values(answers).filter((v) => String(v || "").trim().length >= 30).length,
      researchCount = Object.values(research).filter((v) => String(v || "").trim().length > 15).length,
      strategyChoices = (strategy.answers || []).filter((v) => v !== null && v !== undefined).length,
      budget = acquisition.money ? Object.values(acquisition.money).reduce((sum, v) => sum + Number(v || 0), 0) : 0,
      analyticsReady = Number(analytics.data?.sales || 0) > 0,
      writtenCases = Object.keys(caseLab.drafts || {}).filter((id) => evaluateCaseAnswer(caseLab.drafts[id]).ready).length,
      strongCases = Object.keys(caseLab.drafts || {}).filter((id) => evaluateCaseAnswer(caseLab.drafts[id]).ready && evaluateCaseAnswer(caseLab.drafts[id]).score >= 4).length,
      capstoneCount = [capstone.summary?.length >= 180, capstone.risk?.length >= 80, capstone.experiment?.length >= 120].filter(Boolean).length;
    setSkills([
      { name: "Клиент и проблема", score: answerCount >= 3 ? 2 : answerCount ? 1 : 0, evidence: `${answerCount}/5 учебных работ`, next: "Опишите клиента, его задачу и наблюдаемый барьер.", href: "../#module" },
      { name: "Исследование", score: researchCount >= 6 ? 2 : researchCount >= 2 ? 1 : 0, evidence: `${researchCount}/8 полей брифа`, next: "Сформулируйте решение, гипотезы и вопросы о прошлом поведении.", href: "../research/" },
      { name: "Стратегическая связность", score: strategyChoices === 4 && String(strategy.why || "").length >= 100 ? 2 : strategyChoices >= 2 ? 1 : 0, evidence: `${strategyChoices}/4 решений · обоснование ${String(strategy.why || "").length}/100`, next: "Свяжите сегмент, ценность, канал и бизнес-метрику.", href: "../strategy/" },
      { name: "Привлечение и бюджет", score: budget === 300000 && String(acquisition.reason || "").length >= 100 ? 2 : budget > 0 ? 1 : 0, evidence: `${budget.toLocaleString("ru-RU")} ₽ · обоснование ${String(acquisition.reason || "").length}/100`, next: "Соберите медиамикс под цель и объясните ограничения модели.", href: "../acquisition/" },
      { name: "Маркетинговая аналитика", score: analyticsReady ? 2 : Object.keys(analytics.data || {}).length ? 1 : 0, evidence: analyticsReady ? "Воронка рассчитана" : "Нет полной воронки", next: "Введите данные воронки и найдите главное узкое место.", href: "../analytics/" },
      { name: "Решение кейсов", score: strongCases >= 3 ? 2 : writtenCases ? 1 : 0, evidence: `${strongCases}/4 структурных разбора · ${writtenCases}/4 письменных ответа`, next: "Обоснуйте действие через данные, гипотезу, метрику и риск.", href: writtenCases ? "../review/" : "../cases/" },
      { name: "Защита проекта", score: capstoneCount === 3 ? 2 : capstoneCount ? 1 : 0, evidence: `${capstoneCount}/3 элементов защиты`, next: "Соберите вывод, главный риск и следующий эксперимент.", href: "../olympus/" },
    ]);
  }, []);
  const points = skills.reduce((sum, skill) => sum + skill.score, 0), percent = skills.length ? Math.round((points / (skills.length * 2)) * 100) : 0, nextSkill = skills.find((skill) => skill.score < 2);
  return <main id="main-content" className="skills-page"><header><a href="../learn/">← В учебный кабинет</a><small>ДОКАЗАТЕЛЬСТВА ОБУЧЕНИЯ</small><h1>Карта компетенций</h1><p>Каждый статус опирается на сохранённую работу, а не на просмотр страницы. Карта показывает учебный прогресс и не является профессиональной сертификацией.</p><div className="skills-total"><strong>{percent}%</strong><div><i style={{ width: `${percent}%` }} /></div><span>{points} из {skills.length * 2 || 14} баллов доказательств</span></div></header>{nextSkill && <section className="skills-next"><div><small>СЛЕДУЮЩЕЕ УСИЛЕНИЕ</small><h2>{nextSkill.name}</h2><p>{nextSkill.next}</p></div><a className="primary" href={nextSkill.href}>Перейти к практике →</a></section>}<section className="skills-grid" aria-label="Маркетинговые компетенции">{skills.map((skill, index) => <article className={`skill-level-${skill.score}`} key={skill.name}><div className="skill-top"><span>0{index + 1}</span><b>{levelName[skill.score]}</b></div><h2>{skill.name}</h2><p>{skill.evidence}</p><div className="skill-scale" aria-label={`${skill.score} из 2`}><i /><i /><i /></div><p className="skill-next-copy">{skill.next}</p><a href={skill.href}>{skill.score === 2 ? "Пересмотреть работу" : "Усилить навык"} →</a></article>)}</section><section className="skills-method"><div><h2>Как считается статус</h2><p><b>Начать</b> — подтверждающей работы ещё нет. <b>В работе</b> — заполнена часть задания. <b>Подтверждено работой</b> — выполнен наблюдаемый критерий модуля.</p></div><div><h2>Граница оценки</h2><p>Карта проверяет наличие и структуру учебных артефактов. Она не подтверждает достоверность бизнес-выводов и не заменяет проверку наставником или результатами реального проекта.</p></div></section></main>;
}
