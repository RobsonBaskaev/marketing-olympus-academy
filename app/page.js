"use client";

import { useMemo, useState } from "react";

const tracks = [
  ["01", "Фундамент", "Рынок, ценность, сегментация, позиционирование"],
  ["02", "Исследования", "Интервью, данные, конкуренты, инсайты"],
  ["03", "Стратегия", "STP, бренд, продукт, каналы и экономика"],
  ["04", "Привлечение", "Контент, performance, CRM, продажи"],
  ["05", "Аналитика", "Метрики, эксперименты, атрибуция, рост"],
  ["06", "Олимп", "Сложные кейсы, лидерство и портфолио"],
];

const questions = [
  { q: "Что вы сделаете первым, если продажи продукта падают?", options: ["Увеличу рекламный бюджет", "Проверю данные и сформулирую гипотезы", "Сделаю скидку", "Сменю логотип"], correct: 1 },
  { q: "Какой сегмент полезнее для старта?", options: ["Все люди 18–65", "Те, кому нравится бренд", "Группа с общей задачей, контекстом и доступностью", "Самая большая аудитория"], correct: 2 },
  { q: "Что сильнее всего подтверждает ценностное предложение?", options: ["Мнение команды", "Красивый слоган", "Повторяемое поведение и обратная связь клиентов", "Количество публикаций"], correct: 2 },
];

export default function Page() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const score = useMemo(() => answers.reduce((n, a, i) => n + (a === questions[i].correct ? 1 : 0), 0), [answers]);

  function answer(index) {
    const next = [...answers, index];
    setAnswers(next);
    if (step === questions.length - 1) setDone(true);
    else setStep(step + 1);
  }

  function reset() { setStarted(false); setStep(0); setAnswers([]); setDone(false); }

  return <main>
    <nav><a className="brand" href="#top"><span>М</span> МАРКЕТИНГ <i>ОЛИМП</i></a><div className="navlinks"><a href="#route">Маршрут</a><a href="#practice">Практика</a><a href="#teams">Для команд</a></div><button className="ghost" onClick={() => setStarted(true)}>Определить уровень</button></nav>

    <section className="hero" id="top">
      <div className="eyebrow">ПЛАТФОРМА СИСТЕМНОГО МАРКЕТИНГА</div>
      <h1>Не запоминайте<br/>маркетинг. <em>Освойте.</em></h1>
      <p className="lead">От первого исследования до стратегии роста. Учитесь на реальных задачах, получайте разбор решений и собирайте портфолио, которое говорит за вас.</p>
      <div className="actions"><button className="primary" onClick={() => setStarted(true)}>Начать с диагностики <b>↗</b></button><a href="#route">Посмотреть программу ↓</a></div>
      <div className="proof"><div><strong>6</strong><span>уровней мастерства</span></div><div><strong>100%</strong><span>обучение через практику</span></div><div><strong>1</strong><span>цельная система знаний</span></div></div>
      <div className="orb"><span>ТВОЯ ТОЧКА<br/>СТАРТА</span><b>?</b></div>
    </section>

    <section className="manifesto"><p>Здесь нет пути «посмотреть видео и забыть».</p><h2>Знание становится навыком,<br/>только когда вы <i>принимаете решение.</i></h2></section>

    <section className="route" id="route">
      <div className="sectionhead"><div><small>ВАШ МАРШРУТ</small><h2>От опоры — к высоте</h2></div><p>Диагностика определит стартовую точку. Дальше вы двигаетесь по персональному маршруту: теория → тренажёр → кейс → обратная связь.</p></div>
      <div className="trackgrid">{tracks.map((t, i) => <article key={t[0]}><span>{t[0]}</span><div className="mount">{["▱","◒","△","◇","◭","▲"][i]}</div><h3>{t[1]}</h3><p>{t[2]}</p><b>{i === 0 ? "СТАРТ" : i === 5 ? "ВЕРШИНА" : "УРОВЕНЬ"}</b></article>)}</div>
    </section>

    <section className="case" id="practice"><div><small>КЕЙС-ТРЕНАЖЁР</small><h2>Вы — маркетолог нового сервиса доставки.</h2><p>Повторные заказы упали на 24%. Данных много, но причина неочевидна. Выберите подход, объясните решение и сравните его с разбором эксперта.</p><ul><li>Реалистичный контекст</li><li>Открытый ответ до подсказки</li><li>Разбор логики, а не только «правильно/неправильно»</li></ul></div><div className="casecard"><div className="casebar"><span>01 / 03</span><b>ДИАГНОСТИКА</b></div><h3>С чего начнёте?</h3><button onClick={() => setStarted(true)}>Проверить навыки →</button></div></section>

    <section className="teams" id="teams"><small>ОДНА ПЛАТФОРМА — ТРИ СЦЕНАРИЯ</small><h2>Растём вместе</h2><div><article><b>01</b><h3>Специалистам</h3><p>Персональный маршрут, практика, проекты и доказуемое портфолио.</p></article><article><b>02</b><h3>Компаниям</h3><p>Диагностика команды, программы развития и прозрачный прогресс.</p></article><article><b>03</b><h3>Университетам</h3><p>Готовая практическая среда, задания и аналитика освоения навыков.</p></article></div></section>

    <footer><div className="brand"><span>М</span> МАРКЕТИНГ <i>ОЛИМП</i></div><p>Проверенные знания. Открытые источники.<br/>Практика, которая меняет мышление.</p><button className="primary" onClick={() => setStarted(true)}>Найти свою точку старта</button></footer>

    {started && <div className="modal" role="dialog"><div className="dialog"><button className="close" onClick={reset}>×</button>{!done ? <><small>БЫСТРАЯ ДИАГНОСТИКА · {step + 1}/{questions.length}</small><div className="progress"><i style={{width:`${(step + 1) / questions.length * 100}%`}}/></div><h2>{questions[step].q}</h2><div className="options">{questions[step].options.map((o,i)=><button key={o} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div><p className="hint">Выберите наиболее профессиональный первый шаг.</p></> : <><small>ВАША ТОЧКА СТАРТА</small><div className="result">{score}/{questions.length}</div><h2>{score === 3 ? "Сильная системная база" : score === 2 ? "Уверенный начинающий" : "Начинаем с фундамента"}</h2><p className="analysis">{score === 3 ? "Вы мыслите через данные, сегменты и подтверждённую ценность. Рекомендуем начать со стратегии и сложных кейсов." : score === 2 ? "Базовая логика уже есть. Усилим исследования, формулировку гипотез и связь решений с метриками." : "Соберём цельную картину: рынок → клиент → ценность → стратегия → каналы → измерение результата."}</p><div className="recommend"><b>Рекомендуемый маршрут</b><span>{score === 3 ? "Уровень 03 · Стратегия" : score === 2 ? "Уровень 02 · Исследования" : "Уровень 01 · Фундамент"}</span></div><button className="primary wide" onClick={reset}>Сохранить маршрут →</button></>}</div></div>}
  </main>;
}
