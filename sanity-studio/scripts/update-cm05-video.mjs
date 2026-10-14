import { getCliClient } from "sanity/cli";
import { isDeepStrictEqual } from "node:util";

const client=getCliClient({apiVersion:"2026-10-14"});
const slug="12oz-20oz-leakproof-stainless-steel-coffee-tumbler";
const id="coffee-"+slug;
const video="https://www.youtube.com/shorts/taOKhD7yezM";
const before=await client.getDocument(id);
if(before?._type!=="coffeeProduct" || before.slug!==slug || !before.name?.includes("12oz / 20oz Leakproof")) throw new Error("CM-05 mapping does not match; no product changed.");
if(!isDeepStrictEqual(before.videoUrls,[video])) await client.patch(id).ifRevisionId(before._rev).set({videoUrls:[video]}).commit();
const after=await client.getDocument(id);
if(!isDeepStrictEqual(after.videoUrls,[video])) throw new Error("Video URL verification failed.");
for(const key of Object.keys(before).filter(key=>!["_rev","_updatedAt","videoUrls"].includes(key))) {
  if(!isDeepStrictEqual(before[key],after[key])) throw new Error("Unexpected change to "+key);
}
console.log(JSON.stringify({model:"CM-05",id,video,images:after.galleryImages.length,pricesUnchanged:true,otherFieldsUnchanged:true}));
