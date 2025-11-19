import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  getSetting,
  setSetting,
  deleteSetting,
  getAllSettings,
  clearAllSettings,
} from './db';

describe('Dexie Settings Table', () => {
  beforeEach(async () => {
    await clearAllSettings();
  });

  describe('setSetting and getSetting', () => {
    it('should set and get a string setting', async () => {
      await setSetting('app-language', 'en-US');
      const value = await getSetting('app-language');
      expect(value).toBe('en-US');
    });

    it('should set and get a JSON object setting', async () => {
      const themeConfig = { mode: 'dark', primaryColor: '#000' };
      await setSetting('theme-config', themeConfig);
      const value = await getSetting('theme-config');
      expect(value).toBeDefined();
      expect(JSON.parse(value!)).toEqual(themeConfig);
    });

    it('should return undefined for non-existent key', async () => {
      const value = await getSetting('non-existent-key');
      expect(value).toBeUndefined();
    });

    it('should update existing setting', async () => {
      await setSetting('app-language', 'en-US');
      await setSetting('app-language', 'pt-BR');
      const value = await getSetting('app-language');
      expect(value).toBe('pt-BR');
    });
  });

  describe('deleteSetting', () => {
    it('should delete a setting', async () => {
      await setSetting('temp-setting', 'temporary');
      await deleteSetting('temp-setting');
      const value = await getSetting('temp-setting');
      expect(value).toBeUndefined();
    });

    it('should not throw when deleting non-existent key', async () => {
      await expect(deleteSetting('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings', async () => {
      await setSetting('key1', 'value1');
      await setSetting('key2', 'value2');
      await setSetting('key3', 'value3');

      const allSettings = await getAllSettings();
      expect(allSettings).toHaveLength(3);
      expect(allSettings).toEqual(
        expect.arrayContaining([
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' },
        ])
      );
    });

    it('should return empty array when no settings exist', async () => {
      const allSettings = await getAllSettings();
      expect(allSettings).toEqual([]);
    });
  });

  describe('clearAllSettings', () => {
    it('should clear all settings', async () => {
      await setSetting('key1', 'value1');
      await setSetting('key2', 'value2');
      await clearAllSettings();

      const allSettings = await getAllSettings();
      expect(allSettings).toEqual([]);
    });
  });

  describe('type validation', () => {
    it('should store complex JSON objects', async () => {
      const complexObject = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        boolean: true,
        number: 42,
      };
      await setSetting('complex', complexObject);
      const value = await getSetting('complex');
      expect(JSON.parse(value!)).toEqual(complexObject);
    });

    it('should handle empty strings', async () => {
      await setSetting('empty', '');
      const value = await getSetting('empty');
      expect(value).toBe('');
    });

    it('should handle special characters in values', async () => {
      const specialValue = '{"key": "value with \\"quotes\\" and \\n newlines"}';
      await setSetting('special', specialValue);
      const value = await getSetting('special');
      expect(value).toBe(specialValue);
    });
  });

  describe('database structure', () => {
    it('should have settings table defined', () => {
      expect(db.settings).toBeDefined();
    });

    it('should use key as primary key', async () => {
      await setSetting('primary-test', 'value1');
      await setSetting('primary-test', 'value2');
      
      const allSettings = await getAllSettings();
      const matchingSettings = allSettings.filter(s => s.key === 'primary-test');
      expect(matchingSettings).toHaveLength(1);
      expect(matchingSettings[0].value).toBe('value2');
    });
  });
});
