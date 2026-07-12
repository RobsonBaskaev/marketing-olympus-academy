import assert from "node:assert/strict";
import { validateFunnel } from "../app/lib/analytics-validation.mjs";

assert.deepEqual(validateFunnel({ visits: 100, leads: 20, sales: 4, revenue: 40000 }), []);
assert.equal(validateFunnel({ visits: 100, leads: 120, sales: 4, revenue: 40000 }).length, 1);
assert.equal(validateFunnel({ visits: 100, leads: 20, sales: 30, revenue: 40000 }).length, 1);
assert.equal(validateFunnel({ visits: 100, leads: 0, sales: 0, revenue: 40000 }).length, 1);

console.log("Аналитика: невозможные состояния воронки распознаются корректно.");
