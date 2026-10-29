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
    const cmProducts = products.filter(p => /^CM-\d+$/i.test(productCode(p.slug || "") || ""));
    const [rows,setRows]=useState([{product:defaultProduct?.id || "",option:"",quantity:"1"}]);
    function optionsFor(p){if(!p)return [];if(productCode(p.slug)==="CM-09")return ["16oz · Straw lid","16oz · Three-lid set"];return [...new Set((p.variants||[]).map(v=>v.name||v.size).filter(Boolean))];}
    function changeRow(index,patch){setRows(current=>current.map((row,i)=>i===index?{...row,...patch}:row));}
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
            if (inquiryItems.length) setRows(inquiryItems.map(item=>({product:cmProducts.find(p=>p.slug===item.productSlug)?.id || "",option:item.selectedOption || "",quantity:String(item.quantity || 1)})));

        }
        catch {
            window.localStorage.removeItem(inquiryDraftStorageKey);
        }
        function applySelection(event) {
            const selection = {...event.detail,...resolveRfqProduct(event.detail,products)};
            const p=cmProducts.find(p=>p.slug===selection.productSlug || p.name===selection.productName);
            if(p)setRows([{product:p.id,option:selection.selectedOption||"",quantity:String(selection.quantity||1)}]);

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
        const items=rows.filter(row=>row.product).map((row,i)=>{const p=cmProducts.find(p=>p.id===row.product);return {id:`rfq-${i}`,productId:p?.id,productSlug:p?.slug,productName:p?.name,selectedOption:row.option,quantity:row.quantity.trim()?Number(row.quantity):1};});
        if(items.some(item=>!item.productSlug||!Number.isSafeInteger(item.quantity)||item.quantity<1)){setErrors({productName:"Enter a whole-number quantity above zero for selected products."});return;}
        const submission={...form,inquiryItems:items,productName:items.length?items.map(i=>i.productName).join(", "):"General inquiry",productSlug:items.length===1?items[0].productSlug:"",quantity:items.length?String(items.reduce((n,i)=>n+i.quantity,0)):"",generalInquiry:!items.length};
        const validation = validateRfq(submission);
        setErrors(validation.errors);
        if (!validation.ok) {
            return;
        }
        if(!emailReady){continueWhatsApp();return;}
        sending.current=true;setStatus("sending");setSendError("");
        if(!attempt.current)attempt.current={...submission,displayCurrency:currency,pageUrl:window.location.href,submissionId:crypto.randomUUID()};
        try{
          const response=await fetch("/api/rfq",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(attempt.current)});
          const data=await response.json();
          if(!response.ok||!data.ok)throw Error(data.error||"Unable to confirm delivery.");
          window.gtag?.("event", "generate_lead", {method:"inquiry_form"});
          setReceipt({reference:data.reference,modelSummary:data.modelSummary,items:form.inquiryItems||[],product:form.productName,quantity:form.quantity});setStatus("sent");
          window.localStorage.removeItem(inquiryDraftStorageKey);clearItems();
        }catch(error){setStatus("error");setSendError(error.message||"Unable to confirm delivery. Your details are preserved.");}
        finally{sending.current=false;}
    }
    function continueWhatsApp(){
        const message=buildRfqMessage(attempt.current||form,products,{reference:"FW-"+(attempt.current?.submissionId||crypto.randomUUID()).toUpperCase()});
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
        <div className="space-y-3 sm:col-span-2">
          <p className="font-semibold">Products & sizes (optional)</p>
          {rows.map((row, index) => {
            const product = cmProducts.find((p) => p.id === row.product);
            const options = optionsFor(product);
            return <div key={index} className="space-y-3 rounded-lg border border-black/10 bg-white p-3">
              <Field label="Product"><select value={row.product} onChange={(e) => changeRow(index, { product: e.target.value, option: "" })} className="w-full min-w-0 rounded-md border border-black/15 px-3 py-3">
                <option value="">Choose a product</option>
                {cmProducts.map((p) => <option key={p.id} value={p.id}>{productCode(p.slug || "")} · {p.name}</option>)}
              </select></Field>
              {product ? <p className="text-sm leading-relaxed text-slate-600">{productCode(product.slug || "")} · {product.name}</p> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Size / lid option"><select value={row.option || (options.length === 1 ? options[0] : "")} onChange={(e) => changeRow(index, { option: e.target.value })} className="w-full rounded-md border border-black/15 px-3 py-3">
                  <option value="">Choose an option</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select></Field>
                <Field label="Quantity"><input type="number" min="1" step="1" value={row.quantity} onChange={(e) => changeRow(index, { quantity: e.target.value })} className="w-full rounded-md border border-black/15 px-3 py-3" /></Field>
              </div>
              {rows.length > 1 ? <button type="button" onClick={() => setRows((current) => current.filter((_, i) => i !== index))} className="text-sm text-red-700">Remove</button> : null}
            </div>;
          })}
          {errors.productName ? <p role="alert" className="text-sm text-red-700">{errors.productName}</p> : null}
          <button type="button" onClick={() => setRows((current) => [...current, { product: "", option: "", quantity: "1" }])} className="rounded-full border border-eucalyptus px-4 py-2 font-semibold text-eucalyptus">+ Add another product / size</button>
        </div>
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
