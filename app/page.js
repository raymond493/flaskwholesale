import Image from "@/components/SanityImage";
import Link from "next/link";
import Cta from "@/components/Cta";
import CategoryGrid from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductCard";
import { getCategoryCards, getProducts, sortProductsForDisplay } from "@/lib/site";

export const revalidate = 86400;

export default async function Home() {
  const [products, categoryCards] = await Promise.all([getProducts(), getCategoryCards("core")]);
  const latestProducts = sortProductsForDisplay(products);
  const hero = [products[2], products[48], products[87]];
  return <>
    <section className="hero"><div className="container hero-grid"><div><span className="eyebrow">Factory-direct · Low MOQ · Global delivery</span><h1>Custom drinkware made for growing brands.</h1><p>FlaskWholesale manufactures stainless steel bottles, tumblers, mugs, shakers, jugs and can coolers with logo, colour, packaging and OEM/ODM support.</p><div className="actions"><Link className="button" href="/contact-us">Request a quote</Link><Link className="button light" href="/products">Explore products</Link></div></div><div className="hero-collage">
      <div className="hero-card one"><Image src={hero[0].image} alt={hero[0].title} fill priority sizes="(max-width:900px) 70vw, 33vw" /></div>
      <div className="hero-card two"><Image src={hero[1].image} alt={hero[1].title} fill sizes="(max-width:900px) 50vw, 24vw" /></div>
      <div className="hero-card three"><Image src={hero[2].image} alt={hero[2].title} fill sizes="(max-width:900px) 40vw, 19vw" /></div>
    </div></div></section>
    <div className="statbar"><div className="container stats"><div className="stat"><strong>50 pcs</strong><span>Logo MOQ from</span></div><div className="stat"><strong>100+</strong><span>Drinkware styles</span></div><div className="stat"><strong>3–7 days</strong><span>Typical sampling</span></div><div className="stat"><strong>30+ markets</strong><span>Global delivery experience</span></div></div></div>
    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Product range</span><h2>Stainless steel drinkware.</h2></div><p>Precision-manufactured for durability, thermal performance and scalable production—supporting private-label brands, promotional programmes and global distribution.</p></div><CategoryGrid items={categoryCards} /></div></section>
    <section className="section alt"><div className="container"><div className="section-head"><div><span className="eyebrow">Latest styles</span><h2>Ready for private label.</h2></div><Link className="button secondary" href="/products">View all 100 products</Link></div><ProductGrid products={latestProducts.slice(0,8)} /></div></section>
    <section className="section"><div className="container"><div className="split"><div className="split-image"><Image src={products[10].image} alt={products[10].title} width={900} height={900} /></div><div><span className="eyebrow">Custom solutions</span><h2>Build the right product at the right stage.</h2><p>Move from a test order to a complete private-label collection without overcommitting inventory.</p><ul className="checklist"><li>Logo customization from 50 pieces on selected stock styles</li><li>Stock and Pantone-matched colour programs</li><li>Retail boxes, labels, barcodes and gift packaging</li><li>Private mould development for exclusive projects</li><li>Sampling, inspection and global delivery support</li></ul><Link className="button" href="/custom-solutions">Explore customization</Link></div></div></div></section>
    <section className="section alt"><div className="container"><div className="section-head"><div><span className="eyebrow">Clear sourcing process</span><h2>From idea to delivery.</h2></div></div><div className="process">{[["Share your brief","Product, quantity, logo, packaging, target price and destination."],["Confirm the solution","Select a stock model or develop an OEM option with clear costs and lead time."],["Approve the sample","Review product function, colour, branding and packaging before production."],["Produce & deliver","QC checkpoints, packing confirmation and coordinated global shipment."]].map(([title,copy])=><div className="process-card" key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div></div></section>
    <Cta />
  </>;
}
