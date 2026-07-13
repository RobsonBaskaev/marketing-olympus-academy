import BusinessDiagnostic from "./planner";
import {routeMetadata} from "../lib/seo.mjs";

export const metadata=routeMetadata("business-diagnostic","Диагностика бизнеса для маркетинговой стратегии — Маркетинг Олимп","Опишите бизнес и получите персонализированный черновик применения 20 маркетинговых инструментов.");
export default function Page(){return <BusinessDiagnostic/>}
