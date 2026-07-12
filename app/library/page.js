import LibraryBrowser from "./library-browser";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("library","Библиотека методов маркетинга — Маркетинг Олимп","Практические методы маркетинга: когда применять, пошаговый алгоритм, результат, пример и типичная ошибка.");

export default function Library(){return <main id="main-content" className="library-page">
  <header><a href="../">← На главную</a><small>БАЗА ЗНАНИЙ · 20 МЕТОДОВ</small><h1>Найдите метод под задачу</h1><p>Не энциклопедия ради терминов, а рабочие инструкции: когда применять инструмент, что делать по шагам и какой результат считать достаточным.</p></header>
  <LibraryBrowser/>
  <section className="library-boundary"><h2>Как пользоваться библиотекой</h2><p>Метод помогает структурировать решение, но не заменяет данные и профессиональное суждение. Начните с задачи, зафиксируйте допущения, примените шаги на своём проекте и проверьте вывод реальным результатом.</p><div><a href="../cases/">Применить в кейсах →</a><a href="../sources/">Проверить источники →</a><a href="../curriculum/">Открыть программу →</a></div></section>
  </main>}
