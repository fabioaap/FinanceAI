import Dexie, { Table } from 'dexie';

export interface Setting {
  key: string;
  value: string;
}

export class FinanceAIDatabase extends Dexie {
  settings!: Table<Setting, string>;

  constructor() {
    super('FinanceAI');
    this.version(1).stores({
      settings: 'key',
    });
  }
}

export const db = new FinanceAIDatabase();

/**
 * Get a setting value by key
 * @param key - The setting key
 * @returns The setting value or undefined if not found
 */
export async function getSetting(key: string): Promise<string | undefined> {
  const setting = await db.settings.get(key);
  return setting?.value;
}

/**
 * Set a setting value
 * @param key - The setting key
 * @param value - The setting value (can be a string or JSON-serializable object)
 */
export async function setSetting(
  key: string,
  value: string | object
): Promise<void> {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  await db.settings.put({ key, value: stringValue });
}

/**
 * Delete a setting by key
 * @param key - The setting key
 */
export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}

/**
 * Get all settings
 * @returns Array of all settings
 */
export async function getAllSettings(): Promise<Setting[]> {
  return await db.settings.toArray();
}

/**
 * Clear all settings
 */
export async function clearAllSettings(): Promise<void> {
  await db.settings.clear();
}
