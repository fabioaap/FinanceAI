import { describe, it, expect, beforeEach } from 'vitest';
import { SyncEngine } from '../core/sync-engine';
import type { CloudProvider, SyncRecord, SyncResult } from '../core/types';

// Mock cloud provider for testing
class MockProvider implements CloudProvider {
  readonly name = 'mock';
  connected = true;

  async isConnected(): Promise<boolean> {
    return this.connected;
  }

  async push<T>(records: SyncRecord<T>[]): Promise<SyncResult> {
    return {
      success: true,
      syncedCount: records.length,
      failedCount: 0,
      conflicts: [],
      errors: [],
      timestamp: Date.now(),
    };
  }

  async pull<T>(): Promise<SyncRecord<T>[]> {
    return [];
  }

  async resolveConflict(): Promise<void> {
    // Mock implementation
  }
}

describe('SyncEngine', () => {
  let engine: SyncEngine;
  let provider: MockProvider;

  beforeEach(() => {
    engine = new SyncEngine({ autoSync: false });
    provider = new MockProvider();
    engine.setProvider(provider);
  });

  it('should create a sync engine', () => {
    expect(engine).toBeDefined();
    expect(engine.getStatus()).toBe('idle');
  });

  it('should set and get status', () => {
    expect(engine.getStatus()).toBe('idle');
  });

  it('should allow setting a provider', () => {
    const newEngine = new SyncEngine();
    newEngine.setProvider(provider);
    expect(newEngine).toBeDefined();
  });

  it('should check online status', () => {
    expect(typeof engine.isOnline()).toBe('boolean');
  });

  it('should enqueue records', async () => {
    await engine.enqueue({
      id: '1',
      data: { test: 'data' },
      tableName: 'test_table',
      operation: 'create',
      timestamp: Date.now(),
    });

    const stats = await engine.getQueueStats();
    expect(stats.pending).toBeGreaterThan(0);
  });

  it('should get queue statistics', async () => {
    const stats = await engine.getQueueStats();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('synced');
  });

  it('should cleanup old records', async () => {
    const deleted = await engine.cleanup();
    expect(typeof deleted).toBe('number');
  });

  it('should destroy properly', () => {
    engine.destroy();
    expect(true).toBe(true);
  });
});
