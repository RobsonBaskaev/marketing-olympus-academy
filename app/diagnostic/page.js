import Diagnostic from "./diagnostic";
import {canonicalUrl} from "../lib/seo.mjs";

export const metadata = {
  title: "Диагностика уровня маркетолога — Маркетинг Олимп",
  description:
    "Три мини-кейса для предварительной оценки маркетингового мышления и персональной рекомендации обучения.",
  alternates:{canonical:canonicalUrl("diagnostic")},
};

export default function DiagnosticPage() {
  return <Diagnostic />;
}
