import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionList } from './TransactionList';

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

describe('TransactionList', () => {
  const mockSetCurrentPage = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnReuse = vi.fn();

  const createTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    id: crypto.randomUUID(),
    date: '2024-01-15',
    amount: 100,
    description: 'Test Transaction',
    type: 'Deposit',
    createdAt: Date.now(),
    ...overrides,
  });

  const baseFilters = { dateFrom: null, dateTo: null, description: '', type: 'All' } as const;

  type MockStoreState = {
    transactions: Transaction[];
    filters: {
      dateFrom: string | null;
      dateTo: string | null;
      description: string;
      type: 'All' | Transaction['type'];
    };
    currentPage: number;
    isBalanceVisible: boolean;
    setCurrentPage: typeof mockSetCurrentPage;
  };

  function mockStore(overrides: Partial<MockStoreState> = {}) {
    const state: MockStoreState = {
      transactions: [],
      filters: { ...baseFilters },
      currentPage: 1,
      isBalanceVisible: true,
      setCurrentPage: mockSetCurrentPage,
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

  it('should display empty state when no transactions', () => {
    mockStore({ transactions: [] });

    render(<TransactionList />);

    expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/get started by adding your first transaction/i)).toBeInTheDocument();
  });

  it('should display transactions', () => {
    const transactions = [
      createTransaction({ id: '1', description: 'Salary', amount: 100 }),
      createTransaction({ id: '2', description: 'Grocery', amount: -50 }),
    ];

    mockStore({ transactions });

    render(<TransactionList />);

    // Component renders both mobile and desktop views, so use getAllByText
    expect(screen.getAllByText('Salary').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Grocery').length).toBeGreaterThan(0);
  });

  it('should display transaction count', () => {
    const transactions = [
      createTransaction({ id: '1' }),
      createTransaction({ id: '2' }),
    ];

    mockStore({ transactions });

    render(<TransactionList />);

    expect(screen.getByText(/2 transactions/i)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const transaction = createTransaction({ id: '1', description: 'Salary' });
    const transactions = [transaction];

    mockStore({ transactions });

    render(<TransactionList onEdit={mockOnEdit} />);

    // Component renders both mobile and desktop views, so get first edit button
    const editButtons = screen.getAllByLabelText(/edit salary/i);
    await user.click(editButtons[0]!);

    expect(mockOnEdit).toHaveBeenCalledWith(transaction);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const transaction = createTransaction({ id: '1', description: 'Salary' });
    const transactions = [transaction];

    mockStore({ transactions });

    render(<TransactionList onDelete={mockOnDelete} />);

    // Component renders both mobile and desktop views, so get first delete button
    const deleteButtons = screen.getAllByLabelText(/delete salary/i);
    await user.click(deleteButtons[0]!);

    expect(mockOnDelete).toHaveBeenCalledWith(transaction);
  });

  it('should call onReuse when reuse button is clicked', async () => {
    const user = userEvent.setup();
    const transaction = createTransaction({ id: '1', description: 'Salary' });
    const transactions = [transaction];

    mockStore({ transactions });

    render(<TransactionList onReuse={mockOnReuse} />);

    // Component renders both mobile and desktop views, so get first reuse button
    const reuseButtons = screen.getAllByLabelText(/reuse salary/i);
    await user.click(reuseButtons[0]!);

    expect(mockOnReuse).toHaveBeenCalledWith(transaction);
  });

  it('should paginate transactions (20 per page)', () => {
    const transactions = Array.from({ length: 25 }, (_, i) =>
      createTransaction({ id: String(i), description: `Transaction ${i}` })
    );

    mockStore({ transactions });

    render(<TransactionList />);

    // Should show first 20 transactions (component renders both mobile and desktop)
    expect(screen.getAllByText('Transaction 0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Transaction 19').length).toBeGreaterThan(0);
    expect(screen.queryByText('Transaction 20')).not.toBeInTheDocument();
  });

  it('should display pagination controls when more than one page', () => {
    const transactions = Array.from({ length: 25 }, (_, i) =>
      createTransaction({ id: String(i) })
    );

    mockStore({ transactions });

    render(<TransactionList />);

    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
  });

  it('should call setCurrentPage when pagination button is clicked', async () => {
    const user = userEvent.setup();
    const transactions = Array.from({ length: 25 }, (_, i) =>
      createTransaction({ id: String(i) })
    );

    mockStore({ transactions });

    render(<TransactionList />);

    // Component may render multiple pagination controls, get first one
    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    await user.click(nextButtons[0]!);

    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
  });

  it('should filter transactions by description', () => {
    const transactions = [
      createTransaction({ id: '1', description: 'Salary' }),
      createTransaction({ id: '2', description: 'Grocery' }),
      createTransaction({ id: '3', description: 'Salary Bonus' }),
    ];

    mockStore({
      transactions,
      filters: { dateFrom: null, dateTo: null, description: 'Salary', type: 'All' },
    });

    render(<TransactionList />);

    // Component renders both mobile and desktop views
    expect(screen.getAllByText('Salary').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Salary Bonus').length).toBeGreaterThan(0);
    expect(screen.queryByText('Grocery')).not.toBeInTheDocument();
  });

  it('should filter transactions by type', () => {
    const transactions = [
      createTransaction({ id: '1', type: 'Deposit', amount: 100, description: 'Deposit 1' }),
      createTransaction({ id: '2', type: 'Withdrawal', amount: -50, description: 'Withdrawal 1' }),
      createTransaction({ id: '3', type: 'Deposit', amount: 200, description: 'Deposit 2' }),
    ];

    mockStore({
      transactions,
      filters: { dateFrom: null, dateTo: null, description: '', type: 'Deposit' },
    });

    render(<TransactionList />);

    // Component renders both mobile and desktop views
    expect(screen.getAllByText('Deposit 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Deposit 2').length).toBeGreaterThan(0);
    expect(screen.queryByText('Withdrawal 1')).not.toBeInTheDocument();
  });
});

