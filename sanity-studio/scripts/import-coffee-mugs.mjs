import { getCliClient } from "sanity/cli";
import { createClient } from "@sanity/client";
const source = createClient({projectId:"rbq1eoim",dataset:"ecopak-coffee-cups-production",apiVersion:"2026-10-13",useCdn:false});
const target = getCliClient({apiVersion:"2026-10-13"});
function addKeys(value) {
  if (Array.isArray(value)) return value.map((item,index)=>item && typeof item === "object" ? {...addKeys(item),_key:item._key || `item-${index}`} : item);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,addKeys(item)]));
  return value;
}
const products = await source.fetch(`*[_type == "product" && "insulated-tumblers" in collectionSlugs && defined(slug.current)] | order(order asc, name asc) {
 "slug":slug.current,name,eyebrow,description,shortDescription,specificationsText,faqText,detailText,
 "imageUrl":coalesce(mainImage.asset->url,imageUrl),"galleryImages":galleryImages[]{alt,"imageUrl":image.asset->url},
 videoUrls,tags,collectionSlugs,collectionRanks,moq,leadTime,fromPriceAud,fromPriceLabel,colors,variants,sample,features
}`);
if (!products.length) throw new Error("Source collection is empty; import stopped.");
for (const product of products) {
  if (!product.imageUrl || !product.name) throw new Error("Incomplete source product: " + product.slug);
  const id = "coffee-" + product.slug;
  const existing = await target.fetch('*[_id == $id][0]', {id});
  if (!existing) await target.create(addKeys({...product,_id:id,_type:"coffeeProduct",sourceProject:"rbq1eoim"}));
  else {
    const keyed=addKeys(existing);
    const fields=Object.fromEntries(["galleryImages","variants","collectionRanks"].filter(key=>JSON.stringify(keyed[key])!==JSON.stringify(existing[key])).map(key=>[key,keyed[key]]));
    if(Object.keys(fields).length) await target.patch(id).set(fields).commit();
  }
  console.log(product.slug + " · " + (product.galleryImages?.length || 1) + " images · " + (product.videoUrls?.length || 0) + " videos" + (existing ? " (already imported)" : ""));
}
const settings = await source.fetch(`*[_type == "siteSettings" && defined(tumblerCustomizationOptions)][0]{"heading":coalesce(tumblerCustomizationHeading,"Customization Options"),"intro":tumblerCustomizationIntro,"options":tumblerCustomizationOptions[]{title,slug,description,"imageUrl":image.asset->url,"galleryImages":galleryImages[]{alt,"imageUrl":image.asset->url},alt}}`);
if (!settings?.options?.length) throw new Error("Source customization is missing.");
await target.createIfNotExists(addKeys({...settings,_id:"coffee-customization",_type:"coffeeCustomization"}));
const existingSettings=await target.getDocument("coffee-customization");
if(JSON.stringify(addKeys(existingSettings.options))!==JSON.stringify(existingSettings.options)) await target.patch("coffee-customization").set({options:addKeys(existingSettings.options)}).commit();
console.log("Imported " + products.length + " products; image URLs remain on the original Sanity CDN.");
