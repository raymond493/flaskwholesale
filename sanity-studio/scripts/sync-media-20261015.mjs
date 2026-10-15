import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import assert from "node:assert/strict";
import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";
import { productCode } from "../../coffee/lib/catalog.js";

const plan=JSON.parse(readFileSync(new URL("../../scripts/coffee-media-20261015.json",import.meta.url),"utf8"));
const client=getCliClient({apiVersion:"2026-10-15"});
const source=createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-15",useCdn:false});
const before=await client.fetch('*[_type == "coffeeProduct"]');
const originals=await source.fetch('*[_type == "product" && slug.current in $slugs]{"slug":slug.current,videoUrls,videoPosterUrl,"galleryImages":galleryImages[]{alt,"imageUrl":image.asset->url}}',{slugs:plan.map(p=>p.slug)});
const updates=new Map();
for(const item of plan) {
  assert.equal(productCode(item.slug),item.model,"Model mapping mismatch");
  const old=before.find(p=>p.slug===item.slug);
  const original=originals.find(p=>p.slug===item.slug);
  assert.ok(old && original,item.model+" source or target missing");
  assert.ok(original.videoUrls?.includes(item.video),item.model+" source video differs from approved URL");
  assert.ok(original.videoPosterUrl?.startsWith("https://cdn.sanity.io/images/"),item.model+" missing source poster");
  const response=await fetch(item.video,{method:"HEAD"});
  assert.ok(response.ok && response.headers.get("content-type")?.startsWith("video/"),item.model+" CDN video unavailable");
  const fields={videoUrls:[item.video],videoPosterUrl:original.videoPosterUrl};
  if(item.newImages) {
    const added=item.newImages.map((imageUrl,index)=>{
      const image=original.galleryImages?.find(i=>i.imageUrl===imageUrl);
      assert.ok(image,item.model+" new image absent from source");
      return {...image,_key:`${item.model.toLowerCase()}-new-${index}`};
    });
    const gallery=[...(old.galleryImages || [])];
    if(!gallery.some(i=>i.imageUrl===old.imageUrl)) gallery.unshift({_key:"original-main",imageUrl:old.imageUrl,alt:old.name});
    if(item.model==="CM-07") {
      fields.imageUrl=item.newImages[0];
      fields.galleryImages=[...added,...gallery.filter(i=>!item.newImages.includes(i.imageUrl))];
    } else {
      const main=gallery.find(i=>i.imageUrl===old.imageUrl);
      fields.galleryImages=[main,...added,...gallery.filter(i=>i.imageUrl!==old.imageUrl&&!item.newImages.includes(i.imageUrl))];
    }
    const excluded=new Set(item.newImages);
    assert.deepEqual(fields.galleryImages.filter(i=>!excluded.has(i.imageUrl)),gallery.filter(i=>!excluded.has(i.imageUrl)),item.model+" original image order changed");
  }
  updates.set(old._id,fields);
}
const cm10=before.find(p=>p.slug==="10oz-compact-insulated-coffee-tumbler-with-slide-lid");
assert.ok(cm10,"CM-10 document must be retained");
updates.set(cm10._id,{isActive:false});
let transaction=client.transaction();let changed=0;
for(const [id,fields] of updates) {
  const old=before.find(p=>p._id===id);
  if(Object.entries(fields).some(([key,value])=>!isDeepStrictEqual(old[key],value))) {
    transaction=transaction.patch(id,patch=>patch.ifRevisionId(old._rev).set(fields));changed++;
  }
}
if(changed) await transaction.commit();
const after=await client.fetch('*[_type == "coffeeProduct"]');
assert.deepEqual(after.map(p=>p._id).sort(),before.map(p=>p._id).sort(),"Product documents added/deleted unexpectedly");
for(const old of before) {
  const saved=after.find(p=>p._id===old._id);
  const fields=updates.get(old._id)||{};
  for(const key of Object.keys(old).filter(key=>!["_rev","_updatedAt",...Object.keys(fields)].includes(key))) assert.deepEqual(saved[key],old[key],old.slug+" unrelated field changed: "+key);
  for(const [key,value] of Object.entries(fields)) assert.deepEqual(saved[key],value,old.slug+" updated field mismatch: "+key);
}
console.log(JSON.stringify({updatedDocuments:changed,videoProducts:plan.map(p=>p.model),cm10RetainedOffline:true,pricesAndOtherFieldsUnchanged:true,originalImagesPreserved:true}));
