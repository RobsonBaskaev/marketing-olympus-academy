export function validateFunnel({ visits = 0, leads = 0, sales = 0, revenue = 0 } = {}) {
  const errors = [];
  if (leads > visits) errors.push("Заявок не может быть больше, чем посетителей в той же воронке.");
  if (sales > leads) errors.push("Продаж не может быть больше, чем заявок в той же воронке.");
  if (revenue > 0 && sales === 0) errors.push("Атрибутированная выручка требует хотя бы одной продажи.");
  return errors;
}
