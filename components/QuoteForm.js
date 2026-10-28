"use client";

import {useEffect,useRef,useState} from "react";
export default function QuoteForm() {
  const [ready,setReady]=useState(false),[status,setStatus]=useState("idle"),[notice,setNotice]=useState("");
  const attempt=useRef(null),busy=useRef(false);
  useEffect(()=>{fetch("/api/rfq").then(r=>r.json()).then(d=>setReady(d.configured===true)).catch(()=>{});},[]);
  async function submit(event) {
    event.preventDefault();
    if(busy.current||status==="sent")return;
    const data = new FormData(event.currentTarget);
    if(ready){
      if(!attempt.current)attempt.current={...Object.fromEntries(data),generalInquiry:true,pageUrl:location.href,submissionId:crypto.randomUUID()};
      busy.current=true;setStatus("sending");setNotice("");
      try{const r=await fetch("/api/rfq",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(attempt.current)});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||"Unable to confirm delivery.");window.gtag?.("event", "generate_lead", {method:"inquiry_form"});setStatus("sent");setNotice("Inquiry submitted. Reference: "+d.reference+". We will reply to your email.");}
      catch(error){setStatus("error");setNotice(error.message+" Your details are preserved.");}finally{busy.current=false;}
      return;
    }
    const lines = ["Hello FlaskWholesale, I would like a quote.", `Name: ${data.get("name") || "-"}`, `Email: ${data.get("email") || "-"}`, `Company: ${data.get("company") || "-"}`, `Quantity: ${data.get("quantity") || "-"}`, `Requirements: ${data.get("message") || "-"}`, `Page: ${location.href}`];
    location.href = `https://wa.me/8613267102135?text=${encodeURIComponent(lines.join("\n"))}`;
  }
  return <div className="quote-box"><h2>Tell us what you need</h2><p>{ready?"Send your requirements by email. We will reply to your email address.":"Submit the details below and continue the conversation in WhatsApp."}</p><form className="quote-form" onSubmit={submit}>
    <input name="name" aria-label="Your name" placeholder="Your name" required />
    <input name="email" aria-label="Email" type="email" placeholder="Email" required />
    <input name="company" aria-label="Company" placeholder="Company" />
    <input name="country" aria-label="Country" placeholder="Country" required />
    <input name="quantity" aria-label="Estimated quantity" type="number" min="1" step="1" placeholder="Estimated quantity" required />
    <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off"/></div>
    <textarea className="full" name="message" aria-label="Product requirements" rows="5" placeholder="Product, size, colour, logo and packaging requirements" required />
    <button className="button full" type="submit" disabled={status==="sending"||status==="sent"}>{status==="sending"?"Sending...":status==="sent"?"Inquiry sent":ready?"Send email inquiry":"Continue on WhatsApp"}</button>
    {ready?<a className="text-link full" href="https://wa.me/8613267102135" target="_blank" rel="noopener noreferrer">Prefer WhatsApp?</a>:null}
    {notice?<p className="full" role={status==="error"?"alert":"status"}>{notice}</p>:null}
  </form></div>;
}
