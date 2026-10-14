import { ProductCard } from "@/coffee/components/product-card";

export function CollectionProducts({ products }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index === 0} />
      ))}
    </div>
  );
}
