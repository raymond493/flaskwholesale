import { getCliClient } from "sanity/cli";
const client=getCliClient({apiVersion:"2026-10-13"});
const product=await client.fetch('*[_type == "coffeeProduct" && isActive != false && slug == "280ml-380ml-double-wall-insulated-coffee-tumbler"][0]{name,imageUrl}');
if(!product?.imageUrl) throw new Error("Coffee Mug category image is missing.");
await client.createIfNotExists({_id:"category-coffee-mug",_type:"category",title:"Coffee Mug",slug:{_type:"slug",current:"coffee-mug"},kind:"core",description:"Custom coffee mugs and insulated tumblers",href:"/coffee-mug",order:0,imageUrl:product.imageUrl,imageAlt:product.name,imageFit:"contain"});
await client.patch("category-coffee-mug").set({order:0}).commit();
const categories=await client.fetch('*[_type == "category" && kind == "core"] | order(order asc){title,order,href}');
if(categories[0]?.href !== "/coffee-mug") throw new Error("Coffee Mug is not first.");
console.log(JSON.stringify(categories));
