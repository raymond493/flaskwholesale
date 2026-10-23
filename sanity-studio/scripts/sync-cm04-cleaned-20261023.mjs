import assert from "node:assert/strict";
import {createClient} from "@sanity/client";
import {getCliClient} from "sanity/cli";
const slug="280ml-380ml-double-wall-insulated-coffee-tumbler";
const source=createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-23",useCdn:false,timeout:20000,maxRetries:0});
const target=getCliClient({apiVersion:"2026-10-23"});
const before=await target.fetch('*[_type=="coffeeProduct"]');const old=before.find(p=>p.slug===slug);assert.ok(old);
const original=await source.fetch('*[_id=="product-"+$slug][0]{"galleryImages":galleryImages[]{_key,alt,"imageUrl":image.asset->url}}',{slug});
const gallery=original.galleryImages;assert.equal(gallery.length,21);assert.equal(gallery[0].imageUrl,old.imageUrl);assert.ok(!gallery.some(p=>p._key==="cm04-large-0"));
assert.deepEqual(gallery.map(p=>p._key),old.galleryImages.filter(p=>p._key!=="cm04-large-0").map(p=>p._key));
for(const image of gallery){const previous=old.galleryImages.find(p=>p._key===image._key);assert.ok(previous);const replaced=/^cm04-large-(?:[3-9]|10|11)$/.test(image._key);if(replaced){assert.notEqual(image.imageUrl,previous.imageUrl);assert.ok(image.imageUrl.startsWith("https://cdn.sanity.io/images/rbq1eoim/ecopak-coffee-cups-production/"));}else assert.deepEqual(image,previous);}
await target.patch(old._id).ifRevisionId(old._rev).set({galleryImages:gallery}).commit();
const after=await target.fetch('*[_type=="coffeeProduct"]');assert.equal(after.length,before.length);
for(const previous of before){const saved=after.find(p=>p._id===previous._id);assert.ok(saved);for(const key of Object.keys(previous).filter(k=>!["_rev","_updatedAt",...(previous._id===old._id?["galleryImages"]:[])].includes(k)))assert.deepEqual(saved[key],previous[key],previous.slug+": unrelated field "+key);}
assert.deepEqual(after.find(p=>p._id===old._id).galleryImages,gallery);
console.log("PASS: CM04 gallery only; 21 images, overview removed, nine cleaned replacements in unchanged order; main/video/poster/prices/specs/other products unchanged. No assets deleted.");
