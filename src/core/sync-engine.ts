import { SyncQueue } from './sync-queue.js';
import { NetworkMonitor } from '../utils/network-monitor.js';
import { EventEmitter } from '../utils/event-emitter.js';
import type {
  SyncConfig,
  SyncStatus,
  SyncResult,
  SyncEventMap,
  CloudProvider,
  SyncRecord,
  SyncError,
  SyncConflict,
} from './types.js';

/**
 * Main sync engine that orchestrates synchronization between local and cloud storage
 */
export class SyncEngine extends EventEmitter<SyncEventMap> {
  private queue: SyncQueue;
  private networkMonitor: NetworkMonitor;
  private provider?: CloudProvider;
  private config: Required<SyncConfig>;
  private status: SyncStatus = 'idle';
  private syncInterval?: NodeJS.Timeout;
  private isSyncing = false;
  private lastSyncTime: Record<string, number> = {};

  constructor(config: SyncConfig = {}) {
    super();
    
    this.config = {
      syncInterval: config.syncInterval ?? 30000,
      maxRetries: config.maxRetries ?? 3,
      direction: config.direction ?? 'bidirectional',
      conflictResolution: config.conflictResolution ?? 'last-modified-wins',
      autoSync: config.autoSync ?? true,
      batchSize: config.batchSize ?? 50,
    };

    this.queue = new SyncQueue();
    this.networkMonitor = new NetworkMonitor();

    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring() {
    this.networkMonitor.subscribe((isOnline) => {
      if (isOnline) {
        this.emit('online', undefined);
        if (this.config.autoSync && this.provider) {
          this.sync().catch(error => {
            console.error('Auto-sync failed:', error);
          });
        }
      } else {
        this.emit('offline', undefined);
        this.setStatus('offline');
      }
    });
  }

  /**
   * Set the cloud provider
   */
  setProvider(provider: CloudProvider): void {
    this.provider = provider;
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  private setStatus(status: SyncStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.emit('status-change', status);
    }
  }

  /**
   * Start auto-sync
   */
  start(): void {
    if (this.syncInterval) {
      return; // Already started
    }

    this.syncInterval = setInterval(() => {
      if (this.provider && this.networkMonitor.isOnline) {
        this.sync().catch(error => {
          console.error('Scheduled sync failed:', error);
        });
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop auto-sync
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Manually trigger a sync
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    if (!this.provider) {
      throw new Error('No cloud provider configured');
    }

    if (!this.networkMonitor.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    this.isSyncing = true;
    this.setStatus('syncing');
    this.emit('sync-start', undefined);

    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      errors: [],
      timestamp: Date.now(),
    };

    try {
      // Check provider connection
      const isConnected = await this.provider.isConnected();
      if (!isConnected) {
        throw new Error('Provider is not connected');
      }

      // Push local changes
      if (this.config.direction === 'push' || this.config.direction === 'bidirectional') {
        await this.pushChanges(result);
      }

      // Pull remote changes
      if (this.config.direction === 'pull' || this.config.direction === 'bidirectional') {
        await this.pullChanges(result);
      }

      this.setStatus('idle');
      this.emit('sync-complete', result);

      return result;
    } catch (error) {
      result.success = false;
      const syncError: SyncError = {
        id: `sync-${Date.now()}`,
        message: error instanceof Error ? error.message : 'Unknown sync error',
        timestamp: Date.now(),
        retriesLeft: this.config.maxRetries,
      };
      result.errors.push(syncError);
      
      this.setStatus('error');
      this.emit('sync-error', syncError);
      
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushChanges(result: SyncResult): Promise<void> {
    if (!this.provider) return;

    const pending = await this.queue.getPending(this.config.batchSize);
    
    if (pending.length === 0) {
      return;
    }

    try {
      const pushResult = await this.provider.push(pending);
      
      result.syncedCount += pushResult.syncedCount;
      result.failedCount += pushResult.failedCount;
      result.conflicts.push(...pushResult.conflicts);
      result.errors.push(...pushResult.errors);

      // Mark successfully synced records
      const syncedIds = pending
        .filter((_, index) => index < pushResult.syncedCount)
        .map(record => record.id);
      
      if (syncedIds.length > 0) {
        await this.queue.markAsSynced(syncedIds);
      }

      // Handle conflicts
      for (const conflict of pushResult.conflicts) {
        this.emit('conflict', conflict);
        await this.handleConflict(conflict);
      }
    } catch (error) {
      const syncError: SyncError = {
        id: `push-${Date.now()}`,
        message: error instanceof Error ? error.message : 'Push failed',
        operation: 'push',
        timestamp: Date.now(),
        retriesLeft: this.config.maxRetries,
      };
      result.errors.push(syncError);
      result.failedCount += pending.length;
    }
  }

  private async pullChanges(result: SyncResult): Promise<void> {
    if (!this.provider) return;

    // Get unique table names from pending records
    const pending = await this.queue.getPending();
    const tableNames = [...new Set(pending.map(r => r.tableName))];

    for (const tableName of tableNames) {
      try {
        const lastSync = this.lastSyncTime[tableName] || 0;
        const remoteRecords = await this.provider.pull(tableName, lastSync);

        // Process remote records (application-specific logic would go here)
        result.syncedCount += remoteRecords.length;
        this.lastSyncTime[tableName] = Date.now();
      } catch (error) {
        const syncError: SyncError = {
          id: `pull-${tableName}-${Date.now()}`,
          message: error instanceof Error ? error.message : 'Pull failed',
          tableName,
          operation: 'pull',
          timestamp: Date.now(),
          retriesLeft: this.config.maxRetries,
        };
        result.errors.push(syncError);
      }
    }
  }

  private async handleConflict<T>(conflict: SyncConflict<T>): Promise<void> {
    if (!this.provider) return;

    let resolution: T;

    switch (this.config.conflictResolution) {
      case 'local-wins':
        resolution = conflict.localData;
        break;
      case 'remote-wins':
        resolution = conflict.remoteData;
        break;
      case 'last-modified-wins':
        resolution = conflict.localTimestamp > conflict.remoteTimestamp
          ? conflict.localData
          : conflict.remoteData;
        break;
      case 'manual':
        // Emit conflict event and wait for manual resolution
        return;
      default:
        resolution = conflict.remoteData;
    }

    await this.provider.resolveConflict(conflict, resolution);
  }

  /**
   * Add a record to the sync queue
   */
  async enqueue<T>(record: Omit<SyncRecord<T>, 'synced'>): Promise<void> {
    await this.queue.enqueue(record);
    
    // Trigger immediate sync if auto-sync is enabled
    if (this.config.autoSync && this.provider && this.networkMonitor.isOnline && !this.isSyncing) {
      this.sync().catch(error => {
        console.error('Immediate sync failed:', error);
      });
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return await this.queue.getQueueSize();
  }

  /**
   * Cleanup old synced records
   */
  async cleanup(olderThanMs?: number): Promise<number> {
    return await this.queue.cleanupSynced(olderThanMs);
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.networkMonitor.isOnline;
  }

  /**
   * Cleanup and destroy the sync engine
   */
  destroy(): void {
    this.stop();
    this.networkMonitor.destroy();
    this.clear();
  }
}
