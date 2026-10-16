import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {isDeepStrictEqual} from "node:util";
import {createClient} from "@sanity/client";
import {getCliClient} from "sanity/cli";
import {productCode} from "../../coffee/lib/catalog.js";

const plan=JSON.parse(readFileSync(new URL("../../scripts/coffee-media-20261016.json",import.meta.url),"utf8"));
const source=createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-16",useCdn:false});
const target=getCliClient({apiVersion:"2026-10-16"});
const before=await target.fetch('*[_type=="coffeeProduct"]');
const settings=await target.getDocument("coffee-customization");
const originals=await source.fetch('*[_type=="product" && slug.current in $slugs]{"slug":slug.current,videoUrls,videoPosterUrl}',{slugs:plan.products.map(p=>p.slug)});
const uv=(await source.fetch('*[_type=="siteSettings" && defined(tumblerCustomizationOptions)][0].tumblerCustomizationOptions[slug=="uv-printing"]{slug,videoUrl,videoPosterUrl}'))[0];
assert.equal(uv?.videoUrl,plan.customization.video);assert.equal(uv.videoPosterUrl,plan.customization.poster);
await Promise.all([...plan.products,plan.customization].map(async item=>{
  const response=await fetch(item.video,{method:"HEAD",signal:AbortSignal.timeout(20000)});
  assert.ok(response.ok && response.headers.get("content-type")?.startsWith("video/"),"CDN video unavailable: "+item.slug);
}));
let transaction=target.transaction();let changes=0;const updates=new Map();
for(const item of plan.products){
  assert.equal(productCode(item.slug),item.model);
  const old=before.find(p=>p.slug===item.slug);const original=originals.find(p=>p.slug===item.slug);
  assert.ok(old && original,item.model+" missing source/target");
  assert.deepEqual(original.videoUrls,[item.video]);assert.ok(original.videoPosterUrl?.startsWith("https://cdn.sanity.io/images/"));
  const fields={videoUrls:[item.video],videoPosterUrl:original.videoPosterUrl};updates.set(old._id,fields);
  if(Object.entries(fields).some(([key,value])=>!isDeepStrictEqual(old[key],value))){transaction=transaction.patch(old._id,p=>p.ifRevisionId(old._rev).set(fields));changes++;}
}
assert.ok(settings?.options?.some(p=>p.slug==="uv-printing"),"Target UV option missing");
const options=settings.options.map(item=>item.slug==="uv-printing"?{...item,videoUrl:uv.videoUrl,videoPosterUrl:uv.videoPosterUrl}:item);
if(!isDeepStrictEqual(options,settings.options)){transaction=transaction.patch(settings._id,p=>p.ifRevisionId(settings._rev).set({options}));changes++;}
if(changes)await transaction.commit();
const after=await target.fetch('*[_type=="coffeeProduct"]');
assert.deepEqual(after.map(p=>p._id).sort(),before.map(p=>p._id).sort());
for(const old of before){
  const saved=after.find(p=>p._id===old._id);const fields=updates.get(old._id)||{};
  for(const key of Object.keys(old).filter(k=>!["_rev","_updatedAt",...Object.keys(fields)].includes(k)))assert.deepEqual(saved[key],old[key],old.slug+" unrelated field changed: "+key);
  for(const [key,value]of Object.entries(fields))assert.deepEqual(saved[key],value);
}
const savedSettings=await target.getDocument(settings._id);assert.deepEqual(savedSettings.options,options);
for(const key of Object.keys(settings).filter(k=>!["_rev","_updatedAt","options"].includes(k)))assert.deepEqual(savedSettings[key],settings[key]);
console.log(JSON.stringify({updatedDocuments:changes,products:["CM-13","CM-14"],uvVideoAdded:true,pricesImagesNumberingAndUnrelatedFieldsUnchanged:true}));
