export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", locale: "ar-AE" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", locale: "ar-SA" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", locale: "es-MX" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/** Indicative fallback rates (1 USD = x). Live rates are fetched from /api/rates when available. */
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  TRY: 43.2,
  CAD: 1.38,
  AUD: 1.54,
  AED: 3.67,
  SAR: 3.75,
  JPY: 151,
  KRW: 1430,
  INR: 86,
  BRL: 5.7,
  MXN: 18.4,
  CHF: 0.87,
  SGD: 1.33,
};

export type RateTable = Record<string, number>;

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value);
}

export function getCurrencyMeta(code: CurrencyCode) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

const ZERO_DECIMAL = new Set(["JPY", "KRW"]);

export function convertCents(cents: number, currency: CurrencyCode, rates: RateTable): number {
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
  return (cents / 100) * rate;
}

export function formatMoney(
  cents: number,
  currency: CurrencyCode = "USD",
  rates: RateTable = FALLBACK_RATES,
): string {
  const meta = getCurrencyMeta(currency);
  const amount = convertCents(cents, currency, rates);
  const digits = ZERO_DECIMAL.has(currency) ? 0 : 2;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${meta.symbol}${amount.toFixed(digits)}`;
  }
}

export function formatUsd(cents: number): string {
  return formatMoney(cents, "USD", FALLBACK_RATES);
}
