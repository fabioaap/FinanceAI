/**
 * Event emitter for sync engine
 */

export type EventListener<T = unknown> = (data: T) => void;

export class EventEmitter<EventMap extends Record<string, unknown>> {
  private listeners: Map<keyof EventMap, Set<EventListener<EventMap[keyof EventMap]>>> = new Map();

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(listener as EventListener<EventMap[keyof EventMap]>);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener<EventMap[keyof EventMap]>);
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${String(event)}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Remove all listeners for a specific event
   */
  clearEvent<K extends keyof EventMap>(event: K): void {
    this.listeners.delete(event);
  }
}
