import { Button, DateInput, Input, Select } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useBankingStore } from '@/store';
import { useCallback, useEffect, useState } from 'react';

export const TransactionFilters = () => {
  const filters = useBankingStore((state) => state.filters);
  const setFilters = useBankingStore((state) => state.setFilters);
  const clearFilters = useBankingStore((state) => state.clearFilters);

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

  return (
    <div className="bg-background-secondary rounded-lg p-4 border border-border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
