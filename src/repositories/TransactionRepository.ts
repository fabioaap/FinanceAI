import { BaseRepository } from './BaseRepository';
import { Transaction } from '@/types';
import { db } from '@/database/db';

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
}

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super(db.transactions);
  }

  async getByFilters(filters: TransactionFilters): Promise<Transaction[]> {
    let collection = this.table.toCollection();

    if (filters.type) {
      collection = collection.filter(t => t.type === filters.type);
    }

    if (filters.categoryId) {
      collection = collection.filter(t => t.categoryId === filters.categoryId);
    }

    if (filters.startDate) {
      collection = collection.filter(t => t.date >= filters.startDate!);
    }

    if (filters.endDate) {
      collection = collection.filter(t => t.date <= filters.endDate!);
    }

    return await collection.toArray();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await this.table
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getTotalByType(type: 'income' | 'expense', startDate?: Date, endDate?: Date): Promise<number> {
    const collection = this.table.where('type').equals(type);

    if (startDate && endDate) {
      const transactions = await collection.toArray();
      const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate);
      return filtered.reduce((sum, t) => sum + t.amount, 0);
    }

    const transactions = await collection.toArray();
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  async getByCategory(categoryId: number): Promise<Transaction[]> {
    return await this.table.where('categoryId').equals(categoryId).toArray();
  }
}

export const transactionRepository = new TransactionRepository();
