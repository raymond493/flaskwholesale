"use client";
import { useMemo, useState } from "react";
import { useCurrency } from "@/coffee/components/currency-provider";
import { convertFromAud } from "@/coffee/lib/currency";
import { Check, ClipboardPlus, Minus, Plus } from "lucide-react";
import { cleanVariantName, formatUsd, getBasePriceRangeUsd, getVariantPriceUsd } from "@/coffee/lib/product-pricing";
import { useInquiryList } from "@/coffee/components/inquiry-list";
export function ProductQuoteConfigurator({ productId, productSlug, productName, imageUrl, fromPriceLabel, fromPriceAud, variants, colors = [], moq }) {
    const { addItem } = useInquiryList();
    const { rates, currency, formatAudAmount, formatUsdAmount } = useCurrency();
    const availableColors = useMemo(() => colors || [], [colors]);
    const options = useMemo(() => (variants.length ? variants : [{ name: "Standard", size: "Standard", material: "", wallType: "", moq }]).map((variant, index) => ({
        id: `${index}-${variant.size}`,
        label: cleanVariantName(variant),
        priceUsd: getVariantPriceUsd(variant) ?? (typeof fromPriceAud === "number" ? convertFromAud(fromPriceAud, "USD", rates) : undefined),
        moq: variant.moq > 0 ? variant.moq : moq > 0 ? moq : 1
    })), [moq, variants, fromPriceAud, rates]);
    const [selectedId, setSelectedId] = useState(options[0]?.id || "");
    const [selectedColor, setSelectedColor] = useState(availableColors[0] || "");
    function chooseColor(color) {
        setSelectedColor(color);
        document.dispatchEvent(new CustomEvent("flaskwholesale:product-colour", { detail: { productName, color } }));
    }
    const selected = options.find((option) => option.id === selectedId) || options[0];
    const minimumQuantity = selected?.moq || moq;
    const [quantity, setQuantity] = useState(minimumQuantity);
    const priceRange = getBasePriceRangeUsd(fromPriceLabel, variants);
    const hasPrice = typeof fromPriceAud === "number" || typeof selected?.priceUsd === "number" || Boolean(fromPriceLabel);
    const basePrice = priceRange
        ? priceRange.min === priceRange.max
            ? formatUsdAmount(priceRange.min)
            : `${formatUsdAmount(priceRange.min)} – ${formatUsdAmount(priceRange.max)}`
        : fromPriceLabel || "Quote";
    const displayPrice = typeof fromPriceAud === "number" ? formatAudAmount(fromPriceAud) : typeof selected?.priceUsd === "number" ? formatUsdAmount(selected.priceUsd) : basePrice;
    function chooseOption(id) {
        const next = options.find((option) => option.id === id);
        setSelectedId(id);
        if (next && quantity < next.moq)
            setQuantity(next.moq);
    }
    function addToInquiry() {
        if (!selected)
            return;
        addItem({
            id: `${productSlug}::${selected.id}::${selectedColor}`,
            productId,
            productSlug,
            productName,
            imageUrl,
            selectedOption: [selected.label, selectedColor].filter(Boolean).join(" · "),
            unitPriceUsd: selected.priceUsd,
            unitPriceLabel: selected.priceUsd ? `EXW ${formatUsd(selected.priceUsd)} / pc` : fromPriceLabel || "Price on request",
            quantity,
            moq: selected.moq
        });
    }
    return (<div id="product-options" className="scroll-mt-20 md:border-t md:border-slate-200 md:pt-6">
      {hasPrice ? <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">EXW</span>
        <span className="text-3xl font-bold tracking-tight text-slate-950">{displayPrice}</span>
        <span className="text-sm text-slate-500">{currency} · Wholesale base price</span>
      </div> : <p className="text-2xl font-bold text-slate-950">Price on request</p>}
      {moq > 0 ? <p className="mt-2 text-sm text-slate-500">Minimum order: {moq.toLocaleString("en-US")} units</p> : null}

      {options.length ? (<fieldset className="mt-7">
          <legend className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">Size / style</legend>
          <div className="mt-3 grid max-h-[25rem] grid-cols-2 gap-2 overflow-y-auto sm:pr-1">
            {options.map((option) => {
                const active = option.id === selected?.id;
                return (<button key={option.id} type="button" aria-pressed={active} onClick={() => chooseOption(option.id)} className={`relative min-h-[5rem] rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:p-4 ${active ? "border-emerald-800 bg-emerald-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-slate-400"}`}>
                  {active ? <Check className="absolute right-3 top-3 text-emerald-800" size={18} aria-hidden="true"/> : null}
                  <span className="block pr-7 text-base font-bold text-slate-950">{option.label}</span>
                  <span className="mt-2 block text-sm text-slate-500">
                    {typeof fromPriceAud === "number" || typeof option.priceUsd === "number" || fromPriceLabel ? <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">EXW</span> : null}
                    {typeof fromPriceAud === "number" ? formatAudAmount(fromPriceAud) : typeof option.priceUsd === "number" ? formatUsdAmount(option.priceUsd) : fromPriceLabel || "Price on request"}
                  </span>
                </button>);
            })}
          </div>
        </fieldset>) : null}

      {availableColors.length ? <fieldset className="mt-6"><legend className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">Colour</legend><div className="mt-3 flex flex-wrap gap-2">{availableColors.map((color) => <button key={color} type="button" aria-pressed={selectedColor === color} onClick={() => chooseColor(color)} className={`rounded-full border px-4 py-2 text-sm ${selectedColor === color ? "border-emerald-800 bg-emerald-50 font-semibold text-emerald-900" : "border-slate-200"}`}>{color}</button>)}</div></fieldset> : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-slate-900">Quantity</span>
          <span className="flex h-12 w-44 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(minimumQuantity, current - 100))} className="grid h-full w-12 place-items-center text-slate-600 hover:bg-slate-50">
              <Minus size={17}/>
            </button>
            <input aria-label="Quantity" type="number" min={minimumQuantity} step="1" value={quantity} onChange={(event) => setQuantity(Math.max(minimumQuantity, Math.floor(Number(event.target.value)) || minimumQuantity))} className="min-w-0 flex-1 border-x border-slate-200 py-3 text-center font-bold outline-none"/>
            <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 100)} className="grid h-full w-12 place-items-center text-slate-600 hover:bg-slate-50">
              <Plus size={17}/>
            </button>
          </span>
        </label>
        <button type="button" onClick={addToInquiry} className="inline-flex h-12 min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 font-bold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:flex-1">
          Add to inquiry <ClipboardPlus size={18}/>
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {hasPrice ? "Product prices are EXW. " : ""}Freight and customization are confirmed in your quotation.
      </p>
      <div data-mobile-inquiry-bar className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-4 pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:hidden" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <a href="#product-options" className="min-w-0 flex-1">
            <span className="block text-xs text-slate-500">{hasPrice ? `EXW · ${currency}` : "Wholesale quote"}</span>
            <span className="block truncate text-lg font-bold text-slate-950">{hasPrice ? displayPrice : "Price on request"}</span>
            <span className="block truncate text-[10px] text-slate-500">{[selected?.label, selectedColor, `${quantity} units`].filter(Boolean).join(" · ")}</span>
          </a>
          <button type="button" onClick={addToInquiry} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white">Add to inquiry <ClipboardPlus size={18}/></button>
        </div>
      </div>
    </div>);
}
