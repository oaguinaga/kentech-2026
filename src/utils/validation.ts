import type { Transaction } from '@/types';

/**
 * Validate transaction amount
 * - Must be non-zero
 * - Must match type (positive for Deposit, negative for Withdrawal)
 */
export function validateTransactionAmount(
  amount: number,
  type: 'Deposit' | 'Withdrawal'
): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount === 0) {
    return { valid: false, error: 'Amount must be a non-zero number' };
  }

  const expectedSign = type === 'Deposit' ? 1 : -1;
  const actualSign = Math.sign(amount);

  if (actualSign !== expectedSign) {
    return {
      valid: false,
      error: `${type} amount must be ${expectedSign > 0 ? 'positive' : 'negative'}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a withdrawal won't result in negative balance
 */
export function validateWithdrawalBalance(
  amount: number,
  currentBalance: number
): { valid: boolean; error?: string } {
  if (amount >= 0) {
    return { valid: false, error: 'Withdrawal amount must be negative' };
  }

  const newBalance = currentBalance + amount; // amount is negative, so this subtracts

  if (newBalance < 0) {
    return {
      valid: false,
      error: `Insufficient balance. Available: ${currentBalance.toFixed(2)}, Attempted: ${Math.abs(amount).toFixed(2)}`,
    };
  }

  return { valid: true };
}

/**
 * Validate transaction date
 */
export function validateTransactionDate(date: string): { valid: boolean; error?: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  // Check if date is in the future (optional business rule)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj > today) {
    return { valid: false, error: 'Transaction date cannot be in the future' };
  }

  return { valid: true };
}

/**
 * Validate transaction description
 */
export function validateTransactionDescription(description: string): { valid: boolean; error?: string } {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Description is required' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Description must be 200 characters or less' };
  }

  return { valid: true };
}

/**
 * Validate a complete transaction
 */
export function validateTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>,
  currentBalance: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate amount
  const amountValidation = validateTransactionAmount(transaction.amount, transaction.type);
  if (!amountValidation.valid) {
    errors.push(amountValidation.error!);
  }

  // Validate balance for withdrawals
  if (transaction.type === 'Withdrawal') {
    const balanceValidation = validateWithdrawalBalance(transaction.amount, currentBalance);
    if (!balanceValidation.valid) {
      errors.push(balanceValidation.error!);
    }
  }

  // Validate date
  const dateValidation = validateTransactionDate(transaction.date);
  if (!dateValidation.valid) {
    errors.push(dateValidation.error!);
  }

  // Validate description
  const descriptionValidation = validateTransactionDescription(transaction.description);
  if (!descriptionValidation.valid) {
    errors.push(descriptionValidation.error!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

