import { BaseRepository } from './BaseRepository';
import { Bill } from '@/types';
import { db } from '@/database/db';

export class BillRepository extends BaseRepository<Bill> {
  constructor() {
    super(db.bills);
  }

  async getByStatus(status: 'pending' | 'paid' | 'overdue'): Promise<Bill[]> {
    return await this.table
      .where('status')
      .equals(status)
      .toArray();
  }

  async getUpcoming(limit: number = 5): Promise<Bill[]> {
    const now = new Date();
    return await this.table
      .where('dueDate')
      .aboveOrEqual(now)
      .and(bill => bill.status !== 'paid')
      .sortBy('dueDate')
      .then(bills => bills.slice(0, limit));
  }

  async getOverdue(): Promise<Bill[]> {
    const now = new Date();
    return await this.table
      .where('dueDate')
      .below(now)
      .and(bill => bill.status === 'pending')
      .toArray();
  }

  async getRecurring(): Promise<Bill[]> {
    return await this.table
      .filter(bill => bill.recurrence && bill.recurrence !== 'once')
      .toArray();
  }

  async updateStatus(id: number, status: 'pending' | 'paid' | 'overdue'): Promise<void> {
    await this.update(id, { status, updatedAt: new Date() });
  }
}

export const billRepository = new BillRepository();
