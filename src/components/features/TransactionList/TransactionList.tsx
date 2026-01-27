import { Button } from '@/components/ui';
import { useCurrencyConversion } from '@/hooks';
import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate, getAmountColorClass } from '@/utils';
import { ArrowDownCircle, ArrowUpCircle, Copy, Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

export interface TransactionListProps {
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onReuse?: (transaction: Transaction) => void;
}

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
        {paginatedTransactions.map((transaction) => {
          const isIncome = transaction.amount > 0;
          const Icon = isIncome ? ArrowDownCircle : ArrowUpCircle;
          
          return (
            <div
              key={transaction.id}
              className="bg-background rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-income/10' : 'bg-expense/10'}`}>
                  <Icon className={`w-5 h-5 ${isIncome ? 'text-income' : 'text-expense'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-text truncate">{transaction.description}</h4>
                    <span className={`text-base font-bold whitespace-nowrap tabular-nums ${getAmountColorClass(transaction.amount)}`}>
                      {formatCurrency(convert(transaction.amount), selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-secondary">{formatDate(transaction.date)}</p>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text transition-colors"
                          aria-label={`Edit ${transaction.description}`}
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onReuse && (
                        <button
                          onClick={() => onReuse(transaction)}
                          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text transition-colors"
                          aria-label={`Reuse ${transaction.description}`}
                          title="Reuse transaction"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(transaction)}
                          className="p-1.5 rounded-lg hover:bg-expense/10 text-text-secondary hover:text-expense transition-colors"
                          aria-label={`Delete ${transaction.description}`}
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
            {paginatedTransactions.map((transaction) => {
              const isIncome = transaction.amount > 0;
              const Icon = isIncome ? ArrowDownCircle : ArrowUpCircle;
              
              return (
                <tr
                  key={transaction.id}
                  className="hover:bg-background-secondary transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-text">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-4 text-sm text-text">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isIncome ? 'bg-income/10' : 'bg-expense/10'}`}>
                        <Icon className={`w-4 h-4 ${isIncome ? 'text-income' : 'text-expense'}`} />
                      </div>
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {transaction.type}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold text-right ${getAmountColorClass(transaction.amount)}`}>
                    {formatCurrency(convert(transaction.amount), selectedCurrency)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text transition-colors"
                          aria-label={`Edit ${transaction.description}`}
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onReuse && (
                        <button
                          onClick={() => onReuse(transaction)}
                          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text transition-colors"
                          aria-label={`Reuse ${transaction.description}`}
                          title="Reuse transaction"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(transaction)}
                          className="p-1.5 rounded-lg hover:bg-expense/10 text-text-secondary hover:text-expense transition-colors"
                          aria-label={`Delete ${transaction.description}`}
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-text">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * 20 + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 20, filteredCount)}
                </span>{' '}
                of <span className="font-medium">{filteredCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text border border-border">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

