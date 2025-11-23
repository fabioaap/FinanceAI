import { BaseRepository } from './BaseRepository';
import { Goal } from '@/types';
import { db } from '@/database/db';

export class GoalRepository extends BaseRepository<Goal> {
  constructor() {
    super(db.goals);
  }

  async getByType(type: 'savings' | 'debt' | 'reserve'): Promise<Goal[]> {
    return await this.table
      .where('type')
      .equals(type)
      .toArray();
  }

  async getActive(): Promise<Goal[]> {
    const now = new Date();
    return await this.table
      .where('deadline')
      .aboveOrEqual(now)
      .toArray();
  }

  async updateProgress(id: number, currentAmount: number): Promise<void> {
    await this.update(id, { currentAmount, updatedAt: new Date() });
  }

  async getProgress(id: number): Promise<number> {
    const goal = await this.getById(id);
    if (!goal) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  }

  async isCompleted(id: number): Promise<boolean> {
    const goal = await this.getById(id);
    if (!goal) return false;
    return goal.currentAmount >= goal.targetAmount;
  }
}

export const goalRepository = new GoalRepository();
