import { getCliClient } from "sanity/cli";
const client=getCliClient({apiVersion:"2026-10-13"});
const slug="10oz-compact-insulated-coffee-tumbler-with-slide-lid";
const product=await client.fetch('*[_type == "coffeeProduct" && slug == $slug][0]{_id,name}',{slug});
if(!product) throw new Error("CM-10 not found; no product changed.");
await client.patch(product._id).set({isActive:false}).commit();
const result=await client.getDocument(product._id);
if(result.isActive !== false) throw new Error("Offline state was not saved.");
console.log("CM-10 is offline. Product document and all images are preserved.");
