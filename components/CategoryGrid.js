import Image from "@/components/SanityImage";
import Link from "next/link";

export default function CategoryGrid({ items, compact = false }) {
  return <div className={`category-grid ${compact ? "compact" : ""}`}>
    {items.map((item) => <Link className="category-card" href={item.href} prefetch={false} key={item.slug}>
      <div className="category-card-image"><Image src={item.image} alt={item.imageAlt || item.title} fill style={item.imageFit ? {objectFit:item.imageFit} : undefined} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" /></div>
      <div className="category-copy"><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>
    </Link>)}
  </div>;
}
