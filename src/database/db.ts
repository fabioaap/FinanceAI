import Dexie, { Table } from 'dexie';
import { Transaction, Category, Budget, Account } from '@/types';

export class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  accounts!: Table<Account>;

  constructor() {
    super('FinanceAI');
    
    this.version(1).stores({
      transactions: '++id, description, amount, type, categoryId, date, createdAt, updatedAt',
      categories: '++id, name, type, color, createdAt, updatedAt',
      budgets: '++id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
      accounts: '++id, name, type, balance, currency, createdAt, updatedAt',
    });
  }
}

export const db = new FinanceDatabase();
