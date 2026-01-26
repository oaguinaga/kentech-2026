import { useBankingStore } from '@/store';
import { formatCurrency } from '@/utils';

export const AccountOverview = () => {
  const balance = useBankingStore((state) => state.getBalance());
  const totalIncome = useBankingStore((state) => state.getTotalIncome());
  const totalExpenses = useBankingStore((state) => state.getTotalExpenses());

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

