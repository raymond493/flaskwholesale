import { optimizedImageUrl, sanityImageSrcSet } from "@/coffee/lib/images";

// Let the browser select the right CDN size without using Vercel transforms.
export default function SanityImage({src,alt="",width,height,fill=false,sizes="100vw",priority=false,quality=80,className,style,loading}) {
  return <img src={optimizedImageUrl(src, width || 1200, quality)} srcSet={sanityImageSrcSet(src, quality)} sizes={sizes} alt={alt} width={fill ? undefined : width} height={fill ? undefined : height} className={className} loading={loading || (priority ? "eager" : "lazy")} fetchPriority={priority ? "high" : "auto"} decoding="async" style={fill ? {position:"absolute",inset:0,width:"100%",height:"100%",...style} : style}/>;
}
