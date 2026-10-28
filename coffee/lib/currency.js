export const supportedCurrencies = ["USD", "EUR", "AUD", "GBP", "CAD"];
export const fallbackCurrencyRates = {
    AUD: 1,
    USD: 0.6939,
    EUR: 0.60702,
    GBP: 0.5226,
    CAD: 0.97207
};
export function completeCurrencyRates(rates = {}) {
    return Object.fromEntries(supportedCurrencies.map(code=>[code,code === "AUD" ? 1 : typeof rates?.[code] === "number" && Number.isFinite(rates[code]) && rates[code] > 0 ? rates[code] : fallbackCurrencyRates[code]]));
}
export function preferredCurrency(search,saved) {
    const linked = new URLSearchParams(search).get("currency")?.toUpperCase();
    return isSupportedCurrency(linked) ? linked : isSupportedCurrency(saved) ? saved : "USD";
}
const eurozoneCountries = new Set([
    "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV",
    "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"
]);
export function isSupportedCurrency(value) {
    return supportedCurrencies.includes(value);
}
export function currencyForCountry(countryCode) {
    const country = countryCode.trim().toUpperCase();
    if (country === "CA") return "CAD";
    if (country === "AU")
        return "AUD";
    if (eurozoneCountries.has(country))
        return "EUR";
    return "USD";
}
export function convertFromAud(amountAud, currency, rates) {
    return Number((amountAud * completeCurrencyRates(rates)[currency]).toFixed(2));
}
export function convertFromUsd(amountUsd, currency, rates) {
    const complete = completeCurrencyRates(rates);
    return Number(((amountUsd / complete.USD) * complete[currency]).toFixed(2));
}
