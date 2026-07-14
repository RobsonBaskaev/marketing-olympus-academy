import {foundationLessons} from "./foundation-curriculum.mjs";
import {foundationSummary} from "./foundation-storage.mjs";

const value=(state,index,key)=>String(state.lessons?.[foundationLessons[index].id]?.answers?.[key]||"").trim()||"—";

export function buildFoundationDocument(state={}){
  const summary=foundationSummary(state),scores=foundationLessons.map(lesson=>Number(state.lessons?.[lesson.id]?.bestScore||0)),issues=[...new Set(foundationLessons.flatMap(lesson=>state.lessons?.[lesson.id]?.feedback?.issues||[]))].slice(0,6);
  const data={
    status:summary.ready?"Завершённая работа":"Черновик",
    project:state.selectedProject?.name||"Проект не выбран",
    product:value(state,0,"product"),
    customerJob:value(state,0,"job"),
    desiredOutcome:value(state,0,"outcome"),
    market:[value(state,1,"group"),value(state,1,"demandSituation")].join(" · "),
    alternatives:value(state,1,"alternatives"),
    segments:[value(state,2,"segment1"),value(state,2,"segment2"),value(state,2,"segment3")],
    priority:value(state,2,"priority"),
    value:value(state,3,"valueStatement"),
    positioning:value(state,4,"positionStatement"),
    evidence:[value(state,0,"proof"),value(state,1,"marketEvidence"),value(state,3,"valueProof"),value(state,4,"positionProof")].filter(item=>item!=="—"),
    issues:issues.length?issues:["Требуется проверить выводы на интервью, поведении и данных."],
    score:summary.ready?Math.round(scores.reduce((sum,score)=>sum+score,0)/scores.length):summary.average,
    next:summary.ready?"Перейти к модулю исследований и проверить ключевые допущения на реальных данных.":`Завершить урок ${Math.max(1,summary.completed.length+1)} из 5.`,
  };
  return {data,ready:summary.ready,text:[
    "МАРКЕТИНГ ОЛИМП — МАРКЕТИНГОВЫЙ ФУНДАМЕНТ ПРОЕКТА",
    `Статус: ${data.status}`,
    `Проект: ${data.project}`,
    `Общий балл: ${data.score}/100`,"",
    "1. ВЫБРАННЫЙ ПРОДУКТ",data.product,"",
    "2. ЗАДАЧА КЛИЕНТА",data.customerJob,"",
    "3. ЖЕЛАЕМЫЙ РЕЗУЛЬТАТ",data.desiredOutcome,"",
    "4. ОПИСАНИЕ РЫНКА",data.market,"",
    "5. СУЩЕСТВУЮЩИЕ АЛЬТЕРНАТИВЫ",data.alternatives,"",
    "6. ТРИ СЕГМЕНТА",...data.segments.map((segment,index)=>`${index+1}. ${segment}`),"",
    "7. ПРИОРИТЕТНЫЙ СЕГМЕНТ",data.priority,"",
    "8. ЦЕННОСТНОЕ ПРЕДЛОЖЕНИЕ",data.value,"",
    "9. ПОЗИЦИОНИРОВАНИЕ",data.positioning,"",
    "10. ДОКАЗАТЕЛЬСТВА",...(data.evidence.length?data.evidence:["—"]),"",
    "11. РИСКИ И СЛАБЫЕ МЕСТА",...data.issues.map(issue=>`• ${issue}`),"",
    "12. РЕКОМЕНДОВАННЫЙ СЛЕДУЮЩИЙ ШАГ",data.next,"",
    "Документ создан локально в тренажёре «Маркетинг Олимп». Он отражает учебную работу и не является профессиональной сертификацией.",
  ].join("\n")};
}
