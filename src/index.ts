/**
 * Dexie Settings Module
 * 
 * A simple, type-safe key-value storage system for app-wide settings
 * using Dexie (IndexedDB wrapper).
 */

// Export core database and types
export { db, FinanceAIDatabase } from './lib/db';
export type { Setting } from './lib/db';

// Export setting operations
export {
  getSetting,
  setSetting,
  deleteSetting,
  getAllSettings,
  clearAllSettings,
} from './lib/db';

// Export migration utilities
export {
  migrateFromLocalStorage,
  migrateFromLocalStorageByPrefix,
  checkMigrationNeeded,
} from './lib/migrate';
