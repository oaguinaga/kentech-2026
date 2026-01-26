import type { CsvTransactionRow, Transaction, TransactionType } from '@/types';
import Papa from 'papaparse';

/**
 * Parse CSV file and convert to Transaction array
 */
export function parseCsvFile(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvTransactionRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = validateAndConvertCsvRows(results.data);
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Validate and convert CSV rows to Transaction objects
 */
function validateAndConvertCsvRows(rows: CsvTransactionRow[]): Transaction[] {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) {
      continue; // Skip undefined rows
    }
    const rowNumber = i + 2; // +2 because header is row 1, and arrays are 0-indexed

    try {
      // Validate required fields
      if (!row.Date || !row.Amount || !row.Description || !row.Type) {
        errors.push(`Row ${rowNumber}: Missing required fields`);
        continue;
      }

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.Date)) {
        errors.push(`Row ${rowNumber}: Invalid date format. Expected YYYY-MM-DD, got ${row.Date}`);
        continue;
      }

      // Validate date is valid
      const dateObj = new Date(row.Date);
      if (isNaN(dateObj.getTime())) {
        errors.push(`Row ${rowNumber}: Invalid date: ${row.Date}`);
        continue;
      }

      // Validate amount
      const amount = parseFloat(row.Amount);
      if (isNaN(amount) || amount === 0) {
        errors.push(`Row ${rowNumber}: Invalid amount. Must be a non-zero number, got ${row.Amount}`);
        continue;
      }

      // Validate type
      if (row.Type !== 'Deposit' && row.Type !== 'Withdrawal') {
        errors.push(`Row ${rowNumber}: Invalid type. Must be 'Deposit' or 'Withdrawal', got ${row.Type}`);
        continue;
      }

      // Validate amount matches type
      const expectedSign = row.Type === 'Deposit' ? 1 : -1;
      const actualSign = Math.sign(amount);
      if (actualSign !== expectedSign) {
        errors.push(
          `Row ${rowNumber}: Amount sign doesn't match type. ${row.Type} should be ${expectedSign > 0 ? 'positive' : 'negative'}, got ${amount}`
        );
        continue;
      }

      // Validate description
      const description = row.Description.trim();
      if (description.length === 0) {
        errors.push(`Row ${rowNumber}: Description cannot be empty`);
        continue;
      }

      // Create transaction
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        date: row.Date,
        createdAt: Date.now(),
        amount: amount,
        description: description,
        type: row.Type as TransactionType,
      };

      transactions.push(transaction);
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`CSV validation errors:\n${errors.join('\n')}`);
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in CSV file');
  }

  return transactions;
}

/**
 * Convert Transaction array to CSV string
 */
export function transactionsToCsv(transactions: Transaction[]): string {
  const csvRows: CsvTransactionRow[] = transactions.map((t) => ({
    Date: t.date,
    Amount: t.amount.toString(),
    Description: t.description,
    Type: t.type,
  }));

  return Papa.unparse(csvRows, {
    header: true,
  });
}

/**
 * Download CSV file
 */
export function downloadCsv(csvContent: string, filename: string = 'transactions.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
}

