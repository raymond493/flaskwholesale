import { ResponsiveProductImage } from "./responsive-product-image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CurrencyAmount, UsdCurrencyRange } from "./currency-amount";
import { AddSampleButton } from "./sample-cart";
import { displayProductName, productCode } from "@/coffee/lib/catalog";
import { getBasePriceRangeUsd } from "@/coffee/lib/product-pricing";
export function ProductCard({ product, priority = false }) {
    const hasPrice = typeof product.fromPriceAud === "number";
    const code = productCode(product.slug);
    const usdRange = hasPrice ? undefined : getBasePriceRangeUsd(product.fromPriceLabel, product.variants);
    return (<article className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/coffee-mug/${product.slug}`} prefetch={false} className="group block">
        <div className="relative aspect-square overflow-hidden bg-[#f7f7f7]">
          <ResponsiveProductImage src={product.imageUrl} alt={product.name} priority={priority} sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, calc(50vw - 24px)" className="object-contain p-3 transition duration-300 group-hover:scale-105"/>
        </div>
      </Link>
      <div className="space-y-3 p-3 md:p-4">
        <div className="flex flex-wrap gap-1.5">
          {[...new Set(product.variants.map((variant) => variant.size))].filter((size) => size && size !== "Custom").slice(0, 3).map((tag) => (<span key={tag} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold leading-none text-emerald-700">
              {tag}
            </span>))}
        </div>

        <div className="space-y-1">
          {product.moq > 0 ? <span className="block text-xs font-medium text-slate-500">Min. {product.moq.toLocaleString("en-AU")} units</span> : null}
          <div className="flex items-baseline gap-1">
            {hasPrice ? <span className="text-sm font-semibold text-slate-500">From</span> : null}
            <span className="text-xl font-bold text-emerald-600">
              {hasPrice ? <CurrencyAmount amountAud={product.fromPriceAud}/> : usdRange ? <UsdCurrencyRange minUsd={usdRange.min} maxUsd={usdRange.max}/> : product.fromPriceLabel || "Price on request"}
            </span>
            {hasPrice ? <span className="text-xs text-slate-500">/ unit</span> : null}
          </div>
        </div>

        <Link href={`/coffee-mug/${product.slug}`} prefetch={false} className="block">
          <h3 className="line-clamp-3 min-h-[2.8rem] text-sm font-semibold leading-snug text-slate-900 md:text-base">
            {code ? `${code} ${displayProductName(product.name)}` : displayProductName(product.name)}
          </h3>
        </Link>

        <div className="grid gap-2 pt-1">
          {product.sample ? (<AddSampleButton product={product}/>) : (<Link href={`/coffee-mug/${product.slug}`} prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-600 hover:text-emerald-700">
              <ShoppingBag size={15}/>
              View Details
            </Link>)}
        </div>
      </div>
    </article>);
}
