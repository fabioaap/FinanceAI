import Dexie, { Table } from 'dexie';
import type { SyncRecord } from './types.js';

/**
 * Dexie database for sync queue
 */
export class SyncQueueDB extends Dexie {
  syncQueue!: Table<SyncRecord, string>;

  constructor() {
    super('FinanceAI_SyncQueue');
    
    this.version(1).stores({
      syncQueue: 'id, tableName, synced, timestamp, operation'
    });
  }
}

/**
 * Manages the sync queue for offline operations
 */
export class SyncQueue {
  private db: SyncQueueDB;

  constructor() {
    this.db = new SyncQueueDB();
  }

  /**
   * Add a record to the sync queue
   */
  async enqueue<T>(record: Omit<SyncRecord<T>, 'synced'>): Promise<void> {
    await this.db.syncQueue.add({
      ...record,
      synced: false,
    } as SyncRecord);
  }

  /**
   * Get all pending (unsynced) records
   */
  async getPending(limit?: number): Promise<SyncRecord[]> {
    let query = this.db.syncQueue
      .where('synced')
      .equals(0);

    if (limit) {
      query = query.limit(limit);
    }

    return query.toArray();
  }

  /**
   * Get pending records for a specific table
   */
  async getPendingByTable(tableName: string, limit?: number): Promise<SyncRecord[]> {
    let query = this.db.syncQueue
      .where(['tableName', 'synced'])
      .equals([tableName, 0]);

    if (limit) {
      query = query.limit(limit);
    }

    return query.toArray();
  }

  /**
   * Mark records as synced
   */
  async markAsSynced(ids: string[]): Promise<void> {
    await this.db.transaction('rw', this.db.syncQueue, async () => {
      for (const id of ids) {
        await this.db.syncQueue.update(id, { synced: true });
      }
    });
  }

  /**
   * Remove synced records (cleanup)
   */
  async cleanupSynced(olderThan?: number): Promise<number> {
    const threshold = olderThan || Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days default
    
    return await this.db.syncQueue
      .where('synced')
      .equals(1)
      .and(record => record.timestamp < threshold)
      .delete();
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<{ total: number; pending: number; synced: number }> {
    const total = await this.db.syncQueue.count();
    const synced = await this.db.syncQueue.where('synced').equals(1).count();
    const pending = total - synced;

    return { total, pending, synced };
  }

  /**
   * Clear all records from queue
   */
  async clear(): Promise<void> {
    await this.db.syncQueue.clear();
  }

  /**
   * Remove a specific record from queue
   */
  async remove(id: string): Promise<void> {
    await this.db.syncQueue.delete(id);
  }

  /**
   * Get the database instance
   */
  getDatabase(): SyncQueueDB {
    return this.db;
  }
}
