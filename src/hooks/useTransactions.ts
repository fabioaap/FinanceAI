import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { transactionRepository, DBTransaction } from '../lib/db';

/**
 * Hook para gerenciar transações com dados reativos do Dexie
 * Usa useLiveQuery para atualizações automáticas quando o DB muda
 */
export function useTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live query que atualiza automaticamente quando transações mudam
  const transactions = useLiveQuery(
    () => transactionRepository.getAll(),
    []
  );

  const addTransaction = async (transaction: Omit<DBTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await transactionRepository.add(transaction);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar transação';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: number, changes: Partial<DBTransaction>) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionRepository.update(id, changes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar transação';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionRepository.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar transação';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionRepository.clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar transações';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionsByDateRange = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await transactionRepository.getByDateRange(startDate, endDate);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar transações';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionsByCategory = async (category: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await transactionRepository.getByCategory(category);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar transações';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions: transactions ?? [],
    isLoading: isLoading || transactions === undefined,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    getTransactionsByDateRange,
    getTransactionsByCategory,
  };
}
