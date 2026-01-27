import { DEFAULT_CURRENCY } from '@/constants';
import { convertCurrency, getExchangeRates, type ExchangeRates } from '@/services';
import { useBankingStore } from '@/store';
import { useCallback, useEffect, useState } from 'react';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'KES';

export interface UseCurrencyConversionReturn {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  rates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  convert: (amountEUR: number) => number;
  refreshRates: () => Promise<void>;
}

/**
 * Hook to manage currency conversion
 * Uses Zustand store for selectedCurrency to ensure all components share the same state
 */
export function useCurrencyConversion(): UseCurrencyConversionReturn {
  const selectedCurrency = useBankingStore((state) => state.selectedCurrency);
  const setSelectedCurrencyStore = useBankingStore((state) => state.setSelectedCurrency);
  
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const exchangeRates = await getExchangeRates();
      setRates(exchangeRates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load exchange rates';
      setError(errorMessage);
      console.error('Error loading exchange rates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const handleSetCurrency = useCallback((currency: CurrencyCode) => {
    setSelectedCurrencyStore(currency);
  }, [setSelectedCurrencyStore]);

  const convert = useCallback((amountEUR: number): number => {
    if (!rates || selectedCurrency === DEFAULT_CURRENCY) {
      return amountEUR;
    }
    return convertCurrency(amountEUR, selectedCurrency, rates);
  }, [rates, selectedCurrency]);

  return {
    selectedCurrency,
    setSelectedCurrency: handleSetCurrency,
    rates,
    isLoading,
    error,
    convert,
    refreshRates: loadRates,
  };
}

