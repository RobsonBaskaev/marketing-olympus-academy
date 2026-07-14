import assert from "node:assert/strict";
import {foundationLessons,FOUNDATION_KEY} from "../app/lib/foundation-curriculum.mjs";
import {evaluateFoundationLesson} from "../app/lib/foundation-evaluation.mjs";
import {foundationCompletedIndexes,loadFoundation,migrateFoundation,saveFoundation} from "../app/lib/foundation-storage.mjs";
import {buildFoundationDocument} from "../app/lib/foundation-document.mjs";

assert.equal(foundationLessons.length,5,"Должно быть пять уроков");
assert.equal(new Set(foundationLessons.map(lesson=>lesson.formula)).size,5,"Каждый урок должен тренировать отдельную формулу");
for(const lesson of foundationLessons){
  assert.ok(lesson.provocation&&lesson.contrast.length>=3&&lesson.example&&lesson.miniCase&&lesson.fields.length>=6&&lesson.defense&&lesson.memory,"В уроке должны быть все обязательные этапы");
}

const strongAnswers={product:"Сервис доставки семейных рационов",customer:"Родитель после поздней рабочей смены",situation:"Возвращается домой после 21:00 без сил и готового ужина",job:"Накормить семью без сорока минут готовки и ожидания",outcome:"Получить горячий семейный ужин дома за 30 минут",proof:"Не менее 90% заказов приезжают за 30 минут, повторная покупка за 14 дней"};
const base={version:2,difficulty:"practitioner",lessons:{}};
const weak=evaluateFoundationLesson(0,{answers:{product:"Еда",customer:"Все люди",situation:"Всегда",job:"Купить еду",outcome:"Качество и удобство",proof:"Лучший сервис"},defenseAnswer:"Потому что это будет удобно всем людям и очень качественно.",miniCaseAnswer:2},base);
const stages={provocationAnswer:1,miniCaseAnswer:2,comparisonReasons:[0,1],reviewAnswer:1};
const strong=evaluateFoundationLesson(0,{answers:strongAnswers,defenseAnswer:"Клиент не продолжит готовить сам, потому что после смены теряет 40 минут, а сервис подтверждает срок долей заказов без опозданий.",...stages},base);
assert.ok(strong.score>weak.score,"Сильный ответ должен получать более высокий балл");
assert.ok(weak.issues.some(issue=>issue.includes("Общие слова")),"Общие слова должны распознаваться");
assert.equal(strong.readyToComplete,true,"Сильный ответ с мини-кейсом и защитой должен быть готов к завершению");
assert.equal(evaluateFoundationLesson(0,{answers:strongAnswers,defenseAnswer:"",...stages},base).readyToComplete,false,"Защита обязательна");
assert.equal(evaluateFoundationLesson(0,{answers:strongAnswers,defenseAnswer:"Клиент не продолжит готовить сам, потому что после смены теряет 40 минут, а сервис подтверждает срок долей заказов без опозданий.",...stages,comparisonReasons:[0]},base).readyToComplete,false,"Сравнение слабого и сильного ответа обязательно");

const linkedFoundation={...base,lessons:{[foundationLessons[0].id]:{status:"completed",answers:strongAnswers}}};
const linkedMarket=evaluateFoundationLesson(1,{answers:{group:"Родитель после смены, которому нужно накормить семью горячим ужином",demandSituation:"После 21:00 дома нет готовой еды",frequency:"Три раза в неделю",alternatives:"Самостоятельная готовка или агрегатор",friction:"Готовка занимает 40 минут",willingness:"Платит 2000 рублей в неделю",marketEvidence:"Провести 15 интервью"}},linkedFoundation);
const unrelatedMarket=evaluateFoundationLesson(1,{answers:{group:"Владельцы автомобилей, которым нужен срочный ремонт"}},linkedFoundation);
assert.ok(!linkedMarket.issues.some(issue=>issue.includes("не связано с задачей клиента")),"Общие слова задачи должны связывать соседние уроки");
assert.ok(unrelatedMarket.issues.some(issue=>issue.includes("не связано с задачей клиента")),"Несвязанный рынок должен распознаваться");
const segmentationFoundation={...base,lessons:{[foundationLessons[1].id]:{status:"completed",answers:{}}}};
const prioritySegment="Родители после поздней смены с детьми младше семи лет";
const validPriority=evaluateFoundationLesson(2,{answers:{segment1:prioritySegment,segment2:"Семьи с двумя работающими родителями и регулярным заказом",segment3:"Родители с нерегулярным графиком рабочих смен",priority:prioritySegment}},segmentationFoundation);
const copiedSegments=evaluateFoundationLesson(2,{answers:{segment1:prioritySegment,segment2:prioritySegment,segment3:"Родители с нерегулярным графиком рабочих смен",priority:prioritySegment}},segmentationFoundation);
assert.ok(!validPriority.issues.some(issue=>issue.includes("одинаковый ответ")),"Выбранный сегмент можно дословно перенести в приоритет");
assert.ok(copiedSegments.issues.some(issue=>issue.includes("одинаковый ответ")),"Копирование одного ответа в несколько сегментов должно блокироваться");

const migrated=migrateFoundation({0:"Старый содержательный ответ пользователя о клиенте и его задаче."},[0],"pro");
assert.equal(migrated.difficulty,"pro");
assert.equal(migrated.lessons[foundationLessons[0].id].status,"migrated","Старый прогресс нельзя выдавать за завершение по новым правилам");
assert.equal(migrated.lessons[foundationLessons[0].id].wasPreviouslyMarkedComplete,true);

const data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
storage.setItem("olymp-answers",JSON.stringify({0:"Сохранённый старый ответ длиннее тридцати символов."}));
const loaded=loadFoundation(storage);
assert.equal(loaded.migrated,true);
assert.ok(storage.getItem(FOUNDATION_KEY));
assert.equal(saveFoundation(storage,{...loaded.state,lessons:{[foundationLessons[0].id]:{status:"completed"}}}).ok,true);
assert.deepEqual(foundationCompletedIndexes(JSON.parse(storage.getItem(FOUNDATION_KEY))),[0]);
const completeState={
  ...base,
  selectedProject:{id:"coffee",name:"Кофейня"},
  lessons:Object.fromEntries(foundationLessons.map((lesson,index)=>[
    lesson.id,
    {status:"completed",bestScore:80,answers:
      index===0?strongAnswers:
      index===2?{segment1:"Сегмент один",segment2:"Сегмент два",segment3:"Сегмент три",priority:"Сегмент один"}:
      index===3?{valueStatement:"Ценностное предложение",valueProof:"90% заказов в срок"}:
      index===4?{positionStatement:"Позиционирование",positionProof:"90% заказов в срок"}:
      {group:"Группа",demandSituation:"Ситуация",alternatives:"Альтернатива",marketEvidence:"10 интервью"}},
  ])),
};
const document=buildFoundationDocument(completeState);
assert.equal(document.ready,true);
assert.ok(document.text.includes("ТРИ СЕГМЕНТА")&&document.text.includes("ПОЗИЦИОНИРОВАНИЕ"),"Итоговый документ должен собирать пять уроков");

console.log("Фундамент v2: пять уникальных уроков, оценка, защита и миграция работают корректно.");
