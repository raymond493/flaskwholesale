export function getVariantPriceUsd(variant) {
    if (typeof variant.priceUsd === "number")
        return variant.priceUsd;
    const match = variant.name.match(/(?:US)?\$\s*([0-9]+(?:\.[0-9]+)?)/i);
    return match ? Number(match[1]) : undefined;
}
export function getBasePriceRangeUsd(label, variants = []) {
    const variantPrices = variants.map(getVariantPriceUsd).filter((price) => typeof price === "number");
    if (variantPrices.length) {
        return { min: Math.min(...variantPrices), max: Math.max(...variantPrices) };
    }
    const prices = Array.from(label?.matchAll(/(?:US)?\$\s*([0-9]+(?:\.[0-9]+)?)/gi) || []).map((match) => Number(match[1]));
    if (!prices.length)
        return undefined;
    return { min: Math.min(...prices), max: Math.max(...prices) };
}
export function formatUsd(price) {
    return `$${price.toFixed(2)}`;
}
export function cleanVariantName(variant) {
    return variant.name.replace(/\s*[-–—]\s*(?:US)?\$.*$/i, "").trim() || variant.size;
}
