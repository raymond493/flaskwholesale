import { RfqForm } from "@/coffee/components/rfq-form";
import { getProductOptions } from "@/coffee/lib/products";
export const revalidate = 3600;
export const metadata = {title:"Coffee Mug Wholesale Quote",robots:{index:false,follow:true}};
export default async function QuotePage() {return <section className="mx-auto max-w-4xl px-4 py-12"><RfqForm products={await getProductOptions()}/></section>;}
