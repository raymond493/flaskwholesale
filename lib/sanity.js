import { createClient } from "@sanity/client";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "12npkiv4",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-09-30",
};

const client = createClient({ ...sanityConfig, useCdn: true, perspective: "published" });

const fields = `
  "slug": slug.current,
  "category": category->slug.current,
  title,
  description,
  features,
  idealFor,
  specifications[]{label, value},
  tags,
  sourceUrl,
  "image": mainImage.asset->url,
  "imageAlt": mainImage.alt,
  "gallery": galleryImages[]{"url": asset->url, alt}
`;

const normalize = (product) => ({
  ...product,
  description: product.description || "A factory-direct stainless steel drinkware style available for wholesale, custom logo and private-label projects.",
  image: product.image || product.gallery?.[0]?.url || "/assets/placeholder.svg",
  gallery: product.gallery || [],
});

async function fetchProducts(query, params = {}) {
  const result = await client.fetch(query, params, {
    next: { revalidate: 3600, tags: ["sanity-products"] },
  });
  return Array.isArray(result) ? result.map(normalize) : result ? normalize(result) : null;
}

export async function getProducts() {
  return fetchProducts(`*[_type == "product"] | order(order asc, title asc){${fields}}`);
}

export async function getProduct(slug) {
  return fetchProducts(`*[_type == "product" && slug.current == $slug][0]{${fields}}`, { slug });
}

export async function getCategoryProducts(category) {
  return fetchProducts(
    `*[_type == "product" && category->slug.current == $category] | order(order asc, title asc){${fields}}`,
    { category },
  );
}

export async function getTagProducts(tag) {
  return fetchProducts(
    `*[_type == "product" && $tag in tags] | order(order asc, title asc){${fields}}`,
    { tag },
  );
}

const categoryCardFields = `title, "slug": slug.current, kind, description, href, order, imageFit, "image": coalesce(mainImage.asset->url, imageUrl), "imageAlt": coalesce(mainImage.alt, imageAlt)`;

export async function getCategoryCards(kind = "core") {
  return client.fetch(
    `*[_type == "category" && kind == $kind] | order(order asc){${categoryCardFields}}`,
    { kind },
    { next: { revalidate: 3600, tags: ["sanity-categories"] } },
  );
}

const sitePageFields = `title, "slug": slug.current, path, contentType, summary, bodyHtml, publishedAt, sourceUrl`;

export async function getSitePage(path) {
  return client.fetch(
    `*[_type == "sitePage" && path == $path][0]{${sitePageFields}}`,
    { path },
    { next: { revalidate: 3600, tags: ["sanity-site-pages"] } },
  );
}

export async function getSitePageBySlug(slug) {
  return client.fetch(
    `*[_type == "sitePage" && slug.current == $slug][0]{${sitePageFields}}`,
    { slug },
    { next: { revalidate: 3600, tags: ["sanity-site-pages"] } },
  );
}

export async function getArticles() {
  return client.fetch(
    `*[_type == "sitePage" && contentType == "post"] | order(publishedAt desc){${sitePageFields}}`,
    {},
    { next: { revalidate: 3600, tags: ["sanity-site-pages"] } },
  );
}

export async function getSitePages() {
  return client.fetch(
    `*[_type == "sitePage"] | order(path asc){${sitePageFields}}`,
    {},
    { next: { revalidate: 3600, tags: ["sanity-site-pages"] } },
  );
}
