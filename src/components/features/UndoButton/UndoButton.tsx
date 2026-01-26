import { useBankingStore } from '@/store';
import { Button } from '@/components/ui';

export const UndoButton = () => {
  const lastDeletedTransaction = useBankingStore((state) => state.lastDeletedTransaction);
  const undoDelete = useBankingStore((state) => state.undoDelete);
  const clearUndo = useBankingStore((state) => state.clearUndo);

  if (!lastDeletedTransaction) {
    return null;
  }

  const handleUndo = () => {
    undoDelete();
  };

  const handleDismiss = () => {
    clearUndo();
  };

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
          onClick={handleUndo}
          aria-label="Undo deletion"
        >
          Undo
        </Button>
        <button
          onClick={handleDismiss}
          className="text-text-secondary hover:text-text"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

