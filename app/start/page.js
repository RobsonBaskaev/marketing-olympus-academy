import StartPlanner from "./start-planner";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("start","Настройка учебного маршрута — Маркетинг Олимп","Персональный четырёхнедельный план обучения по цели, темпу и реальному проекту ученика.");

export default function StartPage() {
  return <StartPlanner />;
}
