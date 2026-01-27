import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBankingStore } from '@/store';
import { Button, Input, Select, DateInput } from '@/components/ui';
import { getTodayDateString, formatCurrency as formatCurrencyUtil } from '@/utils';
import type { Transaction, TransactionType } from '@/types';

const transactionSchema = z
  .object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required').max(200, 'Description must be 200 characters or less'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    type: z.enum(['Deposit', 'Withdrawal']),
  })
  .refine(
    (data) => {
      // Deposit must be positive, Withdrawal must be negative
      if (data.type === 'Deposit' && data.amount < 0) return false;
      if (data.type === 'Withdrawal' && data.amount > 0) return false;
      return true;
    },
    {
      message: 'Amount sign must match transaction type',
      path: ['amount'],
    }
  );

type TransactionFormData = z.infer<typeof transactionSchema>;

export interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultType?: TransactionType;
  reuseTransaction?: Transaction; // For pre-filling form without editing
}

export const TransactionForm = ({
  transaction,
  onSuccess,
  onCancel,
  defaultType = 'Deposit',
  reuseTransaction,
}: TransactionFormProps) => {
  const addTransaction = useBankingStore((state) => state.addTransaction);
  const updateTransaction = useBankingStore((state) => state.updateTransaction);
  const getBalance = useBankingStore((state) => state.getBalance);
  const isEditMode = !!transaction && !reuseTransaction;
  
  // Use reuseTransaction for initial values if provided, otherwise use transaction
  const initialTransaction = reuseTransaction || transaction;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialTransaction ? Math.abs(initialTransaction.amount) : undefined,
      description: initialTransaction?.description || '',
      date: initialTransaction?.date || getTodayDateString(),
      type: initialTransaction?.type || defaultType,
    },
  });

  const type = watch('type');
  const amount = watch('amount');

  // Update amount sign when type changes (only if sign doesn't match)
  useEffect(() => {
    if (amount !== undefined && amount !== null && amount !== 0) {
      const currentAmount = amount;
      if (type === 'Deposit' && currentAmount < 0) {
        setValue('amount', Math.abs(currentAmount), { shouldValidate: false });
      } else if (type === 'Withdrawal' && currentAmount > 0) {
        setValue('amount', -Math.abs(currentAmount), { shouldValidate: false });
      }
    }
  }, [type, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const currentBalance = getBalance();
      const transactionAmount = type === 'Deposit' ? data.amount : -data.amount;

      // Validate withdrawal won't cause negative balance
      if (type === 'Withdrawal') {
        const newBalance = currentBalance + transactionAmount;
        if (newBalance < 0) {
          // This should be caught by the form validation, but double-check
          throw new Error(
            `Insufficient balance. Available: ${formatCurrencyUtil(currentBalance)}, Attempted: ${formatCurrencyUtil(Math.abs(transactionAmount))}`
          );
        }
      }

      if (isEditMode && transaction) {
        updateTransaction(transaction.id, {
          amount: transactionAmount,
          description: data.description,
          date: data.date,
          type: data.type,
        });
      } else {
        addTransaction({
          amount: transactionAmount,
          description: data.description,
          date: data.date,
          type: data.type,
        });
      }

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      // Error handling could be improved with toast notifications
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <Select
        label="Type"
        options={[
          { value: 'Deposit', label: 'Deposit' },
          { value: 'Withdrawal', label: 'Withdrawal' },
        ]}
        error={errors.type?.message}
        {...register('type')}
        onChange={(e) => {
          setValue('type', e.target.value as TransactionType);
        }}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        error={errors.amount?.message}
        helperText={type === 'Deposit' ? 'Enter positive amount' : 'Enter positive amount (will be converted to negative)'}
        {...register('amount', { valueAsNumber: true })}
      />

      <Input
        label="Description"
        error={errors.description?.message}
        {...register('description')}
      />

      <DateInput
        label="Date"
        error={errors.date?.message}
        {...register('date')}
      />

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {isEditMode ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};


