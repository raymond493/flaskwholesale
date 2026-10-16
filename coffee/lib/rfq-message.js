import {productCode} from "./catalog.js";

// Shared by the current form and a future mail server; no sending occurs here.
export function resolveRfqProduct(input,catalog){
  const slug=typeof input.productSlug==="string"?input.productSlug.trim():"";
  const name=typeof input.productName==="string"?input.productName.trim():"";
  const matches=slug?catalog.filter(p=>p.slug===slug):catalog.filter(p=>p.name===name);
  if(matches.length!==1)return {found:false,productSlug:"",productName:name,model:""};
  const product=matches[0];
  return {found:true,productSlug:product.slug,productName:product.name,model:productCode(product.slug)||""};
}

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
export function buildRfqMessage(input,catalog,{reference}={}){
  const selections=input.inquiryItems?.length?input.inquiryItems:[input];
  const items=selections.map(item=>({...item,...resolveRfqProduct(item,catalog)}));
  const models=[...new Set(items.map(item=>item.model).filter(Boolean))];
  const modelSummary=models.join(", ")||"Not specified";
  const subject="FlaskWholesale RFQ"+(models.length?" — "+models.join(", "):"");
  const safeReference=String(reference||"Draft").replace(/[\r\n]/g," ");
  const summary=`Reference: ${safeReference}\nModel / SKU: ${modelSummary}`;
  const contact=["name","email","company","country","state","postcode"].filter(key=>input[key]).map(key=>`${key[0].toUpperCase()+key.slice(1)}: ${input[key]}`).join("\n");
  const details=items.map(item=>[
    `Product: ${[item.model,item.productName].filter(Boolean).join(" ")}`,
    `Product slug: ${item.productSlug||"Not specified"}`,
    item.selectedOption?`Option: ${item.selectedOption}`:"",
    `Quantity: ${item.quantity||input.quantity||"Not specified"}`,
    item.unitPriceLabel||input.unitPrice?`Unit price: ${item.unitPriceLabel||input.unitPrice}`:""
  ].filter(Boolean).join("\n")).join("\n\n");
  const text=[subject,summary,contact,details,input.message?`Message: ${input.message}`:"",input.artwork?`Artwork: ${input.artwork.name} (attach separately)` : ""].filter(Boolean).join("\n\n");
  const html=text.split("\n\n").map(group=>`<div>${escapeHtml(group).replace(/\n/g,"<br>")}</div>`).join("<div><br></div>");
  return {subject,text,html,reference:safeReference,modelSummary,items,productSlug:items.length===1?items[0].productSlug:""};
}
