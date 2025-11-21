/**
 * Sync Engine for FinanceAI
 * 
 * Manages synchronization between local IndexedDB (Dexie) and cloud storage.
 * 
 * Features:
 * - Bidirectional sync (local ↔ cloud)
 * - Conflict resolution strategy
 * - Retry mechanism with exponential backoff
 * - Sync queue for offline operations
 * - Change tracking and logs
 * 
 * Environment variables:
 * - VITE_SYNC_ENABLED: 'true' | 'false' (default: 'false')
 * - VITE_SYNC_ENDPOINT: Cloud API endpoint
 * - VITE_SYNC_INTERVAL: Sync interval in milliseconds (default: 300000 = 5 min)
 */

import { db, DBTransaction } from '../db';
import { authService } from '../auth';

export interface SyncLog {
  id?: number;
  timestamp: string;
  action: 'push' | 'pull' | 'conflict' | 'error';
  entityType: 'transaction' | 'bill' | 'goal' | 'category';
  entityId?: number;
  status: 'success' | 'failed' | 'pending';
  message: string;
  retryCount: number;
}

export interface SyncStatus {
  isEnabled: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  conflicts: number;
  errors: string[];
}

export type ConflictResolutionStrategy = 
  | 'local-wins'      // Keep local changes
  | 'remote-wins'     // Accept remote changes
  | 'latest-wins'     // Compare timestamps
  | 'manual';         // Require user intervention

class SyncEngine {
  private isEnabled: boolean = false;
  private isSyncing: boolean = false;
  private syncInterval: number = 300000; // 5 minutes
  private intervalId: number | null = null;
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    // Check if sync is enabled via environment variable
    this.isEnabled = import.meta.env.VITE_SYNC_ENABLED === 'true';
    const interval = parseInt(import.meta.env.VITE_SYNC_INTERVAL || '300000');
    if (!isNaN(interval)) {
      this.syncInterval = interval;
    }

    if (this.isEnabled) {
      console.log('Sync Engine initialized and enabled');
    } else {
      console.log('Sync Engine initialized but disabled (set VITE_SYNC_ENABLED=true to enable)');
    }
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.add(listener);
    listener(this.getStatus());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return {
      isEnabled: this.isEnabled,
      isSyncing: this.isSyncing,
      lastSyncAt: localStorage.getItem('sync:lastSyncAt'),
      pendingChanges: 0, // TODO: Track pending changes
      conflicts: 0,       // TODO: Track conflicts
      errors: [],
    };
  }

  /**
   * Start automatic sync
   */
  start() {
    if (!this.isEnabled) {
      console.warn('Sync is disabled. Set VITE_SYNC_ENABLED=true to enable.');
      return;
    }

    if (this.intervalId) {
      console.warn('Sync already started');
      return;
    }

    console.log(`Starting sync engine with interval: ${this.syncInterval}ms`);
    
    // Sync immediately
    this.sync();

    // Then sync at regular intervals
    this.intervalId = window.setInterval(() => {
      this.sync();
    }, this.syncInterval) as unknown as number;

    this.notifyListeners();
  }

  /**
   * Stop automatic sync
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Sync engine stopped');
      this.notifyListeners();
    }
  }

  /**
   * Perform sync operation
   */
  async sync(): Promise<void> {
    if (!this.isEnabled) {
      console.log('Sync disabled, skipping');
      return;
    }

    if (this.isSyncing) {
      console.log('Sync already in progress, skipping');
      return;
    }

    // Check authentication
    if (!authService.isAuthenticated()) {
      console.log('User not authenticated, skipping sync');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      console.log('Starting sync...');

      // Push local changes to cloud
      await this.pushChanges();

      // Pull remote changes from cloud
      await this.pullChanges();

      // Update last sync timestamp
      localStorage.setItem('sync:lastSyncAt', new Date().toISOString());

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      await this.logError(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Push local changes to cloud
   */
  private async pushChanges(): Promise<void> {
    // TODO: Implement actual cloud push
    // This is a placeholder for demonstration
    
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('No user ID for sync');
    }

    console.log('Pushing local changes...');

    // Get all local transactions (example)
    const transactions = await db.transactions.toArray();
    
    // In production, you would:
    // 1. Filter only changed/new items (track with a 'synced' flag or lastModified)
    // 2. Send to cloud API endpoint
    // 3. Handle conflicts based on strategy
    // 4. Mark items as synced
    
    console.log(`Would push ${transactions.length} transactions to cloud`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Pull remote changes from cloud
   */
  private async pullChanges(): Promise<void> {
    // TODO: Implement actual cloud pull
    // This is a placeholder for demonstration
    
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error('No user ID for sync');
    }

    console.log('Pulling remote changes...');

    // In production, you would:
    // 1. Fetch changes from cloud API since last sync
    // 2. Apply conflict resolution strategy
    // 3. Merge into local database
    // 4. Track conflicts for manual resolution if needed
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Remote changes pulled successfully');
  }

  /**
   * Resolve conflicts between local and remote data
   * Public method for future use in cloud sync implementation
   */
  async resolveConflict(
    local: DBTransaction,
    remote: DBTransaction,
    strategy: ConflictResolutionStrategy = 'latest-wins'
  ): Promise<DBTransaction> {
    switch (strategy) {
      case 'local-wins':
        return local;
      
      case 'remote-wins':
        return remote;
      
      case 'latest-wins': {
        const localTime = new Date(local.updatedAt).getTime();
        const remoteTime = new Date(remote.updatedAt).getTime();
        return localTime > remoteTime ? local : remote;
      }
      
      case 'manual':
        // In production, queue for manual resolution
        console.warn('Manual conflict resolution required:', { local, remote });
        return local; // Default to local for now
      
      default:
        return local;
    }
  }

  /**
   * Log sync error
   */
  private async logError(message: string): Promise<void> {
    const log: SyncLog = {
      timestamp: new Date().toISOString(),
      action: 'error',
      entityType: 'transaction', // Generic
      status: 'failed',
      message,
      retryCount: 0,
    };

    console.error('Sync error logged:', log);
    // TODO: Store logs in IndexedDB for debugging
  }

  /**
   * Retry failed sync operations with exponential backoff
   * Public method for future use in cloud sync implementation
   */
  async retryWithBackoff(key: string, operation: () => Promise<void>): Promise<void> {
    const attempts = this.retryAttempts.get(key) || 0;
    
    if (attempts >= this.maxRetries) {
      this.retryAttempts.delete(key);
      throw new Error(`Max retry attempts (${this.maxRetries}) reached for ${key}`);
    }

    try {
      await operation();
      this.retryAttempts.delete(key); // Success, clear retry count
    } catch {
      this.retryAttempts.set(key, attempts + 1);
      
      // Exponential backoff: 2^attempts seconds
      const backoffMs = Math.pow(2, attempts) * 1000;
      console.log(`Retry ${attempts + 1}/${this.maxRetries} for ${key} after ${backoffMs}ms`);
      
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return this.retryWithBackoff(key, operation);
    }
  }

  /**
   * Force sync now (manual trigger)
   */
  async syncNow(): Promise<void> {
    return this.sync();
  }

  /**
   * Enable sync
   */
  enable() {
    this.isEnabled = true;
    this.notifyListeners();
  }

  /**
   * Disable sync
   */
  disable() {
    this.isEnabled = false;
    this.stop();
    this.notifyListeners();
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();

/**
 * Example .env.example configuration:
 * 
 * # Sync Engine Configuration
 * VITE_SYNC_ENABLED=false
 * VITE_SYNC_ENDPOINT=https://api.financeai.com/sync
 * VITE_SYNC_INTERVAL=300000
 * 
 * # Conflict Resolution
 * # Options: local-wins, remote-wins, latest-wins, manual
 * VITE_SYNC_CONFLICT_STRATEGY=latest-wins
 */
