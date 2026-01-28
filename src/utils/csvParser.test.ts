import type { Transaction } from '@/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, parseCsvFile, transactionsToCsv } from './csvParser';

// Mock Papa Parse
vi.mock('papaparse', () => {
  const Papa = {
    parse: vi.fn(),
    unparse: vi.fn((data) => {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map((row: Record<string, string>) =>
        headers.map((h) => row[h]).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }),
  };
  return { default: Papa };
});

describe('parseCsvFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse valid CSV file with deposits and withdrawals', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '100.50', Description: 'Salary', Type: 'Deposit' },
      { Date: '2024-01-16', Amount: '-50.25', Description: 'Grocery', Type: 'Withdrawal' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    const result = await parseCsvFile(mockFile);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      date: '2024-01-15',
      amount: 100.5,
      description: 'Salary',
      type: 'Deposit',
    });
    expect(result[1]).toMatchObject({
      date: '2024-01-16',
      amount: -50.25,
      description: 'Grocery',
      type: 'Withdrawal',
    });
    expect(result[0]?.id).toBeDefined();
    expect(result[0]?.createdAt).toBeDefined();
  });

  it('should reject CSV with missing required fields', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '100.50', Description: 'Salary' }, // Missing Type
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Missing required fields');
  });

  it('should reject CSV with invalid date format', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '01/15/2024', Amount: '100.50', Description: 'Salary', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Invalid date format');
  });

  it('should reject CSV with invalid date', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-13-01', Amount: '100.50', Description: 'Salary', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Invalid date');
  });

  it('should reject CSV with invalid amount', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: 'invalid', Description: 'Salary', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Invalid amount');
  });

  it('should reject CSV with zero amount', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '0', Description: 'Salary', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Invalid amount');
  });

  it('should reject CSV with invalid type', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '100.50', Description: 'Salary', Type: 'Invalid' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Invalid type');
  });

  it('should reject CSV when amount sign doesn\'t match type', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '-100.50', Description: 'Salary', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Amount sign doesn\'t match type');
  });

  it('should reject CSV with empty description', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '100.50', Description: '   ', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('Description cannot be empty');
  });

  it('should reject empty CSV file', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: [], errors: [], meta: {} });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('No valid transactions found');
  });

  it('should handle Papa Parse errors', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.error({ message: 'Parse error', type: 'Quotes', code: 'MissingQuotes', row: 1 });
    });

    await expect(parseCsvFile(mockFile)).rejects.toThrow('CSV parsing error');
  });

  it('should trim description whitespace', async () => {
    const Papa = (await import('papaparse')).default;
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });

    const mockData = [
      { Date: '2024-01-15', Amount: '100.50', Description: '  Salary  ', Type: 'Deposit' },
    ];

    (Papa.parse as ReturnType<typeof vi.fn>).mockImplementation((file, options) => {
      options.complete({ data: mockData, errors: [], meta: {} });
    });

    const result = await parseCsvFile(mockFile);
    expect(result[0]?.description).toBe('Salary');
  });
});

describe('transactionsToCsv', () => {
  it('should convert transactions to CSV string', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2024-01-15',
        amount: 100.5,
        description: 'Salary',
        type: 'Deposit',
        createdAt: Date.now(),
      },
      {
        id: '2',
        date: '2024-01-16',
        amount: -50.25,
        description: 'Grocery',
        type: 'Withdrawal',
        createdAt: Date.now(),
      },
    ];

    const csv = transactionsToCsv(transactions);
    
    expect(csv).toContain('Date,Amount,Description,Type');
    expect(csv).toContain('2024-01-15,100.5,Salary,Deposit');
    expect(csv).toContain('2024-01-16,-50.25,Grocery,Withdrawal');
  });

  it('should handle empty transactions array', () => {
    const csv = transactionsToCsv([]);
    expect(csv).toBe('');
  });

  it('should include all transaction fields', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2024-01-15',
        amount: 1000,
        description: 'Test Description',
        type: 'Deposit',
        createdAt: Date.now(),
      },
    ];

    const csv = transactionsToCsv(transactions);
    const lines = csv.split('\n');
    
    expect(lines[0]).toBe('Date,Amount,Description,Type');
    expect(lines[1]).toBe('2024-01-15,1000,Test Description,Deposit');
  });
});

describe('downloadCsv', () => {
  beforeEach(() => {
    // Mock DOM methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document methods
    document.createElement = vi.fn(() => {
      const element = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {},
      } as unknown as HTMLElement;
      return element;
    });
    
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create and trigger download link', () => {
    const csvContent = 'Date,Amount\n2024-01-15,100';
    const filename = 'test-transactions.csv';

    downloadCsv(csvContent, filename);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should use default filename if not provided', () => {
    const csvContent = 'Date,Amount\n2024-01-15,100';

    downloadCsv(csvContent);

    expect(document.createElement).toHaveBeenCalledWith('a');
  });
});

