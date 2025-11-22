import { useState, useEffect, useCallback } from 'react'
import { useTransactions } from './useTransactions'
import { Transaction as AppTransaction, CategoryType } from '@/lib/types'
import { Transaction as DbTransaction } from '@/types'

// Mapeamento de CategoryType para categoryId
const CATEGORY_MAP: Record<CategoryType, number> = {
  food: 1,
  transport: 2,
  shopping: 3,
  health: 4,
  home: 5,
  entertainment: 6,
  education: 7,
  work: 8,
  other: 9,
}

const CATEGORY_REVERSE_MAP: Record<number, CategoryType> = {
  1: 'food',
  2: 'transport',
  3: 'shopping',
  4: 'health',
  5: 'home',
  6: 'entertainment',
  7: 'education',
  8: 'work',
  9: 'other',
}

// Converte Transaction do App para o formato do DB
function appToDb(transaction: AppTransaction): Omit<DbTransaction, 'id'> {
  return {
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    categoryId: CATEGORY_MAP[transaction.category] || 9,
    date: new Date(transaction.date),
    createdAt: new Date(transaction.createdAt),
    updatedAt: new Date(),
  }
}

// Converte Transaction do DB para o formato do App
function dbToApp(transaction: DbTransaction): AppTransaction {
  return {
    id: String(transaction.id),
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: CATEGORY_REVERSE_MAP[transaction.categoryId] || 'other',
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
  }
}

/**
 * Hook adaptador que mantém a interface antiga do useKV
 * mas usa Dexie por baixo dos panos
 */
export function useAppTransactions(monthKey: string) {
  const { transactions: dbTransactions, loading, createTransaction, deleteTransaction } = useTransactions()
  const [appTransactions, setAppTransactions] = useState<AppTransaction[]>([])

  // Sincroniza DB → App (converte formato)
  useEffect(() => {
    if (!loading && dbTransactions) {
      // Filtra por mês se necessário (por enquanto retorna todas)
      const converted = dbTransactions.map(dbToApp)
      setAppTransactions(converted)
    }
  }, [dbTransactions, loading])

  // Adapter para adicionar transação
  const addTransaction = useCallback(
    async (transaction: AppTransaction) => {
      try {
        await createTransaction(appToDb(transaction))
      } catch (error) {
        console.error('Failed to add transaction:', error)
        throw error
      }
    },
    [createTransaction]
  )

  // Adapter para deletar transação
  const removeTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await deleteTransaction(Number(transactionId))
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        throw error
      }
    },
    [deleteTransaction]
  )

  return {
    transactions: appTransactions,
    loading,
    addTransaction,
    removeTransaction,
  }
}
