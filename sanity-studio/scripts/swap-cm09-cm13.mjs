import assert from "node:assert/strict";
import {isDeepStrictEqual} from "node:util";
import {createClient} from "@sanity/client";
import {getCliClient} from "sanity/cli";
import {productCode} from "../../coffee/lib/catalog.js";
const slugs=["12oz-slim-insulated-coffee-tumbler-with-slide-lid","16oz-stainless-steel-tumbler-with-three-interchangeable-lids"];
const target=getCliClient({apiVersion:"2026-10-16"});
const source=createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-16",useCdn:false});
const before=await target.fetch('*[_type=="coffeeProduct"]');
const pair=slugs.map(slug=>before.find(p=>p.slug===slug));assert.ok(pair.every(Boolean));
assert.equal(productCode(pair[0].slug),"CM-13");assert.equal(productCode(pair[1].slug),"CM-09");
const rank=p=>p.collectionRanks.find(r=>r.slug==="insulated-tumblers").position;
const ranks=pair.map(rank);assert.ok(isDeepStrictEqual(ranks,[13,9])||isDeepStrictEqual(ranks,[9,13]),"Unexpected current ranking; stopped before writing");
const originals=await source.fetch('*[_type=="product" && slug.current in $slugs]{"slug":slug.current,order,collectionRanks}',{slugs});
const desiredRanks=[9,13];const changes=new Map();let tx=target.transaction();let count=0;
for(let index=0;index<pair.length;index++){
  const old=pair[index],original=originals.find(p=>p.slug===old.slug);
  assert.equal(rank(original),desiredRanks[index]);assert.ok(Number.isFinite(original.order));
  const fields={order:original.order,collectionRanks:old.collectionRanks.map(r=>r.slug==="insulated-tumblers"?{...r,position:desiredRanks[index]}:r)};
  changes.set(old._id,fields);
  if(Object.entries(fields).some(([key,value])=>!isDeepStrictEqual(old[key],value))){tx=tx.patch(old._id,p=>p.ifRevisionId(old._rev).set(fields));count++;}
}
if(count)await tx.commit();
const after=await target.fetch('*[_type=="coffeeProduct"]');assert.equal(after.length,before.length);
for(const old of before){const saved=after.find(p=>p._id===old._id),fields=changes.get(old._id)||{};assert.ok(saved);
  for(const key of Object.keys(old).filter(k=>!["_rev","_updatedAt",...Object.keys(fields)].includes(k)))assert.deepEqual(saved[key],old[key],old.slug+" unrelated field changed: "+key);
  for(const [key,value]of Object.entries(fields))assert.deepEqual(saved[key],value);
}
console.log(JSON.stringify({updated:count,ranking:slugs.map(slug=>{const p=after.find(p=>p.slug===slug);return{model:productCode(slug),order:p.order,rank:rank(p)};}),pricesImagesVideosAndNumberingUnchanged:true}));
