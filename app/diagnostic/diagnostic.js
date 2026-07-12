"use client";
import { useEffect, useState } from "react";

const questions = [
  {
    skill: "Исследование",
    title: "Кофейня теряет вечерних гостей",
    context:
      "После 17:00 загрузка падает с 76% до 29%. Владелец предлагает скидку 30%, но причин падения никто не изучал.",
    ask: "Какой первый шаг наиболее обоснован?",
    options: [
      {
        text: "Сразу запустить скидку для всех",
        score: 0,
        feedback:
          "Решение меняет цену до понимания причины и создаёт риск потери маржи.",
      },
      {
        text: "Провести интервью, изучить чеки и сформулировать гипотезу вечернего спроса",
        score: 2,
        feedback:
          "Сильный ход: сначала собрать доказательства и только затем тестировать изменение.",
      },
      {
        text: "Опубликовать больше постов в социальных сетях",
        score: 1,
        feedback:
          "Это проверяемая тактика, но она пока не связана с причиной снижения спроса.",
      },
    ],
  },
  {
    skill: "Аналитика",
    title: "Повторные покупки упали",
    context:
      "У интернет-магазина повторная покупка за 90 дней снизилась с 24% до 14%. Одновременно выросли задержки доставки и доля промокодов.",
    ask: "Как лучше проверить причину?",
    options: [
      {
        text: "Сравнить когорты по сроку доставки, промокоду и периоду, затем провести ограниченный тест",
        score: 2,
        feedback:
          "Сильный ответ разделяет факторы, сравнивает сопоставимые группы и предусматривает проверку.",
      },
      {
        text: "Посчитать среднее число заказов за весь год",
        score: 1,
        feedback:
          "Среднее покажет масштаб, но скроет различия между периодами и группами клиентов.",
      },
      {
        text: "Отправить всем клиентам купон и оценить выручку",
        score: 0,
        feedback:
          "Одновременное изменение для всех не позволяет понять исходную причину и чистый эффект.",
      },
    ],
  },
  {
    skill: "Стратегия",
    title: "B2B-продажи остановились после демонстрации",
    context:
      "Технические специалисты довольны продуктом, но 68% возможностей не переходят к финансовому согласованию. В сделке участвуют четыре роли.",
    ask: "Какое решение наиболее системное?",
    options: [
      {
        text: "Добавить в презентацию больше технических характеристик",
        score: 0,
        feedback:
          "Техническая ценность уже понятна, а барьер находится на другом этапе решения.",
      },
      {
        text: "Снизить цену на 20% для всех новых клиентов",
        score: 1,
        feedback:
          "Цена может влиять на решение, но общее снижение не создаёт бизнес-кейс и угрожает марже.",
      },
      {
        text: "Создать бизнес-кейс для закупочного комитета с допущениями, эффектом и рисками",
        score: 2,
        feedback:
          "Сильный ход связывает интересы нескольких ролей и помогает внутреннему согласованию.",
      },
    ],
  },
];

const levels = [
  {
    max: 2,
    key: "beginner",
    name: "Новичок",
    summary:
      "Вы уже замечаете маркетинговые действия, но пока часто выбираете тактику до диагностики причины.",
    strength: "Готовность принимать решения и пробовать инструменты.",
    focus: "Связывать клиента, проблему, данные, гипотезу и метрику.",
    route: "Начните с фундамента",
    href: "../#module",
    module: "Модуль 01 · Фундамент",
  },
  {
    max: 4,
    key: "practitioner",
    name: "Практик",
    summary:
      "Вы умеете находить рабочее направление, но отдельные решения ещё важно связывать в единую систему доказательств.",
    strength: "Понимание исследований, каналов или метрик в прикладной задаче.",
    focus:
      "Согласованность сегмента, ценности, эксперимента и бизнес-результата.",
    route: "Начните с исследований",
    href: "../research/",
    module: "Модуль 02 · Исследования",
  },
  {
    max: 6,
    key: "advanced",
    name: "Системный маркетолог",
    summary:
      "Вы уверенно выбираете решения, основанные на данных, и учитываете причинность, экономику и участников решения.",
    strength:
      "Системная логика и способность работать с неоднозначными ситуациями.",
    focus:
      "Усилить аргументацию, ограничения моделей и качество защитных метрик.",
    route: "Перейдите к стратегии",
    href: "../strategy/",
    module: "Модуль 03 · Стратегия",
  },
];

const empty = { step: 0, answers: [], finished: false };
export default function Diagnostic() {
  const [state, setState] = useState(empty),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("olymp-diagnostic") || "null",
      );
      if (saved?.answers?.length === 3) setState({ ...saved, finished: true });
    } catch {}
    setLoaded(true);
  }, []);
  const score = state.answers.reduce(
      (sum, index, i) => sum + (questions[i]?.options[index]?.score || 0),
      0,
    ),
    level = levels.find((x) => score <= x.max) || levels[2],
    choose = (index) => {
      const answers = [...state.answers, index],
        finished = answers.length === questions.length,
        next = {
          step: finished ? state.step : state.step + 1,
          answers,
          finished,
          score: answers.reduce(
            (sum, x, i) => sum + questions[i].options[x].score,
            0,
          ),
          completedAt: finished ? new Date().toISOString() : null,
        };
      setState(next);
      if (finished)
        localStorage.setItem("olymp-diagnostic", JSON.stringify(next));
    },
    reset = () => {
      localStorage.removeItem("olymp-diagnostic");
      setState(empty);
    };
  if (!loaded)
    return (
      <main id="main-content" className="diagnostic-page">
        <p>Загружаем диагностику…</p>
      </main>
    );
  if (state.finished)
    return (
      <main id="main-content" className="diagnostic-page result-page">
        <header>
          <a href="../">← На главную</a>
          <small>ПРЕДВАРИТЕЛЬНЫЙ РЕЗУЛЬТАТ</small>
          <div className="diagnostic-score">
            <b>{score}/6</b>
            <span>баллов</span>
          </div>
          <h1>{level.name}</h1>
          <p>{level.summary}</p>
        </header>
        <section className="level-report">
          <div>
            <small>СИЛЬНАЯ СТОРОНА</small>
            <h2>{level.strength}</h2>
          </div>
          <div>
            <small>ЗОНА РОСТА</small>
            <h2>{level.focus}</h2>
          </div>
        </section>
        <section className="answer-review">
          <h2>Разбор трёх решений</h2>
          {questions.map((question, i) => {
            const option = question.options[state.answers[i]];
            return (
              <article
                key={question.title}
                className={option.score === 2 ? "strong" : "review"}
              >
                <span>{i + 1}</span>
                <div>
                  <small>
                    {question.skill} · {option.score}/2
                  </small>
                  <h3>{question.title}</h3>
                  <p>
                    <b>Ваш выбор:</b> {option.text}
                  </p>
                  <p>{option.feedback}</p>
                </div>
              </article>
            );
          })}
        </section>
        <section className="route-recommendation">
          <div>
            <small>ПЕРСОНАЛЬНАЯ СТАРТОВАЯ ТОЧКА</small>
            <h2>{level.route}</h2>
            <p>
              {level.module}. Рекомендация основана только на трёх учебных
              ситуациях и может уточняться по вашим практическим работам.
            </p>
          </div>
          <a className="primary" href={level.href}>
            Открыть маршрут →
          </a>
        </section>
        <section className="diagnostic-notice">
          <p>
            <b>Что означает результат:</b> это предварительная учебная
            рекомендация, а не подтверждение квалификации, профессиональный
            экзамен или решение о найме.
          </p>
          <button onClick={reset}>Пройти заново</button>
        </section>
      </main>
    );
  const item = questions[state.step];
  return (
    <main id="main-content" className="diagnostic-page">
      <header>
        <a href="../">← На главную</a>
        <small>ВХОДНАЯ ДИАГНОСТИКА · КЕЙС {state.step + 1} ИЗ 3</small>
        <div
          className="diagnostic-progress"
          role="progressbar"
          aria-label="Прогресс диагностики"
          aria-valuemin="0"
          aria-valuemax="3"
          aria-valuenow={state.step}
        >
          <i style={{ width: `${(state.step / 3) * 100}%` }} />
        </div>
        <h1>{item.title}</h1>
        <p>{item.context}</p>
      </header>
      <section className="diagnostic-question">
        <small>{item.skill}</small>
        <h2>{item.ask}</h2>
        <div>
          {item.options.map((option, index) => (
            <button onClick={() => choose(index)} key={option.text}>
              <span>{String.fromCharCode(65 + index)}</span>
              {option.text}
            </button>
          ))}
        </div>
        <p>
          Выберите наиболее обоснованное действие. После третьего кейса вы
          получите уровень, разбор и рекомендованный маршрут.
        </p>
      </section>
    </main>
  );
}
