import { useCurrencyConversion } from '@/hooks';
import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { useMemo } from 'react';
import { PaginationControls } from './PaginationControls';
import { TransactionListItem } from './TransactionListItem';

export type TransactionListProps = {
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onReuse?: (transaction: Transaction) => void;
};

const TRANSACTIONS_PER_PAGE = 20;

export const TransactionList = ({
  onEdit,
  onDelete,
  onReuse,
}: TransactionListProps) => {
  // Get raw state values
  const transactions = useBankingStore((state) => state.transactions);
  const filters = useBankingStore((state) => state.filters);
  const currentPage = useBankingStore((state) => state.currentPage);
  const setCurrentPage = useBankingStore((state) => state.setCurrentPage);
  const isBalanceVisible = useBankingStore((state) => state.isBalanceVisible);
  const { selectedCurrency, convert } = useCurrencyConversion();

  // Compute filtered and paginated transactions in the component
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo!);
    }

    // Filter by description (case-insensitive)
    if (filters.description.trim()) {
      const searchTerm = filters.description.toLowerCase().trim();
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by type
    if (filters.type !== 'All') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Sort by date (newest first), then by createdAt for same date
    filtered.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date); // Newest first
      }
      return b.createdAt - a.createdAt; // Newest first for same date
    });

    return filtered;
  }, [transactions, filters]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE) || 1;
  }, [filteredTransactions.length]);

  const filteredCount = filteredTransactions.length;

  if (paginatedTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-text mb-1">No transactions</h3>
        <p className="text-sm text-text-secondary">
          Get started by adding your first transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Latest Transactions</h2>
        {filteredCount > 0 && (
          <span className="text-sm text-text-secondary">
            {filteredCount} {filteredCount === 1 ? 'transaction' : 'transactions'}
          </span>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-3 sm:hidden">
        {paginatedTransactions.map((transaction) => (
          <TransactionListItem
            key={transaction.id}
            variant="mobile"
            transaction={transaction}
            isBalanceVisible={isBalanceVisible}
            selectedCurrency={selectedCurrency}
            convert={convert}
            onEdit={onEdit}
            onReuse={onReuse}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-secondary">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {paginatedTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                variant="desktop"
                transaction={transaction}
                isBalanceVisible={isBalanceVisible}
                selectedCurrency={selectedCurrency}
                convert={convert}
                onEdit={onEdit}
                onReuse={onReuse}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        filteredCount={filteredCount}
        pageSize={TRANSACTIONS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

