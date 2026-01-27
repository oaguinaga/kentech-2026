import { Button } from '@/components/ui';
import { useBankingStore } from '@/store';
import { formatCurrency } from '@/utils';

export const UndoButton = () => {
  const lastDeletedTransaction = useBankingStore((state) => state.lastDeletedTransaction);
  const lastAddedTransaction = useBankingStore((state) => state.lastAddedTransaction);
  const undoDelete = useBankingStore((state) => state.undoDelete);
  const undoAdd = useBankingStore((state) => state.undoAdd);
  const clearUndo = useBankingStore((state) => state.clearUndo);

  // Show undo for deletion if available
  if (lastDeletedTransaction) {
    return (
      <div
        className="mb-4 p-3 bg-background-secondary border border-border rounded-lg flex items-center justify-between"
        role="alert"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-text">
            Transaction "{lastDeletedTransaction.description}" deleted
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undoDelete}
            aria-label="Undo deletion"
          >
            Undo
          </Button>
          <button
            onClick={clearUndo}
            className="text-text-secondary hover:text-text"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Show undo for addition if available
  if (lastAddedTransaction) {
    return (
      <div
        className="mb-4 p-3 bg-background-secondary border border-border rounded-lg flex items-center justify-between"
        role="alert"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-text">
            Transaction "{lastAddedTransaction.description}" ({formatCurrency(lastAddedTransaction.amount)}) added
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undoAdd}
            aria-label="Undo addition"
          >
            Undo
          </Button>
          <button
            onClick={clearUndo}
            className="text-text-secondary hover:text-text"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
};
