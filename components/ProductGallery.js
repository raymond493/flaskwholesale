"use client";

import Image from "@/components/SanityImage";
import { useRef, useState } from "react";

export default function ProductGallery({ product }) {
  const images = [
    { url: product.image, alt: product.imageAlt || product.title },
    ...(product.gallery || []),
  ].filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);
  const [active, setActive] = useState(0);
  const touchStart = useRef(null);
  const move = (offset) => setActive(index=>(index + offset + images.length) % images.length);
  const selected = images[active] || images[0];

  return <div className="product-gallery">
    <div className="product-main-image" onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};}} onTouchEnd={event=>{
      if(!touchStart.current || images.length < 2) return;
      const dx=event.changedTouches[0].clientX-touchStart.current.x;
      const dy=event.changedTouches[0].clientY-touchStart.current.y;
      if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) move(dx<0?1:-1);
      touchStart.current=null;
    }}>
      <Image
        src={selected.url}
        alt={selected.alt || product.title}
        width={1200}
        height={1200}
        priority
        sizes="(max-width: 900px) 100vw, 50vw"
      />
      {images.length>1 && <><button className="product-gallery-arrow previous" type="button" aria-label="Previous product image" onClick={()=>move(-1)}>‹</button><button className="product-gallery-arrow next" type="button" aria-label="Next product image" onClick={()=>move(1)}>›</button></>}
    </div>
    {images.length > 1 && <div className="product-thumbnails" aria-label="Product images">
      {images.map((image, index) => <button
        className={index === active ? "active" : ""}
        type="button"
        key={image.url}
        onClick={() => setActive(index)}
        aria-label={`View image ${index + 1} of ${images.length}`}
        aria-pressed={index === active}
      >
        <Image src={image.url} alt={image.alt || product.title} width={180} height={180} sizes="82px" quality={72} />
      </button>)}
    </div>}
    {images.length>1 && <p className="product-image-count" aria-live="polite">{active+1} / {images.length} · Swipe to explore</p>}
  </div>;
}
