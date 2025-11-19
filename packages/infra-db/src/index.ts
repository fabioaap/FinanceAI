// Export database instance and types
export { db, FinanceAIDatabase, type Transaction } from './database';

// Export all helper functions
export {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByType,
  getTransactionsByCategory,
  clearAllTransactions,
} from './helpers';
