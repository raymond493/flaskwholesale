import "./coffee.css";
import { CurrencyProvider } from "@/coffee/components/currency-provider";
import { InquiryListProvider, InquiryListButton } from "@/coffee/components/inquiry-list";
import Link from "next/link";
export default function CoffeeLayout({children}) {
  return <div className="coffee-site"><CurrencyProvider><InquiryListProvider><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2"><Link href="/coffee-mug" className="font-semibold text-emerald-800">Coffee Mug</Link><InquiryListButton /></div>{children}</InquiryListProvider></CurrencyProvider></div>;
}
