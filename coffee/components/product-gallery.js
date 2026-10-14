"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { optimizedImageUrl } from "@/coffee/lib/images";
import { ResponsiveProductImage } from "./responsive-product-image";
import { productGalleryMedia } from "@/coffee/lib/product-media";
export function ProductGallery({ images, videoUrls = [], productName }) {
    const [active, setActive] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const touchStart = useRef(null);
    const swiped = useRef(false);
    const media = useMemo(() => productGalleryMedia(images, videoUrls), [images, videoUrls]);
    const current = media[active] || media[0];
    useEffect(() => {
        function showColor(event) {
            const detail = event.detail;
            if (detail.productName !== productName)
                return;
            let match = -1;
            media.forEach((entry, index) => {
                if (entry.type === "image" && entry.image.alt?.toLowerCase().startsWith(detail.color.toLowerCase() + " "))
                    match = index;
            });
            if (match >= 0)
                setActive(match);
        }
        document.addEventListener("flaskwholesale:product-colour", showColor);
        return () => document.removeEventListener("flaskwholesale:product-colour", showColor);
    }, [media, productName]);
    useEffect(() => {
        if (!zoomed)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const close = (event) => event.key === "Escape" && setZoomed(false);
        window.addEventListener("keydown", close);
        return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", close); };
    }, [zoomed]);
    function move(offset) {
        setActive((index) => (index + offset + media.length) % media.length);
    }
    return (<div className="min-w-0 w-full">
      <div className="group relative aspect-square w-full touch-pan-y overflow-hidden rounded-lg bg-[#f7f7f7]" onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; swiped.current = false; }} onTouchEnd={(event) => {
            if (!touchStart.current || current?.type === "video")
                return;
            const dx = event.changedTouches[0].clientX - touchStart.current.x;
            const dy = event.changedTouches[0].clientY - touchStart.current.y;
            if (media.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                swiped.current = true;
                move(dx < 0 ? 1 : -1);
            }
            touchStart.current = null;
        }}>
        {current?.type === "video" ? (<div className="flex h-full items-center justify-center bg-slate-950 p-4">
            {current.provider === "sanity" ? <video key={current.url} src={current.url} poster={current.poster ? optimizedImageUrl(current.poster,800,78) : undefined} controls preload="none" playsInline aria-label={productName + " product video"} className="h-full w-full rounded-md object-contain"/> : <iframe key={current.url} src={youtubeEmbedUrl(current.videoId)} title={productName + " product video"} className="aspect-[9/16] h-full max-h-full w-auto max-w-full rounded-md" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>}
          </div>) : current ? (<>
            <button type="button" onClick={() => { if (!swiped.current)
            setZoomed(true); swiped.current = false; }} className="absolute inset-0 z-10 cursor-zoom-in" aria-label="Open larger product image"/>
            <ResponsiveProductImage src={current.image.imageUrl} alt={current.image.alt || productName} priority sizes="(min-width: 1280px) 600px, (min-width: 768px) calc(50vw - 48px), calc(100vw - 32px)" quality={78} className="object-contain"/>
          </>) : null}
        {media.length > 1 ? (<>
            <GalleryArrow label="Previous media" side="left" onClick={() => move(-1)}><ChevronLeft size={22}/></GalleryArrow>
            <GalleryArrow label="Next media" side="right" onClick={() => move(1)}><ChevronRight size={22}/></GalleryArrow>
          </>) : null}
      </div>

      {media.length > 1 ? (<div className="mt-2 flex w-full max-w-full gap-2 overflow-x-auto pb-2 sm:mt-3 sm:gap-3" aria-label="Product media">
          {media.map((entry, index) => (<button type="button" key={(entry.type === "image" ? entry.image.imageUrl : entry.url) + "-" + index} onClick={() => { setActive(index); setZoomed(false); }} aria-label={entry.type === "video" ? "Play product video" : "View product image " + (index + 1)} className={"relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 bg-[#f7f7f7] sm:size-20 " + (index === active ? "border-emerald-700" : "border-transparent")}>
              {entry.type === "video" ? (<span className="relative h-full w-full overflow-hidden bg-[#f7f7f7]">
                  {entry.provider === "youtube" || entry.poster ? <Image src={entry.provider === "sanity" ? optimizedImageUrl(entry.poster,180,72) : youtubeThumbnailUrl(entry.videoId)} alt={productName + " video preview"} fill unoptimized sizes="80px" className="object-cover"/> : null}
                  <span className="absolute inset-0 bg-black/15"/>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-10 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-md">
                      <Play size={20} fill="currentColor" className="ml-0.5"/>
                    </span>
                  </span>
                </span>) : (<Image src={optimizedImageUrl(entry.image.imageUrl, 180, 72)} alt={entry.image.alt || productName + " " + (index + 1)} fill unoptimized sizes="80px" className="object-cover"/>)}
            </button>))}
        </div>) : null}
      {media.length > 1 ? <p className="mt-1 text-center text-xs text-slate-500 sm:hidden" aria-live="polite">{active + 1} / {media.length} · Swipe to explore</p> : null}

      {zoomed && current?.type === "image" ? (<div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="Product image viewer">
          <button type="button" onClick={() => setZoomed(false)} className="absolute right-4 top-4 z-20 rounded-full bg-white p-3 text-slate-950" aria-label="Close image viewer"><X size={24}/></button>
          <div className="relative h-[88vh] w-[92vw]">
            <Image src={optimizedImageUrl(current.image.imageUrl, 1800, 88)} alt={current.image.alt || productName} fill unoptimized sizes="92vw" className="object-contain" priority/>
          </div>
          {media.length > 1 ? (<>
              <GalleryArrow label="Previous media" side="left" onClick={() => move(-1)} fixed><ChevronLeft size={26}/></GalleryArrow>
              <GalleryArrow label="Next media" side="right" onClick={() => move(1)} fixed><ChevronRight size={26}/></GalleryArrow>
            </>) : null}
        </div>) : null}
    </div>);
}
function youtubeEmbedUrl(videoId) {
    return "https://www.youtube-nocookie.com/embed/" + videoId + "?rel=0";
}
function youtubeThumbnailUrl(videoId) {
    return "https://i.ytimg.com/vi/" + videoId + "/mqdefault.jpg";
}
function GalleryArrow({ label, side, onClick, fixed = false, children }) {
    return (<button type="button" onClick={(event) => { event.stopPropagation(); onClick(); }} aria-label={label} className={(fixed ? "fixed" : "absolute") + " top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-slate-900 shadow-md " + (side === "left" ? "left-4" : "right-4")}>
      {children}
    </button>);
}
