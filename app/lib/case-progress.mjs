import {evaluateCaseAnswer} from "./case-rubric.mjs";

export const CASE_BEST_ANSWERS={coffee:1,store:1,saas:1,b2b:1};

export function caseWorkStatus(selected,best,draft=""){
  const evaluation=evaluateCaseAnswer(draft);
  const directionReady=selected===best;
  return {...evaluation,directionReady,complete:directionReady&&evaluation.ready&&evaluation.score>=4};
}

export function completedCaseCount(caseLab={}){
  return Object.entries(CASE_BEST_ANSWERS).filter(([id,best])=>
    caseWorkStatus(caseLab.selected?.[id],best,caseLab.drafts?.[id]||"").complete
  ).length;
}
