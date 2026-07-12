import {routeMetadata} from "../lib/seo.mjs";
export const metadata=routeMetadata("curriculum","Академическая программа маркетинга — Маркетинг Олимп","Двенадцатинедельная программа: результаты обучения, кейс-семинары, практические работы, критерии оценки и открытые источники.");

const modules = [
  {
    weeks: "Недели 1–2",
    title: "Клиент, рынок и ценность",
    outcomes: [
      "Отличать маркетинг как систему создания ценности от рекламы и продаж.",
      "Описывать клиента через ситуацию, задачу, альтернативу и критерий выбора.",
      "Строить поведенческие сегменты и объяснять, почему они требуют разных решений.",
    ],
    seminar: "Кофейня теряет вечерний спрос: отделить симптом от причины.",
    deliverable: "Карта ценности и сегментация с наблюдаемыми признаками.",
    readings: [
      ["OpenStax: Marketing and the Marketing Process", "https://openstax.org/books/principles-marketing/pages/1-1-marketing-and-the-marketing-process"],
      ["OpenStax: Market Segmentation", "https://openstax.org/books/principles-marketing/pages/5-1-market-segmentation-and-consumer-markets"],
    ],
  },
  {
    weeks: "Недели 3–4",
    title: "Исследования и качество доказательств",
    outcomes: [
      "Переводить бизнес-неопределённость в исследовательский вопрос.",
      "Формулировать опровержимые гипотезы и выбирать подходящий метод проверки.",
      "Различать наблюдение, интерпретацию и причинный вывод; фиксировать ограничения.",
    ],
    seminar: "Повторные покупки упали: какие данные нужны до запуска скидки.",
    deliverable: "Исследовательский бриф, сценарий интервью и таблица сигналов.",
    readings: [
      ["OpenStax: Marketing Research and Big Data", "https://openstax.org/books/principles-marketing/pages/6-1-marketing-research-and-big-data"],
    ],
  },
  {
    weeks: "Недели 5–6",
    title: "Стратегия, выбор и позиционирование",
    outcomes: [
      "Оценивать рыночную возможность и выбирать целевой сегмент.",
      "Связывать позиционирование, ценностное предложение, канал и метрику.",
      "Объяснять конкурентную реакцию и устойчивость предполагаемого преимущества.",
    ],
    seminar: "SaaS с высокой регистрацией и слабой активацией: где стратегический фокус.",
    deliverable: "Одностраничная стратегия с альтернативами и рисками.",
    readings: [
      ["MIT OCW: Marketing Strategy", "https://ocw.mit.edu/courses/15-834-marketing-strategy-spring-2003/"],
      ["OpenStax: Purpose and Structure of the Marketing Plan", "https://openstax.org/books/principles-marketing/pages/2-3-purpose-and-structure-of-the-marketing-plan"],
    ],
  },
  {
    weeks: "Недели 7–8",
    title: "Маркетинг-микс, цена и коммуникации",
    outcomes: [
      "Распределять ограниченный бюджет в соответствии с целью и неопределённостью.",
      "Проверять цену через ценность, издержки, клиентов, каналы и конкуренцию.",
      "Собирать согласованную коммуникацию для разных каналов без подмены стратегии охватом.",
    ],
    seminar: "Один бюджет — три цели: лиды, активация или удержание.",
    deliverable: "Медиамикс, обоснование цены и карта сообщений.",
    readings: [
      ["OpenStax: Five Critical Cs of Pricing", "https://openstax.org/books/principles-marketing/pages/12-2-the-five-critical-cs-of-pricing"],
      ["OpenStax: Integrated Marketing Communications", "https://openstax.org/books/principles-marketing/pages/13-3-integrated-marketing-communications"],
    ],
  },
  {
    weeks: "Недели 9–10",
    title: "Аналитика, эксперименты и решения",
    outcomes: [
      "Строить иерархию от бизнес-цели к основной и защитным метрикам.",
      "Находить узкое место воронки и сравнивать когорты, а не только средние значения.",
      "Проектировать проверку гипотезы и не выдавать корреляцию за причинный эффект.",
    ],
    seminar: "Рост выручки при падении удержания: какая метрика предупреждает раньше.",
    deliverable: "Диагностика воронки и одностраничный план эксперимента.",
    readings: [
      ["MIT OCW: Marketing Management — Analytics, Frameworks, and Applications", "https://ocw.mit.edu/courses/15-810-marketing-management-analytics-frameworks-and-applications-fall-2015/pages/syllabus/"],
      ["OpenStax: Marketing Plan Progress Using Metrics", "https://openstax.org/books/principles-marketing/pages/2-4-marketing-plan-progress-using-metrics"],
      ["OpenStax: Online Marketing Metrics", "https://openstax.org/books/principles-marketing/pages/16-3-metrics-used-to-evaluate-the-success-of-online-marketing"],
    ],
  },
  {
    weeks: "Недели 11–12",
    title: "Интеграция и защита решения",
    outcomes: [
      "Собирать исследования, стратегию, экономику и измерение в единый бизнес-кейс.",
      "Защищать рекомендацию, отвечать на возражения и пересматривать решение по обратной связи.",
      "Отделять факты, допущения, прогнозы и этические ограничения.",
    ],
    seminar: "Закупочный комитет B2B: единый бизнес-кейс для четырёх ролей.",
    deliverable: "Выпускное досье и устная защита с планом следующего эксперимента.",
    readings: [
      ["MIT OCW: Marketing Management", "https://ocw.mit.edu/courses/15-810-marketing-management-fall-2010/"],
      ["MIT OCW: New Enterprises — Syllabus", "https://ocw.mit.edu/courses/15-390-new-enterprises-spring-2013/pages/syllabus/"],
    ],
  },
];

const assessment = [
  ["20%", "Тренировочные решения", "Короткие задания с возможностью пересмотра после обратной связи."],
  ["25%", "Кейс-мемо", "Логика: контекст, данные, гипотеза, действие, метрика и риск."],
  ["15%", "Исследовательский бриф", "Связь вопроса, метода, выборки, сигналов и ограничений."],
  ["20%", "Стратегия и аналитика", "Согласованность выбора и корректность интерпретации данных."],
  ["20%", "Выпускная защита", "Интеграция, доказательства, возражения и следующая проверка."],
];

export default function Curriculum() {
  return (
    <main id="main-content" className="curriculum-page">
      <header>
        <a href="../">← На главную</a>
        <small>АКАДЕМИЧЕСКАЯ МЕТОДИЧКА · ВЕРСИЯ 1.0</small>
        <h1>Маркетинг как дисциплина решений</h1>
        <p>
          Двенадцать недель от понимания клиента до защиты интегрированного
          маркетингового решения. Программа соединяет framework, case discussion,
          практику и action learning на собственном проекте.
        </p>
        <div className="curriculum-facts">
          <div><b>12</b><span>недель</span></div>
          <div><b>6</b><span>модулей</span></div>
          <div><b>1</b><span>сквозной проект</span></div>
        </div>
      </header>
      <section className="course-outcomes">
        <small>РЕЗУЛЬТАТЫ ПРОГРАММЫ</small>
        <h2>После курса ученик сможет</h2>
        <ol>
          <li>Диагностировать маркетинговую задачу до выбора инструмента.</li>
          <li>Собирать и оценивать доказательства о клиентах и рынке.</li>
          <li>Формулировать стратегический выбор и объяснять отказ от альтернатив.</li>
          <li>Связывать предложение, цену, каналы и коммуникацию с экономикой.</li>
          <li>Использовать метрики и эксперименты с пониманием ограничений причинности.</li>
          <li>Защищать решение, отвечать на возражения и улучшать его по обратной связи.</li>
        </ol>
      </section>
      <section className="academic-rhythm">
        <small>РИТМ КАЖДОЙ НЕДЕЛИ</small>
        <div>
          {["1. Открытое чтение", "2. Короткое объяснение", "3. Кейс-семинар", "4. Практическая лаборатория", "5. Обратная связь и пересмотр"].map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
      <section className="curriculum-modules">
        {modules.map((module, index) => (
          <article key={module.title}>
            <div className="module-index"><span>0{index + 1}</span><small>{module.weeks}</small></div>
            <div className="module-syllabus">
              <h2>{module.title}</h2>
              <h3>Измеримые результаты</h3>
              <ul>{module.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
              <div className="seminar-box"><b>Кейс-семинар</b><p>{module.seminar}</p></div>
              <div className="deliverable-box"><b>Работа в портфолио</b><p>{module.deliverable}</p></div>
            </div>
            <aside>
              <h3>Открытые чтения</h3>
              {module.readings.map(([name, href]) => <a href={href} key={name}>{name} ↗</a>)}
            </aside>
          </article>
        ))}
      </section>
      <section className="assessment-model">
        <small>РЕКОМЕНДУЕМАЯ МОДЕЛЬ ОЦЕНКИ</small>
        <h2>Оценивается качество решения, а не посещение</h2>
        <div>{assessment.map(([weight, name, note]) => <article key={name}><b>{weight}</b><h3>{name}</h3><p>{note}</p></article>)}</div>
        <p className="assessment-note">Проценты — методическая модель для преподавателя или корпоративной программы. Текущая автоматическая проверка тренажёра является формирующей обратной связью, а не университетской оценкой или сертификацией.</p>
      </section>
      <section className="level-paths">
        <div><small>НОВИЧОК</small><h2>Больше опор</h2><p>Шаблоны, словарь, разобранные примеры и обязательная фиксация логики перед сравнением с образцом.</p></div>
        <div><small>ПРОФЕССИОНАЛ</small><h2>Больше неопределённости</h2><p>Конфликтующие данные, альтернативные объяснения, экономика, защитные метрики и устная защита допущений.</p></div>
      </section>
      <section className="academic-integrity">
        <h2>Академическая и продуктовая честность</h2>
        <ul>
          <li>Каждое утверждение отделяется от допущения и прогноза.</li>
          <li>Учебные компании и числа явно помечаются как вымышленные.</li>
          <li>Открытые источники цитируются ссылками; закрытые кейсы не копируются.</li>
          <li>Использование AI не заменяет проверку исходных данных и ответственность автора решения.</li>
          <li>Автоматический балл не используется как решение о найме без человеческой проверки.</li>
        </ul>
        <a href="../sources/">Открыть карту источников →</a>
      </section>
    </main>
  );
}
