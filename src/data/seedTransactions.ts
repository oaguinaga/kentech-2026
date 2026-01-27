import type { Transaction } from '@/types';
import { formatDateForInput } from '@/utils';

/**
 * Helper to get date string N days ago
 */
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateForInput(date);
}

/**
 * Sample transaction data for seeding
 * Uses Omit<Transaction, 'id' | 'createdAt'> format to match store interface
 */
export const seedTransactionsData: Array<Omit<Transaction, 'id' | 'createdAt'>> = [
  // Recent deposits
  {
    date: formatDateForInput(new Date()),
    amount: 2500.00,
    description: 'Salary',
    type: 'Deposit',
  },
  {
    date: getDateDaysAgo(2),
    amount: 500.00,
    description: 'Freelance Project',
    type: 'Deposit',
  },
  {
    date: getDateDaysAgo(5),
    amount: 150.00,
    description: 'Refund - Online Purchase',
    type: 'Deposit',
  },
  {
    date: getDateDaysAgo(7),
    amount: 1200.00,
    description: 'Investment Return',
    type: 'Deposit',
  },
  
  // Recent withdrawals
  {
    date: getDateDaysAgo(1),
    amount: -85.50,
    description: 'Grocery Shopping',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(3),
    amount: -45.00,
    description: 'Restaurant Dinner',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(4),
    amount: -120.00,
    description: 'Gas Station',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(6),
    amount: -299.99,
    description: 'Online Shopping',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(8),
    amount: -75.25,
    description: 'Coffee Shop',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(10),
    amount: -200.00,
    description: 'Utility Bill',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(12),
    amount: -50.00,
    description: 'Pharmacy',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(15),
    amount: -350.00,
    description: 'Monthly Subscription',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(18),
    amount: -125.50,
    description: 'Bookstore',
    type: 'Withdrawal',
  },
  {
    date: getDateDaysAgo(20),
    amount: -89.99,
    description: 'Streaming Service',
    type: 'Withdrawal',
  },
];

/**
 * Seed transactions into the store
 * @returns Number of transactions seeded
 */
export function seedTransactions(
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
): number {
  seedTransactionsData.forEach((transaction) => {
    addTransaction(transaction);
  });
  
  return seedTransactionsData.length;
}

