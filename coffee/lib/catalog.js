export const packagingCategories = [
    { slug: "paper-cups", label: "Paper Cups", description: "Hot drink, cold drink and ice cream paper cups." },
    { slug: "plastic-cups", label: "Plastic Cups", description: "Clear, frosted and printed cups for cold drinks." },
    { slug: "wrapping-paper", label: "Wrapping Paper", description: "Printed food wraps, tissue and presentation paper." }
];
// Stable model numbers shown before each insulated tumbler title.
const tumblerProductCodes = {
    "12oz-stainless-steel-insulated-milk-mug-with-inner-scale": "CM-01",
    "12oz-stainless-steel-insulated-coffee-mug": "CM-02",
    "12oz-stainless-steel-insulated-coffee-mug-with-handle": "CM-03",
    "25oz-large-capacity-insulated-tumbler-with-handle": "CM-14",
    "280ml-380ml-double-wall-insulated-coffee-tumbler": "CM-04",
    "12oz-20oz-leakproof-stainless-steel-coffee-tumbler": "CM-05",
    "12oz-custom-egg-shaped-stainless-steel-tumbler": "CM-06",
    "20oz-powder-coated-stainless-steel-car-tumbler": "CM-07",
    "second-generation-380ml-510ml-stainless-steel-coffee-tumbler": "CM-08",
    "16oz-stainless-steel-tumbler-with-three-interchangeable-lids": "CM-09",
    "10oz-compact-insulated-coffee-tumbler-with-slide-lid": "CM-10",
    "12oz-16oz-insulated-coffee-tumbler-with-silicone-grip": "CM-10",
    "27oz-vacuum-insulated-travel-tumbler-with-carry-handle": "CM-11",
    "12oz-egg-shaped-insulated-coffee-mug-with-handle": "CM-12",
    "12oz-slim-insulated-coffee-tumbler-with-slide-lid": "CM-13"
};
export function productCode(slug) {
    return tumblerProductCodes[slug];
}
export function catalogCategory(product) {
    const groups = product.collectionSlugs || [];
    const name = product.name.toLowerCase();
    if (groups.includes("insulated-tumblers"))
        return "insulated-tumblers";
    if (groups.includes("samples") || /^【?sample/.test(name))
        return undefined;
    if (groups.includes("cup-accessories") || /\b(sleeves?|carriers?|holders?|coasters?|straws?)\b/.test(name) || /hot cup lids/.test(name))
        return undefined;
    if (groups.some((group) => ["food-paper", "printed-food-wrapping-paper", "tissue-wrapping-food-paper", "wrapping-tissue", "packaging-paper"].includes(group)))
        return "wrapping-paper";
    if (/paper.*cups?|cups?.*paper/.test(name) || groups.includes("hot-cups") || groups.includes("ice-cream-cups"))
        return "paper-cups";
    if (groups.includes("custom-beverage-cups"))
        return "plastic-cups";
    return undefined;
}
export function displayProductName(name) {
    return name.replace(/^(Wholesale |Custom |Second-Generation )+/g, "").replace(/ with Logo.*$/i, "");
}
export function catalogVariants(product) {
    if ((product.variants || []).some((variant) => variant.material !== "Food-grade paper or plastic" || variant.wallType !== "Custom"))
        return product.variants;
    const size = product.name.match(/\b\d+(?:\.\d+)?\s*(?:oz|ml)\b/i)?.[0] || "Standard";
    return [{ name: size, size, material: "Confirm specification", wallType: "Custom", moq: product.moq }];
}
