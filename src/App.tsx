import {
  AccountActionsPanel,
  AccountOverview,
  CurrencySelector,
  DevPanel,
  TransactionFilters,
  TransactionForm,
  TransactionList,
  UndoToast,
} from '@/components/features';
import { Button, Dialog, ErrorBoundary } from '@/components/ui';
import { useDarkMode } from '@/hooks';
import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { BanknoteArrowDown, BanknoteArrowUp, Moon, Plus, Sun } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | undefined>();
  const [reuseTransaction, setReuseTransaction] = useState<Transaction | undefined>();
  const [defaultTransactionType, setDefaultTransactionType] = useState<'Deposit' | 'Withdrawal' | undefined>();

  const deleteTransaction = useBankingStore((state) => state.deleteTransaction);
  const { isDark, toggle } = useDarkMode();

  // Determine dialog mode and title
  const getDialogTitle = () => {
    if (editingTransaction) return 'Edit Transaction';
    if (reuseTransaction) return 'Reuse Transaction';
    return 'Add Transaction';
  };

  const handleAddClick = () => {
    setEditingTransaction(undefined);
    setReuseTransaction(undefined);
    setDefaultTransactionType(undefined);
    setIsTransactionDialogOpen(true);
  };

  const handleAddDeposit = () => {
    setEditingTransaction(undefined);
    setReuseTransaction(undefined);
    setDefaultTransactionType('Deposit');
    setIsTransactionDialogOpen(true);
  };

  const handleAddWithdrawal = () => {
    setEditingTransaction(undefined);
    setReuseTransaction(undefined);
    setDefaultTransactionType('Withdrawal');
    setIsTransactionDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setReuseTransaction(undefined);
    setDefaultTransactionType(undefined);
    setIsTransactionDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(undefined);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setTransactionToDelete(undefined);
  };

  const handleReuse = (transaction: Transaction) => {
    setEditingTransaction(undefined);
    setReuseTransaction(transaction);
    setDefaultTransactionType(undefined);
    setIsTransactionDialogOpen(true);
  };

  const handleTransactionSuccess = () => {
    setIsTransactionDialogOpen(false);
    setEditingTransaction(undefined);
    setReuseTransaction(undefined);
    setDefaultTransactionType(undefined);
  };

  const handleTransactionCancel = () => {
    setIsTransactionDialogOpen(false);
    setEditingTransaction(undefined);
    setReuseTransaction(undefined);
    setDefaultTransactionType(undefined);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background/70 backdrop-blur-md border-b border-border sticky top-0 z-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <h1 className="text-xl sm:text-2xl font-bold text-text">🏦 KenBank</h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <CurrencySelector />
                <button
                  onClick={toggle}
                  className="p-2 rounded-xl hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            {/* Left Column: Balance + Actions (Sticky on Desktop) */}
            <div className="lg:sticky lg:top-24 lg:h-fit space-y-4">
              {/* Account Overview */}
              <AccountOverview />

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleAddDeposit}
                  className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-background hover:bg-background-secondary border border-border shadow-sm hover:shadow-md transition-all"
                  aria-label="Add deposit"
                >
                  <BanknoteArrowUp className="w-5 h-5 text-text" />
                  <span className="font-medium text-text">Deposit</span>
                </button>
                <button
                  onClick={handleAddWithdrawal}
                  className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-background hover:bg-background-secondary border border-border shadow-sm hover:shadow-md transition-all"
                  aria-label="Add withdrawal"
                >
                  <BanknoteArrowDown className="w-5 h-5 text-text" />
                  <span className="font-medium text-text">Withdraw</span>
                </button>
                <button
                  onClick={handleAddClick}
                  className="p-2.5 sm:p-3 rounded-full bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all ring-1 ring-primary/20"
                  aria-label="Add transaction"
                  title="Add transaction"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <AccountActionsPanel />
              </div>
            </div>

            {/* Right Column: Filters + Transactions */}
            <div>

              {/* Filters - Aligned with balance on desktop (no top margin) */}
              <div className="lg:mt-0">
                <TransactionFilters />
              </div>

              {/* Transaction List */}
              <div className="mt-4 bg-background-secondary rounded-xl border border-border p-4 sm:p-6">
                <TransactionList
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReuse={handleReuse}
                />
              </div>
            </div>
          </div>

          {/* Undo Toast */}
          <UndoToast />
        </main>

        {/* Transaction Dialog (Add/Edit/Reuse) */}
        <Dialog
          isOpen={isTransactionDialogOpen}
          onClose={handleTransactionCancel}
          title={getDialogTitle()}
          size="md"
        >
          <TransactionForm
            transaction={editingTransaction}
            defaultType={defaultTransactionType || reuseTransaction?.type}
            onSuccess={handleTransactionSuccess}
            onCancel={handleTransactionCancel}
            reuseTransaction={reuseTransaction}
          />
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteCancel}
          title="Delete Transaction"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-text">
            Are you sure you want to delete "{transactionToDelete?.description}"? This action cannot be undone.
          </p>
        </Dialog>

        {/* Dev Panel */}
        <DevPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App;
