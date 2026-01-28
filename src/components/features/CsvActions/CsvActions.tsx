import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { downloadCsv, parseCsvFile, transactionsToCsv } from '@/utils';
import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export interface CsvActionsProps {
  showLabels?: boolean;
}

export const CsvActions = ({ showLabels = false }: CsvActionsProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transactions = useBankingStore((state) => state.transactions);
  const importTransactions = useBankingStore((state) => state.importTransactions);

  const handleExport = () => {
    try {
      const csvContent = transactionsToCsv(transactions);
      downloadCsv(csvContent, 'transactions.csv');
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
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Invalid file type. Please upload a CSV file.');
      }

      const importedTransactions: Transaction[] = await parseCsvFile(file);
      
      if (importedTransactions.length === 0) {
        throw new Error('No valid transactions found in the CSV file.');
      }

      // Import transactions (store will handle duplicate detection)
      importTransactions(importedTransactions);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show success message (could be improved with toast notification)
      alert(`Successfully imported ${importedTransactions.length} transaction(s).`);
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

  return (
    <div className="flex gap-2">
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-background-secondary border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          showLabels ? 'w-full justify-start' : 'p-2'
        }`}
        aria-label="Import CSV"
        title="Import CSV"
      >
        <Upload className={`w-4 h-4 text-text ${isImporting ? 'animate-pulse' : ''}`} />
        {showLabels && (
          <span className="text-sm font-medium text-text">
            {isImporting ? 'Importing...' : 'Import CSV'}
          </span>
        )}
      </button>
      <button
        onClick={handleExport}
        disabled={transactions.length === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-background-secondary border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          showLabels ? 'w-full justify-start' : 'p-2'
        }`}
        aria-label="Export CSV"
        title="Export CSV"
      >
        <Download className="w-4 h-4 text-text" />
        {showLabels && (
          <span className="text-sm font-medium text-text">Export CSV</span>
        )}
      </button>

      {importError && (
        <div
          className="absolute top-16 right-4 p-3 bg-error/10 border border-error rounded-lg text-sm text-error max-w-xs z-panel"
          role="alert"
        >
          <strong>Import Error:</strong> {importError}
          <button
            onClick={() => setImportError(null)}
            className="ml-2 text-error hover:opacity-75"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

