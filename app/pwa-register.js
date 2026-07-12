"use client";
import {useEffect} from "react";

export default function PWARegister(){useEffect(()=>{if(!("serviceWorker" in navigator))return;const base=window.location.hostname.endsWith("github.io")?"/marketing-olympus-academy":"";const register=()=>navigator.serviceWorker.register(`${base}/sw.js`,{scope:`${base}/`}).catch(()=>{});if(document.readyState==="complete")register();else window.addEventListener("load",register,{once:true})},[]);return null}
