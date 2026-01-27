import { Button } from '@/components/ui';
import { seedTransactions } from '@/data';
import { useOnClickOutside } from '@/hooks';
import { useBankingStore } from '@/store';
import { Bug, Database, Trash2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export const DevPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    if (
      window.confirm(
        'Are you sure you want to clear all data? This action cannot be undone.'
      )
    ) {
      resetStore();
      setIsOpen(false);
    }
  };

  const handleSeedData = () => {
    const count = seedTransactions(addTransaction);
    alert(`Seeded ${count} sample transactions`);
  };


  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={panelRef} className="fixed bottom-6 left-6 z-50">
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
    </div>
  );
};

