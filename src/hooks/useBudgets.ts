import { useState, useEffect, useCallback } from 'react';
import { budgetRepository } from '@/repositories/BudgetRepository';
import { Budget } from '@/types';

export const useBudgets = (categoryId?: number) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = categoryId
        ? await budgetRepository.getByCategory(categoryId)
        : await budgetRepository.getAll();
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load budgets'));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const createBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    try {
      await budgetRepository.create(budget);
      await loadBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create budget');
    }
  }, [loadBudgets]);

  const updateBudget = useCallback(async (id: number, budget: Partial<Budget>) => {
    try {
      await budgetRepository.update(id, budget);
      await loadBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update budget');
    }
  }, [loadBudgets]);

  const deleteBudget = useCallback(async (id: number) => {
    try {
      await budgetRepository.delete(id);
      await loadBudgets();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete budget');
    }
  }, [loadBudgets]);

  const getActiveBudgets = useCallback(async (date?: Date) => {
    return await budgetRepository.getActiveBudgets(date);
  }, []);

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getActiveBudgets,
    refresh: loadBudgets,
  };
};
