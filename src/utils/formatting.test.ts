import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateForInput,
  getAmountColorClass,
  getTodayDateString,
} from './formatting';

describe('formatCurrency', () => {
  it('should format positive amounts with EUR symbol by default', () => {
    expect(formatCurrency(100.5)).toBe('€100.50');
    expect(formatCurrency(0.01)).toBe('€0.01');
    expect(formatCurrency(1000)).toBe('€1000.00');
  });

  it('should format negative amounts as absolute values', () => {
    expect(formatCurrency(-100.5)).toBe('€100.50');
    expect(formatCurrency(-0.01)).toBe('€0.01');
  });

  it('should format with 2 decimal places', () => {
    expect(formatCurrency(100)).toBe('€100.00');
    expect(formatCurrency(100.1)).toBe('€100.10');
    expect(formatCurrency(100.123)).toBe('€100.12');
    expect(formatCurrency(100.999)).toBe('€101.00');
  });

  it('should support different currencies', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
    expect(formatCurrency(100, 'GBP')).toBe('£100.00');
  });
});

describe('formatDate', () => {
  it('should format valid date strings', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024');
  });

  it('should support custom format strings', () => {
    expect(formatDate('2024-01-15', 'yyyy-MM-dd')).toBe('2024-01-15');
    expect(formatDate('2024-01-15', 'dd/MM/yyyy')).toBe('15/01/2024');
  });

  it('should return original string for invalid dates', () => {
    const invalidDate = 'invalid-date';
    expect(formatDate(invalidDate)).toBe(invalidDate);
  });

  it('should handle edge cases', () => {
    expect(formatDate('2024-02-29')).toBe('Feb 29, 2024'); // Leap year
    expect(formatDate('2024-01-01')).toBe('Jan 01, 2024');
  });
});

describe('formatDateForInput', () => {
  it('should format Date object to YYYY-MM-DD', () => {
    const date = new Date('2024-01-15');
    expect(formatDateForInput(date)).toBe('2024-01-15');
  });

  it('should return string as-is if already a string', () => {
    expect(formatDateForInput('2024-01-15')).toBe('2024-01-15');
  });

  it('should handle different dates', () => {
    const date = new Date('2024-12-31');
    expect(formatDateForInput(date)).toBe('2024-12-31');
  });
});

describe('getTodayDateString', () => {
  it('should return today\'s date in YYYY-MM-DD format', () => {
    const today = new Date();
    const expected = formatDateForInput(today);
    expect(getTodayDateString()).toBe(expected);
  });

  it('should return a valid date string format', () => {
    const result = getTodayDateString();
    expect(/^\d{4}-\d{2}-\d{2}$/.test(result)).toBe(true);
  });
});

describe('getAmountColorClass', () => {
  it('should return text-income for positive amounts', () => {
    expect(getAmountColorClass(100)).toBe('text-income');
    expect(getAmountColorClass(0.01)).toBe('text-income');
  });

  it('should return text-expense for negative amounts', () => {
    expect(getAmountColorClass(-100)).toBe('text-expense');
    expect(getAmountColorClass(-0.01)).toBe('text-expense');
  });

  it('should return text-text for zero', () => {
    expect(getAmountColorClass(0)).toBe('text-text');
  });
});

