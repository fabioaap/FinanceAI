import { describe, it, expect, beforeEach } from 'vitest';
import { goalRepository } from './GoalRepository';
import { db } from '@/database/db';

describe('GoalRepository', () => {
  beforeEach(async () => {
    // Clear the goals table before each test
    await db.goals.clear();
  });

  it('should create a goal', async () => {
    const goal = {
      description: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      deadline: new Date('2025-12-31'),
      type: 'savings' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await goalRepository.create(goal);
    expect(id).toBeGreaterThan(0);

    const saved = await goalRepository.getById(id);
    expect(saved).toBeDefined();
    expect(saved?.description).toBe('Emergency Fund');
    expect(saved?.targetAmount).toBe(10000);
    expect(saved?.currentAmount).toBe(2500);
    expect(saved?.type).toBe('savings');
  });

  it('should get all goals', async () => {
    await goalRepository.create({
      description: 'Goal 1',
      targetAmount: 5000,
      currentAmount: 1000,
      deadline: new Date('2025-06-30'),
      type: 'savings' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await goalRepository.create({
      description: 'Goal 2',
      targetAmount: 20000,
      currentAmount: 5000,
      deadline: new Date('2026-12-31'),
      type: 'debt' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const goals = await goalRepository.getAll();
    expect(goals).toHaveLength(2);
  });

  it('should get goals by type', async () => {
    await goalRepository.create({
      description: 'Savings Goal',
      targetAmount: 5000,
      currentAmount: 1000,
      deadline: new Date('2025-06-30'),
      type: 'savings' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await goalRepository.create({
      description: 'Debt Goal',
      targetAmount: 20000,
      currentAmount: 5000,
      deadline: new Date('2026-12-31'),
      type: 'debt' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savingsGoals = await goalRepository.getByType('savings');
    expect(savingsGoals).toHaveLength(1);
    expect(savingsGoals[0].description).toBe('Savings Goal');
  });

  it('should update goal progress', async () => {
    const id = await goalRepository.create({
      description: 'Test Goal',
      targetAmount: 10000,
      currentAmount: 2500,
      deadline: new Date('2025-12-31'),
      type: 'savings' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await goalRepository.updateProgress(id, 5000);

    const updated = await goalRepository.getById(id);
    expect(updated?.currentAmount).toBe(5000);
  });

  it('should delete a goal', async () => {
    const id = await goalRepository.create({
      description: 'Test Goal',
      targetAmount: 10000,
      currentAmount: 2500,
      deadline: new Date('2025-12-31'),
      type: 'savings' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await goalRepository.delete(id);

    const deleted = await goalRepository.getById(id);
    expect(deleted).toBeUndefined();
  });
});
