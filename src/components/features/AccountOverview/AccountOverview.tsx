import { useCurrencyConversion } from '@/hooks';
import { useBankingStore } from '@/store';
import { formatCurrency } from '@/utils';
import { Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

export const AccountOverview = () => {
  const transactions = useBankingStore((state) => state.transactions);
  const { selectedCurrency, convert } = useCurrencyConversion();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

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

  const actualBalance = formatCurrency(balance, selectedCurrency);

  return (
    <div className="mb-6">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="mb-4">
          <span className="text-sm font-medium text-text-secondary">Total Balance</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <p
            className={`text-4xl sm:text-5xl font-bold text-text transition-all ${
              isBalanceVisible ? 'blur-0' : 'blur-md select-none'
            }`}
          >
            {actualBalance}
          </p>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
            aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
          >
            {isBalanceVisible ? (
              <Eye className="w-4 h-4 text-text-secondary" />
            ) : (
              <EyeOff className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-income" />
            <span className="text-text-secondary text-xs">
              <span className="text-income font-medium">{formatCurrency(totalIncome, selectedCurrency)}</span> income
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-expense" />
            <span className="text-text-secondary text-xs">
              <span className="text-expense font-medium">{formatCurrency(totalExpenses, selectedCurrency)}</span> expenses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

