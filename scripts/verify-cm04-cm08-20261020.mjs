import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createClient} from "@sanity/client";
import {productGalleryMedia} from "../coffee/lib/product-media.js";
import {splitVariantLabel} from "../coffee/lib/variant-label.js";
import {buildRfqMessage} from "../coffee/lib/rfq-message.js";
const client=createClient({projectId:"12npkiv4",dataset:"production",apiVersion:"2026-10-20",useCdn:false,timeout:20000,maxRetries:0});
const plans=[
  {slug:"280ml-380ml-double-wall-insulated-coffee-tumbler",name:"8oz / 12oz / 16oz Double-Wall Insulated Coffee Tumbler",sizes:["8oz (280ml)","12oz (380ml)","16oz (480ml)"],prices:[2.75,2.85,3.29]},
  {slug:"second-generation-380ml-510ml-stainless-steel-coffee-tumbler",name:"Second-Generation 12oz / 16oz Stainless Steel Coffee Tumbler",sizes:["12oz (380ml)","16oz (510ml)"],prices:[2.48,2.69]}
];
for(const plan of plans){
  const p=await client.fetch('*[_type=="coffeeProduct" && slug==$slug][0]',{slug:plan.slug});
  assert.equal(p.name,plan.name);assert.deepEqual(p.variants.map(v=>v.size),plan.sizes);assert.deepEqual(p.variants.map(v=>v.priceUsd),plan.prices);
  const path="/coffee-mug/"+plan.slug;
  const html=process.argv[2]?await fetch(process.argv[2]+path+"?release=cm04-cm08-20261020",{signal:AbortSignal.timeout(20000)}).then(r=>{assert.equal(r.status,200);return r.text();}):readFileSync(new URL("../.next/server/app"+path+".html",import.meta.url),"utf8");
  for(const label of plan.sizes){const {primary,secondary}=splitVariantLabel(label);assert.ok(html.includes(primary+"<span"),"oz primary missing");assert.ok(html.includes('text-xs font-normal text-slate-500">'+secondary),"ml secondary missing");
    assert.ok(buildRfqMessage({productSlug:p.slug,selectedOption:label,quantity:100},[p]).text.includes("Option: "+label));
  }
  if(plan===plans[0]){assert.equal(p.galleryImages.length,21);assert.ok(!p.galleryImages.some(image=>image._key==="cm04-large-0"));assert.equal(p.galleryImages[0].imageUrl,p.imageUrl);assert.equal(p.videoPosterUrl,p.imageUrl);assert.ok(p.imageUrl.endsWith("3f9d49b4eb4ef850491f489e5c1c55a034a71b50-1254x1254.png"));assert.equal(p.fromPriceLabel,"US$2.75-3.29 / pc EXW");
    const media=productGalleryMedia(p.galleryImages,p.videoUrls,p.videoPosterUrl);assert.equal(media[1].type,"video");
    assert.equal((html.match(/aria-label="View product image \d+"/g)||[]).length,21);
    for(const image of p.galleryImages)assert.ok(html.includes(new URL(image.imageUrl).pathname),"Missing current gallery asset in page");
  }
  console.log("PASS "+plan.slug+": prices, sizes, secondary ml, full inquiry text"+(plan===plans[0]?", 21 cleaned images, original main/poster and video second":""));
}
