import { useState, useRef, useCallback } from 'react';
import { MoreVertical, X, Upload, Download } from 'lucide-react';
import { useBankingStore } from '@/store';
import { parseCsvFile, transactionsToCsv, downloadCsv } from '@/utils';
import type { Transaction } from '@/types';
import { useOnClickOutside } from '@/hooks';

export const AccountActionsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transactions = useBankingStore((state) => state.transactions);
  const importTransactions = useBankingStore((state) => state.importTransactions);

  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
  }, []);

  useOnClickOutside(panelRef, handleClickOutside);

  const handleExport = () => {
    try {
      const csvContent = transactionsToCsv(transactions);
      downloadCsv(csvContent, 'transactions.csv');
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setImportError('Failed to export transactions. Please try again.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error('Invalid file type. Please upload a CSV file.');
      }

      const importedTransactions: Transaction[] = await parseCsvFile(file);
      
      if (importedTransactions.length === 0) {
        throw new Error('No valid transactions found in the CSV file.');
      }

      importTransactions(importedTransactions);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert(`Successfully imported ${importedTransactions.length} transaction(s).`);
      setIsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to import CSV file. Please check the format and try again.';
      setImportError(errorMessage);
      console.error('CSV import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="p-2.5 sm:p-3 rounded-full bg-background hover:bg-background-secondary border border-border transition-colors"
        aria-label="Account actions"
        title="Account actions"
      >
        <MoreVertical className="w-5 h-5 text-text" />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 bg-background-secondary border border-border rounded-xl shadow-xl p-4 min-w-[200px] z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Account Actions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text p-1"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              aria-label="Import CSV file"
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-background-secondary border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              aria-label="Import CSV"
            >
              <Upload className={`w-4 h-4 text-text flex-shrink-0 ${isImporting ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium text-text">
                {isImporting ? 'Importing...' : 'Import CSV'}
              </span>
            </button>
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-background-secondary border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              aria-label="Export CSV"
            >
              <Download className="w-4 h-4 text-text flex-shrink-0" />
              <span className="text-sm font-medium text-text">Export CSV</span>
            </button>
          </div>

          {importError && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="p-2 bg-error/10 border border-error rounded-lg text-xs text-error">
                <strong>Error:</strong> {importError}
                <button
                  onClick={() => setImportError(null)}
                  className="ml-2 text-error hover:opacity-75"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

