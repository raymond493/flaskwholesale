import { createClient } from "@sanity/client";
import { catalogVariants } from "./catalog";

const client = createClient({ projectId: "12npkiv4", dataset: "production", apiVersion: "2026-10-13", useCdn: false });
const options = { tag: "coffee-catalog-uv-cm13-cm14-20261016", next: { revalidate: 3600, tags: ["coffee-products"] } };
const normalize = (p) => ({ ...p, id: p._id, variants: catalogVariants(p), colors: p.colors || [], tags: p.tags || [], features: p.features || [], galleryImages: p.galleryImages || [], videoUrls: p.videoUrls || [] });
export async function getProductsByCollection() {
  const products = await client.fetch('*[_type == "coffeeProduct" && isActive != false]', {}, options);
  return products.map(normalize).sort((a,b) => (a.collectionRanks?.find(r=>r.slug === "insulated-tumblers")?.position ?? 999) - (b.collectionRanks?.find(r=>r.slug === "insulated-tumblers")?.position ?? 999) || a.name.localeCompare(b.name));
}
export const getProducts = getProductsByCollection;
export async function getProductBySlug(slug) {
  const p = await client.fetch('*[_type == "coffeeProduct" && isActive != false && slug == $slug][0]', {slug}, options);
  return p ? normalize(p) : null;
}
export async function getProductSlugs() { return (await getProducts()).map(p=>p.slug); }
export async function getProductOptions() { return (await getProducts()).map(({id,name})=>({id,name})); }
export async function getRelatedProducts(product) { return (await getProducts()).filter(p=>p.id !== product.id).slice(0,4); }
export async function getInsulatedTumblerCustomization() {
  return client.fetch('*[_id == "coffee-customization"][0]', {}, options);
}
