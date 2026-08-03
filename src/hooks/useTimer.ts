import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerDirection = 'up' | 'down';

interface UseTimerOptions {
  initialSeconds: number;
  direction?: TimerDirection;
  autoStart?: boolean;
  onComplete?: (elapsed: number) => void;
  onTick?: (current: number) => void;
}

interface UseTimerResult {
  seconds: number;
  elapsed: number;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
}

export function useTimer({
  initialSeconds,
  direction = 'up',
  autoStart = false,
  onComplete,
  onTick,
}: UseTimerOptions): UseTimerResult {
  const [seconds, setSeconds] = useState(direction === 'down' ? initialSeconds : 0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setSeconds(prev => {
      const next = direction === 'down' ? prev - 1 : prev + 1;
      const done = direction === 'down' ? next <= 0 : next >= initialSeconds;

      if (done) {
        setIsRunning(false);
        setIsComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete?.(direction === 'down' ? initialSeconds : next);
        return direction === 'down' ? 0 : initialSeconds;
      }

      onTick?.(next);
      return next;
    });

    setElapsed(e => e + 1);
  }, [direction, initialSeconds, onComplete, onTick]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  const start  = useCallback(() => { setIsRunning(true); setIsComplete(false); }, []);
  const pause  = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const stop   = useCallback(() => {
    setIsRunning(false);
    onComplete?.(elapsed);
  }, [elapsed, onComplete]);
  const reset  = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setElapsed(0);
    setSeconds(direction === 'down' ? initialSeconds : 0);
  }, [direction, initialSeconds]);

  return { seconds, elapsed, isRunning, isComplete, start, pause, resume, reset, stop };
}
