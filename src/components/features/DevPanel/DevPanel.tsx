import { Button, Dialog, Toast } from '@/components/ui';
import { seedTransactions } from '@/data';
import { useOnClickOutside } from '@/hooks';
import { useBankingStore } from '@/store';
import { Bug, CheckCircle2, Database, Trash2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export const DevPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const addTransaction = useBankingStore((state) => state.addTransaction);
  const resetStore = useBankingStore((state) => state.resetStore);
  const transactions = useBankingStore((state) => state.transactions);

  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
  }, []);

  useOnClickOutside(panelRef, handleClickOutside);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const handleClearAll = () => {
    setIsClearDialogOpen(true);
    setIsOpen(false);
  };

  const handleClearConfirm = () => {
    resetStore();
    setIsClearDialogOpen(false);
    setToastMessage({
      message: 'All data has been cleared.',
      variant: 'success',
    });
  };

  const handleClearCancel = () => {
    setIsClearDialogOpen(false);
  };

  const handleSeedData = () => {
    const count = seedTransactions(addTransaction);
    setIsOpen(false);
    setToastMessage({
      message: `Seeded ${count} sample transaction${count !== 1 ? 's' : ''}.`,
      variant: 'success',
    });
  };


  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={panelRef} className="fixed bottom-6 left-6 z-panel">
      {/* Floating Panel */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 bg-background-secondary border border-border rounded-lg shadow-xl p-4 min-w-56">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text p-1"
              aria-label="Close dev panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSeedData}
              className="w-full justify-start gap-2"
            >
              <Database className="w-4 h-4" />
              Seed Sample Data
            </Button>

            <div className="border-t border-border my-2" />

            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAll}
              className="w-full justify-start gap-2"
              disabled={transactions.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-text-secondary">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="w-12 h-12 rounded-full bg-background-secondary border border-border shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-text hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        title="Dev Settings"
        aria-label="Toggle dev settings panel"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          duration={toastMessage.variant === 'error' ? 8000 : 6000}
          onDismiss={() => setToastMessage(null)}
          variant={toastMessage.variant}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {toastMessage.variant === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <X className="w-5 h-5 text-error" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">
                {toastMessage.variant === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-xs text-text-secondary">{toastMessage.message}</p>
            </div>
          </div>
        </Toast>
      )}

      {/* Clear All Confirmation Dialog */}
      <Dialog
        isOpen={isClearDialogOpen}
        onClose={handleClearCancel}
        title="Clear All Data"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleClearCancel}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleClearConfirm}
            >
              Clear All
            </Button>
          </>
        }
      >
        <p className="text-text">
          Are you sure you want to clear all data? This action cannot be undone.
        </p>
      </Dialog>
    </div>
  );
};

