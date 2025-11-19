import type { CloudProvider, SyncRecord, SyncResult, SyncConflict } from '../core/types.js';

// Type definitions for Supabase client (peer dependency)
interface SupabaseClient {
  from(table: string): {
    select(columns: string): {
      limit(count: number): Promise<{ data: unknown; error: unknown }>;
      eq(column: string, value: unknown): {
        single(): Promise<{ data: unknown; error?: { message: string } }>;
      };
      gt(column: string, value: unknown): {
        order(column: string, options: { ascending: boolean }): Promise<{
          data: unknown[] | null;
          error?: { message: string };
        }>;
      };
    };
    upsert(data: unknown): Promise<{ error?: { code?: string; message: string } }>;
    delete(): {
      eq(column: string, value: unknown): Promise<{ error?: { message: string } }>;
    };
    update(data: unknown): {
      eq(column: string, value: unknown): Promise<{ error?: { message: string } }>;
    };
  };
}

export interface SupabaseProviderConfig {
  client: SupabaseClient;
  /** Prefix for sync tables (default: 'sync_') */
  tablePrefix?: string;
}

/**
 * Supabase cloud provider for sync engine
 */
export class SupabaseProvider implements CloudProvider {
  readonly name = 'supabase';
  private client: SupabaseClient;
  private tablePrefix: string;

  constructor(config: SupabaseProviderConfig) {
    this.client = config.client;
    this.tablePrefix = config.tablePrefix ?? 'sync_';
  }

  async isConnected(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(`${this.tablePrefix}health`)
        .select('*')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  async push<T>(records: SyncRecord<T>[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      errors: [],
      timestamp: Date.now(),
    };

    // Group records by table
    const recordsByTable = this.groupByTable(records);

    for (const [tableName, tableRecords] of Object.entries(recordsByTable)) {
      try {
        for (const record of tableRecords) {
          await this.pushRecord(tableName, record, result);
        }
      } catch (error) {
        result.failedCount += tableRecords.length;
        result.errors.push({
          id: `push-${tableName}-${Date.now()}`,
          message: error instanceof Error ? error.message : 'Push failed',
          tableName,
          timestamp: Date.now(),
          retriesLeft: 0,
        });
      }
    }

    result.success = result.failedCount === 0;
    return result;
  }

  private async pushRecord<T>(
    tableName: string,
    record: SyncRecord<T>,
    result: SyncResult
  ): Promise<void> {
    const syncTable = `${this.tablePrefix}${tableName}`;

    try {
      switch (record.operation) {
        case 'create':
        case 'update': {
          const { error } = await this.client
            .from(syncTable)
            .upsert({
              id: record.id,
              data: record.data,
              timestamp: record.timestamp,
              version: (record.version ?? 0) + 1,
            });

          if (error) {
            if (error.code === 'PGRST116') { // Conflict
              await this.detectConflict(tableName, record, result);
            } else {
              throw error;
            }
          } else {
            result.syncedCount++;
          }
          break;
        }

        case 'delete': {
          const { error } = await this.client
            .from(syncTable)
            .delete()
            .eq('id', record.id);

          if (error) {
            throw error;
          }
          result.syncedCount++;
          break;
        }
      }
    } catch (error) {
      result.failedCount++;
      result.errors.push({
        id: record.id,
        message: error instanceof Error ? error.message : 'Unknown error',
        tableName,
        operation: record.operation,
        timestamp: Date.now(),
        retriesLeft: 0,
      });
    }
  }

  private async detectConflict<T>(
    tableName: string,
    localRecord: SyncRecord<T>,
    result: SyncResult
  ): Promise<void> {
    const syncTable = `${this.tablePrefix}${tableName}`;
    
    const { data: remoteData } = await this.client
      .from(syncTable)
      .select('*')
      .eq('id', localRecord.id)
      .single();

    if (remoteData) {
      const remote = remoteData as { data: T; timestamp: number };
      const conflict: SyncConflict<T> = {
        id: localRecord.id,
        tableName,
        localData: localRecord.data,
        remoteData: remote.data,
        localTimestamp: localRecord.timestamp,
        remoteTimestamp: remote.timestamp,
      };
      result.conflicts.push(conflict);
    }
  }

  async pull<T>(tableName: string, lastSync: number): Promise<SyncRecord<T>[]> {
    const syncTable = `${this.tablePrefix}${tableName}`;
    
    const { data, error } = await this.client
      .from(syncTable)
      .select('*')
      .gt('timestamp', lastSync)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to pull from ${tableName}: ${error.message}`);
    }

    return ((data || []) as Array<{ id: string; data: T; timestamp: number; version?: number }>).map(item => ({
      id: item.id,
      data: item.data,
      tableName,
      operation: 'update' as const,
      timestamp: item.timestamp,
      synced: true,
      version: item.version,
    }));
  }

  async resolveConflict<T>(conflict: SyncConflict<T>, resolution: T): Promise<void> {
    const syncTable = `${this.tablePrefix}${conflict.tableName}`;
    
    const { error } = await this.client
      .from(syncTable)
      .update({
        data: resolution,
        timestamp: Date.now(),
      })
      .eq('id', conflict.id);

    if (error) {
      throw new Error(`Failed to resolve conflict: ${error.message}`);
    }
  }

  private groupByTable<T>(records: SyncRecord<T>[]): Record<string, SyncRecord<T>[]> {
    return records.reduce((acc, record) => {
      if (!acc[record.tableName]) {
        acc[record.tableName] = [];
      }
      acc[record.tableName]!.push(record);
      return acc;
    }, {} as Record<string, SyncRecord<T>[]>);
  }
}
