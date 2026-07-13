"use client";
import {useEffect,useState} from "react";

const CONTACT_EMAIL="robson.baskaev@gmail.com";
const features=[
 {title:"Проверка работ экспертом",now:"Автопроверка по рубрике из 6 критериев",pro:"Живой маркетолог читает ваш ответ, отмечает сильные ходы и слепые зоны, предлагает следующий шаг.",tag:"expert"},
 {title:"AI-разбор ваших ответов",now:"Общие критерии и образец сильного ответа",pro:"Персональный разбор каждого черновика: чего не хватает именно в вашей формулировке и как усилить доказательства.",tag:"ai"},
 {title:"Командный кабинет",now:"Индивидуальный прогресс в одном браузере",pro:"Прогресс команды на одном экране: кто на каком модуле, чьи кейсы ждут разбора, общий отчёт для руководителя.",tag:"team"},
 {title:"Аккаунт и синхронизация",now:"Прогресс в localStorage + ручная резервная копия",pro:"Вход с любого устройства, история версий ваших работ и автоматическое сохранение без JSON-файлов.",tag:"sync"},
];
const empty={name:"",business:"",priority:features[0].title,contact:""};

export default function ProOffer(){
 const[form,setForm]=useState(empty),[copied,setCopied]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("olymp-pro-request")||"null");if(saved)setForm({...empty,...saved})}catch{}},[]);
 const update=(key,value)=>{const next={...form,[key]:value};setForm(next);setCopied(false);localStorage.setItem("olymp-pro-request",JSON.stringify(next))};
 const ready=form.name.trim().length>1&&form.business.trim().length>3;
 const body=()=>["Заявка на ранний доступ к Олимп Pro.","",`Имя и роль: ${form.name}`,`Бизнес или ниша: ${form.business}`,`Что нужнее всего: ${form.priority}`,form.contact.trim()?`Как связаться: ${form.contact}`:"","",  "Отправлено со страницы pro/ тренажёра Маркетинг Олимп."].filter(Boolean).join("\n");
 const mailtoHref=`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Заявка на ранний доступ — Олимп Pro")}&body=${encodeURIComponent(body())}`;
 const copy=async()=>{try{await navigator.clipboard.writeText(`Кому: ${CONTACT_EMAIL}\n\n${body()}`);setCopied(true)}catch{setCopied(false)}};
 return <main id="main-content" className="pro-page">
  <header><a href="../">← На главную</a><small>РАННИЙ ДОСТУП · ОПЛАТА ПОКА НЕ ПОДКЛЮЧЕНА</small><h1>Олимп Pro</h1><p>Бесплатный тренажёр остаётся бесплатным. Pro — это следующий уровень: живая проверка ваших работ, персональный разбор и командное обучение. Сейчас мы собираем список раннего доступа.</p>
   <div className="pro-terms"><b>Как это работает</b><span>Заявка ни к чему не обязывает и не требует оплаты. Когда Pro откроется, участники списка получат доступ первыми и цену раннего доступа — ниже публичной.</span></div></header>
  <section className="pro-features"><small>ЧТО ВОЙДЁТ В PRO</small><h2>Бесплатно сегодня → Pro завтра</h2><div>{features.map(item=><article key={item.tag}><h3>{item.title}</h3><p><b>Сейчас бесплатно:</b> {item.now}</p><p className="pro-plus"><b>В Pro:</b> {item.pro}</p></article>)}</div></section>
  <section className="pro-form"><small>СПИСОК РАННЕГО ДОСТУПА</small><h2>Оставить заявку</h2><p>Ответ придёт на почту или контакт, который вы укажете. Данные заявки сохраняются только в вашем браузере, пока вы её не отправите.</p>
   <div className="pro-fields">
    <label><b>Имя и роль *</b><input value={form.name} onChange={event=>update("name",event.target.value)} placeholder="Например: Анна, руководитель отдела маркетинга"/></label>
    <label><b>Бизнес или ниша *</b><input value={form.business} onChange={event=>update("business",event.target.value)} placeholder="Например: онлайн-школа английского, 2 года"/></label>
    <label><b>Что нужнее всего</b><select value={form.priority} onChange={event=>update("priority",event.target.value)}>{features.map(item=><option key={item.tag}>{item.title}</option>)}</select></label>
    <label><b>Как с вами связаться</b><input value={form.contact} onChange={event=>update("contact",event.target.value)} placeholder="Почта или Telegram (если не хотите отвечать с почты)"/></label>
   </div>
   <div className="pro-actions"><a className={ready?"primary":"primary disabled"} href={ready?mailtoHref:undefined} aria-disabled={!ready}>Отправить заявку письмом →</a><button type="button" disabled={!ready} onClick={copy}>{copied?"✓ Скопировано":"Скопировать текст заявки"}</button><span>{ready?"Кнопка откроет ваш почтовый клиент. Если он не настроен — скопируйте текст и отправьте любым способом.":"Заполните имя и бизнес, чтобы собрать заявку"}</span></div></section>
  <section className="pro-boundary"><h2>Честные границы</h2><p>Pro ещё не запущен: оплата не подключена, сроки зависят от количества заявок. Всё, что уже опубликовано — уроки, кейсы, тренажёры, библиотека методов и диагностика бизнеса — работает бесплатно и без регистрации.</p><div><a href="../business-diagnostic/">Попробовать диагностику бизнеса →</a><a href="../cases/">Решить кейс →</a></div></section>
 </main>}
