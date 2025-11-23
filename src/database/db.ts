import Dexie, { Table } from 'dexie';
import { Transaction, Category, Budget, Account, Bill, Goal, AppSettings } from '@/types';

export class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  accounts!: Table<Account>;
  bills!: Table<Bill>;
  goals!: Table<Goal>;
  settings!: Table<AppSettings>;

  constructor() {
    super('FinanceAI');
    
    this.version(1).stores({
      transactions: '++id, description, amount, type, categoryId, date, createdAt, updatedAt',
      categories: '++id, name, type, color, createdAt, updatedAt',
      budgets: '++id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
      accounts: '++id, name, type, balance, currency, createdAt, updatedAt',
    });

    // Version 2: Add bills, goals, settings tables
    this.version(2).stores({
      transactions: '++id, description, amount, type, categoryId, date, createdAt, updatedAt',
      categories: '++id, name, type, color, createdAt, updatedAt',
      budgets: '++id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
      accounts: '++id, name, type, balance, currency, createdAt, updatedAt',
      bills: '++id, description, amount, dueDate, status, recurrence, createdAt, updatedAt',
      goals: '++id, description, targetAmount, currentAmount, deadline, type, createdAt, updatedAt',
      settings: '++id, &key, value, updatedAt',
    });
  }
}

export const db = new FinanceDatabase();
