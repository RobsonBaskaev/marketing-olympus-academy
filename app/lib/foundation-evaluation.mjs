import {foundationDifficulties,foundationLessons} from "./foundation-curriculum.mjs";

export const vagueWords=["качествен","удобн","лучш","современн","надёжн","доступн","уникальн","эффективн","профессиональн","быстр"];
const broadPatterns=[/для всех/i,/все люди/i,/все жители/i,/мужчины\s*\d/i,/женщины\s*\d/i,/люди\s*\d/i,/любые компании/i];
const shortFields=new Set(["product","priority","category","shortPosition"]);

const clean=value=>String(value||"").trim().replace(/\s+/g," ");
const normalized=value=>clean(value).toLowerCase().replace(/[^a-zа-яё0-9 ]/gi,"");
const hasNumber=value=>/\d/.test(String(value||""));
const words=value=>normalized(value).split(" ").filter(word=>word.length>=4);

export function fieldMinimum(field,difficulty="practitioner"){
  if(shortFields.has(field.key)) return difficulty==="pro"?12:6;
  if(field.key.endsWith("Statement")) return difficulty==="pro"?80:50;
  return foundationDifficulties[difficulty]?.min||36;
}

function tagQuality(lesson,answers,tag,difficulty){
  const relevant=lesson.fields.filter(field=>field.tags?.includes(tag));
  if(!relevant.length) return 1;
  return relevant.filter(field=>clean(answers[field.key]).length>=Math.min(24,fieldMinimum(field,difficulty))).length/relevant.length;
}

function overlap(left,right){
  const a=new Set(words(left)),b=new Set(words(right));
  if(!a.size||!b.size) return false;
  return [...a].some(word=>b.has(word));
}

function crossLessonCheck(index,answers,foundation){
  if(index===0) return {ok:true};
  const previous=foundation?.lessons?.[foundationLessons[index-1].id];
  if(previous?.status!=="completed") return {ok:false,message:"Сначала завершите предыдущий урок: новая работа должна опираться на уже проверенный результат."};
  if(index===1&&previous.answers?.job&&!overlap(answers.group,previous.answers.job)) return {ok:false,message:"Описание рынка пока не связано с задачей клиента из урока 1. Уточните общую задачу группы."};
  if(index===3){
    const segmentation=foundation?.lessons?.[foundationLessons[2].id];
    if(segmentation?.answers?.priority&&!overlap(answers.valueSegment,segmentation.answers.priority)) return {ok:false,message:"Ценностное предложение должно использовать приоритетный сегмент из урока 3."};
  }
  if(index===4){
    const value=foundation?.lessons?.[foundationLessons[3].id];
    if(value?.answers?.valueSegment&&!overlap(answers.positionSegment,value.answers.valueSegment)) return {ok:false,message:"Позиционирование должно сохранять сегмент из ценностного предложения."};
    if(value?.answers?.valueAlternative&&!overlap(answers.positionAlternative,value.answers.valueAlternative)) return {ok:false,message:"Проверьте связь главной альтернативы с ценностным предложением урока 4."};
  }
  return {ok:true};
}

export function evaluateFoundationLesson(index,lessonState={},foundation={}){
  const lesson=foundationLessons[index],difficulty=foundation.difficulty||"practitioner",config=foundationDifficulties[difficulty]||foundationDifficulties.practitioner;
  const answers=lessonState.answers||{},defense=clean(lessonState.defenseAnswer),proChallenge=clean(lessonState.proChallenge),values=lesson.fields.map(field=>clean(answers[field.key]));
  const missing=lesson.fields.filter(field=>clean(answers[field.key]).length<fieldMinimum(field,difficulty));
  const answeredRatio=(lesson.fields.length-missing.length)/lesson.fields.length;
  const duplicateGroups=Object.values(lesson.fields.reduce((groups,field)=>{
    const value=clean(answers[field.key]),key=normalized(value);
    if(value.length>=12)(groups[key]||=[]).push(field.key);
    return groups;
  },{})).filter(keys=>keys.length>1);
  const duplicates=duplicateGroups.filter(keys=>!(index===2&&keys.length===2&&keys.includes("priority")&&keys.some(key=>["segment1","segment2","segment3"].includes(key))));
  const vague=[...new Set(lesson.fields.flatMap(field=>{
    const value=clean(answers[field.key]),found=vagueWords.filter(word=>value.toLowerCase().includes(word));
    return found.length&&!hasNumber(value)&&value.length<90?found:[];
  }))];
  const broad=values.some(value=>broadPatterns.some(pattern=>pattern.test(value)));
  const proofQuality=tagQuality(lesson,answers,"proof",difficulty),customerQuality=tagQuality(lesson,answers,"customer",difficulty),alternativeQuality=tagQuality(lesson,answers,"alternative",difficulty);
  const cross=crossLessonCheck(index,answers,foundation);
  const measurable=lesson.fields.filter(field=>field.tags?.includes("proof")&&hasNumber(answers[field.key])).length>0;
  const specificity=Math.round(20*answeredRatio)-Math.min(8,vague.length*2)-(broad?5:0);
  const coherence=Math.max(0,(duplicates.length?8:12)+(cross.ok?8:0));
  const customer=Math.round(20*customerQuality);
  const verifiability=Math.round(15*Math.min(1,proofQuality+(measurable?0.25:0)));
  const alternative=Math.round(15*(index===0?tagQuality(lesson,answers,"situation",difficulty):alternativeQuality));
  const argumentation=Math.round(10*Math.min(1,defense.length/config.defenseMin));
  const score=Math.max(0,Math.min(100,specificity+coherence+customer+verifiability+alternative+argumentation));
  const issues=[];
  if(missing.length) issues.push(`Недостаточно конкретно заполнено полей: ${missing.slice(0,3).map(field=>`«${field.label}»`).join(", ")}.`);
  if(broad) issues.push("Клиент или рынок описан слишком широко. Замените «все» на различимую группу в конкретной ситуации.");
  if(vague.length) issues.push(`Общие слова требуют расшифровки: ${vague.slice(0,4).join(", ")}. Добавьте срок, число, механизм или наблюдаемый критерий.`);
  if(duplicates.length) issues.push("Несколько полей содержат одинаковый ответ. Каждое поле должно добавлять новое звено логики.");
  if(!cross.ok) issues.push(cross.message);
  if(!measurable&&lesson.fields.some(field=>field.tags?.includes("proof"))) issues.push("Доказательство пока нельзя измерить. Добавьте число, срок или наблюдаемое поведение.");
  if(defense.length<config.defenseMin) issues.push(`Защита решения должна содержать не менее ${config.defenseMin} символов.`);
  if(difficulty==="pro"&&proChallenge.length<60) issues.push("Ответьте совету директоров: минимум 60 символов о риске, контраргументе и защитной метрике.");
  if(difficulty==="pro"&&!/риск|огранич|контраргумент|защитн/i.test(values.join(" ")+" "+defense+" "+proChallenge)) issues.push("В профессиональном режиме назовите риск, контраргумент или защитную метрику.");
  const strengths=[];
  if(customerQuality>=.8) strengths.push("Клиентская задача и сегмент описаны через различимые признаки.");
  if(cross.ok&&index>0) strengths.push("Решение логически связано с результатом предыдущего урока.");
  if(measurable) strengths.push("В ответе есть измеримый срок, число или критерий проверки.");
  if(alternativeQuality>=.8&&index>0) strengths.push("Названа альтернатива, относительно которой клиент делает выбор.");
  if(!vague.length&&answeredRatio===1) strengths.push("Общие рекламные формулировки не заменяют конкретное объяснение.");
  const actions=issues.slice(0,3);
  const requiredComplete=missing.length===0&&!duplicates.length&&cross.ok&&(difficulty!=="pro"||proChallenge.length>=60);
  const learningStagesComplete=lessonState.provocationAnswer!==null&&lessonState.provocationAnswer!==undefined&&lessonState.miniCaseAnswer!==null&&lessonState.miniCaseAnswer!==undefined&&(lessonState.comparisonReasons||[]).length>=2&&lessonState.reviewAnswer!==null&&lessonState.reviewAnswer!==undefined;
  const readyToComplete=score>=config.threshold&&requiredComplete&&learningStagesComplete&&defense.length>=config.defenseMin;
  const status=score<40?"Требуется серьёзная доработка":score<60?"Основа есть, но ответ слишком общий":score<75?"Хороший рабочий ответ":score<90?"Сильный маркетинговый ответ":"Профессиональный уровень";
  return {score,status,strengths:strengths.length?strengths:["Заполненная часть ответа создаёт основу для следующей попытки."],issues:issues.length?issues:["Фактических структурных замечаний не найдено; проверьте достоверность исходных данных."],actions,question:lesson.defense,requiredComplete,learningStagesComplete,readyToComplete,threshold:config.threshold,missing:missing.map(field=>field.key),criteria:{specificity:Math.max(0,specificity),coherence,customer,verifiability,alternative,argumentation}};
}

export function canCompleteFoundationLesson(index,lessonState,foundation){
  return evaluateFoundationLesson(index,lessonState,foundation).readyToComplete;
}
