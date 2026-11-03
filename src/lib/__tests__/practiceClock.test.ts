import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPracticeClock } from '../practiceClock';

describe('practice clocks', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('pauses elapsed time outside practice, resumes it and resets for a new set', () => {
    const clock = createPracticeClock(0, 1);
    clock.start();
    vi.advanceTimersByTime(3000);
    expect(clock.getSnapshot()).toBe(3);
    clock.stop();
    vi.advanceTimersByTime(5000);
    expect(clock.getSnapshot()).toBe(3);
    clock.start();
    vi.advanceTimersByTime(1000);
    expect(clock.getSnapshot()).toBe(4);
    clock.reset();
    expect(clock.getSnapshot()).toBe(0);
    clock.stop();
  });

  it('records timeout exactly once and supports the next question', () => {
    const clock = createPracticeClock(2, -1);
    const timeout = vi.fn();
    clock.start(timeout);
    vi.advanceTimersByTime(5000);
    expect(clock.getSnapshot()).toBe(0);
    expect(timeout).toHaveBeenCalledTimes(1);
    clock.reset();
    clock.start(timeout);
    vi.advanceTimersByTime(2000);
    expect(timeout).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans up subscriptions and avoids duplicate intervals on restart', () => {
    const clock = createPracticeClock(10, -1);
    const listener = vi.fn();
    const unsubscribe = clock.subscribe(listener);
    clock.start();
    clock.stop();
    clock.start();
    clock.start();
    vi.advanceTimersByTime(1000);
    expect(clock.getSnapshot()).toBe(9);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    vi.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);
    clock.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
