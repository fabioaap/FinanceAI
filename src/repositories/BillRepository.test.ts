import { describe, it, expect, beforeEach } from 'vitest';
import { billRepository } from './BillRepository';
import { db } from '@/database/db';

describe('BillRepository', () => {
  beforeEach(async () => {
    // Clear the bills table before each test
    await db.bills.clear();
  });

  it('should create a bill', async () => {
    const bill = {
      description: 'Electric Bill',
      amount: 150.50,
      dueDate: new Date('2024-12-01'),
      status: 'pending' as const,
      recurrence: 'monthly' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await billRepository.create(bill);
    expect(id).toBeGreaterThan(0);

    const saved = await billRepository.getById(id);
    expect(saved).toBeDefined();
    expect(saved?.description).toBe('Electric Bill');
    expect(saved?.amount).toBe(150.50);
    expect(saved?.status).toBe('pending');
  });

  it('should get all bills', async () => {
    await billRepository.create({
      description: 'Water Bill',
      amount: 50.00,
      dueDate: new Date('2024-12-05'),
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await billRepository.create({
      description: 'Internet Bill',
      amount: 80.00,
      dueDate: new Date('2024-12-10'),
      status: 'paid' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const bills = await billRepository.getAll();
    expect(bills).toHaveLength(2);
  });

  it('should get bills by status', async () => {
    await billRepository.create({
      description: 'Bill 1',
      amount: 50.00,
      dueDate: new Date('2024-12-05'),
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await billRepository.create({
      description: 'Bill 2',
      amount: 80.00,
      dueDate: new Date('2024-12-10'),
      status: 'paid' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const pendingBills = await billRepository.getByStatus('pending');
    expect(pendingBills).toHaveLength(1);
    expect(pendingBills[0].description).toBe('Bill 1');
  });

  it('should update bill status', async () => {
    const id = await billRepository.create({
      description: 'Test Bill',
      amount: 100.00,
      dueDate: new Date('2024-12-15'),
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await billRepository.updateStatus(id, 'paid');

    const updated = await billRepository.getById(id);
    expect(updated?.status).toBe('paid');
  });

  it('should delete a bill', async () => {
    const id = await billRepository.create({
      description: 'Test Bill',
      amount: 100.00,
      dueDate: new Date('2024-12-15'),
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await billRepository.delete(id);

    const deleted = await billRepository.getById(id);
    expect(deleted).toBeUndefined();
  });
});
