import { useState, useRef } from 'react';
import { useBankingStore } from '@/store';
import { Button } from '@/components/ui';
import { parseCsvFile, transactionsToCsv, downloadCsv } from '@/utils';
import type { Transaction } from '@/types';

export const CsvActions = () => {
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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
          aria-label="Import CSV file"
        />
        <Button
          variant="secondary"
          onClick={handleImportClick}
          isLoading={isImporting}
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import CSV'}
        </Button>
      </div>

      <div className="flex-1">
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={transactions.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {importError && (
        <div
          className="mt-2 p-3 bg-error/10 border border-error rounded-lg text-sm text-error"
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

