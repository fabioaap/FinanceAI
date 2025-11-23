import { useState, useEffect, useCallback } from 'react'
import { goalRepository } from '@/repositories/GoalRepository'
import { Goal as DbGoal } from '@/types'
import { Goal as AppGoal } from '@/lib/types'

/**
 * Converts DB Goal (Date objects) to App Goal (ISO strings)
 */
function dbToApp(goal: DbGoal): AppGoal {
  return {
    id: String(goal.id),
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: goal.deadline.toISOString(),
    type: goal.type,
    createdAt: goal.createdAt.toISOString(),
  }
}

/**
 * Converts App Goal (ISO strings) to DB Goal (Date objects)
 */
function appToDb(goal: AppGoal): Omit<DbGoal, 'id'> {
  return {
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: new Date(goal.deadline),
    type: goal.type,
    createdAt: new Date(goal.createdAt || new Date()),
    updatedAt: new Date(),
  }
}

export function useGoals() {
  const [goals, setGoals] = useState<AppGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true)
      const dbGoals = await goalRepository.getAll()
      const appGoals = dbGoals.map(dbToApp)
      setGoals(appGoals)
      setError(null)
    } catch (err) {
      console.error('Failed to load goals:', err)
      setError(err instanceof Error ? err : new Error('Failed to load goals'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const addGoal = useCallback(
    async (goal: AppGoal) => {
      try {
        await goalRepository.create(appToDb(goal))
        await loadGoals()
      } catch (err) {
        console.error('Failed to add goal:', err)
        throw err instanceof Error ? err : new Error('Failed to add goal')
      }
    },
    [loadGoals]
  )

  const updateGoal = useCallback(
    async (goalId: string, updates: Partial<AppGoal>) => {
      try {
        const dbUpdates: Partial<DbGoal> = {}
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.targetAmount !== undefined) dbUpdates.targetAmount = updates.targetAmount
        if (updates.currentAmount !== undefined) dbUpdates.currentAmount = updates.currentAmount
        if (updates.deadline !== undefined) dbUpdates.deadline = new Date(updates.deadline)
        if (updates.type !== undefined) dbUpdates.type = updates.type
        dbUpdates.updatedAt = new Date()

        await goalRepository.update(Number(goalId), dbUpdates)
        await loadGoals()
      } catch (err) {
        console.error('Failed to update goal:', err)
        throw err instanceof Error ? err : new Error('Failed to update goal')
      }
    },
    [loadGoals]
  )

  const removeGoal = useCallback(
    async (goalId: string) => {
      try {
        await goalRepository.delete(Number(goalId))
        await loadGoals()
      } catch (err) {
        console.error('Failed to remove goal:', err)
        throw err instanceof Error ? err : new Error('Failed to remove goal')
      }
    },
    [loadGoals]
  )

  const updateProgress = useCallback(
    async (goalId: string, currentAmount: number) => {
      try {
        await goalRepository.updateProgress(Number(goalId), currentAmount)
        await loadGoals()
      } catch (err) {
        console.error('Failed to update progress:', err)
        throw err instanceof Error ? err : new Error('Failed to update progress')
      }
    },
    [loadGoals]
  )

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    removeGoal,
    updateProgress,
    refresh: loadGoals,
  }
}
