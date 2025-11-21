import Dexie, { Table } from 'dexie';

// Database models
export interface DBTransaction {
  id?: number;
  date: string; // ISO date string for storage
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance?: number;
  category?: string;
  accountId?: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Bill {
  id?: number;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  isPaid: boolean;
  category?: string;
  recurrence?: 'once' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date string
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  key: string; // primary key
  value: string; // JSON stringified value
}

// Dexie database class
export class FinanceAIDatabase extends Dexie {
  transactions!: Table<DBTransaction, number>;
  bills!: Table<Bill, number>;
  goals!: Table<Goal, number>;
  categories!: Table<Category, number>;
  settings!: Table<Settings, string>;

  constructor() {
    super('financeai-db');
    
    this.version(1).stores({
      transactions: '++id, date, type, category, accountId, createdAt',
      bills: '++id, dueDate, isPaid, category, createdAt',
      goals: '++id, deadline, createdAt',
      categories: '++id, name, type, createdAt',
      settings: 'key',
    });
  }
}

// Singleton instance
export const db = new FinanceAIDatabase();
