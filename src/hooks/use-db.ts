import { useCallback, useState } from 'react'
import { addTransaction, getAllTransactions, addCategory, getAllCategories } from '@financeai/infra-db'

export function useTransactions() {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllTransactions()
      setTransactions(res)
    } finally {
      setLoading(false)
    }
  }, [])

  const add = useCallback(async (t) => {
    setLoading(true)
    try {
      const id = await addTransaction(t)
      await load()
      return id
    } finally {
      setLoading(false)
    }
  }, [load])

  return {
    transactions,
    loading,
    reload: load,
    add
  }
}

export function useCategories() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllCategories()
      setCategories(res)
    } finally {
      setLoading(false)
    }
  }, [])

  const add = useCallback(async (c) => {
    setLoading(true)
    try {
      const id = await addCategory(c)
      await load()
      return id
    } finally {
      setLoading(false)
    }
  }, [load])

  return {
    categories,
    loading,
    reload: load,
    add
  }
}
