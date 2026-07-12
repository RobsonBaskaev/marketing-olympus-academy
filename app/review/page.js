import ReviewDashboard from "./review-dashboard";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("review","Разбор письменных кейсов — Маркетинг Олимп","Прозрачная структурная проверка письменных решений маркетинговых кейсов.");

export default function ReviewPage() {
  return <ReviewDashboard />;
}
