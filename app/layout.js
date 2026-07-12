import "./globals.css";
import "./module.css";
import "./trainer.css";
import "./product.css";
import "./coach.css";
import "./portfolio.css";
import "./accessibility.css";
import "./resources.css";
import "./lesson-enhance.css";
import "./trust.css";

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

const courseSchema = {"@context":"https://schema.org","@type":"Course",name:"Маркетинг: от азов до Олимпа",description:"Интерактивный тренажёр системного маркетинга с уроками, кейсами, проверкой ответов и портфолио.",url:"https://robsonbaskaev.github.io/marketing-olympus-academy/",inLanguage:"ru",educationalLevel:"От начинающего до профессионального",isAccessibleForFree:true,provider:{"@type":"Organization",name:"Маркетинг Олимп"},teaches:["Основы маркетинга","Сегментация","Ценностное предложение","Позиционирование","Решение маркетинговых кейсов"]};

export default function RootLayout({ children }) {
  return <html lang="ru"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(courseSchema)}}/><a className="skip-link" href="#main-content">Перейти к содержанию</a>{children}</body></html>;
}
