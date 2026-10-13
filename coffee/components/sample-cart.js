"use client";
import { useInquiryList } from "./inquiry-list";
export function AddSampleButton({product}) {
  const {addItem}=useInquiryList();
  return <button type="button" className="rounded-full border border-emerald-800 px-5 py-3 font-semibold text-emerald-800" onClick={()=>addItem({id:product.slug+"::sample",productId:product.id,productSlug:product.slug,productName:product.name,imageUrl:product.imageUrl,selectedOption:"Sample request",unitPriceLabel:"Sample price on request",quantity:1,moq:1})}>Request a sample</button>;
}
