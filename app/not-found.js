export default function NotFound() {
  return (
    <main id="main-content" className="not-found-page">
      <small>ОШИБКА 404</small>
      <h1>Такого урока пока нет</h1>
      <p>
        Возможно, адрес изменился или ссылка устарела. Ваш сохранённый прогресс не
        пострадал.
      </p>
      <div>
        <a className="primary" href="/marketing-olympus-academy/learn/">
          Продолжить обучение →
        </a>
        <a href="/marketing-olympus-academy/">На главную</a>
      </div>
    </main>
  );
}
