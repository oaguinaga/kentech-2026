import type { Transaction } from '@/types';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBankingStore } from './bankingStore';

/**
 * Store unit tests (challenge submission)
 *
 * Goal: high-signal coverage of critical behavior + invariants.
 * We intentionally avoid exhaustive filter/pagination permutations here; those are better
 * validated via integration tests and UI-level tests.
 */

// Minimal localStorage mock for zustand/persist.
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function createTransactionData(
  overrides: Partial<Omit<Transaction, 'id' | 'createdAt'>> = {}
): Omit<Transaction, 'id' | 'createdAt'> {
  return {
    date: '2024-01-15',
    amount: 100,
    description: 'Test Transaction',
    type: 'Deposit',
    ...overrides,
  };
}

function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...createTransactionData(),
    ...overrides,
  };
}

describe('bankingStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useBankingStore.getState().resetStore();
  });

  it('addTransaction: adds item, generates id/createdAt, sets undo state, resets page', () => {
    const store = useBankingStore.getState();
    store.setCurrentPage(3);

    store.addTransaction(
      createTransactionData({
        description: 'Salary',
        amount: 500,
        type: 'Deposit',
      })
    );

    const state = useBankingStore.getState();
    expect(state.currentPage).toBe(1);
    expect(state.lastDeletedTransaction).toBeNull();
    expect(state.lastAddedTransaction).not.toBeNull();

    expect(state.transactions).toHaveLength(1);
    const tx = state.transactions[0]!;
    expect(tx.description).toBe('Salary');
    expect(tx.amount).toBe(500);
    expect(tx.id).toBeTruthy();
    expect(tx.createdAt).toBeTruthy();
  });

  it('updateTransaction: updates fields and clears undo state', () => {
    const store = useBankingStore.getState();
    store.addTransaction(createTransactionData({ description: 'Original', amount: 10 }));
    const tx = useBankingStore.getState().transactions[0]!;

    // Prime undo state.
    store.deleteTransaction(tx.id);
    expect(useBankingStore.getState().lastDeletedTransaction).not.toBeNull();
    store.undoDelete();
    expect(useBankingStore.getState().transactions).toHaveLength(1);

    store.updateTransaction(tx.id, { description: 'Updated', amount: 25 });

    const state = useBankingStore.getState();
    const updated = state.transactions.find((t) => t.id === tx.id)!;
    expect(updated.description).toBe('Updated');
    expect(updated.amount).toBe(25);
    expect(state.lastAddedTransaction).toBeNull();
    expect(state.lastDeletedTransaction).toBeNull();
  });

  it('deleteTransaction: removes item, sets lastDeletedTransaction, clears lastAddedTransaction', () => {
    const store = useBankingStore.getState();
    store.addTransaction(createTransactionData({ description: 'To delete' }));
    const tx = useBankingStore.getState().transactions[0]!;

    expect(useBankingStore.getState().lastAddedTransaction).not.toBeNull();
    store.deleteTransaction(tx.id);

    const state = useBankingStore.getState();
    expect(state.transactions).toHaveLength(0);
    expect(state.lastAddedTransaction).toBeNull();
    expect(state.lastDeletedTransaction?.id).toBe(tx.id);
  });

  it('deleteTransaction: decrements currentPage when deleting the last item on the last page', () => {
    const store = useBankingStore.getState();

    // 21 items -> page 2 exists (20/page)
    for (let i = 0; i < 21; i++) {
      store.addTransaction(
        createTransactionData({
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          description: `Tx ${i}`,
          amount: 1,
        })
      );
    }

    store.setCurrentPage(2);
    const lastTx = useBankingStore.getState().transactions[20]!;
    store.deleteTransaction(lastTx.id);

    expect(useBankingStore.getState().currentPage).toBe(1);
  });

  it('undoDelete: restores last deleted transaction and clears lastDeletedTransaction', () => {
    const store = useBankingStore.getState();
    store.addTransaction(createTransactionData({ description: 'Undo me' }));
    const tx = useBankingStore.getState().transactions[0]!;

    store.deleteTransaction(tx.id);
    expect(useBankingStore.getState().transactions).toHaveLength(0);

    store.undoDelete();

    const state = useBankingStore.getState();
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0]!.id).toBe(tx.id);
    expect(state.lastDeletedTransaction).toBeNull();
  });

  it('undoAdd: removes last added transaction and clears lastAddedTransaction', () => {
    const store = useBankingStore.getState();
    store.addTransaction(createTransactionData({ description: 'Added' }));
    expect(useBankingStore.getState().transactions).toHaveLength(1);
    expect(useBankingStore.getState().lastAddedTransaction).not.toBeNull();

    store.undoAdd();

    const state = useBankingStore.getState();
    expect(state.transactions).toHaveLength(0);
    expect(state.lastAddedTransaction).toBeNull();
  });

  it('importTransactions: merges unique by id and resets currentPage', () => {
    const store = useBankingStore.getState();
    store.setCurrentPage(2);

    const existing = createTransaction({ id: 'existing', description: 'Existing' });
    useBankingStore.setState({ transactions: [existing] });

    store.importTransactions([
      createTransaction({ id: 'existing', description: 'Duplicate' }),
      createTransaction({ id: 'new', description: 'New' }),
    ]);

    const state = useBankingStore.getState();
    expect(state.currentPage).toBe(1);
    expect(state.transactions).toHaveLength(2);
    expect(state.transactions.find((t) => t.id === 'existing')?.description).toBe('Existing');
    expect(state.transactions.find((t) => t.id === 'new')?.description).toBe('New');
  });

  it('getBalance: sums all transaction amounts', () => {
    const store = useBankingStore.getState();
    store.importTransactions([
      createTransaction({ id: '1', amount: 100, type: 'Deposit' }),
      createTransaction({ id: '2', amount: -40, type: 'Withdrawal' }),
      createTransaction({ id: '3', amount: 10, type: 'Deposit' }),
    ]);

    expect(store.getBalance()).toBe(70);
  });
});


