/**
 * Example: Complete Sync Engine Setup with Supabase
 */

import { SyncEngine, SupabaseProvider } from '@financeai/sync-engine';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create and configure sync engine
const syncEngine = new SyncEngine({
  syncInterval: 30000,               // Sync every 30 seconds
  maxRetries: 3,                     // Retry failed syncs 3 times
  direction: 'bidirectional',        // Sync both ways
  conflictResolution: 'last-modified-wins',
  autoSync: true,                    // Auto-sync when online
  batchSize: 50                      // Process 50 records per batch
});

// Set up Supabase provider
const provider = new SupabaseProvider({
  client: supabase,
  tablePrefix: 'sync_'
});

syncEngine.setProvider(provider);

// Event listeners
syncEngine.on('status-change', (status) => {
  console.log(`[Sync Engine] Status: ${status}`);
  updateUIStatus(status);
});

syncEngine.on('sync-complete', (result) => {
  console.log(`[Sync Engine] Sync complete:`, {
    synced: result.syncedCount,
    failed: result.failedCount,
    conflicts: result.conflicts.length
  });
  
  if (result.conflicts.length > 0) {
    showConflictNotification(result.conflicts);
  }
});

syncEngine.on('sync-error', (error) => {
  console.error(`[Sync Engine] Error:`, error.message);
  showErrorNotification(error);
});

syncEngine.on('conflict', (conflict) => {
  console.warn(`[Sync Engine] Conflict detected:`, conflict);
  // Optionally show UI for manual conflict resolution
});

syncEngine.on('online', () => {
  console.log('[Sync Engine] Network online - syncing...');
  showOnlineIndicator();
});

syncEngine.on('offline', () => {
  console.log('[Sync Engine] Network offline - queuing changes');
  showOfflineIndicator();
});

// Start the sync engine
syncEngine.start();

// Example: Add a transaction
async function createTransaction(transaction: {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}) {
  // Save locally first (to IndexedDB via Dexie)
  await saveToLocalDB('transactions', transaction);
  
  // Enqueue for sync
  await syncEngine.enqueue({
    id: transaction.id,
    data: transaction,
    tableName: 'transactions',
    operation: 'create',
    timestamp: Date.now()
  });
  
  console.log('Transaction queued for sync:', transaction.id);
}

// Example: Update a transaction
async function updateTransaction(id: string, updates: Partial<typeof transaction>) {
  // Update locally
  await updateInLocalDB('transactions', id, updates);
  
  // Enqueue for sync
  await syncEngine.enqueue({
    id,
    data: updates,
    tableName: 'transactions',
    operation: 'update',
    timestamp: Date.now()
  });
  
  console.log('Transaction update queued:', id);
}

// Example: Delete a transaction
async function deleteTransaction(id: string) {
  // Delete locally
  await deleteFromLocalDB('transactions', id);
  
  // Enqueue for sync
  await syncEngine.enqueue({
    id,
    data: { id },
    tableName: 'transactions',
    operation: 'delete',
    timestamp: Date.now()
  });
  
  console.log('Transaction deletion queued:', id);
}

// Example: Manual sync trigger
async function forceSyncNow() {
  try {
    const result = await syncEngine.sync();
    console.log('Manual sync completed:', result);
    return result;
  } catch (error) {
    console.error('Manual sync failed:', error);
    throw error;
  }
}

// Example: Get sync statistics
async function getSyncStats() {
  const stats = await syncEngine.getQueueStats();
  console.log('Sync queue stats:', stats);
  return stats;
}

// Example: Cleanup old synced records (older than 7 days)
async function cleanupOldRecords() {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const deleted = await syncEngine.cleanup(sevenDaysAgo);
  console.log(`Cleaned up ${deleted} old records`);
  return deleted;
}

// Graceful shutdown
function shutdown() {
  console.log('Shutting down sync engine...');
  syncEngine.stop();
  syncEngine.destroy();
}

// Handle app shutdown
window.addEventListener('beforeunload', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// UI helper functions (implement based on your UI framework)
function updateUIStatus(status: string) {
  // Update UI to show sync status
}

function showConflictNotification(conflicts: unknown[]) {
  // Show notification about conflicts
}

function showErrorNotification(error: { message: string }) {
  // Show error notification
}

function showOnlineIndicator() {
  // Show online indicator in UI
}

function showOfflineIndicator() {
  // Show offline indicator in UI
}

// Mock local DB functions (implement with Dexie)
async function saveToLocalDB(table: string, data: unknown) {
  // Implementation
}

async function updateInLocalDB(table: string, id: string, updates: unknown) {
  // Implementation
}

async function deleteFromLocalDB(table: string, id: string) {
  // Implementation
}

export {
  syncEngine,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  forceSyncNow,
  getSyncStats,
  cleanupOldRecords
};
