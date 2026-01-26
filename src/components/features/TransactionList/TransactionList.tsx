import { useBankingStore } from '@/store';
import { Button } from '@/components/ui';
import { formatCurrency, formatDate, getAmountColorClass } from '@/utils';
import type { Transaction } from '@/types';

export interface TransactionListProps {
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onReuse?: (transaction: Transaction) => void;
}

export const TransactionList = ({
  onEdit,
  onDelete,
  onReuse,
}: TransactionListProps) => {
  const transactions = useBankingStore((state) => state.getPaginatedTransactions());
  const currentPage = useBankingStore((state) => state.currentPage);
  const totalPages = useBankingStore((state) => state.getTotalPages());
  const setCurrentPage = useBankingStore((state) => state.setCurrentPage);
  const filteredCount = useBankingStore((state) => state.getFilteredTransactions().length);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-text-secondary"
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
        <h3 className="mt-2 text-sm font-medium text-text">No transactions</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Get started by adding your first transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transactions Table */}
      <div className="overflow-x-auto">
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
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-background-secondary"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-sm text-text">{transaction.description}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                  {transaction.type}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${getAmountColorClass(transaction.amount)}`}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        aria-label={`Edit ${transaction.description}`}
                      >
                        Edit
                      </Button>
                    )}
                    {onReuse && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReuse(transaction)}
                        aria-label={`Reuse ${transaction.description}`}
                      >
                        Reuse
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(transaction)}
                        aria-label={`Delete ${transaction.description}`}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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

