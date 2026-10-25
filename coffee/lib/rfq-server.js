import {createHash} from "node:crypto";
import {buildRfqMessage,resolveRfqProduct} from "./rfq-message.js";
const email=/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
export const maxRfqBytes=4_000_000;
export function mailConfigured(env){return Boolean(env.RESEND_API_KEY&&env.RFQ_FROM_EMAIL&&email.test(env.RFQ_NOTIFY_EMAIL||""));}
export function prepareRfq(raw,catalog){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Invalid form.");
  const input={};
  for(const field of ["name","email","company","country","state","postcode","message","productName","productSlug","selectedOption","unitPrice","displayCurrency","pageUrl"]){
    if(raw[field]!=null&&typeof raw[field]!=="string")throw Error("Invalid "+field+".");
    input[field]=(raw[field]||"").trim();
    if(input[field].length>(field==="message"?8000:field==="pageUrl"?2000:500))throw Error("Field too long: "+field);
  }
  if(!input.name||!email.test(input.email)||!input.country)throw Error("Enter your name, valid email and country.");
  if(raw.website)throw Error("Unable to submit this form.");
  input.quantity=String(raw.quantity??"");
  const quantity=n=>Number.isSafeInteger(Number(n))&&Number(n)>0&&Number(n)<=100000000;
  if(!quantity(input.quantity))throw Error("Enter a whole-number quantity above 0.");
  if(raw.inquiryItems!=null&&!Array.isArray(raw.inquiryItems))throw Error("Invalid inquiry list.");
  if(raw.inquiryItems?.length){
    if(raw.inquiryItems.length>40)throw Error("Maximum 40 inquiry lines.");
    input.inquiryItems=raw.inquiryItems.map(item=>{
      if(!item||typeof item!=="object"||!quantity(item.quantity))throw Error("Invalid inquiry quantity.");
      const resolved=resolveRfqProduct(item,catalog);if(!resolved.found)throw Error("A product is no longer available. Refresh your inquiry list.");
      const option=typeof item.selectedOption==="string"?item.selectedOption:"";
      if(option.length>500)throw Error("Option too long.");
      return {...resolved,quantity:Number(item.quantity),selectedOption:option,unitPriceLabel:"Confirmed in quotation"};
    });
    input.quantity=String(input.inquiryItems.reduce((n,item)=>n+item.quantity,0));
    input.productName=input.inquiryItems.map(item=>item.productName).join(", ");
  }else if(raw.generalInquiry===true){
    input.productName="General drinkware inquiry";input.productSlug="";
    if(!input.message)throw Error("Tell us your product requirements.");
  }else{
    const resolved=resolveRfqProduct(input,catalog);if(!resolved.found)throw Error("Choose an available product.");
    Object.assign(input,resolved);
  }
  // Never present client-supplied prices as a verified quotation.
  input.unitPrice="Confirmed in quotation";
  let attachment;
  if(raw.artwork){
    const a=raw.artwork;
    if(typeof a.name!=="string"||typeof a.content!=="string"||!a.content||!/^[-\w .()]+\.(ai|eps|pdf|svg|png|jpe?g)$/i.test(a.name)||a.name.length>120)throw Error("Unsupported artwork filename.");
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(a.content)||a.content.length%4!==0)throw Error("Invalid artwork encoding.");
    const bytes=Buffer.from(a.content,"base64");if(bytes.length>2*1024*1024)throw Error("Artwork must be 2 MB or smaller.");
    attachment={filename:a.name,content:a.content};input.artwork={name:a.name};
  }
  return {input,attachment};
}
export function createRfqHandler({env,loadCatalog,send=fetch}){
 const recent=new Map();
 return async function POST(request){
  const json=(body,status)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return json({ok:false,error:"Invalid request origin."},403);
  // Best-effort warm-instance abuse throttle, not a distributed security boundary.
  const address=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if(address){const now=Date.now();for(const [key,value]of recent)if(value.until<now)recent.delete(key);
    const key=createHash("sha256").update(address).digest("hex"),entry=recent.get(key)||{count:0,until:now+60000};
    if(entry.count>=10||recent.size>=5000)return json({ok:false,error:"Too many requests. Please wait a minute."},429);
    entry.count++;recent.set(key,entry);
  }
  if(!request.headers.get("content-type")?.startsWith("application/json"))return json({ok:false,error:"JSON required."},415);
  if(Number(request.headers.get("content-length"))>maxRfqBytes)return json({ok:false,error:"Form is too large."},413);
  let raw;
  try{
    const reader=request.body?.getReader();if(!reader)throw Error();let size=0;const chunks=[];
    while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxRfqBytes){await reader.cancel();return json({ok:false,error:"Form is too large."},413);}chunks.push(Buffer.from(value));}
    raw=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }catch{return json({ok:false,error:"Invalid form data."},400);}
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw?.submissionId||""))return json({ok:false,error:"Refresh the form before submitting."},400);
  let prepared,available;
  try{available=await loadCatalog();}catch{return json({ok:false,error:"Product information is temporarily unavailable. Please try later."},503);}
  try{prepared=prepareRfq(raw,available);}catch(error){return json({ok:false,error:error.message||"Invalid inquiry."},400);}
  if(!mailConfigured(env))return json({ok:false,error:"Email inquiry is not configured yet. Please contact us on WhatsApp."},503);
  const reference="FW-"+raw.submissionId.toUpperCase();
  // The validated canonical products are retained for stable model lookup.
  const catalog=[...new Map((prepared.input.inquiryItems||[prepared.input]).map(p=>[p.productSlug||p.productName,p])).values()];
  const formatted=buildRfqMessage(prepared.input,catalog.map(p=>({slug:p.productSlug,name:p.productName})),{reference});
  const text=formatted.text.replace("(attach separately)","(attached)")+"\n\nDisplay currency: "+(prepared.input.displayCurrency||"USD")+"\nPrices are indicative; final quotation required.\nSource: "+(prepared.input.pageUrl||"https://www.flaskwholesale.com");
  const payload={from:env.RFQ_FROM_EMAIL,to:[env.RFQ_NOTIFY_EMAIL],reply_to:prepared.input.email,subject:"["+reference+"] "+formatted.subject,text,html:'<div style="font-family:Arial,sans-serif"><img src="https://www.flaskwholesale.com/brand/flaskwholesale-logo-v1.webp" alt="FlaskWholesale" width="230"><div><br></div>'+formatted.html+'<div><br></div><div>Prices are indicative; final quotation required.</div></div>',...(prepared.attachment?{attachments:[prepared.attachment]}:{})};
  // Provider-level idempotency survives Vercel cold starts; never auto-retry a send.
  payload.html=payload.html.replace("(attach separately)","(attached)");
  const hash=createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  try{
    const response=await send("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json","Idempotency-Key":"flask-rfq-"+raw.submissionId+"-"+hash},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
    if(!response.ok)return json({ok:false,error:"Email could not be confirmed. Your details are preserved. Please contact us on WhatsApp if needed."},502);
    const result=await response.json();if(!result.id)throw Error();
    return json({ok:true,reference,modelSummary:formatted.modelSummary},200);
  }catch{return json({ok:false,error:"Delivery is unconfirmed. Please do not submit again immediately; contact us on WhatsApp with reference "+reference+"."},502);}
 };
}
