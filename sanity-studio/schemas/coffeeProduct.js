import { defineType, defineField } from "sanity";
const textFields=["description","shortDescription","specificationsText","faqText","detailText"];
export const coffeeProduct=defineType({name:"coffeeProduct",title:"Coffee Mug",type:"document",fields:[
  defineField({name:"isActive",title:"Available on website",type:"boolean",initialValue:true,description:"Turn off to take this product offline without deleting its data."}),
  defineField({name:"order",title:"Global display order",type:"number"}),
  defineField({name:"sourceUpdatedAt",title:"Source update date",type:"datetime",readOnly:true,hidden:true}),
  defineField({name:"videoPosterUrl",title:"Video cover — Sanity CDN URL",type:"url"}),
  defineField({name:"name",title:"Product name",type:"string"}),defineField({name:"slug",type:"string"}),defineField({name:"eyebrow",type:"string"}),
  ...textFields.map(name=>defineField({name,type:"text"})),defineField({name:"imageUrl",title:"Main image — Sanity CDN URL",type:"url"}),
  defineField({name:"galleryImages",type:"array",of:[{type:"object",fields:[{name:"alt",type:"string"},{name:"imageUrl",type:"url"}]}]}),
  ...["videoUrls","colors","tags","features","collectionSlugs"].map(name=>defineField({name,type:"array",of:[{type:name==="videoUrls"?"url":"string"}]})),
  defineField({name:"moq",type:"number"}),defineField({name:"leadTime",type:"string"}),defineField({name:"fromPriceLabel",type:"string"}),defineField({name:"fromPriceAud",type:"number"}),
  defineField({name:"variants",type:"array",of:[{type:"object",fields:[...['name','size','material','wallType'].map(name=>({name,type:"string"})),{name:"moq",type:"number"},{name:"priceUsd",type:"number"}]}]}),
  defineField({name:"collectionRanks",type:"array",of:[{type:"object",fields:[{name:"slug",type:"string"},{name:"position",type:"number"}]}]})
],preview:{select:{title:"name"}}});
export const coffeeCustomization=defineType({name:"coffeeCustomization",title:"Coffee Mug Customization",type:"document",fields:[
  {name:"heading",type:"string"},{name:"intro",type:"text"},{name:"options",type:"array",of:[{type:"object",fields:[{name:"title",type:"string"},{name:"slug",type:"string"},{name:"description",type:"text"},{name:"imageUrl",type:"url"},{name:"alt",type:"string"},{name:"videoUrl",type:"url"},{name:"videoPosterUrl",type:"url"},{name:"galleryImages",type:"array",of:[{type:"object",fields:[{name:"alt",type:"string"},{name:"imageUrl",type:"url"}]}]}]}]}
],preview:{select:{title:"heading"}}});
