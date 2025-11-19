import type { CloudProvider, SyncRecord, SyncResult, SyncConflict } from '../core/types.js';

export interface HttpProviderConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** API key or authentication token */
  apiKey?: string;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Custom HTTP cloud provider for sync engine
 */
export class HttpProvider implements CloudProvider {
  readonly name = 'http';
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(config: HttpProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? 30000;
    
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (config.apiKey) {
      this.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/sync/push`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ records }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Push failed: ${response.statusText}`);
      }

      const data = await response.json() as {
        syncedCount: number;
        failedCount: number;
        conflicts?: SyncConflict[];
        errors?: Array<{ id: string; message: string }>;
      };

      result.syncedCount = data.syncedCount;
      result.failedCount = data.failedCount;
      result.conflicts = data.conflicts || [];
      result.errors = (data.errors || []).map(err => ({
        id: err.id,
        message: err.message,
        timestamp: Date.now(),
        retriesLeft: 0,
      }));

      result.success = result.failedCount === 0;
    } catch (error) {
      result.success = false;
      result.failedCount = records.length;
      result.errors.push({
        id: `push-${Date.now()}`,
        message: error instanceof Error ? error.message : 'Push failed',
        timestamp: Date.now(),
        retriesLeft: 0,
      });
    }

    return result;
  }

  async pull<T>(tableName: string, lastSync: number): Promise<SyncRecord<T>[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const url = new URL(`${this.baseUrl}/sync/pull`);
      url.searchParams.set('tableName', tableName);
      url.searchParams.set('lastSync', lastSync.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.statusText}`);
      }

      const data = await response.json() as { records: SyncRecord<T>[] };
      return data.records || [];
    } catch (error) {
      throw new Error(
        `Failed to pull from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async resolveConflict<T>(conflict: SyncConflict<T>, resolution: T): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/sync/resolve-conflict`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          id: conflict.id,
          tableName: conflict.tableName,
          resolution,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to resolve conflict: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to resolve conflict: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
