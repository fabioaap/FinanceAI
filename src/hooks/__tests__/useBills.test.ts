import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBills } from '../useBills'
import { db } from '@/database/db'

describe('useBills', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.bills.clear()
  })

  it('should start with empty bills array', async () => {
    const { result } = renderHook(() => useBills())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.bills).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should add a bill successfully', async () => {
    const { result } = renderHook(() => useBills())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newBill = {
      id: '1',
      description: 'Rent Payment',
      amount: 1000,
      dueDate: new Date('2024-12-01').toISOString(),
      status: 'pending' as const,
      recurrence: 'monthly' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addBill(newBill)

    await waitFor(() => {
      expect(result.current.bills).toHaveLength(1)
    })

    expect(result.current.bills[0].description).toBe('Rent Payment')
    expect(result.current.bills[0].amount).toBe(1000)
    expect(result.current.bills[0].status).toBe('pending')
  })

  it('should update a bill status', async () => {
    const { result } = renderHook(() => useBills())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newBill = {
      id: '1',
      description: 'Electric Bill',
      amount: 150,
      dueDate: new Date('2024-12-15').toISOString(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addBill(newBill)

    await waitFor(() => {
      expect(result.current.bills).toHaveLength(1)
    })

    const billId = result.current.bills[0].id

    await result.current.updateBill(billId, { status: 'paid' })

    await waitFor(() => {
      expect(result.current.bills[0].status).toBe('paid')
    })
  })

  it('should remove a bill', async () => {
    const { result } = renderHook(() => useBills())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newBill = {
      id: '1',
      description: 'Water Bill',
      amount: 50,
      dueDate: new Date('2024-12-10').toISOString(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addBill(newBill)

    await waitFor(() => {
      expect(result.current.bills).toHaveLength(1)
    })

    const billId = result.current.bills[0].id

    await result.current.removeBill(billId)

    await waitFor(() => {
      expect(result.current.bills).toHaveLength(0)
    })
  })

  it('should sort bills by dueDate ascending', async () => {
    const { result } = renderHook(() => useBills())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const bill1 = {
      id: '1',
      description: 'Bill 1',
      amount: 100,
      dueDate: new Date('2024-12-20').toISOString(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    const bill2 = {
      id: '2',
      description: 'Bill 2',
      amount: 200,
      dueDate: new Date('2024-12-10').toISOString(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    await result.current.addBill(bill1)
    await result.current.addBill(bill2)

    await waitFor(() => {
      expect(result.current.bills).toHaveLength(2)
    })

    // Should be sorted by dueDate ascending (Dec 10 before Dec 20)
    expect(result.current.bills[0].description).toBe('Bill 2')
    expect(result.current.bills[1].description).toBe('Bill 1')
  })

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useBills())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Dexie update doesn't throw for non-existent IDs, it just doesn't update anything
    // So this test just verifies the operation completes without crashing
    await result.current.updateBill('999', { status: 'paid' })
    
    // Bills list should still be empty
    expect(result.current.bills).toHaveLength(0)
  })
})
