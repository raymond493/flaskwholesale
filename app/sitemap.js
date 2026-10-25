import { articles, businessPages, categories, featureCategories, getProducts, site, solutions } from "@/lib/site";
import { getSitePages } from "@/lib/sanity";
import { getProductSlugs as getCoffeeSlugs } from "@/coffee/lib/products";

export default async function sitemap() {
  const products = await getProducts();
  const sitePages = await getSitePages();
  const coffeePaths = ["/recent-work", "/coffee-mug", ...(await getCoffeeSlugs()).map(slug=>`/coffee-mug/${slug}`), ...["uv-printing","laser-logo-engraving","custom-packaging"].map(slug=>`/coffee-mug/customization/${slug}`)];
  const productPages = Array.from({ length: Math.max(0, Math.ceil(products.length / 12) - 1) }, (_, index) => `/products/page/${index + 2}`);
  const paths = [...new Set(["/", "/products", ...productPages, "/custom-solutions", "/knowledge-center", "/contact-us", ...Object.keys(categories).map((key)=>`/product-category/${key}`), ...Object.keys(featureCategories).map((key)=>`/product-tag/${key}`), ...products.map((product)=>`/product/${product.slug}`), ...Object.keys(solutions).map((slug)=>`/custom-solutions/${slug}`), ...Object.keys(articles).map((slug)=>`/knowledge-center/${slug}`), ...Object.keys(businessPages).map((slug)=>`/${slug}`), ...sitePages.map((page)=>page.path)])];
  return [...paths,...coffeePaths].map((path) => ({ url: `${site.origin}${path}`, changeFrequency: path.startsWith("/product/") ? "weekly" : "monthly", priority: path === "/" ? 1 : 0.7 }));
}
