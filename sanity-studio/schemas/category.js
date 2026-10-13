import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "kind", title: "Category group", type: "string", options: { list: [{ title: "Core product category", value: "core" }, { title: "Drinkware by design", value: "feature" }] } }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "href", title: "Website link", type: "string" }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "imageUrl", title: "Shared Sanity image URL", type: "url" }),
    defineField({ name: "imageAlt", title: "Shared image alternative text", type: "string" }),
    defineField({ name: "imageFit", title: "Image fit", type: "string", options: { list: ["cover", "contain"] } }),
    defineField({ name: "mainImage", title: "Category main image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })] }),
  ],
});
