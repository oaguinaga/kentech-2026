import type { CurrencyCode } from '@/hooks';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate, getAmountColorClass } from '@/utils';
import { ArrowDownCircle, ArrowUpCircle, Copy, Edit2, Trash2 } from 'lucide-react';

export type TransactionListItemVariant = 'mobile' | 'desktop';

export interface TransactionListItemProps {
  variant: TransactionListItemVariant;
  transaction: Transaction;
  isBalanceVisible: boolean;
  selectedCurrency: CurrencyCode;
  convert: (amount: number) => number;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onReuse?: (transaction: Transaction) => void;
}

export const TransactionListItem = ({
  variant,
  transaction,
  isBalanceVisible,
  selectedCurrency,
  convert,
  onEdit,
  onDelete,
  onReuse,
}: TransactionListItemProps) => {
  const isIncome = transaction.amount > 0;
  const Icon = isIncome ? ArrowDownCircle : ArrowUpCircle;

  const amountClasses = `transition-all ${
    isBalanceVisible ? 'blur-0' : 'blur-md select-none'
  } ${getAmountColorClass(transaction.amount)}`;

  const formattedAmount = formatCurrency(convert(transaction.amount), selectedCurrency);

  const actions = (
    <>
      {onEdit && (
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text transition-colors"
          aria-label={`Edit ${transaction.description}`}
          title="Edit transaction"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      )}
      {onReuse && (
        <button
          onClick={() => onReuse(transaction)}
          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text transition-colors"
          aria-label={`Reuse ${transaction.description}`}
          title="Reuse transaction"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(transaction)}
          className="p-1.5 rounded-lg hover:bg-expense/10 text-text-secondary hover:text-expense transition-colors"
          aria-label={`Delete ${transaction.description}`}
          title="Delete transaction"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </>
  );

  if (variant === 'mobile') {
    return (
      <div className="bg-background rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-income/10' : 'bg-expense/10'}`}>
            <Icon className={`w-5 h-5 ${isIncome ? 'text-income' : 'text-expense'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-text truncate">{transaction.description}</h4>
              <span className={`text-base font-bold whitespace-nowrap tabular-nums ${amountClasses}`}>
                {formattedAmount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">{formatDate(transaction.date)}</p>
              <div className="flex items-center gap-1">{actions}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="hover:bg-background-secondary transition-colors">
      <td className="px-4 py-4 whitespace-nowrap text-sm text-text">
        {formatDate(transaction.date)}
      </td>
      <td className="px-4 py-4 text-sm text-text">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isIncome ? 'bg-income/10' : 'bg-expense/10'}`}>
            <Icon className={`w-4 h-4 ${isIncome ? 'text-income' : 'text-expense'}`} />
          </div>
          {transaction.description}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{transaction.type}</td>
      <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold text-right ${amountClasses}`}>
        {formattedAmount}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-1">{actions}</div>
      </td>
    </tr>
  );
};


