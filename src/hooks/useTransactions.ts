import { useState, useEffect, useCallback } from 'react';
import { transactionRepository, TransactionFilters } from '@/repositories/TransactionRepository';
import { Transaction } from '@/types';

export const useTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = filters
        ? await transactionRepository.getByFilters(filters)
        : await transactionRepository.getAll();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const createTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      await transactionRepository.create(transaction);
      await loadTransactions();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create transaction');
    }
  }, [loadTransactions]);

  const updateTransaction = useCallback(async (id: number, transaction: Partial<Transaction>) => {
    try {
      await transactionRepository.update(id, transaction);
      await loadTransactions();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update transaction');
    }
  }, [loadTransactions]);

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      await transactionRepository.delete(id);
      await loadTransactions();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete transaction');
    }
  }, [loadTransactions]);

  const getTotalByType = useCallback(async (type: 'income' | 'expense', startDate?: Date, endDate?: Date) => {
    return await transactionRepository.getTotalByType(type, startDate, endDate);
  }, []);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalByType,
    refresh: loadTransactions,
  };
};
