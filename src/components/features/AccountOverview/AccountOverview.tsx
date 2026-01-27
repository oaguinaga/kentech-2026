import { useCurrencyConversion } from '@/hooks';
import { useBankingStore } from '@/store';
import { formatCurrency } from '@/utils';
import { useMemo } from 'react';

export const AccountOverview = () => {
  const transactions = useBankingStore((state) => state.transactions);
  const { selectedCurrency, convert } = useCurrencyConversion();

  // Compute values in component to avoid infinite loops
  const balanceEUR = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalIncomeEUR = useMemo(() => {
    return transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalExpensesEUR = useMemo(() => {
    return Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );
  }, [transactions]);

  // Convert to selected currency (re-compute when currency or amounts change)
  const balance = useMemo(() => convert(balanceEUR), [balanceEUR, convert]);
  const totalIncome = useMemo(() => convert(totalIncomeEUR), [totalIncomeEUR, convert]);
  const totalExpenses = useMemo(() => convert(totalExpensesEUR), [totalExpensesEUR, convert]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Balance Card */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Balance</h3>
        </div>
        <p className="text-2xl font-bold text-text">{formatCurrency(balance, selectedCurrency)}</p>
      </div>

      {/* Income Card */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Total Income</h3>
        </div>
        <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome, selectedCurrency)}</p>
      </div>

      {/* Expenses Card */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Total Expenses</h3>
        </div>
        <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses, selectedCurrency)}</p>
      </div>
    </div>
  );
};

