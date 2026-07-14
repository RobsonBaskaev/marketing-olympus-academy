import {FOUNDATION_KEY,foundationLessons} from "./foundation-curriculum.mjs";

export function emptyFoundation(){return {version:2,selectedProject:null,difficulty:"beginner",lessons:{},updatedAt:null};}

export function migrateFoundation(legacyAnswers={},legacyProgress=[],legacyMode="beginner"){
  const next=emptyFoundation();
  next.difficulty=["beginner","practitioner","pro"].includes(legacyMode)?legacyMode:"beginner";
  foundationLessons.forEach((lesson,index)=>{
    const legacy=String(legacyAnswers?.[index]||"").trim();
    if(!legacy) return;
    next.lessons[lesson.id]={status:"migrated",answers:{legacyAnswer:legacy},initialAnswers:{legacyAnswer:legacy},score:0,bestScore:0,attempts:0,defenseAnswer:"",miniCaseAnswer:null,provocationAnswer:null,feedback:{issues:["Ответ сохранён из прежней версии. Разложите его по новым полям и пройдите проверку качества."]},completedAt:null,wasPreviouslyMarkedComplete:Array.isArray(legacyProgress)&&legacyProgress.includes(index)};
  });
  return next;
}

export function loadFoundation(storage){
  try{
    const saved=JSON.parse(storage.getItem(FOUNDATION_KEY)||"null");
    if(saved?.version===2) return {state:{...emptyFoundation(),...saved,lessons:saved.lessons||{}},restored:true,migrated:false};
    const legacyAnswers=JSON.parse(storage.getItem("olymp-answers")||"{}"),legacyProgress=JSON.parse(storage.getItem("olymp-progress")||"[]"),legacyMode=storage.getItem("olymp-mode")||"beginner";
    const state=migrateFoundation(legacyAnswers,legacyProgress,legacyMode);
    storage.setItem(FOUNDATION_KEY,JSON.stringify(state));
    return {state,restored:false,migrated:Object.keys(state.lessons).length>0};
  }catch{return {state:emptyFoundation(),restored:false,migrated:false,error:true};}
}

export function saveFoundation(storage,state){
  try{const next={...state,version:2,updatedAt:new Date().toISOString()};storage.setItem(FOUNDATION_KEY,JSON.stringify(next));return {ok:true,state:next};}
  catch{return {ok:false,state};}
}

export function foundationCompletedIndexes(state={}){
  return foundationLessons.map((lesson,index)=>state.lessons?.[lesson.id]?.status==="completed"?index:null).filter(index=>index!==null);
}

export function foundationSummary(state={}){
  const completed=foundationCompletedIndexes(state),scores=foundationLessons.map(lesson=>Number(state.lessons?.[lesson.id]?.bestScore||0));
  return {completed,average:completed.length?Math.round(scores.reduce((sum,score)=>sum+score,0)/completed.length):0,ready:completed.length===foundationLessons.length};
}
