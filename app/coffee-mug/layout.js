import "./coffee.css";
import { InquiryListProvider, InquiryListButton } from "@/coffee/components/inquiry-list";
import Link from "next/link";
import { getProductSlugs } from "@/coffee/lib/products";
export default async function CoffeeLayout({children}) {
  return <div className="coffee-site"><InquiryListProvider availableSlugs={await getProductSlugs()}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2"><Link href="/coffee-mug" className="font-semibold text-emerald-800">Coffee Mug</Link><div className="flex items-center gap-3"><InquiryListButton /></div></div>{children}</InquiryListProvider></div>;
}
