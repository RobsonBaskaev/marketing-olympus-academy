"use client";
import { useEffect, useState } from "react";

const goals = {
  career: { name: "Начать карьеру", note: "Собрать базу, научиться решать кейсы и подготовить портфолио.", weeks: [["Фундамент", "../#module"], ["Исследования", "../research/"], ["Практикум кейсов", "../cases/"], ["Выпускное досье", "../olympus/"]] },
  business: { name: "Развивать свой бизнес", note: "Связать клиента, стратегию, привлечение и экономику решений.", weeks: [["Фундамент", "../#module"], ["Стратегия", "../strategy/"], ["Привлечение", "../acquisition/"], ["Аналитика", "../analytics/"]] },
  system: { name: "Систематизировать опыт", note: "Найти пробелы, связать решения и усилить доказательность.", weeks: [["Диагностика", "../diagnostic/"], ["Исследования", "../research/"], ["Стратегия", "../strategy/"], ["Выпускное досье", "../olympus/"]] },
  team: { name: "Обучать команду", note: "Использовать единые кейсы, критерии и язык обратной связи.", weeks: [["Диагностика", "../diagnostic/"], ["Практикум кейсов", "../cases/"], ["Разбор решений", "../review/"], ["Карта компетенций", "../skills/"]] },
};
const paces = { 2: "2 короткие сессии по 45–60 минут", 4: "3 сессии примерно по 60–80 минут", 6: "4 сессии примерно по 75–90 минут" };

export default function StartPlanner() {
  const [profile, setProfile] = useState({ name: "", goal: "career", pace: 4, project: "" }), [saved, setSaved] = useState(false), [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const current = JSON.parse(localStorage.getItem("olymp-profile") || "null"); if (current) { setProfile(current); setSaved(true); } } catch {}
    setLoaded(true);
  }, []);
  const update = (key, value) => { setProfile((current) => ({ ...current, [key]: value })); setSaved(false); },
    save = () => { const next = { ...profile, pace: Number(profile.pace), updatedAt: new Date().toISOString() }; localStorage.setItem("olymp-profile", JSON.stringify(next)); setProfile(next); setSaved(true); },
    plan = goals[profile.goal] || goals.career;
  if (!loaded) return <main id="main-content" className="start-page"><p>Загружаем маршрут…</p></main>;
  return <main id="main-content" className="start-page"><header><a href="../learn/">← В учебный кабинет</a><small>НАСТРОЙКА ОБУЧЕНИЯ</small><h1>Ваш путь к Олимпу</h1><p>Выберите практическую цель и доступный темп. План можно изменить в любой момент — выполненные работы сохранятся.</p></header><div className="start-layout"><section className="start-form"><label><b>Как к вам обращаться? <span>необязательно</span></b><input value={profile.name || ""} onChange={(event) => update("name", event.target.value)} maxLength="50" placeholder="Имя" /></label><fieldset><legend>Главная цель на ближайшие четыре недели</legend><div className="goal-options">{Object.entries(goals).map(([key, goal]) => <button className={profile.goal === key ? "active" : ""} type="button" onClick={() => update("goal", key)} key={key}><b>{goal.name}</b><span>{goal.note}</span></button>)}</div></fieldset><fieldset><legend>Сколько времени реально доступно в неделю?</legend><div className="pace-options">{Object.entries(paces).map(([hours, note]) => <button className={Number(profile.pace) === Number(hours) ? "active" : ""} type="button" onClick={() => update("pace", Number(hours))} key={hours}><b>{hours} ч</b><span>{note}</span></button>)}</div></fieldset><label><b>Проект для практики <span>необязательно</span></b><textarea value={profile.project || ""} onChange={(event) => update("project", event.target.value)} placeholder="Например: кофейня, интернет-магазин или продукт вашей компании" /></label><button className="primary" onClick={save}>{saved ? "✓ Маршрут сохранён" : "Сохранить мой маршрут →"}</button></section><aside className="start-plan"><small>ПЛАН НА 4 НЕДЕЛИ</small><h2>{plan.name}</h2><p>{paces[profile.pace]}</p>{profile.project && <p className="project-note"><b>Проект:</b> {profile.project}</p>}<ol>{plan.weeks.map(([name, href], index) => <li key={name}><span>Неделя {index + 1}</span><a href={href}>{name} →</a></li>)}</ol>{saved && <a className="plan-cabinet" href="../learn/">Открыть учебный кабинет →</a>}<div className="plan-note"><b>Как использовать план</b><p>Неделя задаёт приоритет, а не блокировку. Если задание требует больше времени, продолжайте его без штрафа. Качество работы важнее серии посещений.</p></div></aside></div></main>;
}
