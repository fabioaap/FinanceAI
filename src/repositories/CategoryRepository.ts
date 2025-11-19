import { BaseRepository } from './BaseRepository';
import { Category } from '@/types';
import { db } from '@/database/db';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(db.categories);
  }

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    return await this.table.where('type').equals(type).toArray();
  }

  async getByName(name: string): Promise<Category | undefined> {
    return await this.table.where('name').equalsIgnoreCase(name).first();
  }

  async exists(name: string): Promise<boolean> {
    const category = await this.getByName(name);
    return category !== undefined;
  }
}

export const categoryRepository = new CategoryRepository();
