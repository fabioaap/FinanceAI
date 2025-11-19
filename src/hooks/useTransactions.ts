import { useKV } from '@github/spark/hooks'
import { Transaction } from '@/lib/types'
import { getMonthKey } from '@/lib/constants'

export function useTransactions(currentMonth: Date = new Date()) {
  const monthKey = getMonthKey(currentMonth)
  const [transactions, setTransactions] = useKV<Transaction[]>(`transactions-${monthKey}`, [])

  return {
    transactions: transactions || [],
    setTransactions,
    monthKey
  }
}
