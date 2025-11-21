import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { goalRepository, Goal } from '../lib/db';

/**
 * Hook para gerenciar metas (goals) com dados reativos do Dexie
 */
export function useGoals() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live query que atualiza automaticamente quando goals mudam
  const goals = useLiveQuery(
    () => goalRepository.getAll(),
    []
  );

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await goalRepository.add(goal);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar meta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async (id: number, changes: Partial<Goal>) => {
    setIsLoading(true);
    setError(null);
    try {
      await goalRepository.update(id, changes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar meta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await goalRepository.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar meta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    goals: goals ?? [],
    isLoading: isLoading || goals === undefined,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
