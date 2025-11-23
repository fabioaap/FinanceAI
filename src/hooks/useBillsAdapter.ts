import { useState, useEffect, useCallback } from 'react'
import { Bill } from '@/lib/types'

const STORAGE_KEY = 'financeai-bills'

/**
 * Hook provisório para gerenciar bills com localStorage
 * até migração completa para Dexie
 */
export function useBillsAdapter() {
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load bills from localStorage:', error)
      return []
    }
  })

  // Persiste no localStorage sempre que bills mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
    } catch (error) {
      console.error('Failed to save bills to localStorage:', error)
    }
  }, [bills])

  const addBill = useCallback(async (bill: Bill) => {
    setBills((current) => [...current, bill])
  }, [])

  const removeBill = useCallback(async (billId: string) => {
    setBills((current) => current.filter((bill) => bill.id !== billId))
  }, [])

  const updateBill = useCallback(async (billId: string, updates: Partial<Bill>) => {
    setBills((current) =>
      current.map((bill) =>
        bill.id === billId ? { ...bill, ...updates } : bill
      )
    )
  }, [])

  return {
    bills,
    addBill,
    removeBill,
    updateBill,
  }
}
