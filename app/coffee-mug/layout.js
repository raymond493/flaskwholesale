import "./coffee.css";
import { CurrencyProvider } from "@/coffee/components/currency-provider";
import { InquiryListProvider, InquiryListButton } from "@/coffee/components/inquiry-list";
import Link from "next/link";
import { getProductSlugs } from "@/coffee/lib/products";
export default async function CoffeeLayout({children}) {
  return <div className="coffee-site"><CurrencyProvider><InquiryListProvider availableSlugs={await getProductSlugs()}><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2"><Link href="/coffee-mug" className="font-semibold text-emerald-800">Coffee Mug</Link><InquiryListButton /></div>{children}</InquiryListProvider></CurrencyProvider></div>;
}
