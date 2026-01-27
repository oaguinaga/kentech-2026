import { useCurrencyConversion } from '@/hooks';
import { Select } from '@/components/ui';
import type { CurrencyCode } from '@/hooks';

export const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency, isLoading, error, refreshRates } = useCurrencyConversion();

  const currencyOptions: Array<{ value: CurrencyCode; label: string }> = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'KES', label: 'KES (KSh)' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Select
        label="Currency"
        options={currencyOptions}
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
        className="w-32"
        disabled={isLoading}
      />
      {error && (
        <button
          onClick={refreshRates}
          className="text-xs text-error hover:underline"
          title="Click to retry"
        >
          Error loading rates
        </button>
      )}
      {isLoading && (
        <span className="text-xs text-text-secondary">Loading rates...</span>
      )}
    </div>
  );
};

