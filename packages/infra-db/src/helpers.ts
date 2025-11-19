import { db, Transaction } from './database';

/**
 * Add a new transaction to the database
 * @param transaction - Transaction object without id (will be auto-generated)
 * @returns Promise with the id of the newly created transaction
 */
export async function addTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<number> {
  const transactionWithTimestamp: Transaction = {
    ...transaction,
    createdAt: new Date(),
  };

  const id = await db.transactions.add(transactionWithTimestamp);
  return id;
}

/**
 * Get all transactions from the database
 * @returns Promise with array of all transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  const transactions = await db.transactions.toArray();
  return transactions;
}

/**
 * Get a transaction by id
 * @param id - Transaction id
 * @returns Promise with the transaction or undefined if not found
 */
export async function getTransactionById(id: number): Promise<Transaction | undefined> {
  return await db.transactions.get(id);
}

/**
 * Update a transaction
 * @param id - Transaction id
 * @param updates - Partial transaction object with fields to update
 * @returns Promise with the number of updated records (0 or 1)
 */
export async function updateTransaction(
  id: number,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<number> {
  return await db.transactions.update(id, updates);
}

/**
 * Delete a transaction by id
 * @param id - Transaction id
 * @returns Promise that resolves when the transaction is deleted
 */
export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}

/**
 * Get transactions by type (income or expense)
 * @param type - Transaction type
 * @returns Promise with array of transactions of the specified type
 */
export async function getTransactionsByType(
  type: 'income' | 'expense'
): Promise<Transaction[]> {
  return await db.transactions.where('type').equals(type).toArray();
}

/**
 * Get transactions by category
 * @param category - Transaction category
 * @returns Promise with array of transactions in the specified category
 */
export async function getTransactionsByCategory(category: string): Promise<Transaction[]> {
  return await db.transactions.where('category').equals(category).toArray();
}

/**
 * Clear all transactions from the database
 * @returns Promise that resolves when all transactions are deleted
 */
export async function clearAllTransactions(): Promise<void> {
  await db.transactions.clear();
}
