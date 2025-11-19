export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance?: number;
  id?: string;
  category?: string;
}

export interface ParseResult {
  transactions: Transaction[];
  accountInfo?: {
    accountId?: string;
    bankId?: string;
    accountType?: string;
    currency?: string;
    startDate?: Date;
    endDate?: Date;
  };
  errors?: string[];
}

export type FileFormat = 'ofx' | 'csv';
