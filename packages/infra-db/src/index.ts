import Dexie, { type EntityTable } from 'dexie'

export interface Transaction {
  id?: number
  amount: number
  description: string
  date: string
  categoryId?: string
  accountId?: string
  type: 'income' | 'expense'
  category?: string
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id?: number
  name: string
  type: 'income' | 'expense'
  createdAt?: string
  updatedAt?: string
}

export interface Bill {
  id?: number
  name: string
  amount: number
  dueDate: string
  recurring?: boolean
  status?: 'pending' | 'paid' | 'overdue'
  createdAt?: string
  updatedAt?: string
}

export interface Goal {
  id?: number
  name: string
  targetAmount: number
  currentAmount?: number
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface Settings {
  id?: number
  key: string
  value: string
  updatedAt?: string
}

const db = new Dexie('FinanceAI') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  bills: EntityTable<Bill, 'id'>
  goals: EntityTable<Goal, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  transactions: '++id, date, amount, categoryId, accountId, type',
  categories: '++id, name, type',
  bills: '++id, dueDate, name, status',
  goals: '++id, name, targetAmount',
  settings: '++id, key'
})

export { db }

// Transaction operations
export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  return await db.transactions.add({
    ...transaction,
    createdAt: now,
    updatedAt: now
  })
}

export async function getAllTransactions() {
  return await db.transactions.toArray()
}

export async function getTransactionsByDateRange(startDate: string, endDate: string) {
  return await db.transactions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
}

export async function updateTransaction(id: number, updates: Partial<Transaction>) {
  return await db.transactions.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  })
}

export async function deleteTransaction(id: number) {
  return await db.transactions.delete(id)
}

// Category operations
export async function addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  return await db.categories.add({
    ...category,
    createdAt: now,
    updatedAt: now
  })
}

export async function getAllCategories() {
  return await db.categories.toArray()
}

export async function updateCategory(id: number, updates: Partial<Category>) {
  return await db.categories.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  })
}

export async function deleteCategory(id: number) {
  return await db.categories.delete(id)
}

// Bill operations
export async function addBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  return await db.bills.add({
    ...bill,
    status: bill.status || 'pending',
    createdAt: now,
    updatedAt: now
  })
}

export async function getAllBills() {
  return await db.bills.toArray()
}

export async function updateBill(id: number, updates: Partial<Bill>) {
  return await db.bills.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  })
}

export async function deleteBill(id: number) {
  return await db.bills.delete(id)
}

// Goal operations
export async function addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  return await db.goals.add({
    ...goal,
    currentAmount: goal.currentAmount || 0,
    createdAt: now,
    updatedAt: now
  })
}

export async function getAllGoals() {
  return await db.goals.toArray()
}

export async function updateGoal(id: number, updates: Partial<Goal>) {
  return await db.goals.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  })
}

export async function deleteGoal(id: number) {
  return await db.goals.delete(id)
}

// Settings operations
export async function getSetting(key: string): Promise<string | undefined> {
  const setting = await db.settings.where('key').equals(key).first()
  return setting?.value
}

export async function setSetting(key: string, value: string) {
  const existing = await db.settings.where('key').equals(key).first()
  const now = new Date().toISOString()
  
  if (existing) {
    return await db.settings.update(existing.id!, {
      value,
      updatedAt: now
    })
  } else {
    return await db.settings.add({
      key,
      value,
      updatedAt: now
    })
  }
}

export async function deleteSetting(key: string) {
  const setting = await db.settings.where('key').equals(key).first()
  if (setting?.id) {
    return await db.settings.delete(setting.id)
  }
}
