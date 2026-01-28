import { DEFAULT_CURRENCY, getCurrencySymbol } from '@/constants';
import { format, parseISO } from 'date-fns';

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
 * Format date from YYYY-MM-DD to display format
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
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

