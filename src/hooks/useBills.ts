import { useState, useEffect, useCallback } from 'react';
import { billRepository, BillFilters } from '@/repositories/BillRepository';
import { Bill } from '@/types';
import { Bill as AppBill } from '@/lib/types';

/**
 * Convert Dexie Bill to App Bill format
 */
function dbToApp(bill: Bill): AppBill {
  return {
    id: String(bill.id),
    description: bill.description,
    amount: bill.amount,
    dueDate: bill.dueDate.toISOString(),
    status: bill.status,
    recurrence: bill.recurrence,
    createdAt: bill.createdAt.toISOString(),
  };
}

/**
 * Convert App Bill to Dexie Bill format
 */
function appToDb(bill: AppBill): Omit<Bill, 'id'> {
  return {
    description: bill.description,
    amount: bill.amount,
    dueDate: new Date(bill.dueDate),
    status: bill.status,
    recurrence: bill.recurrence,
    createdAt: new Date(bill.createdAt),
    updatedAt: new Date(),
  };
}

export const useBills = (filters?: BillFilters) => {
  const [bills, setBills] = useState<AppBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const data = filters
        ? await billRepository.getByFilters(filters)
        : await billRepository.getAll();
      setBills(data.map(dbToApp));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load bills'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const addBill = useCallback(async (bill: AppBill) => {
    try {
      await billRepository.create(appToDb(bill));
      await loadBills();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add bill');
    }
  }, [loadBills]);

  const updateBill = useCallback(async (id: string, updates: Partial<AppBill>) => {
    try {
      const dbUpdates: Partial<Bill> = {};
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.dueDate !== undefined) dbUpdates.dueDate = new Date(updates.dueDate);
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence;
      
      await billRepository.update(Number(id), dbUpdates);
      await loadBills();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update bill');
    }
  }, [loadBills]);

  const removeBill = useCallback(async (id: string) => {
    try {
      await billRepository.delete(Number(id));
      await loadBills();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete bill');
    }
  }, [loadBills]);

  const updateBillStatus = useCallback(async (id: string, status: 'pending' | 'paid' | 'overdue') => {
    try {
      await billRepository.updateStatus(Number(id), status);
      await loadBills();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update bill status');
    }
  }, [loadBills]);

  return {
    bills,
    loading,
    error,
    addBill,
    updateBill,
    removeBill,
    updateBillStatus,
    refresh: loadBills,
  };
};
