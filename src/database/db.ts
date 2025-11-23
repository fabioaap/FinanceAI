import Dexie, { Table } from 'dexie';
import { Transaction, Category, Budget, Account, Bill, Goal, Settings } from '@/types';

export class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  accounts!: Table<Account>;
  bills!: Table<Bill>;
  goals!: Table<Goal>;
  settings!: Table<Settings>;

  constructor() {
    super('FinanceAI');
    
    this.version(1).stores({
      transactions: '++id, description, amount, type, categoryId, date, createdAt, updatedAt',
      categories: '++id, name, type, color, createdAt, updatedAt',
      budgets: '++id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
      accounts: '++id, name, type, balance, currency, createdAt, updatedAt',
    });

    // Version 2: Add bills, goals, and settings tables
    this.version(2).stores({
      transactions: '++id, description, amount, type, categoryId, date, createdAt, updatedAt',
      categories: '++id, name, type, color, createdAt, updatedAt',
      budgets: '++id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
      accounts: '++id, name, type, balance, currency, createdAt, updatedAt',
      bills: '++id, dueDate, status, createdAt, updatedAt',
      goals: '++id, deadline, type, createdAt, updatedAt',
      settings: '++id, &key, createdAt, updatedAt',
    });
  }
}

export const db = new FinanceDatabase();
