import { BaseRepository } from './BaseRepository';
import { Goal } from '@/types';
import { db } from '@/database/db';

export interface GoalFilters {
  type?: 'savings' | 'debt' | 'reserve';
  startDate?: Date;
  endDate?: Date;
}

export class GoalRepository extends BaseRepository<Goal> {
  constructor() {
    super(db.goals);
  }

  async getByType(type: 'savings' | 'debt' | 'reserve'): Promise<Goal[]> {
    return await this.table.where('type').equals(type).toArray();
  }

  async getByFilters(filters: GoalFilters): Promise<Goal[]> {
    let collection = this.table.toCollection();

    if (filters.type) {
      collection = collection.filter(g => g.type === filters.type);
    }

    if (filters.startDate) {
      collection = collection.filter(g => g.deadline >= filters.startDate!);
    }

    if (filters.endDate) {
      collection = collection.filter(g => g.deadline <= filters.endDate!);
    }

    return await collection.toArray();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
    return await this.table
      .where('deadline')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async updateProgress(id: number, currentAmount: number): Promise<number> {
    return await this.update(id, { currentAmount });
  }
}

export const goalRepository = new GoalRepository();
