export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance?: number;
}

export interface ParseResult {
  transactions: Transaction[];
  accountInfo?: {
    accountNumber?: string;
    bankId?: string;
    currency?: string;
  };
  errors?: string[];
}
