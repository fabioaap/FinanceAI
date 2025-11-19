import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Bill, Goal } from './types'

export interface Category {
  id?: number
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

const db = new Dexie('FinanceAIDatabase') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  bills: EntityTable<Bill, 'id'>
  goals: EntityTable<Goal, 'id'>
  categories: EntityTable<Category, 'id'>
}

db.version(1).stores({
  transactions: 'id, amount, description, category, type, date, createdAt',
  bills: 'id, description, amount, dueDate, status, recurrence, createdAt',
  goals: 'id, description, targetAmount, currentAmount, deadline, type, createdAt',
  categories: '++id, name, type'
})

export { db }
