"use client";
import { ResponsiveProductImage } from "./responsive-product-image";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ClipboardList, Minus, Plus, X } from "lucide-react";
import { useCurrency } from "@/coffee/components/currency-provider";
import { inquiryDraftStorageKey, inquiryEstimatedTotal, inquiryStorageKey } from "@/coffee/lib/inquiry";
import { productCode } from "@/coffee/lib/catalog";
const InquiryListContext = createContext(null);
export function InquiryListProvider({ children, availableSlugs }) {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(inquiryStorageKey);
            if (saved) {
                const stored = JSON.parse(saved);
                const valid = Array.isArray(stored) ? stored.filter(item=>availableSlugs.includes(item.productSlug)) : [];
                setItems(valid);
                window.localStorage.setItem(inquiryStorageKey,JSON.stringify(valid));
            }
        }
        catch {
            window.localStorage.removeItem(inquiryStorageKey);
        }
    }, [availableSlugs]);
    const persist = useCallback((next) => {
        setItems(next);
        window.localStorage.setItem(inquiryStorageKey, JSON.stringify(next));
        if (window.localStorage.getItem(inquiryDraftStorageKey))
            window.localStorage.setItem(inquiryDraftStorageKey, JSON.stringify(next));
    }, []);
    const addItem = useCallback((item) => {
        setItems((current) => {
            const existing = current.find((entry) => entry.id === item.id);
            const next = existing
                ? current.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + item.quantity } : entry))
                : [...current, item];
            window.localStorage.setItem(inquiryStorageKey, JSON.stringify(next));
            if (window.localStorage.getItem(inquiryDraftStorageKey))
                window.localStorage.setItem(inquiryDraftStorageKey, JSON.stringify(next));
            return next;
        });
        setOpen(true);
    }, []);
    const updateQuantity = useCallback((id, quantity) => {
        const next = items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) } : item));
        persist(next);
    }, [items, persist]);
    const removeItem = useCallback((id) => persist(items.filter((item) => item.id !== id)), [items, persist]);
    const clearItems = useCallback(() => persist([]), [persist]);
    function requestQuote() {
        window.localStorage.setItem(inquiryDraftStorageKey, JSON.stringify(items));
        setOpen(false);
        router.push("/coffee-mug/quote?source=inquiry-list");
    }
    const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearItems, openList: () => setOpen(true) }), [addItem, clearItems, items, removeItem, updateQuantity]);
    return (<InquiryListContext.Provider value={value}>
      {children}
      {open ? (<InquiryDrawer items={items} onClose={() => setOpen(false)} onUpdateQuantity={updateQuantity} onRemove={removeItem} onRequestQuote={requestQuote}/>) : null}
    </InquiryListContext.Provider>);
}
export function useInquiryList() {
    const context = useContext(InquiryListContext);
    if (!context)
        throw new Error("useInquiryList must be used within InquiryListProvider");
    return context;
}
export function InquiryListButton() {
    const { items, openList } = useInquiryList();
    return (<button type="button" onClick={openList} aria-label={`Open bulk inquiry list with ${items.length} items`} title="Bulk inquiry list" className="relative inline-flex h-10 w-10 items-center justify-center gap-2 rounded-md text-slate-700 transition hover:bg-slate-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:w-auto lg:px-3">
      <ClipboardList size={22}/>
      <span className="hidden text-sm font-semibold lg:inline">Inquiry List</span>
      {items.length ? (<span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-800 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-white shadow-sm">
          {items.length}
        </span>) : null}
    </button>);
}
function InquiryDrawer({ items, onClose, onUpdateQuantity, onRemove, onRequestQuote }) {
    const closeButton = useRef(null);
    const estimatedTotal = inquiryEstimatedTotal(items);
    const { currency, formatUsdAmount } = useCurrency();
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButton.current?.focus();
        function onKeyDown(event) {
            if (event.key === "Escape")
                onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);
    return (<div className="fixed inset-0 z-[80]" role="presentation">
      <button type="button" aria-label="Close bulk inquiry list" onClick={onClose} className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"/>
      <aside role="dialog" aria-modal="true" aria-labelledby="bulk-inquiry-title" className="absolute inset-y-0 right-0 flex w-full max-w-[720px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-6 sm:px-10 sm:py-8">
          <h2 id="bulk-inquiry-title" className="font-serif text-3xl text-slate-950 sm:text-4xl">BULK INQUIRY <span className="text-slate-300">({items.length})</span></h2>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Close bulk inquiry list" className="grid h-11 w-11 place-items-center rounded-full text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
            <X size={30}/>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-10 sm:py-8">
          {items.length ? (<div className="divide-y divide-slate-100">
              {items.map((item) => (<InquiryRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove}/>))}
            </div>) : (<div className="mx-auto flex max-w-sm flex-col items-center py-20 text-center">
              <ClipboardList size={44} className="text-slate-300"/>
              <h3 className="mt-5 text-xl font-bold text-slate-900">Your inquiry list is empty</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Choose a product style and quantity, then add it to your bulk inquiry.</p>
              <button type="button" onClick={onClose} className="mt-6 rounded-full bg-emerald-800 px-6 py-3 font-bold text-white">Continue shopping</button>
            </div>)}
        </div>

        {items.length ? (<footer className="border-t border-slate-200 bg-white px-6 py-5 shadow-[0_-12px_32px_rgba(15,23,42,0.06)] sm:px-10 sm:py-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{items.some((item) => !item.unitPriceUsd) ? `Estimated product total · ${currency}` : `Estimated product total · ${currency}`}</p>
                {items.some((item) => !item.unitPriceUsd) ? <p className="mt-1 text-xs text-slate-500">Items without a price will be quoted separately.</p> : null}
                <p className="mt-1 text-sm text-slate-500">Freight and customization quoted separately</p>
              </div>
              <p className="text-2xl font-bold text-slate-950">{estimatedTotal ? formatUsdAmount(estimatedTotal) : "To be quoted"}</p>
            </div>
            <button type="button" onClick={onRequestQuote} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#164d2b] px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#103d22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
              Request wholesale quote <ArrowRight size={18}/>
            </button>
          </footer>) : null}
      </aside>
    </div>);
}
function InquiryRow({ item, onUpdateQuantity, onRemove }) {
    const step = 1;
    const [quantityDraft, setQuantityDraft] = useState(String(item.quantity));
    useEffect(() => setQuantityDraft(String(item.quantity)), [item.quantity]);
    const commitQuantity = () => { const n = /^\d+$/.test(quantityDraft) && Number.isSafeInteger(Number(quantityDraft)) && Number(quantityDraft) > 0 ? Number(quantityDraft) : 1; setQuantityDraft(String(n)); onUpdateQuantity(item.id, n); };
    const { formatUsdAmount } = useCurrency();
    return (<article className="grid grid-cols-[92px_1fr] gap-4 py-6 first:pt-0 sm:grid-cols-[120px_1fr] sm:gap-6">
      <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50">
        <ResponsiveProductImage src={item.imageUrl} alt="" sizes="120px" className="object-contain"/>
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-serif text-xl leading-snug text-slate-950 sm:text-2xl">
              {[productCode(item.productSlug), item.productName].filter(Boolean).join(" ")}
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-stone-500">Wholesale item</p>
            <p className="mt-4 text-sm font-bold uppercase text-[#2d6233]">Option: {item.selectedOption}</p>
          </div>
          <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.productName}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-700">
            <X size={22}/>
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg text-slate-950"><span className="mr-2 text-sm font-bold uppercase text-stone-400">Unit price</span><span className="font-bold">{item.unitPriceUsd ? formatUsdAmount(item.unitPriceUsd) : item.unitPriceLabel}</span></p>
          <div className="flex h-12 w-48 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button type="button" aria-label={`Decrease ${item.productName} quantity`} onClick={() => onUpdateQuantity(item.id, item.quantity - step)} className="grid h-full w-12 place-items-center text-slate-400 hover:bg-slate-50 hover:text-slate-900"><Minus size={17}/></button>
            <input aria-label={`${item.productName} quantity`} type="number" min="1" step={step} value={quantityDraft} onChange={(event) => { setQuantityDraft(event.target.value); const n = Number(event.target.value); if (/^\d+$/.test(event.target.value) && Number.isSafeInteger(n) && n > 0) onUpdateQuantity(item.id, n); }} onBlur={commitQuantity} className="min-w-0 flex-1 border-x border-slate-200 py-3 text-center text-xl font-bold outline-none"/>
            <button type="button" aria-label={`Increase ${item.productName} quantity`} onClick={() => onUpdateQuantity(item.id, item.quantity + step)} className="grid h-full w-12 place-items-center text-[#2d6233] hover:bg-slate-50"><Plus size={17}/></button>
          </div>
        </div>
      </div>
    </article>);
}
