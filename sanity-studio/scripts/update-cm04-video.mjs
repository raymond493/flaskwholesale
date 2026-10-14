import { getCliClient } from "sanity/cli";
import { isDeepStrictEqual } from "node:util";

const client=getCliClient({apiVersion:"2026-10-14"});
const slug="280ml-380ml-double-wall-insulated-coffee-tumbler";
const id="coffee-"+slug;
const video="https://youtube.com/shorts/hf77NaqWZg8?feature=share";
const before=await client.getDocument(id);
if(before?._type!=="coffeeProduct" || before.slug!==slug || !before.name?.includes("280ml / 380ml")) throw new Error("CM-04 mapping does not match; no product changed.");
if(!isDeepStrictEqual(before.videoUrls,[video])) await client.patch(id).ifRevisionId(before._rev).set({videoUrls:[video]}).commit();
const after=await client.getDocument(id);
if(!isDeepStrictEqual(after.videoUrls,[video])) throw new Error("Video URL verification failed.");
for(const key of Object.keys(before).filter(key=>!["_rev","_updatedAt","videoUrls"].includes(key))) {
  if(!isDeepStrictEqual(before[key],after[key])) throw new Error("Unexpected change to "+key);
}
console.log(JSON.stringify({model:"CM-04",id,video,images:after.galleryImages.length,pricesUnchanged:true,otherFieldsUnchanged:true}));
