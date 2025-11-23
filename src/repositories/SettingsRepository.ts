import { BaseRepository } from './BaseRepository';
import { Settings } from '@/types';
import { db } from '@/database/db';

export class SettingsRepository extends BaseRepository<Settings> {
  constructor() {
    super(db.settings);
  }

  async getByKey(key: string): Promise<Settings | undefined> {
    return await this.table.where('key').equals(key).first();
  }

  async setByKey(key: string, value: string): Promise<number> {
    const existing = await this.getByKey(key);
    
    if (existing && existing.id) {
      await this.update(existing.id, { value });
      return existing.id;
    }
    
    return await this.create({ key, value } as Omit<Settings, 'id'>);
  }

  async deleteByKey(key: string): Promise<void> {
    const existing = await this.getByKey(key);
    if (existing && existing.id) {
      await this.delete(existing.id);
    }
  }
}

export const settingsRepository = new SettingsRepository();
