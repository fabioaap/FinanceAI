/**
 * Example: Using Custom HTTP Provider
 */

import { SyncEngine, HttpProvider } from '@financeai/sync-engine';

// Create HTTP provider pointing to your custom API
const provider = new HttpProvider({
  baseUrl: 'https://api.financeai.example.com',
  apiKey: process.env.API_KEY,
  headers: {
    'X-App-Version': '1.0.0',
  },
  timeout: 30000
});

// Create sync engine
const syncEngine = new SyncEngine({
  syncInterval: 60000,  // Sync every minute
  autoSync: true,
  conflictResolution: 'remote-wins'  // Server always wins on conflicts
});

syncEngine.setProvider(provider);

// Monitor sync progress
let syncInProgress = false;

syncEngine.on('sync-start', () => {
  syncInProgress = true;
  console.log('[HTTP Sync] Starting sync...');
});

syncEngine.on('sync-complete', (result) => {
  syncInProgress = false;
  console.log('[HTTP Sync] Complete:', {
    success: result.success,
    synced: result.syncedCount,
    failed: result.failedCount,
    errors: result.errors.length
  });
});

syncEngine.on('sync-error', (error) => {
  syncInProgress = false;
  console.error('[HTTP Sync] Error:', error);
  
  // Implement exponential backoff
  if (error.retriesLeft > 0) {
    const delay = Math.pow(2, 3 - error.retriesLeft) * 1000;
    console.log(`[HTTP Sync] Retrying in ${delay}ms...`);
    setTimeout(() => {
      syncEngine.sync().catch(console.error);
    }, delay);
  }
});

// Start sync engine
syncEngine.start();

// Example usage
async function addExpense(expense: {
  id: string;
  amount: number;
  category: string;
}) {
  await syncEngine.enqueue({
    id: expense.id,
    data: expense,
    tableName: 'expenses',
    operation: 'create',
    timestamp: Date.now()
  });
}

export { syncEngine, addExpense };
