export function optimizedImageUrl(url, width, quality = 80) {
    if (!url.includes("cdn.sanity.io/images/"))
        return url;
    const imageUrl = new URL(url);
    imageUrl.searchParams.set("w", String(width));
    imageUrl.searchParams.set("q", String(quality));
    imageUrl.searchParams.set("fit", "max");
    imageUrl.searchParams.set("auto", "format");
    return imageUrl.toString();
}
export function sanityImageSrcSet(url, quality = 78) {
    if (!url.includes("cdn.sanity.io/images/"))
        return undefined;
    const originalWidth = Number(new URL(url).pathname.match(/-(\d+)x\d+\.[a-z]+$/i)?.[1]);
    const widths = [160, 240, 360, 480, 640, 800, 960, 1200, 1600, 1800]
        .filter((width) => !originalWidth || width < originalWidth);
    if (originalWidth && originalWidth <= 1800)
        widths.push(originalWidth);
    return widths.map((width) => `${optimizedImageUrl(url, width, quality)} ${width}w`).join(", ");
}
