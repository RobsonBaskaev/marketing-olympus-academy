import CaseLab from "./case-lab";

export const metadata = {
  title: "Маркетинговые кейсы — Маркетинг Олимп",
  description: "Многоуровневый тренажёр маркетинговых решений с данными, вариантами, обратной связью и образцами ответов.",
};

export default function Cases(){return <><CaseLab/><a className="case-review-link" href="../review/">Разобрать мой ответ →</a></>}
