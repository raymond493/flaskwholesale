"use client";
import { Globe2 } from "lucide-react";
import { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";
import { convertFromAud, convertFromUsd, completeCurrencyRates, fallbackCurrencyRates, preferredCurrency, supportedCurrencies, isSupportedCurrency } from "../lib/currency";
import { formatCurrency } from "../lib/money";
const Context = createContext(null);
const preferenceKey="flaskwholesale-currency-preference";
const rateKey="flaskwholesale-currency-rates-v3-region";
export function CurrencyProvider({children}) {
  const [currency,setCurrency]=useState("USD");
  const [rates,setRates]=useState(fallbackCurrencyRates);
  const manualChoice=useRef(null);
  useEffect(()=>{
    function readPreference(){
      let saved;try{saved=localStorage.getItem(preferenceKey);}catch{}
      const linked=new URLSearchParams(window.location.search).get("currency")?.toUpperCase();
      const next=preferredCurrency(window.location.search,saved);setCurrency(next);
      if(isSupportedCurrency(linked)||isSupportedCurrency(saved))try{localStorage.setItem(preferenceKey,next);}catch{}
    }
    readPreference();window.addEventListener("popstate",readPreference);
    let cancelled=false;
    async function loadRegion(){
      let saved;try{saved=localStorage.getItem(preferenceKey);}catch{}
      const linked=new URLSearchParams(window.location.search).get("currency")?.toUpperCase();
      if(isSupportedCurrency(linked)||isSupportedCurrency(saved))return;
      try{
        const response=await fetch("/api/currency-region",{cache:"no-store"});if(!response.ok)throw Error();
        const data=await response.json();if(cancelled)return;
        let current;try{current=localStorage.getItem(preferenceKey);}catch{}
        const next=manualChoice.current||preferredCurrency(window.location.search,current,data.suggestedCurrency);
        setCurrency(next);try{localStorage.setItem(preferenceKey,next);}catch{}
      }catch{}
    }
    loadRegion();
    async function loadRates(){
      try{
        const cached=JSON.parse(localStorage.getItem(rateKey)||"null");
        if(cached?.expiresAt>Date.now() && supportedCurrencies.every(code=>Number.isFinite(cached.rates?.[code])&&cached.rates[code]>0)){setRates(completeCurrencyRates(cached.rates));return;}
      }catch{}
      try{
        const response=await fetch("/api/currency-rates");if(!response.ok)throw Error();
        const data=await response.json();const next=completeCurrencyRates(data.rates);
        if(cancelled)return;setRates(next);
        try{localStorage.setItem(rateKey,JSON.stringify({rates:next,expiresAt:Date.now()+12*60*60*1000}));}catch{}
      }catch{}
    }
    loadRates();
    return()=>{cancelled=true;window.removeEventListener("popstate",readPreference);};
  },[]);
  const value = useMemo(()=>({currency,rates,selectCurrency:(next)=>{
    if(!isSupportedCurrency(next))return;manualChoice.current=next;setCurrency(next);
    try{localStorage.setItem(preferenceKey,next);}catch{}
    const url=new URL(window.location.href);url.searchParams.set("currency",next);window.history.replaceState(null,"",url);
  },formatUsdAmount:(n)=>formatCurrency(convertFromUsd(n,currency,rates),currency),formatAudAmount:(n)=>formatCurrency(convertFromAud(n,currency,rates),currency)}),[currency,rates]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCurrency() { return useContext(Context); }
export function CurrencySelector(){
  const {currency,selectCurrency}=useCurrency();
  return <label className="currency-switch"><Globe2 size={17} aria-hidden="true"/><select aria-label="Currency" value={currency} onChange={event=>selectCurrency(event.target.value)}>{supportedCurrencies.map(code=><option key={code} value={code}>{code}</option>)}</select></label>;
}
