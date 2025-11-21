import { useState, useEffect } from 'react';
import { syncEngine, SyncStatus } from './syncEngine';

/**
 * React hook for sync engine
 * Provides reactive sync state and methods
 */
export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncEngine.getStatus());

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncEngine.subscribe((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  const startSync = () => {
    syncEngine.start();
  };

  const stopSync = () => {
    syncEngine.stop();
  };

  const syncNow = async () => {
    await syncEngine.syncNow();
  };

  const enableSync = () => {
    syncEngine.enable();
  };

  const disableSync = () => {
    syncEngine.disable();
  };

  return {
    status: syncStatus,
    startSync,
    stopSync,
    syncNow,
    enableSync,
    disableSync,
  };
}
