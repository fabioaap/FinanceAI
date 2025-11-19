import { describe, it, expect } from 'vitest';
import { EventEmitter } from '../utils/event-emitter';

describe('EventEmitter', () => {
  it('should emit and listen to events', () => {
    const emitter = new EventEmitter<{ test: string }>();
    let received = '';

    emitter.on('test', (data) => {
      received = data;
    });

    emitter.emit('test', 'hello');

    expect(received).toBe('hello');
  });

  it('should unsubscribe from events', () => {
    const emitter = new EventEmitter<{ test: string }>();
    let count = 0;

    const unsubscribe = emitter.on('test', () => {
      count++;
    });

    emitter.emit('test', 'first');
    expect(count).toBe(1);

    unsubscribe();
    emitter.emit('test', 'second');
    expect(count).toBe(1);
  });

  it('should handle multiple listeners', () => {
    const emitter = new EventEmitter<{ test: number }>();
    let sum = 0;

    emitter.on('test', (data) => {
      sum += data;
    });

    emitter.on('test', (data) => {
      sum += data * 2;
    });

    emitter.emit('test', 5);
    expect(sum).toBe(15); // 5 + (5*2)
  });

  it('should clear all listeners', () => {
    const emitter = new EventEmitter<{ test: string }>();
    let called = false;

    emitter.on('test', () => {
      called = true;
    });

    emitter.clear();
    emitter.emit('test', 'data');

    expect(called).toBe(false);
  });
});
