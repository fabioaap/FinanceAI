/**
 * Network status monitor utility
 */

export type NetworkStatusListener = (isOnline: boolean) => void;

export class NetworkMonitor {
  private listeners: Set<NetworkStatusListener> = new Set();
  private _isOnline: boolean = typeof globalThis.navigator !== 'undefined' ? globalThis.navigator.onLine : true;
  private checkInterval?: NodeJS.Timeout;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.addEventListener('online', () => this.setOnlineStatus(true));
      globalThis.window.addEventListener('offline', () => this.setOnlineStatus(false));
    }
  }

  private setOnlineStatus(status: boolean) {
    if (this._isOnline !== status) {
      this._isOnline = status;
      this.notifyListeners(status);
    }
  }

  private notifyListeners(status: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Get current online status
   */
  get isOnline(): boolean {
    return this._isOnline;
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start periodic connectivity checks
   */
  startPeriodicCheck(intervalMs: number = 10000, checkUrl: string = 'https://www.google.com/favicon.ico') {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        await fetch(checkUrl, {
          method: 'HEAD',
          mode: 'no-cors',
        });
        this.setOnlineStatus(true);
      } catch {
        this.setOnlineStatus(false);
      }
    }, intervalMs);
  }

  /**
   * Stop periodic connectivity checks
   */
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopPeriodicCheck();
    this.listeners.clear();
    
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.removeEventListener('online', () => this.setOnlineStatus(true));
      globalThis.window.removeEventListener('offline', () => this.setOnlineStatus(false));
    }
  }
}
