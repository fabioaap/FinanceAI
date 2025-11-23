import { describe, it, expect, beforeEach } from 'vitest';
import { settingsRepository } from './SettingsRepository';
import { db } from '@/database/db';

describe('SettingsRepository', () => {
  beforeEach(async () => {
    // Clear the settings table before each test
    await db.settings.clear();
  });

  it('should create a setting', async () => {
    const id = await settingsRepository.setByKey('theme', 'dark');
    expect(id).toBeGreaterThan(0);

    const saved = await settingsRepository.getByKey('theme');
    expect(saved).toBeDefined();
    expect(saved?.key).toBe('theme');
    expect(saved?.value).toBe('dark');
  });

  it('should update existing setting', async () => {
    await settingsRepository.setByKey('language', 'en');
    await settingsRepository.setByKey('language', 'pt-BR');

    const setting = await settingsRepository.getByKey('language');
    expect(setting?.value).toBe('pt-BR');
  });

  it('should get all settings', async () => {
    await settingsRepository.setByKey('theme', 'dark');
    await settingsRepository.setByKey('language', 'en');

    const settings = await settingsRepository.getAll();
    expect(settings).toHaveLength(2);
  });

  it('should delete a setting by key', async () => {
    await settingsRepository.setByKey('test-key', 'test-value');
    
    let setting = await settingsRepository.getByKey('test-key');
    expect(setting).toBeDefined();

    await settingsRepository.deleteByKey('test-key');

    setting = await settingsRepository.getByKey('test-key');
    expect(setting).toBeUndefined();
  });

  it('should return undefined for non-existent key', async () => {
    const setting = await settingsRepository.getByKey('non-existent');
    expect(setting).toBeUndefined();
  });
});
