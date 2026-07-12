import Diagnostic from "./diagnostic";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("diagnostic","Диагностика уровня маркетолога — Маркетинг Олимп","Три мини-кейса для предварительной оценки маркетингового мышления и персональной рекомендации обучения.");

export default function DiagnosticPage() {
  return <Diagnostic />;
}
