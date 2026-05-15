import { useState, useEffect, useCallback } from 'react';

export function useCooldown(durationSeconds: number) {
  const [until, setUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!until) return;
    const tick = () => {
      const r = Math.ceil((until - Date.now()) / 1000);
      if (r <= 0) { setUntil(null); setRemaining(0); }
      else setRemaining(r);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);

  const start = useCallback(() => {
    setUntil(Date.now() + durationSeconds * 1000);
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  return { isOnCooldown: !!until, remaining, start };
}

export function formatCooldown(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
