"use client";
import { useCurrency } from "./currency-provider";
export function CurrencyAmount({ amountAud }) {
    const { formatAudAmount } = useCurrency();
    return <>{formatAudAmount(amountAud)}</>;
}
export function UsdCurrencyAmount({ amountUsd }) {
    const { formatUsdAmount } = useCurrency();
    return <>{formatUsdAmount(amountUsd)}</>;
}
export function UsdCurrencyRange({ minUsd, maxUsd }) {
    const { formatUsdAmount } = useCurrency();
    return <>{minUsd === maxUsd ? formatUsdAmount(minUsd) : `${formatUsdAmount(minUsd)} – ${formatUsdAmount(maxUsd)}`}</>;
}
