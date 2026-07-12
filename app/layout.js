import "./globals.css";
import "./module.css";
import "./trainer.css";
import "./product.css";
import "./coach.css";
import "./portfolio.css";
import "./accessibility.css";
import "./resources.css";

export const metadata = {
  title: "Маркетинг: от азов до Олимпа",
  description: "Интерактивный тренажёр маркетинга: уроки, практические кейсы, автопроверка ответов и учебное портфолио.",
  alternates: { canonical: "https://robsonbaskaev.github.io/marketing-olympus-academy/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Маркетинг Олимп — тренажёр системного маркетинга",
    description: "Учитесь решать маркетинговые задачи на практике и собирайте портфолио.",
    url: "https://robsonbaskaev.github.io/marketing-olympus-academy/",
    siteName: "Маркетинг Олимп",
    locale: "ru_RU",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return <html lang="ru"><body><a className="skip-link" href="#main-content">Перейти к содержанию</a>{children}</body></html>;
}
