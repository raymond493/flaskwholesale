export function formatCurrency(amount, currency) {
    const rounded = Number(amount.toFixed(2));
    const hasCents = !Number.isInteger(rounded);
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: hasCents ? 2 : 0
    }).format(rounded);
    if (currency === "CAD" && formatted.startsWith("$")) return `C${formatted}`;
    return currency === "AUD" && formatted.startsWith("$") ? `A${formatted}` : formatted;
}
export function formatAud(amount) {
    return formatCurrency(amount, "AUD");
}
