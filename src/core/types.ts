/**
 * Sync engine types and interfaces
 */

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export type SyncDirection = 'push' | 'pull' | 'bidirectional';

export type ConflictResolution = 'local-wins' | 'remote-wins' | 'last-modified-wins' | 'manual';

export interface SyncRecord<T = unknown> {
  id: string;
  data: T;
  tableName: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
  version?: number;
}

export interface SyncConfig {
  /** How often to sync in milliseconds (default: 30000 - 30 seconds) */
  syncInterval?: number;
  /** Maximum number of retries for failed syncs (default: 3) */
  maxRetries?: number;
  /** Sync direction (default: 'bidirectional') */
  direction?: SyncDirection;
  /** Conflict resolution strategy (default: 'last-modified-wins') */
  conflictResolution?: ConflictResolution;
  /** Enable auto-sync when online (default: true) */
  autoSync?: boolean;
  /** Batch size for sync operations (default: 50) */
  batchSize?: number;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
  timestamp: number;
}

export interface SyncConflict<T = unknown> {
  id: string;
  tableName: string;
  localData: T;
  remoteData: T;
  localTimestamp: number;
  remoteTimestamp: number;
}

export interface SyncError {
  id: string;
  message: string;
  tableName?: string;
  operation?: string;
  timestamp: number;
  retriesLeft: number;
}

export interface CloudProvider {
  /** Provider name */
  readonly name: string;
  
  /** Check if provider is connected */
  isConnected(): Promise<boolean>;
  
  /** Push local changes to cloud */
  push<T>(records: SyncRecord<T>[]): Promise<SyncResult>;
  
  /** Pull remote changes from cloud */
  pull<T>(tableName: string, lastSync: number): Promise<SyncRecord<T>[]>;
  
  /** Resolve conflicts manually */
  resolveConflict<T>(conflict: SyncConflict<T>, resolution: T): Promise<void>;
}

export interface SyncEventMap extends Record<string, unknown> {
  'status-change': SyncStatus;
  'sync-start': void;
  'sync-complete': SyncResult;
  'sync-error': SyncError;
  'conflict': SyncConflict;
  'online': void;
  'offline': void;
}

export type SyncEventListener<K extends keyof SyncEventMap> = (data: SyncEventMap[K]) => void;
