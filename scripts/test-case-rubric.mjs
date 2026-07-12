import assert from "node:assert/strict";
import { evaluateCaseAnswer } from "../app/lib/case-rubric.mjs";

const strong = evaluateCaseAnswer(
  "Для новых клиентов сравню данные CRM и проведу интервью. Гипотеза: если прояснить доставку, то повторный заказ вырастет. Запущу ограниченный тест, измерю конверсию и маржу. Риск — сезонность, поэтому сохраню контрольную группу.",
);
assert.equal(strong.ready, true, "Сильный развёрнутый ответ должен быть готов к разбору");
assert.equal(strong.score, 6, "Сильный ответ должен содержать все шесть элементов");

const weak = evaluateCaseAnswer("Сразу запущу скидку для всех.");
assert.equal(weak.ready, false, "Короткий ответ не должен считаться готовой работой");
assert.ok(weak.score <= 2, "Одна тактика не должна выглядеть структурным решением");

const withoutRisk = evaluateCaseAnswer(
  "Для клиентов проведу интервью и сравню данные чеков. Проверю гипотезу о вечернем спросе, затем протестирую набор. Решение приму по конверсии и среднему заказу.",
);
assert.equal(withoutRisk.ready, true);
assert.equal(withoutRisk.criteria.find((rule) => rule.name === "Риск или ограничение")?.ok, false);

console.log("Рубрика кейсов: сильный, слабый и ответ без риска оценены корректно.");
