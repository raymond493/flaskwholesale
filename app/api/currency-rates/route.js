import {fallbackCurrencyRates} from "@/coffee/lib/currency";
export const revalidate=43200;
export async function GET(){
  let rates=fallbackCurrencyRates;
  try{
    const response=await fetch("https://api.frankfurter.dev/v2/rates?base=AUD&quotes=USD,EUR,GBP,CAD",{next:{revalidate:43200},signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw Error();
    const data=await response.json();const next={AUD:1};
    for(const quote of ["USD","EUR","GBP","CAD"]){const rate=data.find(v=>v.base==="AUD"&&v.quote===quote)?.rate;if(!Number.isFinite(rate)||rate<=0)throw Error();next[quote]=rate;}
    rates=next;
  }catch{}
  return Response.json({rates},{headers:{"Cache-Control":"public, s-maxage=43200, stale-while-revalidate=3600"}});
}
