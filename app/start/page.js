import StartPlanner from "./start-planner";
import {canonicalUrl} from "../lib/seo.mjs";

export const metadata = {
  title: "Настройка учебного маршрута — Маркетинг Олимп",
  description: "Персональный четырёхнедельный план обучения по цели, темпу и реальному проекту ученика.",
  alternates:{canonical:canonicalUrl("start")},
};

export default function StartPage() {
  return <StartPlanner />;
}
