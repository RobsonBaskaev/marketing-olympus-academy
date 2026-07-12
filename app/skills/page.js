import SkillsDashboard from "./skills-dashboard";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("skills","Карта компетенций — Маркетинг Олимп","Прозрачная учебная карта маркетинговых навыков, подтверждённых выполненными работами в тренажёре.");

export default function SkillsPage() {
  return <SkillsDashboard />;
}
