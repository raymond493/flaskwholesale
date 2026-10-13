export const supportedCurrencies = ["USD", "EUR", "AUD"];
export const fallbackCurrencyRates = {
    AUD: 1,
    USD: 0.6939,
    EUR: 0.60702
};
const eurozoneCountries = new Set([
    "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV",
    "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"
]);
export function isSupportedCurrency(value) {
    return supportedCurrencies.includes(value);
}
export function currencyForCountry(countryCode) {
    const country = countryCode.trim().toUpperCase();
    if (country === "AU")
        return "AUD";
    if (eurozoneCountries.has(country))
        return "EUR";
    return "USD";
}
export function convertFromAud(amountAud, currency, rates) {
    return Number((amountAud * rates[currency]).toFixed(2));
}
export function convertFromUsd(amountUsd, currency, rates) {
    return Number(((amountUsd / rates.USD) * rates[currency]).toFixed(2));
}
