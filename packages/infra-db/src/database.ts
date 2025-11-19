import Dexie, { Table } from 'dexie';

/**
 * Transaction interface defining the structure of a financial transaction
 */
export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  createdAt?: Date;
}

/**
 * FinanceAI Database class extending Dexie
 */
export class FinanceAIDatabase extends Dexie {
  transactions!: Table<Transaction, number>;

  constructor() {
    super('FinanceAIDB');
    
    this.version(1).stores({
      transactions: '++id, amount, description, category, date, type, createdAt'
    });
  }
}

// Singleton instance
export const db = new FinanceAIDatabase();
