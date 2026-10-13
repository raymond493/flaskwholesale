export const inquiryStorageKey = "flaskwholesale-bulk-inquiry";
export const inquiryDraftStorageKey = "flaskwholesale-bulk-inquiry-draft";
export function inquiryEstimatedTotal(items) {
    return items.reduce((sum, item) => sum + (item.unitPriceUsd || 0) * item.quantity, 0);
}
export function inquiryQuantityTotal(items) {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}
