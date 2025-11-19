import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionRepository } from '@/repositories/TransactionRepository';
import { Transaction } from '@/types';
import { db } from '@/database/db';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  beforeEach(async () => {
    await db.delete();
    await db.open();
    repository = new TransactionRepository();
  });

  it('should create a transaction', async () => {
    const transaction: Omit<Transaction, 'id'> = {
      description: 'Test Transaction',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await repository.create(transaction);
    expect(id).toBeGreaterThan(0);
  });

  it('should get all transactions', async () => {
    const transaction: Omit<Transaction, 'id'> = {
      description: 'Test Transaction',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repository.create(transaction);
    const transactions = await repository.getAll();
    expect(transactions.length).toBe(1);
  });

  it('should get transaction by id', async () => {
    const transaction: Omit<Transaction, 'id'> = {
      description: 'Test Transaction',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await repository.create(transaction);
    const retrieved = await repository.getById(id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.description).toBe('Test Transaction');
  });

  it('should update a transaction', async () => {
    const transaction: Omit<Transaction, 'id'> = {
      description: 'Test Transaction',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await repository.create(transaction);
    await repository.update(id, { amount: 200 });
    const updated = await repository.getById(id);
    expect(updated?.amount).toBe(200);
  });

  it('should delete a transaction', async () => {
    const transaction: Omit<Transaction, 'id'> = {
      description: 'Test Transaction',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await repository.create(transaction);
    await repository.delete(id);
    const deleted = await repository.getById(id);
    expect(deleted).toBeUndefined();
  });

  it('should filter transactions by type', async () => {
    await repository.create({
      description: 'Income',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.create({
      description: 'Expense',
      amount: 50,
      type: 'expense',
      categoryId: 2,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const incomes = await repository.getByFilters({ type: 'income' });
    expect(incomes.length).toBe(1);
    expect(incomes[0].type).toBe('income');
  });

  it('should calculate total by type', async () => {
    await repository.create({
      description: 'Income 1',
      amount: 100,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.create({
      description: 'Income 2',
      amount: 150,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const total = await repository.getTotalByType('income');
    expect(total).toBe(250);
  });
});
