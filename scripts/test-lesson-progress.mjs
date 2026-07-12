import assert from "node:assert/strict";
import {
  MIN_LESSON_ANSWER,
  nextIncompleteLesson,
  reconcileCompletedLessons,
} from "../app/lib/lesson-progress.mjs";

const notes = {
  0: "Коротко",
  1: "Клиент — офисный сотрудник утром; ему нужен быстрый напиток по дороге на работу.",
  3: "Сегмент — новые покупатели с задержанной доставкой; проверю повторный заказ за 90 дней.",
};

assert.equal(MIN_LESSON_ANSWER, 30);
assert.deepEqual(
  reconcileCompletedLessons([0, 1, 1, 3, 9, "2"], notes, 5),
  [1, 3],
  "Прогресс должен учитывать только уникальные уроки с полноценной работой",
);
assert.equal(nextIncompleteLesson([0, 1], 5), 2);
assert.equal(nextIncompleteLesson([0, 1, 2, 3, 4], 5), 0);
assert.equal(nextIncompleteLesson([], 5), 0);

console.log("Прогресс уроков: восстановление и продолжение работают корректно.");
