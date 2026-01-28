import { CURRENCY_SYMBOL } from '@/constants';
import type { CurrencyCode } from '@/hooks';
import { useCurrencyConversion, useOnClickOutside } from '@/hooks';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';

export const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency, isLoading, error, refreshRates } = useCurrencyConversion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencyOptions: Array<{ value: CurrencyCode; label: string; symbol: string }> = [
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'GBP', label: 'GBP', symbol: '£' },
    { value: 'KES', label: 'KES', symbol: 'KSh' },
  ];

  const currentCurrency = currencyOptions.find((c) => c.value === selectedCurrency) || currencyOptions[0]!;
  const currentSymbol = CURRENCY_SYMBOL[selectedCurrency] || currentCurrency.symbol;

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const handleSelect = (currency: CurrencyCode) => {
    setSelectedCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background hover:bg-background-secondary border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select currency"
        title="Select currency"
      >
        <span className="text-sm font-medium text-text">{currentSymbol}</span>
        <span className="text-xs text-text-secondary">{currentCurrency.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-background-secondary border border-border rounded-lg shadow-lg z-dropdown min-w-[120px]">
          <div className="py-1">
            {currencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-background transition-colors flex items-center gap-2 ${
                  selectedCurrency === option.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text'
                }`}
              >
                <span className="font-medium">{option.symbol}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {error && (
            <div className="border-t border-border px-3 py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  refreshRates();
                }}
                className="flex items-center gap-1.5 text-xs text-error hover:text-error/80 transition-colors w-full"
                title="Click to retry"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry rates</span>
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading && !isOpen && (
        <div className="absolute -bottom-5 right-0 text-xs text-text-secondary whitespace-nowrap">
          Loading rates...
        </div>
      )}
    </div>
  );
};

