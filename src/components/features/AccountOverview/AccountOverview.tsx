import { useMemo } from 'react';
import { useBankingStore } from '@/store';
import { formatCurrency } from '@/utils';

export const AccountOverview = () => {
  const transactions = useBankingStore((state) => state.transactions);

  // Compute values in component to avoid infinite loops
  const balance = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Balance Card */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Balance</h3>
        </div>
        <p className="text-2xl font-bold text-text">{formatCurrency(balance)}</p>
      </div>

      {/* Income Card */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Total Income</h3>
        </div>
        <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
      </div>

      {/* Expenses Card */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Total Expenses</h3>
        </div>
        <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses)}</p>
      </div>
    </div>
  );
};

