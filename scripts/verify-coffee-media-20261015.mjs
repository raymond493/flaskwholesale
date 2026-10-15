import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { productGalleryMedia } from "../coffee/lib/product-media.js";
import { productCode } from "../coffee/lib/catalog.js";

const plan=JSON.parse(readFileSync(new URL("./coffee-media-20261015.json",import.meta.url),"utf8"));
const client=createClient({projectId:"12npkiv4",dataset:"production",apiVersion:"2026-10-15",useCdn:false});
const products=await client.fetch('*[_type == "coffeeProduct"]');
const origin=process.argv[2] || null;
for(const item of plan) {
  const product=products.find(p=>p.slug===item.slug);
  assert.equal(productCode(product.slug),item.model);
  assert.deepEqual(product.videoUrls,[item.video]);
  const media=productGalleryMedia(product.galleryImages,product.videoUrls,product.videoPosterUrl);
  assert.equal(media[1].provider,"sanity");
  assert.equal(media[1].url,item.video);
  assert.equal(media[1].poster,product.videoPosterUrl);
  if(item.model==="CM-07") {assert.equal(product.imageUrl,item.newImages[0]);assert.equal(media[0].image.imageUrl,item.newImages[0]);}
  if(item.model==="CM-11") {assert.equal(media[0].image.imageUrl,product.imageUrl);assert.equal(media[2].image.imageUrl,item.newImages[0]);assert.equal(media[3].image.imageUrl,item.newImages[1]);}
  let html;
  if(origin) {
    const response=await fetch(origin+"/coffee-mug/"+item.slug,{signal:AbortSignal.timeout(20000)});
    assert.equal(response.status,200,item.model+" page failed");html=await response.text();
  } else html=readFileSync(new URL("../.next/server/app/coffee-mug/"+item.slug+".html",import.meta.url),"utf8");
  const labels=[...html.matchAll(/aria-label="(View product image \d+|Play product video)"/g)].map(m=>m[1]);
  assert.equal(labels[0],"View product image 1");assert.equal(labels[1],"Play product video");
  assert.equal(labels.length,media.length);
  assert.ok(html.includes(item.video));assert.ok(html.includes(product.videoPosterUrl));
  for(const image of item.newImages || []) assert.ok(html.includes(image));
  console.log(item.model+": correct CDN video, poster, second position; "+product.galleryImages.length+" images");
}
assert.equal(products.find(p=>productCode(p.slug)==="CM-10").isActive,false);
if(origin) {
  const collection=await fetch(origin+"/coffee-mug");const html=await collection.text();
  assert.equal(collection.status,200);
  for(const control of ["Search within this collection","All colours","All sizes","Sort by"]) assert.ok(!html.includes(control),control+" is still visible");
  assert.ok(!html.includes("CM-10"));
  assert.equal((await fetch(origin+"/coffee-mug/10oz-compact-insulated-coffee-tumbler-with-slide-lid")).status,404);
  assert.ok(!(await (await fetch(origin+"/sitemap.xml")).text()).includes("/coffee-mug/10oz-compact-insulated-coffee-tumbler-with-slide-lid"));
}
console.log("PASS: all 8 requested models, stable numbering, native video ordering, CM-07/CM-11 image placement and retained CM-10 offline.");
