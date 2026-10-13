import Cta from "@/components/Cta";
import CategoryGrid from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductCard";
import { getCategoryCards, getProducts, sortProductsForDisplay } from "@/lib/site";
import Link from "next/link";

export default async function ProductCatalog({ currentPage = 1 }) {
  const [products, coreCards, featureCards] = await Promise.all([getProducts(), getCategoryCards("core"), getCategoryCards("feature")]);
  const orderedProducts = sortProductsForDisplay(products);
  const perPage = 12;
  const totalPages = Math.ceil(products.length / perPage);
  if (currentPage < 1 || currentPage > totalPages) return null;
  const visibleProducts = orderedProducts.slice((currentPage - 1) * perPage, currentPage * perPage);
  return <>
    {currentPage === 1 && <>
      <section className="catalog-intro"><div className="container"><span className="eyebrow">Wholesale catalogue</span><h1>Stainless Steel Drinkware</h1><p>Precision-manufactured for durability, thermal performance and scalable production—supporting private-label brands, promotional programmes and global distribution.</p></div></section>
      <section className="section catalog-section"><div className="container"><CategoryGrid items={coreCards} /></div></section>
      <section className="section alt"><div className="container"><div className="section-head"><div><span className="eyebrow">Coffee Mug Collection</span><h2>Custom coffee mugs & tumblers.</h2></div><Link className="button" href="/coffee-mug">Explore Coffee Mug →</Link></div><p>Explore complete photo galleries, product videos, sizes, colours and wholesale inquiry options.</p></div></section>
      <section className="section alt"><div className="container"><div className="section-head"><div><span className="eyebrow">Collections</span><h2>Drinkware by design.</h2></div><p>Browse application-led collections for retail, promotional and private-label programmes.</p></div><CategoryGrid items={featureCards} compact /></div></section>
    </>}
    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">{products.length} migrated products</span><h2>Latest product developments.</h2></div><p>Newly engineered drinkware designed to meet evolving market needs and private-label opportunities.</p></div><ProductGrid products={visibleProducts} /><nav className="pagination" aria-label="Product pages">{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <Link className={page === currentPage ? "active" : ""} href={page === 1 ? "/products" : `/products/page/${page}`} key={page}>{page}</Link>)}</nav></div></section>
    <Cta />
  </>;
}
