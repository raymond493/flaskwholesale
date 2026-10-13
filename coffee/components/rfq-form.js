"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { validateRfq } from "@/coffee/lib/rfq";
import { inquiryDraftStorageKey, inquiryQuantityTotal } from "@/coffee/lib/inquiry";
import { useInquiryList } from "@/coffee/components/inquiry-list";
import { productCode } from "@/coffee/lib/catalog";
import { useCurrency } from "@/coffee/components/currency-provider";
const emptyForm = {
    productName: "",
    name: "",
    email: "",
    company: "",
    country: "",
    state: "",
    postcode: "",
    quantity: "",
    message: ""
};
export function RfqForm({ products, defaultProduct }) {
    const { clearItems } = useInquiryList();
    const { currency, formatUsdAmount } = useCurrency();
    const [form, setForm] = useState({
        ...emptyForm,
        productName: defaultProduct?.name || ""
    });
    const [status, setStatus] = useState("idle");
    const [receipt, setReceipt] = useState(null);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(inquiryDraftStorageKey);
            const inquiryItems = saved ? JSON.parse(saved) : [];
            if (inquiryItems.length) {
                setForm((current) => ({
                    ...current,
                    productName: inquiryItems.map((item) => item.productName).join(", "),
                    selectedOption: inquiryItems.map((item) => `${item.productName}: ${item.selectedOption}`).join("\n"),
                    unitPrice: "See bulk inquiry list",
                    quantity: String(inquiryQuantityTotal(inquiryItems)),
                    inquiryItems
                }));
            }
        }
        catch {
            window.localStorage.removeItem(inquiryDraftStorageKey);
        }
        function applySelection(event) {
            const selection = event.detail;
            setForm((current) => ({ ...current, ...selection }));
            setErrors((current) => ({ ...current, productName: undefined, quantity: undefined }));
        }
        document.addEventListener("flaskwholesale:quote-selection", applySelection);
        return () => document.removeEventListener("flaskwholesale:quote-selection", applySelection);
    }, []);
    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }
    async function submit(event) {
        event.preventDefault();
        const validation = validateRfq(form);
        setErrors(validation.errors);
        if (!validation.ok) {
            return;
        }
        const lines = ["FlaskWholesale coffee mug inquiry", ...Object.entries(form).filter(([key, value]) => value && !["artwork", "inquiryItems"].includes(key)).map(([key, value]) => key + ": " + value), ...(form.inquiryItems || []).map(item => item.productName + " · " + item.selectedOption + " · " + item.quantity + " units"), form.artwork ? "Artwork: " + form.artwork.name + " (I will attach it in WhatsApp)" : ""].filter(Boolean);
        window.open("https://wa.me/8613267102135?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener,noreferrer");
        setReceipt({ reference: "Continue in WhatsApp", items: form.inquiryItems || [], product: form.productName, quantity: form.quantity });
        setStatus("sent");
    }
    async function attachArtwork(file) {
        if (!file) {
            setForm((current) => ({ ...current, artwork: undefined }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((current) => ({ ...current, artwork: "Artwork must be 5 MB or smaller." }));
            return;
        }
        const content = "";
        setForm((current) => ({ ...current, artwork: { name: file.name, type: file.type || "application/octet-stream", content } }));
        setErrors((current) => ({ ...current, artwork: undefined }));
    }
    return (<form onSubmit={submit} className="rounded-lg border border-black/10 bg-cream p-5 shadow-soft sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-eucalyptus">Custom quote</p>
        <h2 className="mt-2 text-3xl font-bold">Request custom pricing</h2>
        <p className="mt-2 text-ink/70">Tell us your product specifications, quantity, delivery location, and logo needs. We will reply with a tailored international quote.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {form.inquiryItems?.length ? (<div className="rounded-lg border border-emerald-200 bg-white p-4 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Bulk inquiry list ({form.inquiryItems.length})</p>
            <div className="mt-3 divide-y divide-slate-100">
              {form.inquiryItems.map((item) => (<div key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div><p className="font-bold text-slate-950">{[productCode(item.productSlug), item.productName].filter(Boolean).join(" ")}</p><p className="mt-1 text-sm text-slate-600">{item.selectedOption} · Qty {item.quantity.toLocaleString("en-US")}</p></div>
                  <p className="shrink-0 text-sm font-bold text-slate-700">{item.unitPriceUsd ? `EXW ${formatUsdAmount(item.unitPriceUsd)}` : item.unitPriceLabel}</p>
                </div>))}
            </div>
          </div>) : form.selectedOption ? (<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Selected option</p>
            <p className="mt-1 font-bold text-slate-950">{form.selectedOption}</p>
            {form.unitPrice ? <p className="mt-1 text-sm text-slate-600">{form.unitPrice}</p> : null}
          </div>) : null}
        {!form.inquiryItems?.length ? <Field label="Product" error={errors.productName}>
          <select value={form.productName} onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value, selectedOption: undefined, unitPrice: undefined, inquiryItems: undefined }))} className="w-full rounded-md border border-black/15 bg-white px-3 py-2">
            <option value="">Choose a product</option>
            {products.map((product) => (<option key={product.id} value={product.name}>
                {product.name}
              </option>))}
          </select>
        </Field> : null}
        {!form.inquiryItems?.length ? <Field label="Quantity" error={errors.quantity}>
          <input value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} placeholder="e.g. 5,000" className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field> : null}
        <Field label="Name" error={errors.name}>
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field>
        <Field label="Company">
          <input value={form.company} onChange={(event) => updateField("company", event.target.value)} className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field>
        <Field label="Country" error={errors.country}>
          <input value={form.country} onChange={(event) => updateField("country", event.target.value)} placeholder="Country" className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field>
        <Field label="State / Province / Region">
          <input value={form.state} onChange={(event) => updateField("state", event.target.value)} placeholder="State, province, or region" className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field>
        <Field label="Postal / ZIP code">
          <input value={form.postcode} onChange={(event) => updateField("postcode", event.target.value)} className="w-full rounded-md border border-black/15 px-3 py-2"/>
        </Field>
      </div>

      <Field label="Message" className="mt-4">
        <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} rows={4} placeholder="Cup size, lid preference, artwork status, delivery suburb, and target date." className="w-full rounded-md border border-black/15 px-3 py-2"/>
      </Field>

      <Field label="Logo / artwork (optional)" error={errors.artwork} className="mt-4">
        <input type="file" accept=".ai,.eps,.pdf,.svg,.png,.jpg,.jpeg" onChange={(event) => void attachArtwork(event.target.files?.[0])} className="w-full rounded-md border border-dashed border-black/20 bg-white px-3 py-3 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-800"/>
        <span className="mt-1 block text-xs text-slate-500">Select an artwork filename, then attach the file in WhatsApp. Up to 5 MB.</span>
      </Field>

      <button type="submit" disabled={status === "sending"} className="mt-5 inline-flex items-center gap-2 rounded-full bg-eucalyptus px-5 py-3 font-semibold text-white disabled:opacity-60">
        <Send size={18}/>
        {status === "sending" ? "Sending..." : "Continue on WhatsApp"}
      </button>

      {status === "sent" && receipt ? <div role="status" className="mt-5 rounded-xl bg-white p-5"><p className="font-semibold text-eucalyptus">Your inquiry is ready. Please send it in WhatsApp.</p><p className="mt-2 text-sm">Reference: {receipt.reference}</p>{receipt.items.length ? <ul className="mt-3 space-y-2 text-sm">{receipt.items.map((item) => <li key={item.id}>{[productCode(item.productSlug), item.productName].filter(Boolean).join(" · ")} · {item.selectedOption} · {item.quantity} units</li>)}</ul> : <p className="mt-3 text-sm">{receipt.product} · {receipt.quantity} units</p>}</div> : null}
      {status === "error" ? <p className="mt-4 font-semibold text-red-700">Something went wrong. Please email raymond@mategourdwholesale.com.</p> : null}
    </form>);
}
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
function Field({ label, error, className = "", children }) {
    return (<label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm font-semibold text-red-700">{error}</span> : null}
    </label>);
}
