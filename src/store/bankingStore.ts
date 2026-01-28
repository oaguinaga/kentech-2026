import type { CurrencyCode } from '@/hooks';
import type { Transaction, TransactionType } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Filter state for transactions
 */
export type TransactionFilters = {
  dateFrom: string | null;
  dateTo: string | null;
  description: string;
  type: 'All' | TransactionType;
};

/**
 * Banking store state and actions
 */
type BankingState = {
  // State
  transactions: Transaction[];
  lastDeletedTransaction: Transaction | null;
  lastAddedTransaction: Transaction | null;
  filters: TransactionFilters;
  currentPage: number;
  selectedCurrency: CurrencyCode;
  isBalanceVisible: boolean;

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  undoDelete: () => void;
  undoAdd: () => void;
  clearUndo: () => void;
  importTransactions: (transactions: Transaction[]) => void;
  resetStore: () => void;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  toggleBalanceVisibility: () => void;

  // Computed selectors (getters)
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getFilteredTransactions: () => Transaction[];
  getPaginatedTransactions: () => Transaction[];
  getTotalPages: () => number;
};

const TRANSACTIONS_PER_PAGE = 20;

const initialState = {
  transactions: [],
  lastDeletedTransaction: null,
  lastAddedTransaction: null,
  filters: {
    dateFrom: null,
    dateTo: null,
    description: '',
    type: 'All' as const,
  },
  currentPage: 1,
  selectedCurrency: 'EUR' as CurrencyCode,
  isBalanceVisible: true,
};

/**
 * Calculate balance from transactions array
 */
function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}

/**
 * Calculate total income (sum of positive amounts)
 */
function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

/**
 * Calculate total expenses (sum of absolute negative amounts)
 */
function calculateTotalExpenses(transactions: Transaction[]): number {
  return Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );
}

/**
 * Filter transactions based on current filters
 */
function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  let filtered = [...transactions];

  // Filter by date range
  if (filters.dateFrom) {
    filtered = filtered.filter((t) => t.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((t) => t.date <= filters.dateTo!);
  }

  // Filter by description (case-insensitive)
  if (filters.description.trim()) {
    const searchTerm = filters.description.toLowerCase().trim();
    filtered = filtered.filter((t) =>
      t.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by type
  if (filters.type !== 'All') {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  // Sort by date (newest first), then by createdAt for same date
  filtered.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date); // Newest first
    }
    return b.createdAt - a.createdAt; // Newest first for same date
  });

  return filtered;
}

export const useBankingStore = create<BankingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Add a new transaction
      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
          lastAddedTransaction: newTransaction,
          lastDeletedTransaction: null, // Clear delete undo when adding
          currentPage: 1, // Reset to first page when adding
        }));
      },

      // Update an existing transaction
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
          lastAddedTransaction: null, // Clear add undo when updating
          lastDeletedTransaction: null, // Clear delete undo when updating
        }));
      },

      // Delete a transaction and store it for undo
      deleteTransaction: (id) => {
        set((state) => {
          const transactionToDelete = state.transactions.find((t) => t.id === id);
          if (!transactionToDelete) return state;

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            lastDeletedTransaction: transactionToDelete,
            lastAddedTransaction: null, // Clear add undo when deleting
            // Adjust current page if needed
            currentPage:
              state.currentPage > 1 &&
              state.transactions.length <= (state.currentPage - 1) * TRANSACTIONS_PER_PAGE + 1
                ? state.currentPage - 1
                : state.currentPage,
          };
        });
      },

      // Update filters
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filtering
        }));
      },

      // Clear all filters
      clearFilters: () => {
        set({
          filters: initialState.filters,
          currentPage: 1,
        });
      },

      // Set current page
      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      // Undo last deletion
      undoDelete: () => {
        const state = get();
        if (!state.lastDeletedTransaction) return;

        set((currentState) => ({
          transactions: [...currentState.transactions, state.lastDeletedTransaction!],
          lastDeletedTransaction: null,
        }));
      },

      // Undo last addition
      undoAdd: () => {
        const state = get();
        if (!state.lastAddedTransaction) return;

        set((currentState) => ({
          transactions: currentState.transactions.filter(
            (t) => t.id !== state.lastAddedTransaction!.id
          ),
          lastAddedTransaction: null,
        }));
      },

      // Clear undo state
      clearUndo: () => {
        set({ lastDeletedTransaction: null, lastAddedTransaction: null });
      },

      // Import transactions (for CSV import)
      importTransactions: (newTransactions) => {
        set((state) => {
          // Merge with existing, avoiding duplicates based on id
          const existingIds = new Set(state.transactions.map((t) => t.id));
          const uniqueNewTransactions = newTransactions.filter(
            (t) => !existingIds.has(t.id)
          );

          return {
            transactions: [...state.transactions, ...uniqueNewTransactions],
            currentPage: 1,
          };
        });
      },

      // Reset entire store
      resetStore: () => {
        set(initialState);
      },

      // Set selected currency
      setSelectedCurrency: (currency) => {
        set({ selectedCurrency: currency });
      },

      // Toggle balance visibility (privacy mode)
      toggleBalanceVisibility: () => {
        set((state) => ({ isBalanceVisible: !state.isBalanceVisible }));
      },

      // Computed: Get current balance
      getBalance: () => {
        return calculateBalance(get().transactions);
      },

      // Computed: Get total income
      getTotalIncome: () => {
        return calculateTotalIncome(get().transactions);
      },

      // Computed: Get total expenses
      getTotalExpenses: () => {
        return calculateTotalExpenses(get().transactions);
      },

      // Computed: Get filtered transactions
      getFilteredTransactions: () => {
        const state = get();
        return filterTransactions(state.transactions, state.filters);
      },

      // Computed: Get paginated transactions
      getPaginatedTransactions: () => {
        const state = get();
        const filtered = state.getFilteredTransactions();
        const startIndex = (state.currentPage - 1) * TRANSACTIONS_PER_PAGE;
        const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
        return filtered.slice(startIndex, endIndex);
      },

      // Computed: Get total pages
      getTotalPages: () => {
        const state = get();
        const filtered = state.getFilteredTransactions();
        return Math.ceil(filtered.length / TRANSACTIONS_PER_PAGE) || 1;
      },
    }),
    {
      name: 'banking-storage',
      partialize: (state) => ({
        // Only persist transactions and selected currency, not filters, page, or undo state
        transactions: state.transactions,
        selectedCurrency: state.selectedCurrency,
      }),
    }
  )
);

