import { BaseRepository } from './BaseRepository';
import { Budget } from '@/types';
import { db } from '@/database/db';

export class BudgetRepository extends BaseRepository<Budget> {
  constructor() {
    super(db.budgets);
  }

  async getByCategory(categoryId: number): Promise<Budget[]> {
    return await this.table.where('categoryId').equals(categoryId).toArray();
  }

  async getActiveBudgets(date: Date = new Date()): Promise<Budget[]> {
    const budgets = await this.table.toArray();
    return budgets.filter(budget => {
      const isAfterStart = budget.startDate <= date;
      const isBeforeEnd = !budget.endDate || budget.endDate >= date;
      return isAfterStart && isBeforeEnd;
    });
  }

  async getByPeriod(period: 'monthly' | 'yearly'): Promise<Budget[]> {
    return await this.table.where('period').equals(period).toArray();
  }
}

export const budgetRepository = new BudgetRepository();
