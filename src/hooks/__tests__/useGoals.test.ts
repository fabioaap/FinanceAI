import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGoals } from '../useGoals'
import { db } from '@/database/db'

describe('useGoals', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.goals.clear()
  })

  it('should start with empty goals array', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.goals).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should add a goal successfully', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newGoal = {
      id: '1',
      description: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5000,
      deadline: new Date('2025-12-31').toISOString(),
      type: 'savings' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addGoal(newGoal)

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(1)
    })

    expect(result.current.goals[0].description).toBe('Emergency Fund')
    expect(result.current.goals[0].targetAmount).toBe(10000)
    expect(result.current.goals[0].currentAmount).toBe(5000)
    expect(result.current.goals[0].type).toBe('savings')
  })

  it('should update goal progress', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newGoal = {
      id: '1',
      description: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 1000,
      deadline: new Date('2025-06-30').toISOString(),
      type: 'savings' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addGoal(newGoal)

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(1)
    })

    const goalId = result.current.goals[0].id

    await result.current.updateProgress(goalId, 2500)

    await waitFor(() => {
      expect(result.current.goals[0].currentAmount).toBe(2500)
    })
  })

  it('should update goal properties', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newGoal = {
      id: '1',
      description: 'Debt Payoff',
      targetAmount: 15000,
      currentAmount: 3000,
      deadline: new Date('2026-01-01').toISOString(),
      type: 'debt' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addGoal(newGoal)

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(1)
    })

    const goalId = result.current.goals[0].id

    await result.current.updateGoal(goalId, {
      description: 'Credit Card Payoff',
      targetAmount: 12000,
    })

    await waitFor(() => {
      expect(result.current.goals[0].description).toBe('Credit Card Payoff')
      expect(result.current.goals[0].targetAmount).toBe(12000)
    })
  })

  it('should remove a goal', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newGoal = {
      id: '1',
      description: 'New Car Fund',
      targetAmount: 20000,
      currentAmount: 8000,
      deadline: new Date('2025-12-31').toISOString(),
      type: 'savings' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addGoal(newGoal)

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(1)
    })

    const goalId = result.current.goals[0].id

    await result.current.removeGoal(goalId)

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(0)
    })
  })

  it('should handle multiple goals', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const goal1 = {
      id: '1',
      description: 'Goal 1',
      targetAmount: 10000,
      currentAmount: 2000,
      deadline: new Date('2025-12-31').toISOString(),
      type: 'savings' as const,
      createdAt: new Date().toISOString(),
    }

    const goal2 = {
      id: '2',
      description: 'Goal 2',
      targetAmount: 5000,
      currentAmount: 1000,
      deadline: new Date('2025-06-30').toISOString(),
      type: 'reserve' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addGoal(goal1)
    await result.current.addGoal(goal2)

    await waitFor(() => {
      expect(result.current.goals).toHaveLength(2)
    })
  })

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useGoals())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Dexie update doesn't throw for non-existent IDs, it just doesn't update anything
    // So this test just verifies the operation completes without crashing
    await result.current.updateGoal('999', { currentAmount: 5000 })
    
    // Goals list should still be empty
    expect(result.current.goals).toHaveLength(0)
  })
})
