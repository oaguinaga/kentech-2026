/**
 * Transaction type representing a financial transaction
 * - id: Unique identifier generated with crypto.randomUUID()
 * - date: Transaction date in YYYY-MM-DD format
 * - createdAt: System timestamp when transaction was created (Date.now())
 * - amount: Positive for deposits, negative for withdrawals
 * - description: Human-readable description of the transaction
 * - type: Either 'Deposit' or 'Withdrawal'
 */
export type TransactionType = 'Deposit' | 'Withdrawal';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD format
  createdAt: number; // Date.now() timestamp
  amount: number; // positive for deposits, negative for withdrawals
  description: string;
  type: TransactionType;
}

/**
 * Type guard to check if an object is a valid Transaction
 */
export function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.amount === 'number' &&
    typeof obj.description === 'string' &&
    typeof obj.type === 'string' &&
    (obj.type === 'Deposit' || obj.type === 'Withdrawal') &&
    /^\d{4}-\d{2}-\d{2}$/.test(obj.date) // Basic date format validation
  );
}

/**
 * CSV row format for import/export
 */
export interface CsvTransactionRow {
  Date: string;
  Amount: string;
  Description: string;
  Type: TransactionType;
}

