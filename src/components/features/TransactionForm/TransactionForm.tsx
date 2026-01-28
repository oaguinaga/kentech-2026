import { Button, DateInput, Input, Select } from '@/components/ui';
import { useBankingStore } from '@/store';
import type { Transaction, TransactionType } from '@/types';
import { formatCurrency as formatCurrencyUtil, getTodayDateString } from '@/utils';
import { parseLocalIsoDate } from '@/utils/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((value) => {
      const date = parseLocalIsoDate(value);
      if (!date) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date.getTime() <= today.getTime();
    }, 'Transaction date cannot be in the future'),
  type: z.enum(['Deposit', 'Withdrawal']),
});

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  
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

  // Ensure amount is always positive in the form (sign conversion happens on submit)
  useEffect(() => {
    if (amount !== undefined && amount !== null && amount < 0) {
      // If user somehow enters negative, convert to positive
      setValue('amount', Math.abs(amount), { shouldValidate: false });
    }
  }, [amount, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    setSubmitError(null);
    
    try {
      const currentBalance = getBalance();
      const transactionAmount = type === 'Deposit' ? data.amount : -data.amount;

      // Validate withdrawal won't cause negative balance
      if (type === 'Withdrawal') {
        const newBalance = currentBalance + transactionAmount;
        if (newBalance < 0) {
          const errorMessage = `Insufficient balance. Available: ${formatCurrencyUtil(currentBalance)}, Attempted: ${formatCurrencyUtil(Math.abs(transactionAmount))}`;
          setSubmitError(errorMessage);
          return;
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

      setSubmitError(null);
      reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
      console.error('Error submitting transaction:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {submitError && (
        <div
          className="p-3 bg-error/10 border border-error rounded-xl text-sm text-error"
          role="alert"
        >
          <strong>Error:</strong> {submitError}
        </div>
      )}

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

      <div className="flex gap-3 justify-end pt-2 border-t border-border mt-6">
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


