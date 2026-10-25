"use client";
import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { validateRfq } from "@/coffee/lib/rfq";
import { inquiryDraftStorageKey, inquiryQuantityTotal } from "@/coffee/lib/inquiry";
import { useInquiryList } from "@/coffee/components/inquiry-list";
import { productCode } from "@/coffee/lib/catalog";
import { useCurrency } from "@/coffee/components/currency-provider";
import { buildRfqMessage, resolveRfqProduct } from "@/coffee/lib/rfq-message";
const emptyForm = {
    productName: "",
    productSlug: "",
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
        productName: defaultProduct?.name || "",
        productSlug: defaultProduct?.slug || ""
    });
    const [status, setStatus] = useState("idle");
    const [receipt, setReceipt] = useState(null);
    const [errors, setErrors] = useState({});
    const [emailReady,setEmailReady]=useState(false);
    const [sendError,setSendError]=useState("");
    const sending=useRef(false);
    const attempt=useRef(null);
    useEffect(() => {
        fetch("/api/rfq").then(r=>r.json()).then(data=>setEmailReady(data.configured===true)).catch(()=>{});
        try {
            const saved = window.localStorage.getItem(inquiryDraftStorageKey);
            const stored = saved ? JSON.parse(saved) : [];
            const inquiryItems = Array.isArray(stored) ? stored.map(item=>({...item,...resolveRfqProduct(item,products)})).filter(item=>item.found) : [];
            if(saved) window.localStorage.setItem(inquiryDraftStorageKey,JSON.stringify(inquiryItems));
            if (inquiryItems.length) {
                setForm((current) => ({
                    ...current,
                    productName: inquiryItems.map((item) => item.productName).join(", "),
                    productSlug: "",
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
            const selection = {...event.detail,...resolveRfqProduct(event.detail,products)};
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
        if(sending.current||status==="sent")return;
        const validation = validateRfq(form);
        setErrors(validation.errors);
        if (!validation.ok) {
            return;
        }
        if(!emailReady){continueWhatsApp();return;}
        sending.current=true;setStatus("sending");setSendError("");
        if(!attempt.current)attempt.current={...form,displayCurrency:currency,pageUrl:window.location.href,submissionId:crypto.randomUUID()};
        try{
          const response=await fetch("/api/rfq",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(attempt.current)});
          const data=await response.json();
          if(!response.ok||!data.ok)throw Error(data.error||"Unable to confirm delivery.");
          setReceipt({reference:data.reference,modelSummary:data.modelSummary,items:form.inquiryItems||[],product:form.productName,quantity:form.quantity});setStatus("sent");
          window.localStorage.removeItem(inquiryDraftStorageKey);clearItems();
        }catch(error){setStatus("error");setSendError(error.message||"Unable to confirm delivery. Your details are preserved.");}
        finally{sending.current=false;}
    }
    function continueWhatsApp(){
        const message=buildRfqMessage(form,products,{reference:"FW-"+(attempt.current?.submissionId||crypto.randomUUID()).toUpperCase()});
        window.open("https://wa.me/8613267102135?text="+encodeURIComponent(message.text),"_blank","noopener,noreferrer");
    }
    async function attachArtwork(file) {
        if (!file) {
            setForm((current) => ({ ...current, artwork: undefined }));
            setErrors(current=>({...current,artwork:undefined}));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setForm(current=>({...current,artwork:undefined}));
            setErrors((current) => ({ ...current, artwork: "Artwork must be 2 MB or smaller." }));
            return;
        }
        try{const content=await fileToBase64(file);
        setForm((current) => ({ ...current, artwork: { name: file.name.replace(/[^\w .()-]/g,"_"), type: file.type || "application/octet-stream", content } }));
        setErrors((current) => ({ ...current, artwork: undefined }));
        }catch{setErrors(current=>({...current,artwork:"Could not read artwork. Please select it again."}));}
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
          <select name="productSlug" value={form.productSlug || ""} onChange={(event) => {const product=products.find(p=>p.slug===event.target.value);setForm((current)=>({...current,productName:product?.name||"",productSlug:product?.slug||"",selectedOption:undefined,unitPrice:undefined,inquiryItems:undefined}));}} className="w-full rounded-md border border-black/15 bg-white px-3 py-2">
            <option value="">Choose a product</option>
            {products.map((product) => (<option key={product.id} value={product.slug}>
                {[productCode(product.slug),product.name].filter(Boolean).join(" ")}
              </option>))}
          </select>
        </Field> : null}
        {!form.inquiryItems?.length ? <Field label="Quantity" error={errors.quantity}>
          <input value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} className="w-full rounded-md border border-black/15 px-3 py-2"/>
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
        <span className="mt-1 block text-xs text-slate-500">{emailReady?"Artwork is included with your email inquiry. Up to 2 MB.":"Attach your artwork in WhatsApp. Up to 2 MB."}</span>
      </Field>

      <div className="hidden" aria-hidden="true"><label>Leave empty<input tabIndex={-1} autoComplete="off" value={form.website||""} onChange={event=>updateField("website",event.target.value)}/></label></div>
      <button type="submit" disabled={status === "sending"||status==="sent"||Boolean(errors.artwork)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-eucalyptus px-5 py-3 font-semibold text-white disabled:opacity-60">
        <Send size={18}/>
        {status === "sending" ? "Sending..." : status==="sent"?"Inquiry sent":status==="error"?"Retry original inquiry":emailReady?"Send email inquiry":"Continue on WhatsApp"}
      </button>

      {emailReady?<button type="button" onClick={continueWhatsApp} className="ml-4 mt-5 text-sm underline">Prefer WhatsApp?</button>:null}
      {status === "sent" && receipt ? <div role="status" className="mt-5 rounded-xl bg-white p-5"><p className="font-semibold text-eucalyptus">Your email inquiry has been submitted. We will reply to your email.</p><p className="mt-2 text-sm">Reference: {receipt.reference}<br/>Model / SKU: {receipt.modelSummary}</p></div> : null}
      {status === "error" ? <p role="alert" className="mt-4 font-semibold text-red-700">{sendError} Your form has not been cleared.</p> : null}
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
