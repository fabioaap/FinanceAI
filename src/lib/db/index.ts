// Re-export database schema and instance
export { db, FinanceAIDatabase } from './schema';
export type { DBTransaction, Bill, Goal, Category, Settings } from './schema';

// Re-export repositories
export {
  transactionRepository,
  billRepository,
  goalRepository,
  categoryRepository,
  settingsRepository,
} from './repositories';
