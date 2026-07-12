import CaseLab from "./case-lab";
import {canonicalUrl} from "../lib/seo.mjs";

export const metadata = {
  title: "Маркетинговые кейсы — Маркетинг Олимп",
  description: "Многоуровневый тренажёр маркетинговых решений с данными, вариантами, обратной связью и образцами ответов.",
  alternates:{canonical:canonicalUrl("cases")},
};

export default function Cases(){return <><CaseLab/><a className="case-review-link" href="../review/">Разобрать мой ответ →</a></>}
