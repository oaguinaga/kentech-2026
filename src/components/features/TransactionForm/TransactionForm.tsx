import { Button, DateInput, Input, Select } from '@/components/ui';
import { DEFAULT_CURRENCY, getCurrencySymbol } from '@/constants';
import { useCurrencyConversion } from '@/hooks';
import { useBankingStore } from '@/store';
import type { Transaction, TransactionType } from '@/types';
import { formatCurrency as formatCurrencyUtil, getTodayDateString } from '@/utils';
import { parseLocalIsoDate } from '@/utils/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

export type TransactionFormProps = {
  transaction?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultType?: TransactionType;
  reuseTransaction?: Transaction; // For pre-filling form without editing
};

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
  const { selectedCurrency, convert, rates } = useCurrencyConversion();
  const isEditMode = !!transaction && !reuseTransaction;
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const currencySymbol = getCurrencySymbol(selectedCurrency);
  
  // Use reuseTransaction for initial values if provided, otherwise use transaction
  const initialTransaction = reuseTransaction || transaction;

  // Convert EUR amount to selected currency for display (rounded to 2 decimal places)
  const convertToSelectedCurrency = useCallback((amountEUR: number): number => {
    if (!rates || selectedCurrency === DEFAULT_CURRENCY) {
      return Math.round(amountEUR * 100) / 100; // Round to 2 decimal places
    }
    const converted = convert(amountEUR);
    return Math.round(converted * 100) / 100; // Round to 2 decimal places
  }, [rates, selectedCurrency, convert]);

  // Convert selected currency amount to EUR for storage
  const convertToEUR = (amountInSelectedCurrency: number): number => {
    if (!rates || selectedCurrency === DEFAULT_CURRENCY) {
      return amountInSelectedCurrency;
    }
    const rate = rates[selectedCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${selectedCurrency}, using as EUR`);
      return amountInSelectedCurrency;
    }
    // Reverse conversion: divide by rate to get EUR
    return amountInSelectedCurrency / rate;
  };

  // Calculate initial amount in selected currency for form display
  const initialAmountInSelectedCurrency = useMemo(() => {
    if (!initialTransaction) return undefined;
    const amountEUR = Math.abs(initialTransaction.amount);
    return convertToSelectedCurrency(amountEUR);
  }, [initialTransaction, convertToSelectedCurrency]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialAmountInSelectedCurrency,
      description: initialTransaction?.description || '',
      date: initialTransaction?.date || getTodayDateString(),
      type: initialTransaction?.type || defaultType,
    },
  });

  // Update form amount when currency or rates change (for edit mode)
  useEffect(() => {
    if (initialTransaction && rates) {
      const amountEUR = Math.abs(initialTransaction.amount);
      const amountInSelectedCurrency = convertToSelectedCurrency(amountEUR);
      // Round to 2 decimal places for display
      const roundedAmount = Math.round(amountInSelectedCurrency * 100) / 100;
      setValue('amount', roundedAmount, { shouldValidate: false });
    }
  }, [selectedCurrency, rates, initialTransaction, setValue, convertToSelectedCurrency]);

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
      // Convert amount from selected currency to EUR for storage
      const amountEUR = convertToEUR(data.amount);
      const currentBalance = getBalance();
      const transactionAmountEUR = type === 'Deposit' ? amountEUR : -amountEUR;

      // Validate withdrawal won't cause negative balance
      if (type === 'Withdrawal') {
        // When editing, subtract the original transaction amount first to get the adjusted balance
        const adjustedBalance = isEditMode && transaction
          ? currentBalance - transaction.amount  // Remove old transaction from balance
          : currentBalance;
        
        const newBalance = adjustedBalance + transactionAmountEUR;
        if (newBalance < 0) {
          // Convert balance to selected currency for error message
          const adjustedBalanceInSelectedCurrency = convertToSelectedCurrency(adjustedBalance);
          const attemptedAmountInSelectedCurrency = convertToSelectedCurrency(Math.abs(transactionAmountEUR));
          const errorMessage = `Insufficient balance. Available: ${formatCurrencyUtil(adjustedBalanceInSelectedCurrency, selectedCurrency)}, Attempted: ${formatCurrencyUtil(attemptedAmountInSelectedCurrency, selectedCurrency)}`;
          setSubmitError(errorMessage);
          return;
        }
      }

      if (isEditMode && transaction) {
        updateTransaction(transaction.id, {
          amount: transactionAmountEUR,
          description: data.description,
          date: data.date,
          type: data.type,
        });
      } else {
        addTransaction({
          amount: transactionAmountEUR,
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

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            label="Type"
            options={[
              { value: 'Deposit', label: 'Deposit' },
              { value: 'Withdrawal', label: 'Withdrawal' },
            ]}
            error={errors.type?.message}
            {...field}
          />
        )}
      />

      <Input
        label={`Amount (${currencySymbol})`}
        type="number"
        step="0.01"
        error={errors.amount?.message}
        helperText={
          type === 'Deposit'
            ? `Enter the amount you received in ${selectedCurrency}`
            : `Enter the amount to withdraw in ${selectedCurrency} (will be stored as negative)`
        }
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

      <div className="flex gap-3 justify-end pt-2 mt-6">
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


