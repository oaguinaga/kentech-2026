import type { Transaction } from '@/types';

/**
 * Service abstraction layer for transaction operations
 * Currently uses localStorage, but structured to easily swap with API calls
 */

const STORAGE_KEY = 'banking-transactions';

/**
 * Simulate async operation (for future API integration)
 */
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Get all transactions from storage
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const transactions = JSON.parse(stored) as Transaction[];
    return delay(0, transactions);
  } catch (error) {
    console.error('Error reading transactions from storage:', error);
    // Return empty array on error (graceful degradation)
    return delay(0, []);
  }
}

/**
 * Save transactions to storage
 */
async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    await delay(0, undefined);
  } catch (error) {
    // Handle quota exceeded or disabled storage
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please free up some space.');
    }
    if (error instanceof DOMException && error.name === 'SecurityError') {
      throw new Error('Storage access denied. Please check your browser settings.');
    }
    throw new Error('Failed to save transactions to storage.');
  }
}

/**
 * Add a new transaction
 */
export async function addTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const transactions = await getTransactions();
  const updated = [...transactions, newTransaction];
  await saveTransactions(updated);

  return delay(0, newTransaction);
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<Transaction> {
  const transactions = await getTransactions();
  const index = transactions.findIndex((t) => t.id === id);

  if (index === -1) {
    throw new Error(`Transaction with id ${id} not found`);
  }

  const existing = transactions[index];
  if (!existing) {
    throw new Error(`Transaction with id ${id} not found`);
  }

  const updated: Transaction = {
    ...existing,
    ...updates,
  };

  transactions[index] = updated;
  await saveTransactions(transactions);

  return delay(0, updated);
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const transactions = await getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);

  if (filtered.length === transactions.length) {
    throw new Error(`Transaction with id ${id} not found`);
  }

  await saveTransactions(filtered);
  await delay(0, undefined);
}

/**
 * Import multiple transactions
 */
export async function importTransactions(
  newTransactions: Transaction[]
): Promise<{ imported: number; duplicates: number }> {
  const existing = await getTransactions();
  const existingIds = new Set(existing.map((t) => t.id));
  const existingKeys = new Set(
    existing.map((t) => `${t.date}-${t.amount}-${t.description}`)
  );

  const uniqueTransactions: Transaction[] = [];
  let duplicates = 0;

  for (const transaction of newTransactions) {
    // Check for duplicate by id
    if (existingIds.has(transaction.id)) {
      duplicates++;
      continue;
    }

    // Check for duplicate by date+amount+description
    const key = `${transaction.date}-${transaction.amount}-${transaction.description}`;
    if (existingKeys.has(key)) {
      duplicates++;
      continue;
    }

    uniqueTransactions.push(transaction);
    existingKeys.add(key);
  }

  if (uniqueTransactions.length > 0) {
    const updated = [...existing, ...uniqueTransactions];
    await saveTransactions(updated);
  }

  return delay(0, {
    imported: uniqueTransactions.length,
    duplicates,
  });
}

/**
 * Export all transactions
 */
export async function exportTransactions(): Promise<Transaction[]> {
  return getTransactions();
}

