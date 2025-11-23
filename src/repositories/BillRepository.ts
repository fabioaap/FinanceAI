import { BaseRepository } from './BaseRepository';
import { Bill } from '@/types';
import { db } from '@/database/db';

export interface BillFilters {
  status?: 'pending' | 'paid' | 'overdue';
  startDate?: Date;
  endDate?: Date;
}

export class BillRepository extends BaseRepository<Bill> {
  constructor() {
    super(db.bills);
  }

  async getByStatus(status: 'pending' | 'paid' | 'overdue'): Promise<Bill[]> {
    return await this.table.where('status').equals(status).toArray();
  }

  async getByFilters(filters: BillFilters): Promise<Bill[]> {
    let collection = this.table.toCollection();

    if (filters.status) {
      collection = collection.filter(b => b.status === filters.status);
    }

    if (filters.startDate) {
      collection = collection.filter(b => b.dueDate >= filters.startDate!);
    }

    if (filters.endDate) {
      collection = collection.filter(b => b.dueDate <= filters.endDate!);
    }

    return await collection.toArray();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Bill[]> {
    return await this.table
      .where('dueDate')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async updateStatus(id: number, status: 'pending' | 'paid' | 'overdue'): Promise<number> {
    return await this.update(id, { status });
  }
}

export const billRepository = new BillRepository();
