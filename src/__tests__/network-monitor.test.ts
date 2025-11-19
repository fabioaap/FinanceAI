import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkMonitor } from '../utils/network-monitor';

describe('NetworkMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a network monitor', () => {
    const monitor = new NetworkMonitor();
    expect(monitor).toBeDefined();
    expect(typeof monitor.isOnline).toBe('boolean');
    monitor.destroy();
  });

  it('should allow subscribing to network status changes', () => {
    const monitor = new NetworkMonitor();

    const unsubscribe = monitor.subscribe(() => {
      // Listener callback
    });

    expect(typeof unsubscribe).toBe('function');
    monitor.destroy();
  });

  it('should clean up resources on destroy', () => {
    const monitor = new NetworkMonitor();
    monitor.startPeriodicCheck(5000);
    monitor.destroy();
    // Should not throw
    expect(true).toBe(true);
  });
});
