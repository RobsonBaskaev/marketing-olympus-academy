"use client";
import { useEffect, useState } from "react";

export default function NotFound() {
  // Пререндер использует путь GitHub Pages; на других хостах базовый путь корректируется после гидрации.
  const [base, setBase] = useState("/marketing-olympus-academy");
  useEffect(() => {
    if (!window.location.hostname.endsWith("github.io")) setBase("");
  }, []);
  return (
    <main id="main-content" className="not-found-page">
      <small>ОШИБКА 404</small>
      <h1>Такого урока пока нет</h1>
      <p>
        Возможно, адрес изменился или ссылка устарела. Ваш сохранённый прогресс не
        пострадал.
      </p>
      <div>
        <a className="primary" href={`${base}/learn/`}>
          Продолжить обучение →
        </a>
        <a href={`${base}/`}>На главную</a>
      </div>
    </main>
  );
}
