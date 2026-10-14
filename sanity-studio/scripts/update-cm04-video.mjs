import { getCliClient } from "sanity/cli";
import { isDeepStrictEqual } from "node:util";

const client=getCliClient({apiVersion:"2026-10-14"});
const slug="280ml-380ml-double-wall-insulated-coffee-tumbler";
const id="coffee-"+slug;
const video="https://cdn.sanity.io/files/rbq1eoim/ecopak-coffee-cups-production/c857fbfacb8fdbc51f0179267e813d8af5910273.mp4";
const poster="https://cdn.sanity.io/images/rbq1eoim/ecopak-coffee-cups-production/6b39ead13287c610e92b14a6b2ca8498358c39df-1254x1254.png";
const before=await client.getDocument(id);
if(before?._type!=="coffeeProduct" || before.slug!==slug || !before.name?.includes("280ml / 380ml")) throw new Error("CM-04 mapping does not match; no product changed.");
const asset=await fetch(video,{method:"HEAD"});
if(!asset.ok || !asset.headers.get("content-type")?.startsWith("video/")) throw new Error("Video CDN URL is not available.");
if(!isDeepStrictEqual(before.videoUrls,[video]) || before.videoPosterUrl!==poster) await client.patch(id).ifRevisionId(before._rev).set({videoUrls:[video],videoPosterUrl:poster}).commit();
const after=await client.getDocument(id);
if(!isDeepStrictEqual(after.videoUrls,[video]) || after.videoPosterUrl!==poster) throw new Error("Video URL verification failed.");
for(const key of Object.keys(before).filter(key=>!["_rev","_updatedAt","videoUrls","videoPosterUrl"].includes(key))) {
  if(!isDeepStrictEqual(before[key],after[key])) throw new Error("Unexpected change to "+key);
}
console.log(JSON.stringify({model:"CM-04",id,video,poster,images:after.galleryImages.length,pricesUnchanged:true,otherFieldsUnchanged:true}));
