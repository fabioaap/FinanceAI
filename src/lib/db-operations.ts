import { db } from './db'
import type { Transaction, Bill, Goal } from './types'

/**
 * Seed the database with initial default categories
 */
export async function seedCategories() {
  const count = await db.categories.count()
  
  if (count === 0) {
    await db.categories.bulkAdd([
      { name: 'shopping', icon: '🛍️', color: 'oklch(0.60 0.15 320)', type: 'expense' },
      { name: 'home', icon: '🏠', color: 'oklch(0.60 0.15 250)', type: 'expense' },
      { name: 'transport', icon: '🚗', color: 'oklch(0.60 0.15 200)', type: 'expense' },
      { name: 'food', icon: '🍔', color: 'oklch(0.60 0.15 50)', type: 'expense' },
      { name: 'health', icon: '🏥', color: 'oklch(0.60 0.15 360)', type: 'expense' },
      { name: 'work', icon: '💼', color: 'oklch(0.60 0.15 160)', type: 'income' },
      { name: 'education', icon: '📚', color: 'oklch(0.60 0.15 280)', type: 'expense' },
      { name: 'entertainment', icon: '🎮', color: 'oklch(0.60 0.15 300)', type: 'expense' },
      { name: 'other', icon: '📦', color: 'oklch(0.60 0.15 0)', type: 'expense' }
    ])
  }
}

/**
 * Add a new transaction
 */
export async function addTransaction(transaction: Transaction) {
  return await db.transactions.add(transaction)
}

/**
 * Get all transactions
 */
export async function getAllTransactions() {
  return await db.transactions.toArray()
}

/**
 * Add a new bill
 */
export async function addBill(bill: Bill) {
  return await db.bills.add(bill)
}

/**
 * Get all bills
 */
export async function getAllBills() {
  return await db.bills.toArray()
}

/**
 * Add a new goal
 */
export async function addGoal(goal: Goal) {
  return await db.goals.add(goal)
}

/**
 * Get all goals
 */
export async function getAllGoals() {
  return await db.goals.toArray()
}

/**
 * Delete a transaction by id
 */
export async function deleteTransaction(id: string) {
  return await db.transactions.delete(id)
}

/**
 * Delete a bill by id
 */
export async function deleteBill(id: string) {
  return await db.bills.delete(id)
}

/**
 * Delete a goal by id
 */
export async function deleteGoal(id: string) {
  return await db.goals.delete(id)
}
