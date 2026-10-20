import assert from "node:assert/strict";
import {createClient} from "@sanity/client";
import {getCliClient} from "sanity/cli";
const slug="12oz-stainless-steel-insulated-milk-mug-with-inner-scale";
const keys=["description","shortDescription","detailText","specificationsText","variants"];
const source=createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-20",useCdn:false,timeout:20000,maxRetries:0});
const target=getCliClient({apiVersion:"2026-10-20"});
const before=await target.fetch('*[_type=="coffeeProduct"]');const old=before.find(p=>p.slug===slug);assert.ok(old);
const original=await source.fetch('*[_id=="product-"+$slug][0]',{slug});assert.ok(original);
assert.deepEqual(original.variants.map(v=>[v.name,v.size,v.priceUsd]),[["12oz (360ml)","12oz (360ml)",2.58],["16oz (500ml)","16oz (500ml)",3.52]]);
for(const key of keys.filter(k=>k!=="variants")){assert.equal(typeof original[key],"string");assert.ok(original[key].includes("12oz (360ml)")&&original[key].includes("16oz (500ml)"),key+": missing two-size wording");}
console.log(JSON.stringify(Object.fromEntries(keys.map(k=>[k,original[k]])),null,2));
for(const heading of ["Weight (12oz)","Dimensions (12oz)","Carton (12oz)"])assert.ok(original.specificationsText.includes(heading),"Unscoped legacy measurement: "+heading);
if(process.argv.includes("--apply")){
 const fields=Object.fromEntries(keys.map(k=>[k,typeof original[k]==="string"?original[k].replace(/\bEcopak\b/g,"FlaskWholesale"):original[k]]));await target.patch(old._id).ifRevisionId(old._rev).set(fields).commit();
 const after=await target.fetch('*[_type=="coffeeProduct"]');assert.equal(after.length,before.length);
 for(const previous of before){const saved=after.find(p=>p._id===previous._id);assert.ok(saved);
  for(const key of Object.keys(previous).filter(k=>!["_rev","_updatedAt",...(previous._id===old._id?keys:[])].includes(k)))assert.deepEqual(saved[key],previous[key],previous.slug+": unrelated field "+key);
  if(previous._id===old._id)for(const key of keys)assert.deepEqual(saved[key],fields[key]);
 }
 console.log("PASS applied: only CM01 copy and variants changed; price, images, main image, videos and all other products preserved.");
}else console.log("READ ONLY: inspect measurements before applying.");
