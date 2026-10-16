import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createClient} from "@sanity/client";
import {productGalleryMedia} from "../coffee/lib/product-media.js";
import {productCode} from "../coffee/lib/catalog.js";
import {getTumblerCustomizationPage} from "../coffee/lib/tumbler-customization-pages.js";
const plan=JSON.parse(readFileSync(new URL("./coffee-media-20261016.json",import.meta.url),"utf8"));
const client=createClient({projectId:"12npkiv4",dataset:"production",apiVersion:"2026-10-16",useCdn:false});
const origin=process.argv[2];
async function page(path){
  if(!origin)return readFileSync(new URL("../.next/server/app"+path+".html",import.meta.url),"utf8");
  const response=await fetch(origin+path,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,path);return response.text();
}
for(const item of plan.products){
  const product=await client.fetch('*[_type=="coffeeProduct" && slug==$slug][0]',{slug:item.slug});
  assert.equal(productCode(product.slug),item.model);assert.deepEqual(product.videoUrls,[item.video]);
  const media=productGalleryMedia(product.galleryImages,product.videoUrls,product.videoPosterUrl);
  assert.equal(media[1].provider,"sanity");assert.equal(media[1].url,item.video);
  const html=await page("/coffee-mug/"+item.slug);
  const labels=[...html.matchAll(/aria-label="(View product image \d+|Play product video)"/g)].map(m=>m[1]);
  assert.equal(labels[0],"View product image 1");assert.equal(labels[1],"Play product video");assert.equal(labels.length,media.length);
  assert.ok(html.includes(item.video));assert.ok(html.includes(product.videoPosterUrl));
  console.log(item.model+": specified CDN video second; "+product.galleryImages.length+" images; poster present");
}
const uv=plan.customization;const html=await page("/coffee-mug/customization/"+uv.slug);
const video=html.match(/<video\b[^>]*>/)?.[0];assert.ok(video,"UV native video missing");
assert.ok(video.includes(uv.video));assert.ok(video.includes(uv.poster));assert.ok(/\bcontrols(?:=|\s|>)/i.test(video));
assert.ok(/\bplaysinline(?:=|\s|>)/i.test(video));assert.ok(video.includes('preload="none"'));assert.ok(!/\bautoplay(?:=|\s|>)/i.test(video));
assert.ok(html.indexOf('id="production-video"')>html.indexOf("</h1>"));
const examples=html.indexOf("Production examples");
const followingContent=examples>=0?examples:html.indexOf(getTumblerCustomizationPage("uv-printing").sections[0].heading);
assert.ok(followingContent>html.indexOf('id="production-video"'));
assert.ok(video.includes("aspect-[9/16]"));
console.log("UV Printing: native 9:16 video after introduction and before examples; specified poster; controls, playsInline, preload=none, no autoplay.");
console.log("PASS: all three requested updates.");
