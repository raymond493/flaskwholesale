// Dry-run by default. Apply only as part of an explicitly approved publication.
import assert from "node:assert/strict";
import {isDeepStrictEqual} from "node:util";
import {createClient} from "@sanity/client";
import {getCliClient} from "sanity/cli";
const source=createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-20",useCdn:false,timeout:20000,maxRetries:0});
const target=process.argv.includes("--apply")?getCliClient({apiVersion:"2026-10-20"}):createClient({projectId:"12npkiv4",dataset:"production",apiVersion:"2026-10-20",useCdn:false,timeout:20000,maxRetries:0});
const slugs=["280ml-380ml-double-wall-insulated-coffee-tumbler","second-generation-380ml-510ml-stainless-steel-coffee-tumbler"];
const before=await target.fetch('*[_type=="coffeeProduct"]');
const originals=await source.fetch('*[_type=="product" && slug.current in $slugs]{"slug":slug.current,"galleryImages":galleryImages[]{_key,alt,"imageUrl":image.asset->url}}',{slugs});
let tx=target.transaction();const updates=new Map();
for(const [index,slug] of slugs.entries()){
  const old=before.find(p=>p.slug===slug);assert.ok(old,"Target missing");
  const specs=index===0?[[8,280,2.75],[12,380,2.85],[16,480,3.29]]:[[12,380,2.48],[16,510,2.69]];
  const variants=specs.map(([oz,ml,priceUsd])=>{
    const prior=old.variants.find(v=>`${v.size} ${v.name}`.includes(`${ml}ml`));
    assert.ok(prior || (index===0&&ml===480),"Existing variant missing");
    const base=prior||old.variants[1];assert.ok(base);
    if(index===1)assert.equal(prior.priceUsd,priceUsd,"CM08 price drift; stop");
    return {...base,_key:prior?._key||"cm04-480ml",name:`${oz}oz (${ml}ml)`,size:`${oz}oz (${ml}ml)`,priceUsd};
  });
  const fields={variants,name:index===0?"8oz / 12oz / 16oz Double-Wall Insulated Coffee Tumbler":"Second-Generation 12oz / 16oz Stainless Steel Coffee Tumbler"};
  if(index===0){
    const gallery=originals.find(p=>p.slug===slug)?.galleryImages;assert.ok(gallery?.length>=13);
    assert.equal(gallery[0].imageUrl,old.imageUrl,"Source main image differs; stop");
    assert.ok(gallery.every(p=>p.imageUrl?.startsWith("https://cdn.sanity.io/images/")));
    for(const item of old.galleryImages||[])assert.ok(gallery.some(p=>p.imageUrl===item.imageUrl),"Old gallery image missing");
    const added=gallery.filter(p=>!(old.galleryImages||[]).some(oldImage=>oldImage.imageUrl===p.imageUrl));
    assert.equal(added.length,12,"Expected exactly 12 added CM04 images");
    fields.galleryImages=gallery;fields.fromPriceLabel="US$2.75-3.29 / pc EXW";
  }
  updates.set(old._id,fields);tx=tx.patch(old._id,p=>p.ifRevisionId(old._rev).set(fields));
  console.log(JSON.stringify({slug,variants:variants.map(v=>({size:v.size,priceUsd:v.priceUsd})),galleryCount:fields.galleryImages?.length,mode:process.argv.includes("--apply")?"apply":"dry-run"}));
}
if(process.argv.includes("--apply")){
  await tx.commit();const after=await target.fetch('*[_type=="coffeeProduct"]');assert.equal(after.length,before.length);
  for(const old of before){const saved=after.find(p=>p._id===old._id),fields=updates.get(old._id)||{};assert.ok(saved);
    for(const key of Object.keys(old).filter(k=>!["_rev","_updatedAt",...Object.keys(fields)].includes(k)))assert.ok(isDeepStrictEqual(saved[key],old[key]),"Unrelated field changed: "+key);
    for(const [key,value]of Object.entries(fields))assert.deepEqual(saved[key],value);
  }
  console.log("Applied and verified; unrelated fields, original main images and videos preserved.");
}else console.log("Validated only: no Sanity writes and no publication.");
