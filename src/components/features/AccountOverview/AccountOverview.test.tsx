import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountOverview } from './AccountOverview';

// Mock the store
vi.mock('@/store', () => ({
  useBankingStore: vi.fn(),
}));

// Mock currency conversion hook
vi.mock('@/hooks', () => ({
  useCurrencyConversion: () => ({
    selectedCurrency: 'EUR',
    convert: (amount: number) => amount,
  }),
}));

describe('AccountOverview', () => {
  const mockToggleBalanceVisibility = vi.fn();

  const createTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    id: crypto.randomUUID(),
    date: '2024-01-15',
    amount: 100,
    description: 'Test Transaction',
    type: 'Deposit',
    createdAt: Date.now(),
    ...overrides,
  });

  type MockStoreState = {
    transactions: Transaction[];
    isBalanceVisible: boolean;
    toggleBalanceVisibility: typeof mockToggleBalanceVisibility;
  };

  function mockStore(overrides: Partial<MockStoreState> = {}) {
    const state: MockStoreState = {
      transactions: [],
      isBalanceVisible: true,
      toggleBalanceVisibility: mockToggleBalanceVisibility,
      ...overrides,
    };

    (useBankingStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (s: MockStoreState) => unknown) => selector(state)
    );

    return state;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display balance', () => {
    const transactions = [
      createTransaction({ amount: 100 }),
      createTransaction({ amount: -50 }),
    ];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    expect(screen.getByText(/total balance/i)).toBeInTheDocument();
    // Balance appears in main balance display
    const balanceElements = screen.getAllByText(/€50.00/i);
    expect(balanceElements.length).toBeGreaterThan(0);
  });

  it('should calculate balance correctly', () => {
    const transactions = [
      createTransaction({ amount: 1000 }),
      createTransaction({ amount: -300 }),
      createTransaction({ amount: 200 }),
      createTransaction({ amount: -100 }),
    ];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    // Balance should be 1000 - 300 + 200 - 100 = 800
    expect(screen.getByText(/€800.00/i)).toBeInTheDocument();
  });

  it('should display total income', () => {
    const transactions = [
      createTransaction({ amount: 100 }),
      createTransaction({ amount: 200 }),
      createTransaction({ amount: -50 }),
    ];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    // Income should be 100 + 200 = 300
    expect(screen.getByText(/€300.00/i)).toBeInTheDocument();
    expect(screen.getByText(/income/i)).toBeInTheDocument();
  });

  it('should display total expenses', () => {
    const transactions = [
      createTransaction({ amount: 100 }),
      createTransaction({ amount: -50 }),
      createTransaction({ amount: -150 }),
    ];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    // Expenses should be 50 + 150 = 200
    expect(screen.getByText(/€200.00/i)).toBeInTheDocument();
    expect(screen.getByText(/expenses/i)).toBeInTheDocument();
  });

  it('should toggle balance visibility', async () => {
    const user = userEvent.setup();
    const transactions = [createTransaction({ amount: 100 })];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    const toggleButton = screen.getByLabelText(/hide balance/i);
    await user.click(toggleButton);

    expect(mockToggleBalanceVisibility).toHaveBeenCalled();
  });

  it('should blur balance when visibility is off', () => {
    const transactions = [createTransaction({ amount: 100 })];

    mockStore({ transactions, isBalanceVisible: false });

    render(<AccountOverview />);

    // Find the main balance element (the one with large text size)
    const balanceElements = screen.getAllByText(/€100.00/i);
    const mainBalance = balanceElements.find((el) => 
      el.className.includes('text-4xl') || el.className.includes('text-5xl')
    );
    expect(mainBalance).toHaveClass('blur-md');
  });

  it('should display zero balance when no transactions', () => {
    mockStore({ transactions: [], isBalanceVisible: true });

    render(<AccountOverview />);

    // Balance, income, and expenses all show €0.00, so check that at least one exists
    const zeroElements = screen.getAllByText(/€0.00/i);
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should display zero income when no deposits', () => {
    const transactions = [
      createTransaction({ amount: -50 }),
      createTransaction({ amount: -100 }),
    ];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    expect(screen.getByText(/€0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/income/i)).toBeInTheDocument();
  });

  it('should display zero expenses when no withdrawals', () => {
    const transactions = [
      createTransaction({ amount: 100 }),
      createTransaction({ amount: 200 }),
    ];

    mockStore({ transactions, isBalanceVisible: true });

    render(<AccountOverview />);

    expect(screen.getByText(/€0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/expenses/i)).toBeInTheDocument();
  });
});

