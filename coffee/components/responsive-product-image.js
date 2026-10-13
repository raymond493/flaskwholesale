import Image from "next/image";
import { optimizedImageUrl, sanityImageSrcSet } from "@/coffee/lib/images";
// Sanity handles resizing directly; no Vercel image transformations are needed.
export function ResponsiveProductImage({ src, alt, sizes, className, priority = false, quality = 78, width = 1200, desktopOnly = false }) {
    const srcSet = sanityImageSrcSet(src, quality);
    if (!srcSet)
        return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className}/>;
    const image = <img src={desktopOnly ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" : optimizedImageUrl(src, width, quality)} srcSet={desktopOnly ? undefined : srcSet} sizes={sizes} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" className={`absolute inset-0 h-full w-full ${className || ""}`}/>;
    return desktopOnly ? <picture><source media="(min-width: 640px)" srcSet={srcSet} sizes={sizes}/>{image}</picture> : image;
}
