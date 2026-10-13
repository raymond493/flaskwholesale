"use client";
import { useMemo, useState } from "react";
import { ProductCard } from "@/coffee/components/product-card";
import { getBasePriceRangeUsd } from "@/coffee/lib/product-pricing";
import { useCurrency } from "@/coffee/components/currency-provider";
import { convertFromAud } from "@/coffee/lib/currency";
export function CollectionProducts({ products }) {
    const { rates } = useCurrency();
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("featured");
    const [capacity, setCapacity] = useState("");
    const [color, setColor] = useState("");
    const capacities = [...new Set(products.flatMap((product) => product.variants.map((variant) => variant.size)))].filter((value) => value && value !== "Custom");
    const colors = [...new Set(products.flatMap((product) => product.colors || []))];
    const visible = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        const filtered = products.filter((product) => (!normalized || [product.name, ...product.tags].join(" ").toLowerCase().includes(normalized)) &&
            (!capacity || product.variants.some((variant) => variant.size === capacity)) &&
            (!color || product.colors?.includes(color)));
        if (sort === "featured")
            return filtered;
        return [...filtered].sort((a, b) => {
            if (sort === "name")
                return a.name.localeCompare(b.name);
            const price = (product) => typeof product.fromPriceAud === "number"
                ? convertFromAud(product.fromPriceAud, "USD", rates)
                : getBasePriceRangeUsd(product.fromPriceLabel, product.variants)?.min;
            const left = price(a);
            const right = price(b);
            if (left === undefined)
                return right === undefined ? 0 : 1;
            if (right === undefined)
                return -1;
            return sort === "price-low" ? left - right : right - left;
        });
    }, [products, query, sort, capacity, color, rates]);
    return (<>
      {(capacities.length > 1 || colors.length > 1) ? <div className="mb-3 flex flex-wrap items-center gap-2 text-sm sm:mb-4 sm:gap-3">
        {capacities.length > 1 ? <label className="text-sm">Capacity / size <select value={capacity} onChange={(event) => setCapacity(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white p-2"><option value="">All sizes</option>{capacities.map((value) => <option key={value}>{value}</option>)}</select></label> : null}
        {colors.length > 1 ? <label className="text-sm">Colour <select value={color} onChange={(event) => setColor(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white p-2"><option value="">All colours</option>{colors.map((value) => <option key={value}>{value}</option>)}</select></label> : null}
        {(capacity || color || query) ? <button type="button" onClick={() => { setCapacity(""); setColor(""); setQuery(""); }} className="text-sm text-emerald-800 underline">Clear filters</button> : null}
      </div> : null}
      <div className="mb-4 grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:mb-6 sm:gap-3 sm:p-4 sm:grid-cols-[1fr_auto]">
        <label>
          <span className="sr-only">Filter this collection</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search within this collection" className="w-full rounded-md border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-700"/>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900">
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      {visible.length ? (<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2}/>)}
        </div>) : (<div className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-600">No products match this search.</div>)}
    </>);
}
