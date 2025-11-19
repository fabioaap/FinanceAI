import { useCallback, useState, useEffect } from 'react'
import {
  addTransaction as dbAddTransaction,
  getAllTransactions,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  addBill as dbAddBill,
  getAllBills,
  updateBill as dbUpdateBill,
  deleteBill as dbDeleteBill,
  addGoal as dbAddGoal,
  getAllGoals,
  updateGoal as dbUpdateGoal,
  deleteGoal as dbDeleteGoal,
  getSetting,
  setSetting as dbSetSetting
} from '@financeai/infra-db'
import type { Transaction, Bill, Goal } from '@/lib/types'
import type { Language } from '@/lib/i18n'

// Helper to convert app Transaction to DB format
function toDbTransaction(t: Transaction) {
  return {
    amount: t.amount,
    description: t.description,
    date: t.date,
    type: t.type,
    category: t.category,
    createdAt: t.createdAt
  }
}

// Helper to convert DB transaction to app format
function fromDbTransaction(t: any): Transaction {
  return {
    id: String(t.id),
    amount: t.amount,
    description: t.description,
    date: t.date,
    type: t.type,
    category: t.category || 'other',
    createdAt: t.createdAt || new Date().toISOString()
  }
}

// Helper to convert app Bill to DB format
function toDbBill(b: Bill) {
  return {
    name: b.description,
    amount: b.amount,
    dueDate: b.dueDate,
    status: b.status,
    recurring: b.recurrence !== 'once',
    createdAt: b.createdAt
  }
}

// Helper to convert DB bill to app format
function fromDbBill(b: any): Bill {
  return {
    id: String(b.id),
    description: b.name,
    amount: b.amount,
    dueDate: b.dueDate,
    status: b.status || 'pending',
    recurrence: b.recurring ? 'monthly' : 'once',
    createdAt: b.createdAt || new Date().toISOString()
  }
}

// Helper to convert app Goal to DB format
function toDbGoal(g: Goal) {
  return {
    name: g.description,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    dueDate: g.deadline
  }
}

// Helper to convert DB goal to app format
function fromDbGoal(g: any): Goal {
  return {
    id: String(g.id),
    description: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount || 0,
    deadline: g.dueDate || '',
    type: 'savings',
    createdAt: g.createdAt || new Date().toISOString()
  }
}

/**
 * Hook for managing transactions with Dexie storage
 */
export function useTransactions(monthKey?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const allTransactions = await getAllTransactions()
      let filtered = allTransactions.map(fromDbTransaction)
      
      // Filter by month if monthKey is provided
      if (monthKey) {
        filtered = filtered.filter(t => {
          const date = new Date(t.date)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          return key === monthKey
        })
      }
      
      setTransactions(filtered)
    } finally {
      setLoading(false)
    }
  }, [monthKey])

  const add = useCallback(async (transaction: Transaction) => {
    setLoading(true)
    try {
      await dbAddTransaction(toDbTransaction(transaction))
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  const update = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setLoading(true)
    try {
      // Convert app format to DB format for updates
      const dbUpdates: any = {}
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount
      if (updates.description) dbUpdates.description = updates.description
      if (updates.date) dbUpdates.date = updates.date
      if (updates.type) dbUpdates.type = updates.type
      if (updates.category) dbUpdates.category = updates.category
      
      await dbUpdateTransaction(Number(id), dbUpdates)
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await dbDeleteTransaction(Number(id))
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    load()
  }, [load])

  return {
    transactions,
    loading,
    reload: load,
    add,
    update,
    remove
  }
}

/**
 * Hook for managing bills with Dexie storage
 */
export function useBills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const allBills = await getAllBills()
      setBills(allBills.map(fromDbBill))
    } finally {
      setLoading(false)
    }
  }, [])

  const add = useCallback(async (bill: Bill) => {
    setLoading(true)
    try {
      await dbAddBill(toDbBill(bill))
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  const update = useCallback(async (id: string, updates: Partial<Bill>) => {
    setLoading(true)
    try {
      const dbUpdates: any = {}
      if (updates.description) dbUpdates.name = updates.description
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount
      if (updates.dueDate) dbUpdates.dueDate = updates.dueDate
      if (updates.status) dbUpdates.status = updates.status
      if (updates.recurrence) dbUpdates.recurring = updates.recurrence !== 'once'
      
      await dbUpdateBill(Number(id), dbUpdates)
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await dbDeleteBill(Number(id))
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    load()
  }, [load])

  return {
    bills,
    loading,
    reload: load,
    add,
    update,
    remove
  }
}

/**
 * Hook for managing goals with Dexie storage
 */
export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const allGoals = await getAllGoals()
      setGoals(allGoals.map(fromDbGoal))
    } finally {
      setLoading(false)
    }
  }, [])

  const add = useCallback(async (goal: Goal) => {
    setLoading(true)
    try {
      await dbAddGoal(toDbGoal(goal))
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  const update = useCallback(async (id: string, updates: Partial<Goal>) => {
    setLoading(true)
    try {
      const dbUpdates: any = {}
      if (updates.description) dbUpdates.name = updates.description
      if (updates.targetAmount !== undefined) dbUpdates.targetAmount = updates.targetAmount
      if (updates.currentAmount !== undefined) dbUpdates.currentAmount = updates.currentAmount
      if (updates.deadline) dbUpdates.dueDate = updates.deadline
      
      await dbUpdateGoal(Number(id), dbUpdates)
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await dbDeleteGoal(Number(id))
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    load()
  }, [load])

  return {
    goals,
    loading,
    reload: load,
    add,
    update,
    remove
  }
}

/**
 * Hook for managing language setting with Dexie storage
 */
export function useLanguageSetting() {
  const [language, setLanguageState] = useState<Language>('en')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const value = await getSetting('app-language')
      if (value) {
        setLanguageState(value as Language)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const setLanguage = useCallback(async (newLanguage: Language) => {
    setLoading(true)
    try {
      await dbSetSetting('app-language', newLanguage)
      setLanguageState(newLanguage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    language,
    setLanguage,
    loading
  }
}
