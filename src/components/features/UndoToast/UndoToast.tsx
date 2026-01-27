import { Toast } from '@/components/ui';
import { Button } from '@/components/ui';
import { useBankingStore } from '@/store';
import { formatCurrency } from '@/utils';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export const UndoToast = () => {
  const lastDeletedTransaction = useBankingStore((state) => state.lastDeletedTransaction);
  const lastAddedTransaction = useBankingStore((state) => state.lastAddedTransaction);
  const isBalanceVisible = useBankingStore((state) => state.isBalanceVisible);
  const undoDelete = useBankingStore((state) => state.undoDelete);
  const undoAdd = useBankingStore((state) => state.undoAdd);
  const clearUndo = useBankingStore((state) => state.clearUndo);

  // Show undo for deletion if available
  if (lastDeletedTransaction) {
    return (
      <Toast
        duration={6000}
        onDismiss={clearUndo}
        variant="default"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <RotateCcw className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text">
              Transaction deleted
            </p>
            <p className="text-xs text-text-secondary truncate">
              {lastDeletedTransaction.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              undoDelete();
              clearUndo();
            }}
            className="flex-shrink-0"
            aria-label="Undo deletion"
          >
            Undo
          </Button>
        </div>
      </Toast>
    );
  }

  // Show undo for addition if available
  if (lastAddedTransaction) {
    return (
      <Toast
        duration={6000}
        onDismiss={clearUndo}
        variant="success"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text">
              Transaction added
            </p>
            <p className="text-xs text-text-secondary truncate">
              {lastAddedTransaction.description} •{' '}
              <span
                className={`transition-all ${
                  isBalanceVisible ? 'blur-0' : 'blur-md select-none'
                }`}
              >
                {formatCurrency(lastAddedTransaction.amount)}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              undoAdd();
              clearUndo();
            }}
            className="flex-shrink-0"
            aria-label="Undo addition"
          >
            Undo
          </Button>
        </div>
      </Toast>
    );
  }

  return null;
};

