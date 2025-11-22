import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryRepository } from '@/repositories/CategoryRepository';
import { Category } from '@/types';
import { db } from '@/database/db';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;

  beforeEach(async () => {
    await db.delete();
    await db.open();
    repository = new CategoryRepository();
  });

  it('should create a category', async () => {
    const category: Omit<Category, 'id'> = {
      name: 'Salary',
      type: 'income',
      color: '#00FF00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await repository.create(category);
    expect(id).toBeGreaterThan(0);
  });

  it('should get categories by type', async () => {
    await repository.create({
      name: 'Salary',
      type: 'income',
      color: '#00FF00',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.create({
      name: 'Food',
      type: 'expense',
      color: '#FF0000',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const incomeCategories = await repository.getByType('income');
    expect(incomeCategories.length).toBe(1);
    expect(incomeCategories[0].name).toBe('Salary');
  });

  it('should check if category exists', async () => {
    await repository.create({
      name: 'Salary',
      type: 'income',
      color: '#00FF00',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const exists = await repository.exists('Salary');
    expect(exists).toBe(true);

    const notExists = await repository.exists('Bonus');
    expect(notExists).toBe(false);
  });
});
