import { InsulatedTumblersView } from "@/coffee/components/insulated-tumblers-view";
import { getProductsByCollection, getInsulatedTumblerCustomization } from "@/coffee/lib/products";
export const revalidate = 3600;
export const metadata = {title:"Coffee Mug",description:"Wholesale coffee mugs and insulated tumblers. Custom sizes, colours, logo printing and packaging.",alternates:{canonical:"/coffee-mug"}};
export default async function CoffeeMugPage() {
  const [products,customization]=await Promise.all([getProductsByCollection(),getInsulatedTumblerCustomization()]);
  return <InsulatedTumblersView products={products} customization={customization}/>;
}
