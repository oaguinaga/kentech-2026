/**
 * Currency constants for the banking dashboard
 */
export const DEFAULT_CURRENCY = 'EUR' as const;

export const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  KES: 'KSh',
} as const;

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  return CURRENCY_SYMBOL[currency] ?? currency;
}

