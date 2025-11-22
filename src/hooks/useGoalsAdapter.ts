import { useState, useEffect, useCallback } from 'react'
import { Goal } from '@/lib/types'

const STORAGE_KEY = 'financeai-goals'

/**
 * Hook provisório para gerenciar goals com localStorage
 * até migração completa para Dexie
 */
export function useGoalsAdapter() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load goals from localStorage:', error)
      return []
    }
  })

  // Persiste no localStorage sempre que goals mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    } catch (error) {
      console.error('Failed to save goals to localStorage:', error)
    }
  }, [goals])

  const addGoal = useCallback(async (goal: Goal) => {
    setGoals((current) => [...current, goal])
  }, [])

  const removeGoal = useCallback(async (goalId: string) => {
    setGoals((current) => current.filter((goal) => goal.id !== goalId))
  }, [])

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    )
  }, [])

  return {
    goals,
    addGoal,
    removeGoal,
    updateGoal,
  }
}
