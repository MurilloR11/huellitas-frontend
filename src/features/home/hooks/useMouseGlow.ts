import { useEffect, useRef, useCallback } from 'react';

interface Paw {
  id: number;
  x: number;
  y: number;
  rotation: number;
  isLeft: boolean;
}

const MIN_DISTANCE = 60;
const MAX_PAWS = 20;
const PAW_LIFETIME = 1500;

export function usePawTrail() {
  const pawsRef = useRef<Paw[]>([]);
  const lastPosRef = useRef({ x: -1000, y: -1000 });
  const nextIdRef = useRef(0);
  const isLeftRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const spawnPaw = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return;

    // Use page coordinates (viewport + scroll) so paws stay in place
    const pageX = x + window.scrollX;
    const pageY = y + window.scrollY;

    const dx = pageX - lastPosRef.current.x;
    const dy = pageY - lastPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MIN_DISTANCE) return;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const isLeft = isLeftRef.current;
    isLeftRef.current = !isLeft;

    const offsetX = isLeft ? -8 : 8;

    const id = nextIdRef.current++;
    const paw: Paw = { id, x: pageX + offsetX, y: pageY, rotation: angle, isLeft };

    pawsRef.current = [...pawsRef.current.slice(-MAX_PAWS + 1), paw];
    lastPosRef.current = { x: pageX, y: pageY };

    const el = document.createElement('div');
    el.className = 'paw-print';
    el.style.left = `${paw.x}px`;
    el.style.top = `${paw.y}px`;
    el.style.transform = `translate(-50%, -50%) rotate(${paw.rotation}deg)`;
    el.innerHTML = `<svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="22" rx="5.5" ry="5" fill="#e85d26" opacity="0.4"/>
      <ellipse cx="9" cy="13" rx="2.8" ry="3.2" fill="#e85d26" opacity="0.4" transform="rotate(-15 9 13)"/>
      <ellipse cx="23" cy="13" rx="2.8" ry="3.2" fill="#e85d26" opacity="0.4" transform="rotate(15 23 13)"/>
      <ellipse cx="12.5" cy="7.5" rx="2.5" ry="3" fill="#e85d26" opacity="0.4" transform="rotate(-5 12.5 7.5)"/>
      <ellipse cx="19.5" cy="7.5" rx="2.5" ry="3" fill="#e85d26" opacity="0.4" transform="rotate(5 19.5 7.5)"/>
    </svg>`;

    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('paw-fade-out');
      setTimeout(() => el.remove(), 500);
    }, PAW_LIFETIME);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => spawnPaw(e.clientX, e.clientY));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [spawnPaw]);

  return containerRef;
}
