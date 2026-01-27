import { DateInput, Input, Select } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useBankingStore } from '@/store';
import { Filter, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export const TransactionFilters = () => {
  const filters = useBankingStore((state) => state.filters);
  const setFilters = useBankingStore((state) => state.setFilters);
  const clearFilters = useBankingStore((state) => state.clearFilters);
  const [isOpen, setIsOpen] = useState(false);
  const hasInitialized = useRef(false);

  // Local state for immediate input updates (not debounced)
  const [descriptionInput, setDescriptionInput] = useState(filters.description);
  const debouncedDescription = useDebounce(descriptionInput, 300);

  // Update store when debounced description changes
  useEffect(() => {
    if (debouncedDescription !== filters.description) {
      setFilters({ description: debouncedDescription });
    }
  }, [debouncedDescription, filters.description, setFilters]);

  // Handle clear filters - reset local state too
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setDescriptionInput('');
  }, [clearFilters]);

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ dateFrom: e.target.value || null });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ dateTo: e.target.value || null });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ type: e.target.value as 'All' | 'Deposit' | 'Withdrawal' });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.description ||
    filters.type !== 'All';

  // Auto-open if filters are active on initial render
  useEffect(() => {
    if (!hasInitialized.current && hasActiveFilters) {
      setIsOpen(true);
      hasInitialized.current = true;
    }
  }, [hasActiveFilters]);

  return (
    <div className="mb-4 sm:mb-6 lg:mb-0">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text hover:bg-background-secondary transition-colors"
          aria-label={isOpen ? 'Hide filters' : 'Show filters'}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {[
                filters.dateFrom && 1,
                filters.dateTo && 1,
                filters.description && 1,
                filters.type !== 'All' && 1,
              ].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-background-secondary rounded-xl p-3 sm:p-4 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <DateInput
              label="From Date"
              value={filters.dateFrom || ''}
              onChange={handleDateFromChange}
            />

            <DateInput
              label="To Date"
              value={filters.dateTo || ''}
              onChange={handleDateToChange}
            />

            <Input
              label="Description"
              placeholder="Search descriptions..."
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
            />

            <Select
              label="Type"
              options={[
                { value: 'All', label: 'All Transactions' },
                { value: 'Deposit', label: 'Only Deposits' },
                { value: 'Withdrawal', label: 'Only Withdrawals' },
              ]}
              value={filters.type}
              onChange={handleTypeChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
