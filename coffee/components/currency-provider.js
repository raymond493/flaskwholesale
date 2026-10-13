"use client";
import { createContext, useContext, useMemo } from "react";
import { convertFromAud, fallbackCurrencyRates } from "../lib/currency";
import { formatCurrency } from "../lib/money";
const Context = createContext(null);
export function CurrencyProvider({children}) {
  const value = useMemo(()=>({currency:"USD",rates:fallbackCurrencyRates,formatUsdAmount:(n)=>formatCurrency(n,"USD"),formatAudAmount:(n)=>formatCurrency(convertFromAud(n,"USD",fallbackCurrencyRates),"USD")}),[]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCurrency() { return useContext(Context); }
