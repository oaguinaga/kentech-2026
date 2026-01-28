import { useBankingStore } from '@/store';
import type { Transaction } from '@/types';
import { getTodayDateString } from '@/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionForm } from './TransactionForm';

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

describe('TransactionForm', () => {
  const mockAddTransaction = vi.fn();
  const mockUpdateTransaction = vi.fn();
  const mockGetBalance = vi.fn(() => 1000);

  beforeEach(() => {
    vi.clearAllMocks();
    const mockState = {
      addTransaction: mockAddTransaction,
      updateTransaction: mockUpdateTransaction,
      getBalance: mockGetBalance,
    };
    (useBankingStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: typeof mockState) => unknown) => selector(mockState)
    );
  });

  it('should render form with default values', () => {
    render(<TransactionForm />);

    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it('should submit valid deposit transaction', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.type(screen.getByLabelText(/description/i), 'Salary');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          description: 'Salary',
          type: 'Deposit',
        })
      );
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should submit valid withdrawal transaction', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.selectOptions(screen.getByLabelText(/type/i), 'Withdrawal');
    await user.type(screen.getByLabelText(/amount/i), '50');
    await user.type(screen.getByLabelText(/description/i), 'Grocery');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -50,
          description: 'Grocery',
          type: 'Withdrawal',
        })
      );
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(<TransactionForm />);

    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('should validate amount is greater than 0', async () => {
    const user = userEvent.setup();

    render(<TransactionForm />);

    await user.type(screen.getByLabelText(/amount/i), '0');
    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });

    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('should allow selecting today as the transaction date', async () => {
    const user = userEvent.setup();

    render(<TransactionForm />);

    const today = getTodayDateString();
    const dateInput = screen.getByLabelText(/date/i);

    await user.clear(dateInput);
    await user.type(dateInput, today);

    await user.type(screen.getByLabelText(/amount/i), '10');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(screen.queryByText(/transaction date cannot be in the future/i)).not.toBeInTheDocument();
      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10,
          description: 'Coffee',
          date: today,
        })
      );
    });
  });

  it('should prevent withdrawal that exceeds balance', async () => {
    const user = userEvent.setup();
    mockGetBalance.mockReturnValue(100);

    render(<TransactionForm />);

    await user.selectOptions(screen.getByLabelText(/type/i), 'Withdrawal');
    await user.type(screen.getByLabelText(/amount/i), '150');
    await user.type(screen.getByLabelText(/description/i), 'Large Purchase');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    });

    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('should allow withdrawal within balance', async () => {
    const user = userEvent.setup();
    mockGetBalance.mockReturnValue(100);
    const onSuccess = vi.fn();

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.selectOptions(screen.getByLabelText(/type/i), 'Withdrawal');
    await user.type(screen.getByLabelText(/amount/i), '50');
    await user.type(screen.getByLabelText(/description/i), 'Grocery');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalled();
    });
  });

  it('should pre-fill form in edit mode', () => {
    const transaction: Transaction = {
      id: '1',
      date: '2024-01-15',
      amount: 100,
      description: 'Salary',
      type: 'Deposit',
      createdAt: Date.now(),
    };

    render(<TransactionForm transaction={transaction} />);

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Salary')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update transaction/i })).toBeInTheDocument();
  });

  it('should update transaction in edit mode', async () => {
    const user = userEvent.setup();
    const transaction: Transaction = {
      id: '1',
      date: '2024-01-15',
      amount: 100,
      description: 'Salary',
      type: 'Deposit',
      createdAt: Date.now(),
    };
    const onSuccess = vi.fn();

    render(<TransactionForm transaction={transaction} onSuccess={onSuccess} />);

    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), 'Updated Salary');
    await user.click(screen.getByRole('button', { name: /update transaction/i }));

    await waitFor(() => {
      expect(mockUpdateTransaction).toHaveBeenCalledWith('1', expect.objectContaining({
        description: 'Updated Salary',
      }));
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should pre-fill form with reuse transaction', () => {
    const reuseTransaction: Transaction = {
      id: '1',
      date: '2024-01-15',
      amount: 100,
      description: 'Salary',
      type: 'Deposit',
      createdAt: Date.now(),
    };

    render(<TransactionForm reuseTransaction={reuseTransaction} />);

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Salary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<TransactionForm onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});

