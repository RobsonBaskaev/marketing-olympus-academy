import SkillsDashboard from "./skills-dashboard";
import {canonicalUrl} from "../lib/seo.mjs";

export const metadata = {
  title: "Карта компетенций — Маркетинг Олимп",
  description: "Прозрачная учебная карта маркетинговых навыков, подтверждённых выполненными работами в тренажёре.",
  alternates:{canonical:canonicalUrl("skills")},
};

export default function SkillsPage() {
  return <SkillsDashboard />;
}
