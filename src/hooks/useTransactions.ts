import { useState, useEffect, useCallback } from 'react';
import { 
  getAllTransactions, 
  addTransaction as addTransactionToDB, 
  updateTransaction as updateTransactionInDB,
  deleteTransaction as deleteTransactionFromDB,
  getTransactionsByType,
  getTransactionsByCategory,
  type Transaction as DBTransaction
} from '@financeai/infra-db';

// Export the Transaction type from the DB package
export type { Transaction } from '@financeai/infra-db';

interface UseTransactionsResult {
  transactions: DBTransaction[];
  loading: boolean;
  error: Error | null;
  addTransaction: (transaction: Omit<DBTransaction, 'id' | 'createdAt'>) => Promise<number>;
  updateTransaction: (id: number, updates: Partial<Omit<DBTransaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  getByType: (type: 'income' | 'expense') => DBTransaction[];
  getByCategory: (category: string) => DBTransaction[];
  refetch: () => Promise<void>;
}

/**
 * Custom hook to manage transactions using Dexie database
 * @returns Object with transactions data and CRUD operations
 */
export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<DBTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Add a new transaction
  const addTransaction = useCallback(async (
    transaction: Omit<DBTransaction, 'id' | 'createdAt'>
  ): Promise<number> => {
    try {
      const id = await addTransactionToDB(transaction);
      await fetchTransactions(); // Refetch to update the list
      return id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add transaction');
      setError(error);
      console.error('Error adding transaction:', err);
      throw error;
    }
  }, [fetchTransactions]);

  // Update an existing transaction
  const updateTransaction = useCallback(async (
    id: number,
    updates: Partial<Omit<DBTransaction, 'id' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updateTransactionInDB(id, updates);
      await fetchTransactions(); // Refetch to update the list
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update transaction');
      setError(error);
      console.error('Error updating transaction:', err);
      throw error;
    }
  }, [fetchTransactions]);

  // Delete a transaction
  const deleteTransaction = useCallback(async (id: number): Promise<void> => {
    try {
      await deleteTransactionFromDB(id);
      await fetchTransactions(); // Refetch to update the list
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete transaction');
      setError(error);
      console.error('Error deleting transaction:', err);
      throw error;
    }
  }, [fetchTransactions]);

  // Filter transactions by type (computed from current state)
  const getByType = useCallback((type: 'income' | 'expense'): DBTransaction[] => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  // Filter transactions by category (computed from current state)
  const getByCategory = useCallback((category: string): DBTransaction[] => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getByType,
    getByCategory,
    refetch: fetchTransactions,
  };
}
