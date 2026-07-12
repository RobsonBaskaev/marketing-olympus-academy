"use client";
import {useMemo,useState} from "react";
import {marketingMethods,methodCategories} from "./methods.mjs";

const levels=["Все уровни","Новичок","Практик","Профессионал"];

export default function LibraryBrowser(){
  const[query,setQuery]=useState("");
  const[category,setCategory]=useState("Все");
  const[level,setLevel]=useState("Все уровни");
  const[open,setOpen]=useState(null);
  const methods=useMemo(()=>marketingMethods.filter(method=>{
    const haystack=`${method.title} ${method.category} ${method.use} ${method.result} ${method.example}`.toLowerCase();
    return(category==="Все"||method.category===category)&&(level==="Все уровни"||method.level===level)&&haystack.includes(query.trim().toLowerCase());
  }),[query,category,level]);
  return <>
    <section className="library-controls" aria-label="Поиск и фильтры библиотеки">
      <label><span>Что нужно решить?</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Например: сегментация, CAC или интервью"/></label>
      <div className="library-filter" aria-label="Раздел метода">{methodCategories.map(item=><button className={category===item?"active":""} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div>
      <div className="library-filter levels" aria-label="Уровень сложности">{levels.map(item=><button className={level===item?"active":""} onClick={()=>setLevel(item)} key={item}>{item}</button>)}</div>
    </section>
    <div className="library-count" role="status">Найдено методов: <b>{methods.length}</b></div>
    {methods.length?<section className="method-grid">{methods.map(method=>{
      const active=open===method.title;
      return <article className={active?"open":""} key={method.title}>
        <div className="method-meta"><span>{method.category}</span><b>{method.level}</b></div>
        <h2>{method.title}</h2><p>{method.use}</p>
        <button aria-expanded={active} onClick={()=>setOpen(active?null:method.title)}>{active?"Свернуть":"Открыть метод →"}</button>
        {active&&<div className="method-detail">
          <h3>Как применить</h3><ol>{method.steps.map(step=><li key={step}>{step}</li>)}</ol>
          <h3>Что должно получиться</h3><p>{method.result}</p>
          <div className="method-example"><b>Пример</b><p>{method.example}</p></div>
          <div className="method-avoid"><b>Типичная ошибка</b><p>{method.avoid}</p></div>
        </div>}
      </article>})}</section>:<section className="library-empty"><h2>Метод не найден</h2><p>Попробуйте убрать один из фильтров или искать по задаче, а не по названию инструмента.</p><button onClick={()=>{setQuery("");setCategory("Все");setLevel("Все уровни")}}>Сбросить фильтры</button></section>}
  </>;
}
