export const MIN_LESSON_ANSWER = 30;

export function reconcileCompletedLessons(done = [], notes = {}, lessonCount = 5) {
  return [...new Set(Array.isArray(done) ? done : [])]
    .filter(
      (index) =>
        Number.isInteger(index) &&
        index >= 0 &&
        index < lessonCount &&
        String(notes?.[index] || "").trim().length >= MIN_LESSON_ANSWER,
    )
    .sort((a, b) => a - b);
}

export function nextIncompleteLesson(done = [], lessonCount = 5) {
  if (lessonCount <= 0) return 0;
  const completed = new Set(Array.isArray(done) ? done : []);
  const next = Array.from({ length: lessonCount }, (_, index) => index).find(
    (index) => !completed.has(index),
  );
  return next === undefined ? 0 : next;
}
