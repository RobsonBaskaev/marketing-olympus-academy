import assert from "node:assert/strict";
import {caseWorkStatus,completedCaseCount} from "../app/lib/case-progress.mjs";

const nonsense="Очень длинный ответ без доказательств и профессиональной структуры. ".repeat(3);
assert.equal(caseWorkStatus(1,1,nonsense).complete,false,"Длина не должна равняться завершению");
const strong="Для новых клиентов сравню данные CRM и проведу интервью. Гипотеза: если прояснить доставку, то повторный заказ вырастет. Запущу тест с контрольной группой, измерю удержание и маржу. Риск — сезонность.";
assert.equal(caseWorkStatus(0,1,strong).complete,false,"Сильный текст с ошибочным направлением не завершает кейс");
assert.equal(caseWorkStatus(1,1,strong).complete,true,"Сильное направление и доказательный ответ завершают кейс");
assert.equal(completedCaseCount({selected:{coffee:1,store:0},drafts:{coffee:strong,store:strong}}),1,"Кабинет должен учитывать только подтверждённый кейс");
console.log("Прогресс кейсов: длина, направление и доказательная структура учитываются корректно.");
