import { useState, useEffect, useCallback } from 'react';
import { goalRepository, GoalFilters } from '@/repositories/GoalRepository';
import { Goal } from '@/types';
import { Goal as AppGoal } from '@/lib/types';

/**
 * Convert Dexie Goal to App Goal format
 */
function dbToApp(goal: Goal): AppGoal {
  return {
    id: String(goal.id),
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: goal.deadline.toISOString(),
    type: goal.type,
    createdAt: goal.createdAt.toISOString(),
  };
}

/**
 * Convert App Goal to Dexie Goal format
 */
function appToDb(goal: AppGoal): Omit<Goal, 'id'> {
  return {
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: new Date(goal.deadline),
    type: goal.type,
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(),
  };
}

export const useGoals = (filters?: GoalFilters) => {
  const [goals, setGoals] = useState<AppGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = filters
        ? await goalRepository.getByFilters(filters)
        : await goalRepository.getAll();
      setGoals(data.map(dbToApp));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load goals'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = useCallback(async (goal: AppGoal) => {
    try {
      await goalRepository.create(appToDb(goal));
      await loadGoals();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add goal');
    }
  }, [loadGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<AppGoal>) => {
    try {
      const dbUpdates: Partial<Goal> = {};
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.targetAmount !== undefined) dbUpdates.targetAmount = updates.targetAmount;
      if (updates.currentAmount !== undefined) dbUpdates.currentAmount = updates.currentAmount;
      if (updates.deadline !== undefined) dbUpdates.deadline = new Date(updates.deadline);
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      
      await goalRepository.update(Number(id), dbUpdates);
      await loadGoals();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update goal');
    }
  }, [loadGoals]);

  const removeGoal = useCallback(async (id: string) => {
    try {
      await goalRepository.delete(Number(id));
      await loadGoals();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete goal');
    }
  }, [loadGoals]);

  const updateProgress = useCallback(async (id: string, currentAmount: number) => {
    try {
      await goalRepository.updateProgress(Number(id), currentAmount);
      await loadGoals();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update goal progress');
    }
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    removeGoal,
    updateProgress,
    refresh: loadGoals,
  };
};
