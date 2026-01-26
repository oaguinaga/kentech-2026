import { format, parseISO } from 'date-fns';
import { getCurrencySymbol, DEFAULT_CURRENCY } from '@/constants';

/**
 * Format currency amount with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.abs(amount).toFixed(2);
  return `${symbol}${formatted}`;
}

/**
 * Format currency with sign (positive/negative indicator)
 */
export function formatCurrencyWithSign(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount, currency)}`;
}

/**
 * Format date from YYYY-MM-DD to display format
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    // Fallback to original string if parsing fails
    return dateString;
  }
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return formatDateForInput(new Date());
}

/**
 * Format transaction amount with color class (for Tailwind)
 */
export function getAmountColorClass(amount: number): string {
  if (amount > 0) {
    return 'text-income';
  }
  if (amount < 0) {
    return 'text-expense';
  }
  return 'text-text';
}

