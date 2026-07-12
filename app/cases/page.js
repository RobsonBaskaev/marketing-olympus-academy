import CaseLab from "./case-lab";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("cases","Маркетинговые кейсы — Маркетинг Олимп","Многоуровневый тренажёр маркетинговых решений с данными, вариантами, обратной связью и образцами ответов.");

export default function Cases(){return <><CaseLab/><a className="case-review-link" href="../review/">Разобрать мой ответ →</a></>}
