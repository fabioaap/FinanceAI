import { setSetting } from './db';

/**
 * Migration utility to transfer settings from localStorage to Dexie
 * 
 * Usage example:
 * ```typescript
 * // Define which localStorage keys to migrate
 * const keysToMigrate = ['app-language', 'theme-config', 'user-preferences'];
 * 
 * // Run the migration
 * await migrateFromLocalStorage(keysToMigrate);
 * ```
 * 
 * @param keys - Array of localStorage keys to migrate to Dexie
 * @param removeFromLocalStorage - Whether to remove the keys from localStorage after migration (default: false)
 * @returns Object with migration results (success count, failed keys)
 */
export async function migrateFromLocalStorage(
  keys: string[],
  removeFromLocalStorage: boolean = false
): Promise<{ migrated: number; failed: string[] }> {
  const failed: string[] = [];
  let migrated = 0;

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      
      if (value !== null) {
        // Try to parse as JSON, if it fails, store as string
        let settingValue: string | object = value;
        try {
          settingValue = JSON.parse(value);
        } catch {
          // Value is not JSON, keep it as string
        }
        
        await setSetting(key, settingValue);
        migrated++;
        
        if (removeFromLocalStorage) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Failed to migrate key "${key}":`, error);
      failed.push(key);
    }
  }

  return { migrated, failed };
}

/**
 * Migrate all localStorage items that match a prefix
 * 
 * Usage example:
 * ```typescript
 * // Migrate all settings that start with 'app-'
 * await migrateFromLocalStorageByPrefix('app-');
 * ```
 * 
 * @param prefix - The prefix to match localStorage keys
 * @param removeFromLocalStorage - Whether to remove the keys from localStorage after migration
 * @returns Object with migration results
 */
export async function migrateFromLocalStorageByPrefix(
  prefix: string,
  removeFromLocalStorage: boolean = false
): Promise<{ migrated: number; failed: string[] }> {
  const keysToMigrate: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToMigrate.push(key);
    }
  }
  
  return await migrateFromLocalStorage(keysToMigrate, removeFromLocalStorage);
}

/**
 * Check if a migration is needed by comparing localStorage and Dexie
 * 
 * @param keys - Array of keys to check
 * @returns Array of keys that exist in localStorage but not in Dexie
 */
export async function checkMigrationNeeded(keys: string[]): Promise<string[]> {
  const { getSetting } = await import('./db');
  const keysToMigrate: string[] = [];
  
  for (const key of keys) {
    const localStorageValue = localStorage.getItem(key);
    const dexieValue = await getSetting(key);
    
    if (localStorageValue !== null && dexieValue === undefined) {
      keysToMigrate.push(key);
    }
  }
  
  return keysToMigrate;
}
