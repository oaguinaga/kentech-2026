import {
  AccountOverview,
  CsvActions,
  CurrencySelector,
  DevPanel,
  TransactionFilters,
  TransactionForm,
  TransactionList,
  UndoButton,
} from '@/components/features';
import { Dialog, ErrorBoundary } from '@/components/ui';
import { useDarkMode } from '@/hooks';
import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { BanknoteArrowDown, BanknoteArrowUp, Moon, Plus, Sun } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [reuseTransaction, setReuseTransaction] = useState<Transaction | undefined>();
  const [defaultTransactionType, setDefaultTransactionType] = useState<'Deposit' | 'Withdrawal' | undefined>();

  const deleteTransaction = useBankingStore((state) => state.deleteTransaction);
  const { isDark, toggle } = useDarkMode();

  const handleAddClick = () => {
    setReuseTransaction(undefined);
    setIsAddDialogOpen(true);
  };

  const handleAddDeposit = () => {
    setReuseTransaction(undefined);
    setDefaultTransactionType('Deposit');
    setIsAddDialogOpen(true);
  };

  const handleAddWithdrawal = () => {
    setReuseTransaction(undefined);
    setDefaultTransactionType('Withdrawal');
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
    setDefaultTransactionType(undefined);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingTransaction(undefined);
  };

  const handleAddCancel = () => {
    setIsAddDialogOpen(false);
    setReuseTransaction(undefined);
    setDefaultTransactionType(undefined);
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingTransaction(undefined);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-background/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <h1 className="text-xl sm:text-2xl font-bold text-text">Banking</h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <CurrencySelector />
                <button
                  onClick={toggle}
                  className="p-2 rounded-lg hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-text" />
                  ) : (
                    <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-text" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Account Overview */}
          <AccountOverview />

          {/* Quick Action Buttons */}
          <div className="mb-6 flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleAddDeposit}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-background hover:bg-background-secondary border border-border transition-colors"
              aria-label="Add deposit"
            >
              <BanknoteArrowDown className="w-5 h-5 text-text" />
              <span className="font-medium text-text">Deposit</span>
            </button>
            <button
              onClick={handleAddWithdrawal}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-background hover:bg-background-secondary border border-border transition-colors"
              aria-label="Add withdrawal"
            >
              <BanknoteArrowUp className="w-5 h-5 text-text" />
              <span className="font-medium text-text">Withdraw</span>
            </button>
            <button
              onClick={handleAddClick}
              className="p-2.5 sm:p-3 rounded-full bg-background hover:bg-background-secondary border border-border transition-colors"
              aria-label="Add transaction"
              title="Add transaction"
            >
              <Plus className="w-5 h-5 text-text" />
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="mb-4 flex items-center justify-end gap-2">
            <CsvActions />
            <UndoButton />
          </div>

          {/* Filters */}
          <TransactionFilters />

          {/* Transaction List */}
          <div className="bg-background-secondary rounded-xl border border-border p-4 sm:p-6">
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
            defaultType={defaultTransactionType || reuseTransaction?.type}
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

        {/* Dev Panel */}
        <DevPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App;
