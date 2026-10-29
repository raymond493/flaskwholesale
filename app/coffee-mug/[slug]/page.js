import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, Paintbrush, Truck } from "lucide-react";
import { ProductCard } from "@/coffee/components/product-card";
import { ProductGallery } from "@/coffee/components/product-gallery";
import { ProductDetailTabs } from "@/coffee/components/product-detail-tabs";
import { AddSampleButton } from "@/coffee/components/sample-cart";
import { RfqForm } from "@/coffee/components/rfq-form";
import { ProductQuoteConfigurator } from "@/coffee/components/product-quote-configurator";
import { getProductBySlug, getProductOptions, getProductSlugs, getRelatedProducts } from "@/coffee/lib/products";
import { catalogCategory, displayProductName, packagingCategories, productCode } from "@/coffee/lib/catalog";
export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = true;
const PREBUILT_PRODUCT_LIMIT = 30;
export async function generateStaticParams() {
    const slugs = await getProductSlugs();
    return slugs.slice(0, PREBUILT_PRODUCT_LIMIT).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    return {
        title: product ? `${productCode(slug) ? `${productCode(slug)} · ` : ""}${product.name}` : "Custom Product",
        description: product?.description,
        alternates: {canonical: `/coffee-mug/${slug}`}
    };
}
export default async function ProductPage({ params }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    const products = await getProductOptions();
    if (!product) {
        notFound();
    }
    const galleryImages = product.galleryImages?.length ? product.galleryImages : [{ imageUrl: product.imageUrl, alt: product.name }];
    const relatedProducts = await getRelatedProducts(product);
    const category = catalogCategory(product);
    const code = productCode(product.slug);
    const categoryLabel = category === "insulated-tumblers" ? "Coffee Mug" : packagingCategories.find((entry) => entry.slug === category)?.label || "Products";
    const hasSpecificVariants = product.variants.some((variant) => variant.material !== "Food-grade paper or plastic" || variant.wallType !== "Custom");
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: galleryImages.map((image) => image.imageUrl),
        description: product.shortDescription || product.description,
        brand: { "@type": "Brand", name: "FlaskWholesale" },
        offers: product.fromPriceAud ? { "@type": "Offer", priceCurrency: "AUD", price: product.fromPriceAud, availability: "https://schema.org/InStock", url: `https://www.flaskwholesale.com/coffee-mug/${product.slug}` } : undefined
    };
    return (<main className="pb-24 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}/>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-4 text-xs text-slate-500 sm:px-6 sm:pt-6 sm:text-sm lg:px-8">
          <Link href="/" prefetch={false}>Home</Link> <span aria-hidden="true">/</span> <Link href="/coffee-mug" prefetch={false}>{categoryLabel}</Link> <span aria-hidden="true">/</span> <span className="text-slate-800 sm:hidden">{code || "Product"}</span><span className="hidden text-slate-800 sm:inline">{displayProductName(product.name)}</span>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-4 sm:gap-8 sm:px-6 sm:py-10 md:grid-cols-2 md:grid-rows-[auto_1fr] md:items-start lg:px-8">
          <div className="min-w-0 md:col-start-2 md:row-start-1">
            <p className="hidden text-sm font-bold uppercase tracking-[0.2em] text-eucalyptus md:block">{product.eyebrow}</p>
            <h1 className="font-serif text-2xl leading-tight sm:text-4xl md:mt-3">
              {code ? `${code} ${displayProductName(product.name)}` : displayProductName(product.name)}
            </h1>
            <p className="mt-4 hidden whitespace-pre-line text-lg text-ink/75 md:block">{product.shortDescription || product.description}</p>
          </div>
          <div className="min-w-0 md:col-start-1 md:row-span-2 md:row-start-1">
            <ProductGallery images={galleryImages} videoUrls={product.videoUrls} videoPosterUrl={product.videoPosterUrl} productName={product.name}/>
          </div>
          <div className="flex min-w-0 flex-col md:col-start-2 md:row-start-2">
              <ProductQuoteConfigurator productId={product.id} productSlug={product.slug} productName={product.name} imageUrl={product.imageUrl} fromPriceLabel={product.fromPriceLabel} fromPriceAud={product.fromPriceAud} variants={product.variants} colors={product.colors} moq={product.moq}/>
            <p className="mt-6 whitespace-pre-line text-sm leading-6 text-ink/75 md:hidden">{product.shortDescription || product.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {product.sample ? <AddSampleButton product={product}/> : null}
              {typeof product.fromPriceAud === "number" ? <Link href="#quote" className="rounded-full bg-eucalyptus px-5 py-3 font-semibold text-white">Request custom quote</Link> : null}
            </div>
            <div className="mt-6 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <Trust icon={Paintbrush} label="Free artwork check"/>
              <Trust icon={LockKeyhole} label="Quote before production"/>
              <Trust icon={Truck} label="Worldwide delivery"/>
            </div>
          </div>
        </div>
      </section>

      <ProductDetailTabs specificationsText={product.specificationsText} faqText={product.faqText} detailText={product.detailText}/>

      <section className={`mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8 ${hasSpecificVariants ? "md:grid-cols-[0.9fr_1.1fr]" : ""}`}>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">Why brands choose it</h2>
          <div className="mt-4 grid gap-3">
            {product.features.map((feature) => (<div key={feature} className="flex items-center gap-3 rounded-md bg-white p-4 shadow-sm">
                <CheckCircle2 className="text-eucalyptus" size={20}/>
                <span className="font-semibold">{feature}</span>
              </div>))}
          </div>
        </div>
        {hasSpecificVariants ? <div className="min-w-0 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold">Available specs</h2>
          <div className="mt-4 max-w-full overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-cream">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Wall type</th>
                  <th className="p-3">Material</th>
                  {product.moq > 0 ? <th className="p-3">MOQ</th> : null}
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (<tr key={`${variant.name}-${variant.wallType}`} className="border-b border-black/10">
                    <td className="p-3 font-semibold">{variant.size}</td>
                    <td className="p-3">{variant.wallType}</td>
                    <td className="p-3">{variant.material}</td>
                    {product.moq > 0 ? <td className="p-3">{variant.moq.toLocaleString("en-AU")}</td> : null}
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div> : null}
      </section>

      <section id="quote" className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <RfqForm products={products} defaultProduct={product}/>
        </div>
      </section>

      {relatedProducts.length ? (<section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map((entry) => <ProductCard key={entry.id} product={entry}/>)}
          </div>
        </section>) : null}
    </main>);
}
function Trust({ icon: Icon, label }) {
    return <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Icon size={18} className="text-emerald-700"/>{label}</div>;
}
