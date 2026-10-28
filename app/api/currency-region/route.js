import {currencyForCountry} from "@/coffee/lib/currency";
export const dynamic="force-dynamic";
export async function GET(request){
  return Response.json({suggestedCurrency:currencyForCountry(request.headers.get("x-vercel-ip-country")||"")},{headers:{"Cache-Control":"private, no-store, max-age=0","Vary":"X-Vercel-IP-Country"}});
}
