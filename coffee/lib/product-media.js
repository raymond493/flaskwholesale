export function productVideo(url, poster) {
  if (typeof url !== "string") return null;
  const videoId = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([\w-]{11})/)?.[1];
  if (videoId) return { type:"video", provider:"youtube", url, videoId };
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && parsed.hostname === "cdn.sanity.io" && /^\/files\/[^/]+\/[^/]+\/[^/]+\.(mp4|webm|m4v|mov)$/i.test(parsed.pathname)) {
      return { type:"video", provider:"sanity", url, poster };
    }
  } catch { /* Invalid entries do not become gallery media. */ }
  return null;
}

export function productGalleryMedia(images, videoUrls, videoPosterUrl) {
  const entries = images.map(image=>({type:"image",image}));
  const videos = (videoUrls ?? []).flatMap(url=>{
    const video=productVideo(url,videoPosterUrl || images[0]?.imageUrl);
    return video ? [video] : [];
  });
  entries.splice(Math.min(1,entries.length),0,...videos);
  return entries;
}
