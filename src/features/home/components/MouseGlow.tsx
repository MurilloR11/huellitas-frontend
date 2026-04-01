import { usePawTrail } from '../hooks/useMouseGlow';

export function PawTrail() {
  const containerRef = usePawTrail();

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute top-0 left-0 w-full h-full z-50"
    />
  );
}
