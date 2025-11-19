import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateFromLocalStorage,
  migrateFromLocalStorageByPrefix,
  checkMigrationNeeded,
} from './migrate';
import { getSetting, clearAllSettings } from './db';

describe('Migration from localStorage to Dexie', () => {
  beforeEach(async () => {
    await clearAllSettings();
    localStorage.clear();
  });

  describe('migrateFromLocalStorage', () => {
    it('should migrate string values from localStorage to Dexie', async () => {
      localStorage.setItem('app-language', 'en-US');
      localStorage.setItem('theme-mode', 'dark');

      const result = await migrateFromLocalStorage(['app-language', 'theme-mode']);

      expect(result.migrated).toBe(2);
      expect(result.failed).toEqual([]);
      expect(await getSetting('app-language')).toBe('en-US');
      expect(await getSetting('theme-mode')).toBe('dark');
    });

    it('should migrate JSON values from localStorage to Dexie', async () => {
      const config = { color: 'blue', size: 'large' };
      localStorage.setItem('user-config', JSON.stringify(config));

      const result = await migrateFromLocalStorage(['user-config']);

      expect(result.migrated).toBe(1);
      expect(result.failed).toEqual([]);
      const value = await getSetting('user-config');
      expect(JSON.parse(value!)).toEqual(config);
    });

    it('should skip keys that do not exist in localStorage', async () => {
      localStorage.setItem('existing-key', 'value');

      const result = await migrateFromLocalStorage([
        'existing-key',
        'non-existent-key',
      ]);

      expect(result.migrated).toBe(1);
      expect(result.failed).toEqual([]);
      expect(await getSetting('existing-key')).toBe('value');
      expect(await getSetting('non-existent-key')).toBeUndefined();
    });

    it('should remove from localStorage when removeFromLocalStorage is true', async () => {
      localStorage.setItem('temp-setting', 'temporary');

      const result = await migrateFromLocalStorage(['temp-setting'], true);

      expect(result.migrated).toBe(1);
      expect(localStorage.getItem('temp-setting')).toBeNull();
      expect(await getSetting('temp-setting')).toBe('temporary');
    });

    it('should not remove from localStorage when removeFromLocalStorage is false', async () => {
      localStorage.setItem('keep-setting', 'keep-me');

      const result = await migrateFromLocalStorage(['keep-setting'], false);

      expect(result.migrated).toBe(1);
      expect(localStorage.getItem('keep-setting')).toBe('keep-me');
      expect(await getSetting('keep-setting')).toBe('keep-me');
    });

    it('should handle empty array', async () => {
      const result = await migrateFromLocalStorage([]);
      expect(result.migrated).toBe(0);
      expect(result.failed).toEqual([]);
    });
  });

  describe('migrateFromLocalStorageByPrefix', () => {
    it('should migrate all keys with matching prefix', async () => {
      localStorage.setItem('app-language', 'en-US');
      localStorage.setItem('app-theme', 'dark');
      localStorage.setItem('app-version', '1.0.0');
      localStorage.setItem('user-name', 'John');

      const result = await migrateFromLocalStorageByPrefix('app-');

      expect(result.migrated).toBe(3);
      expect(result.failed).toEqual([]);
      expect(await getSetting('app-language')).toBe('en-US');
      expect(await getSetting('app-theme')).toBe('dark');
      expect(await getSetting('app-version')).toBe('1.0.0');
      expect(await getSetting('user-name')).toBeUndefined();
    });

    it('should handle no matching keys', async () => {
      localStorage.setItem('other-key', 'value');

      const result = await migrateFromLocalStorageByPrefix('app-');

      expect(result.migrated).toBe(0);
      expect(result.failed).toEqual([]);
    });

    it('should remove matching keys from localStorage when specified', async () => {
      localStorage.setItem('app-setting1', 'value1');
      localStorage.setItem('app-setting2', 'value2');

      await migrateFromLocalStorageByPrefix('app-', true);

      expect(localStorage.getItem('app-setting1')).toBeNull();
      expect(localStorage.getItem('app-setting2')).toBeNull();
    });
  });

  describe('checkMigrationNeeded', () => {
    it('should return keys that exist in localStorage but not in Dexie', async () => {
      localStorage.setItem('setting1', 'value1');
      localStorage.setItem('setting2', 'value2');
      localStorage.setItem('setting3', 'value3');

      const keysToCheck = ['setting1', 'setting2', 'setting3'];
      const result = await checkMigrationNeeded(keysToCheck);

      expect(result).toEqual(['setting1', 'setting2', 'setting3']);
    });

    it('should not return keys that already exist in Dexie', async () => {
      localStorage.setItem('setting1', 'value1');
      localStorage.setItem('setting2', 'value2');
      
      await migrateFromLocalStorage(['setting1']);

      const keysToCheck = ['setting1', 'setting2'];
      const result = await checkMigrationNeeded(keysToCheck);

      expect(result).toEqual(['setting2']);
    });

    it('should not return keys that do not exist in localStorage', async () => {
      localStorage.setItem('setting1', 'value1');

      const keysToCheck = ['setting1', 'setting2'];
      const result = await checkMigrationNeeded(keysToCheck);

      expect(result).toEqual(['setting1']);
    });

    it('should return empty array when all keys are migrated', async () => {
      localStorage.setItem('setting1', 'value1');
      await migrateFromLocalStorage(['setting1']);

      const result = await checkMigrationNeeded(['setting1']);

      expect(result).toEqual([]);
    });
  });
});
