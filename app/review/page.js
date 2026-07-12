import ReviewDashboard from "./review-dashboard";
import {canonicalUrl} from "../lib/seo.mjs";

export const metadata = {
  title: "Разбор письменных кейсов — Маркетинг Олимп",
  description: "Прозрачная структурная проверка письменных решений маркетинговых кейсов.",
  alternates:{canonical:canonicalUrl("review")},
};

export default function ReviewPage() {
  return <ReviewDashboard />;
}
