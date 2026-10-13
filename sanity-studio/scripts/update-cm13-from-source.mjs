import { getCliClient } from "sanity/cli";
import { createClient } from "@sanity/client";
import { isDeepStrictEqual } from "node:util";

const slug = "12oz-slim-insulated-coffee-tumbler-with-slide-lid";
const source = createClient({ projectId:"rbq1eoim", dataset:"ecopak-coffee-cups-production", apiVersion:"2026-10-13", useCdn:false });
const target = getCliClient({ apiVersion:"2026-10-13" });
const product = await source.fetch(`*[_type == "product" && slug.current == $slug][0]{
  "sourceUpdatedAt":_updatedAt,name,eyebrow,description,shortDescription,specificationsText,faqText,detailText,
  "imageUrl":coalesce(mainImage.asset->url,imageUrl),"galleryImages":galleryImages[]{alt,"imageUrl":image.asset->url},
  videoUrls,tags,collectionSlugs,collectionRanks,moq,leadTime,fromPriceAud,fromPriceLabel,colors,variants,sample,features
}`, {slug});
const existing = await target.fetch('*[_type == "coffeeProduct" && slug == $slug][0]{_id}', {slug});
if(!product?.imageUrl || !product.variants?.length || !existing?._id) throw new Error("CM-13 source or target is incomplete; update stopped.");
function normalize(value) {
  if(typeof value === "string") return value.replace(/\bEcopak\b/g,"FlaskWholesale");
  if(Array.isArray(value)) return value.map((item,index)=>item && typeof item === "object" ? {...normalize(item),_key:item._key || `cm13-${index}`} : normalize(item));
  if(value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,normalize(item)]));
  return value;
}
const update = normalize(product);
const current = await target.getDocument(existing._id);
if(Object.entries(update).some(([field,value])=>!isDeepStrictEqual(current[field],value))) await target.patch(existing._id).set(update).commit();
const saved = await target.getDocument(existing._id);
for(const [field,value] of Object.entries(update)) if(!isDeepStrictEqual(saved[field],value)) throw new Error("Verification failed: " + field);
console.log(JSON.stringify({product:saved.name,images:saved.galleryImages.length,colors:saved.colors.length,variants:saved.variants.map(v=>({size:v.size,priceUsd:v.priceUsd})),sourceUpdatedAt:saved.sourceUpdatedAt,verified:true}));
