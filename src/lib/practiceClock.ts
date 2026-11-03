/** A clock subscribed to by its display, without rerendering the practice controller. */
export function createPracticeClock(initialSeconds: number, direction: 1 | -1) {
  let seconds = initialSeconds;
  let interval: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const stop = () => {
    clearInterval(interval);
    interval = undefined;
  };

  return {
    getSnapshot: () => seconds,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    reset: () => {
      seconds = initialSeconds;
      notify();
    },
    start: (onComplete?: () => void) => {
      stop();
      if (direction === -1 && seconds === 0) return;
      interval = setInterval(() => {
        seconds = Math.max(0, seconds + direction);
        notify();
        if (direction === -1 && seconds === 0) {
          stop();
          onComplete?.();
        }
      }, 1000);
    },
    stop,
  };
}

export type PracticeClock = ReturnType<typeof createPracticeClock>;
