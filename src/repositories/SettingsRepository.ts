import { BaseRepository } from './BaseRepository';
import { AppSettings } from '@/types';
import { db } from '@/database/db';

export class SettingsRepository extends BaseRepository<AppSettings> {
  constructor() {
    super(db.settings);
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.table
      .where('key')
      .equals(key)
      .first();
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.table
      .where('key')
      .equals(key)
      .first();

    if (existing && existing.id !== undefined) {
      await this.update(existing.id, { value, updatedAt: new Date() });
    } else {
      await this.create({ key, value, updatedAt: new Date() });
    }
  }

  async deleteSetting(key: string): Promise<void> {
    const setting = await this.table
      .where('key')
      .equals(key)
      .first();
    
    if (setting?.id) {
      await this.delete(setting.id);
    }
  }
}

export const settingsRepository = new SettingsRepository();
