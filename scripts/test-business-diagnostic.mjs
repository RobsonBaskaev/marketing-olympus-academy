import assert from "node:assert/strict";
import {buildBusinessMethodPlans,businessProfileReady} from "../app/lib/business-diagnostic.mjs";

const profile={name:"Север",product:"доставка рационов",customer:"занятые специалисты",problem:"мало повторных заказов",goal:"увеличить удержание",geography:"Москва",market:"Россия"};
assert.equal(businessProfileReady(profile),true);
const plans=buildBusinessMethodPlans(profile);
assert.equal(plans.length,28);
assert.ok(plans.every(plan=>plan.question&&plan.draft&&plan.action&&plan.metric));
assert.ok(plans.find(plan=>plan.title==="Ценностное предложение").draft.includes("доставка рационов"));
assert.equal(businessProfileReady({name:"A"}),false);
console.log("Диагностика бизнеса: 28 персонализированных разборов формируются корректно.");
