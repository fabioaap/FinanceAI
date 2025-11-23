import { useState, useEffect, useCallback } from 'react'
import { billRepository } from '@/repositories/BillRepository'
import { Bill as DbBill } from '@/types'
import { Bill as AppBill } from '@/lib/types'

/**
 * Converts DB Bill (Date objects) to App Bill (ISO strings)
 */
function dbToApp(bill: DbBill): AppBill {
  return {
    id: String(bill.id),
    description: bill.description,
    amount: bill.amount,
    dueDate: bill.dueDate.toISOString(),
    status: bill.status,
    recurrence: bill.recurrence,
    createdAt: bill.createdAt.toISOString(),
  }
}

/**
 * Converts App Bill (ISO strings) to DB Bill (Date objects)
 */
function appToDb(bill: AppBill): Omit<DbBill, 'id'> {
  return {
    description: bill.description,
    amount: bill.amount,
    dueDate: new Date(bill.dueDate),
    status: bill.status,
    recurrence: bill.recurrence,
    createdAt: new Date(bill.createdAt || new Date()),
    updatedAt: new Date(),
  }
}

export function useBills() {
  const [bills, setBills] = useState<AppBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadBills = useCallback(async () => {
    try {
      setLoading(true)
      // Use Dexie's built-in sorting for better performance
      const dbBills = await billRepository.table.orderBy('dueDate').toArray()
      const appBills = dbBills.map(dbToApp)
      setBills(appBills)
      setError(null)
    } catch (err) {
      console.error('Failed to load bills:', err)
      setError(err instanceof Error ? err : new Error('Failed to load bills'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBills()
  }, [loadBills])

  const addBill = useCallback(
    async (bill: AppBill) => {
      try {
        await billRepository.create(appToDb(bill))
        await loadBills()
      } catch (err) {
        console.error('Failed to add bill:', err)
        throw err instanceof Error ? err : new Error('Failed to add bill')
      }
    },
    [loadBills]
  )

  const updateBill = useCallback(
    async (billId: string, updates: Partial<AppBill>) => {
      try {
        const numericId = Number(billId)
        if (isNaN(numericId)) {
          throw new Error('Invalid bill ID')
        }

        const dbUpdates: Partial<DbBill> = {}
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount
        if (updates.dueDate !== undefined) dbUpdates.dueDate = new Date(updates.dueDate)
        if (updates.status !== undefined) dbUpdates.status = updates.status
        if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence
        dbUpdates.updatedAt = new Date()

        await billRepository.update(numericId, dbUpdates)
        await loadBills()
      } catch (err) {
        console.error('Failed to update bill:', err)
        throw err instanceof Error ? err : new Error('Failed to update bill')
      }
    },
    [loadBills]
  )

  const removeBill = useCallback(
    async (billId: string) => {
      try {
        const numericId = Number(billId)
        if (isNaN(numericId)) {
          throw new Error('Invalid bill ID')
        }

        await billRepository.delete(numericId)
        await loadBills()
      } catch (err) {
        console.error('Failed to remove bill:', err)
        throw err instanceof Error ? err : new Error('Failed to remove bill')
      }
    },
    [loadBills]
  )

  return {
    bills,
    loading,
    error,
    addBill,
    updateBill,
    removeBill,
    refresh: loadBills,
  }
}
