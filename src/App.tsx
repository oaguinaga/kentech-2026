import { useState } from 'react';
import { ErrorBoundary } from '@/components/ui';
import {
  AccountOverview,
  TransactionForm,
  TransactionList,
  TransactionFilters,
  CsvActions,
  UndoButton,
} from '@/components/features';
import { useBankingStore } from '@/store';
import { useDarkMode } from '@/hooks';
import { Button, Dialog } from '@/components/ui';
import type { Transaction } from '@/types';

function App() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [reuseTransaction, setReuseTransaction] = useState<Transaction | undefined>();

  const deleteTransaction = useBankingStore((state) => state.deleteTransaction);
  const { isDark, toggle } = useDarkMode();

  const handleAddClick = () => {
    setReuseTransaction(undefined);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
      deleteTransaction(transaction.id);
    }
  };

  const handleReuse = (transaction: Transaction) => {
    setReuseTransaction(transaction);
    setIsAddDialogOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    setReuseTransaction(undefined);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingTransaction(undefined);
  };

  const handleAddCancel = () => {
    setIsAddDialogOpen(false);
    setReuseTransaction(undefined);
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingTransaction(undefined);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background-secondary border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-text">Banking Dashboard</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggle}
                  className="p-2 rounded-lg hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <svg
                      className="w-6 h-6 text-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Account Overview */}
          <AccountOverview />

          {/* Actions Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Button
              variant="primary"
              onClick={handleAddClick}
              className="w-full sm:w-auto"
            >
              Add Transaction
            </Button>
            <CsvActions />
          </div>

          {/* Undo Button */}
          <UndoButton />

          {/* Filters */}
          <TransactionFilters />

          {/* Transaction List */}
          <div className="bg-background-secondary rounded-lg border border-border p-4 sm:p-6">
            <TransactionList
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReuse={handleReuse}
            />
          </div>
        </main>

        {/* Add Transaction Dialog */}
        <Dialog
          isOpen={isAddDialogOpen}
          onClose={handleAddCancel}
          title={reuseTransaction ? 'Reuse Transaction' : 'Add Transaction'}
          size="md"
        >
          <TransactionForm
            defaultType={reuseTransaction?.type}
            onSuccess={handleAddSuccess}
            onCancel={handleAddCancel}
            reuseTransaction={reuseTransaction}
          />
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog
          isOpen={isEditDialogOpen}
          onClose={handleEditCancel}
          title="Edit Transaction"
          size="md"
        >
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}

export default App;
