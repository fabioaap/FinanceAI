# FinanceAI - Sync Engine

Finance AI sync engine that synchronizes local data (Dexie) with cloud storage (Supabase/Firebase/Custom) when online.

## Features

- 🔄 **Offline-first**: Queue operations when offline and sync automatically when back online
- 🌐 **Multi-provider**: Supports Supabase, custom HTTP APIs, and extensible for other providers
- 🔔 **Event-driven**: Subscribe to sync events (status changes, conflicts, errors)
- ⚙️ **Configurable**: Flexible sync intervals, batch sizes, and conflict resolution strategies
- 🎯 **Type-safe**: Full TypeScript support with strict types
- 📦 **Zero dependencies**: Core engine has minimal dependencies (only Dexie for local storage)

## Installation

```bash
npm install @financeai/sync-engine
```

For Supabase support, install the peer dependency:

```bash
npm install @supabase/supabase-js
```

## Quick Start

### Basic Setup

```typescript
import { SyncEngine, SupabaseProvider } from '@financeai/sync-engine';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

// Create sync engine
const syncEngine = new SyncEngine({
  syncInterval: 30000,      // Sync every 30 seconds
  autoSync: true,           // Automatically sync when online
  batchSize: 50,           // Process 50 records per sync
  conflictResolution: 'last-modified-wins'
});

// Set up provider
const provider = new SupabaseProvider({
  client: supabase,
  tablePrefix: 'sync_'
});

syncEngine.setProvider(provider);

// Start syncing
syncEngine.start();
```

### Using Custom HTTP Provider

```typescript
import { SyncEngine, HttpProvider } from '@financeai/sync-engine';

const provider = new HttpProvider({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  timeout: 30000
});

syncEngine.setProvider(provider);
```

### Enqueuing Changes

```typescript
// Add a record to sync queue
await syncEngine.enqueue({
  id: '123',
  data: { amount: 100, category: 'food' },
  tableName: 'transactions',
  operation: 'create',
  timestamp: Date.now()
});
```

### Listening to Events

```typescript
// Subscribe to sync status changes
syncEngine.on('status-change', (status) => {
  console.log('Sync status:', status);
});

// Subscribe to sync completion
syncEngine.on('sync-complete', (result) => {
  console.log(`Synced ${result.syncedCount} records`);
});

// Handle conflicts
syncEngine.on('conflict', (conflict) => {
  console.log('Conflict detected:', conflict);
});

// Handle errors
syncEngine.on('sync-error', (error) => {
  console.error('Sync error:', error);
});

// Network status
syncEngine.on('online', () => console.log('Back online'));
syncEngine.on('offline', () => console.log('Gone offline'));
```

### Manual Sync

```typescript
try {
  const result = await syncEngine.sync();
  console.log('Sync complete:', result);
} catch (error) {
  console.error('Sync failed:', error);
}
```

## Configuration Options

```typescript
interface SyncConfig {
  /** How often to sync in milliseconds (default: 30000) */
  syncInterval?: number;
  
  /** Maximum number of retries for failed syncs (default: 3) */
  maxRetries?: number;
  
  /** Sync direction: 'push' | 'pull' | 'bidirectional' (default: 'bidirectional') */
  direction?: SyncDirection;
  
  /** Conflict resolution strategy (default: 'last-modified-wins') */
  conflictResolution?: 'local-wins' | 'remote-wins' | 'last-modified-wins' | 'manual';
  
  /** Enable auto-sync when online (default: true) */
  autoSync?: boolean;
  
  /** Batch size for sync operations (default: 50) */
  batchSize?: number;
}
```

## API Reference

### SyncEngine

#### Methods

- `setProvider(provider: CloudProvider)`: Set the cloud provider
- `start()`: Start automatic syncing
- `stop()`: Stop automatic syncing
- `sync()`: Manually trigger a sync
- `enqueue(record)`: Add a record to the sync queue
- `getStatus()`: Get current sync status
- `getQueueStats()`: Get queue statistics
- `cleanup(olderThanMs?)`: Clean up old synced records
- `isOnline()`: Check if currently online
- `destroy()`: Cleanup and destroy the engine

#### Events

- `status-change`: Sync status changed
- `sync-start`: Sync started
- `sync-complete`: Sync completed
- `sync-error`: Sync error occurred
- `conflict`: Conflict detected
- `online`: Network came online
- `offline`: Network went offline

### Cloud Providers

#### SupabaseProvider

```typescript
const provider = new SupabaseProvider({
  client: supabaseClient,
  tablePrefix: 'sync_'  // Tables will be named sync_tablename
});
```

#### HttpProvider

```typescript
const provider = new HttpProvider({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  headers: { 'Custom-Header': 'value' },
  timeout: 30000
});
```

Expected endpoints:
- `GET /health` - Health check
- `POST /sync/push` - Push local changes
- `GET /sync/pull?tableName=X&lastSync=Y` - Pull remote changes
- `POST /sync/resolve-conflict` - Resolve conflicts

### Custom Provider

Implement the `CloudProvider` interface:

```typescript
import { CloudProvider, SyncRecord, SyncResult, SyncConflict } from '@financeai/sync-engine';

class MyCustomProvider implements CloudProvider {
  readonly name = 'my-provider';

  async isConnected(): Promise<boolean> {
    // Check connection
  }

  async push<T>(records: SyncRecord<T>[]): Promise<SyncResult> {
    // Push records to cloud
  }

  async pull<T>(tableName: string, lastSync: number): Promise<SyncRecord<T>[]> {
    // Pull records from cloud
  }

  async resolveConflict<T>(conflict: SyncConflict<T>, resolution: T): Promise<void> {
    // Resolve conflict
  }
}
```

## Local Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint

# Type check
npm run type-check
```

## Architecture

```
┌─────────────────────────────────────────────┐
│           Application Layer                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Sync Engine                       │
│  - Event Management                         │
│  - Sync Orchestration                       │
│  - Conflict Resolution                      │
└─────┬────────────────────┬──────────────────┘
      │                    │
┌─────▼──────┐      ┌──────▼─────────────────┐
│ Sync Queue │      │  Cloud Providers       │
│  (Dexie)   │      │  - Supabase            │
│            │      │  - HTTP                │
│            │      │  - Custom              │
└────────────┘      └────────────────────────┘
```

## License

MIT
