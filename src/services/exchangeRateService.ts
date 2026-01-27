/**
 * Exchange rate service using exchangerate-api.io (free, no API key required)
 * Alternative: Can be swapped with other APIs like fixer.io, exchangerate-api.com, etc.
 */

export interface ExchangeRates {
  [currency: string]: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'exchange-rates-cache';
const CACHE_TIMESTAMP_KEY = 'exchange-rates-timestamp';

/**
 * Get cached exchange rates if still valid
 */
function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached) as ExchangeRates;
      }
    }
  } catch (error) {
    console.error('Error reading cached exchange rates:', error);
  }
  return null;
}

/**
 * Cache exchange rates
 */
function cacheRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching exchange rates:', error);
  }
}

/**
 * Fetch exchange rates from API
 * Using exchangerate-api.io (free, no API key required)
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Using exchangerate-api.io free endpoint (EUR as base)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return rates object (EUR is base, so rate is 1)
    const rates: ExchangeRates = {
      EUR: 1,
      ...data.rates,
    };
    
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return default rates (EUR = 1, others as fallback)
    return {
      EUR: 1,
      USD: 1.08, // Approximate fallback
      GBP: 0.85,
      KES: 140,
    };
  }
}

/**
 * Get exchange rates (from cache or API)
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Try cache first
  const cached = getCachedRates();
  if (cached) {
    return cached;
  }
  
  // Fetch from API
  const rates = await fetchExchangeRates();
  cacheRates(rates);
  
  return rates;
}

/**
 * Convert amount from EUR to target currency
 */
export function convertCurrency(
  amountEUR: number,
  targetCurrency: string,
  rates: ExchangeRates
): number {
  if (targetCurrency === 'EUR') {
    return amountEUR;
  }
  
  const rate = rates[targetCurrency];
  if (!rate) {
    console.warn(`Exchange rate not found for ${targetCurrency}, using EUR`);
    return amountEUR;
  }
  
  return amountEUR * rate;
}

/**
 * Get exchange rate for a currency
 */
export function getExchangeRate(currency: string, rates: ExchangeRates): number {
  if (currency === 'EUR') {
    return 1;
  }
  return rates[currency] ?? 1;
}

