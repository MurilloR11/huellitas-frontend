import { useEffect, useRef } from 'react';
import {
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiVite,
  SiReactrouter,
  SiReactquery,
  SiPython,
  SiFlask,
  SiPostgresql,
  SiSqlalchemy,
  SiSwagger,
  SiJsonwebtokens,
} from 'react-icons/si';

/* ─── Tech definitions ─────────────────────────────────────────── */
interface Tech {
  name: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const TECHS_ROW_1: Tech[] = [
  { name: 'React',         Icon: SiReact,       color: '#61DAFB' },
  { name: 'TypeScript',    Icon: SiTypescript,  color: '#3178C6' },
  { name: 'Tailwind CSS',  Icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'Vite',          Icon: SiVite,        color: '#646CFF' },
  { name: 'React Router',  Icon: SiReactrouter, color: '#CA4245' },
  { name: 'TanStack Query',Icon: SiReactquery,  color: '#FF4154' },
];

const TECHS_ROW_2: Tech[] = [
  { name: 'Python',      Icon: SiPython,       color: '#3776AB' },
  { name: 'Flask',       Icon: SiFlask,        color: '#71717a' },
  { name: 'PostgreSQL',  Icon: SiPostgresql,   color: '#4169E1' },
  { name: 'SQLAlchemy',  Icon: SiSqlalchemy,   color: '#D71F00' },
  { name: 'Swagger',     Icon: SiSwagger,      color: '#4BA82E' },
  { name: 'JWT',         Icon: SiJsonwebtokens,color: '#d13b84' },
];

/* ─── Sub-components ───────────────────────────────────────────── */
function TechCard({ name, Icon, color }: Tech) {
  return (
    <div className="
      flex flex-col items-center justify-center gap-3
      w-28 h-28 rounded-xl
      border border-zinc-200 bg-white
      shrink-0 mx-3 select-none
      transition-colors duration-200
      hover:bg-brand-light hover:border-brand/30
      cursor-default
    ">
      <Icon size={32} color={color} />
      <p className="text-xs font-medium text-zinc-600 text-center leading-tight px-1">{name}</p>
    </div>
  );
}

/* ─── Infinite scroll hook (rAF-based, no CSS reset glitch) ───── */
function useInfiniteScroll(pxPerSecond: number, reverse: boolean) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const xRef      = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const lastRef   = useRef<number | null>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // half = width of one copy of the list (track has 2 copies)
    const half = track.scrollWidth / 2;
    if (xRef.current === null) xRef.current = reverse ? -half : 0;

    const step = (now: number) => {
      const dt = lastRef.current !== null ? now - lastRef.current : 0;
      lastRef.current = now;

      if (!pausedRef.current && dt > 0 && dt < 100) {
        const delta = (pxPerSecond * dt) / 1000;

        if (reverse) {
          xRef.current! += delta;
          if (xRef.current! >= 0) xRef.current = -half;
        } else {
          xRef.current! -= delta;
          if (xRef.current! <= -half) xRef.current = 0;
        }

        track.style.transform = `translateX(${xRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pxPerSecond, reverse]);

  return {
    trackRef,
    pause:  () => { pausedRef.current = true;  },
    resume: () => { pausedRef.current = false; },
  };
}

/* ─── CarouselRow ──────────────────────────────────────────────── */
interface CarouselRowProps {
  techs: Tech[];
  reverse?: boolean;
  speed?: number;
}

function CarouselRow({ techs, reverse = false, speed = 60 }: CarouselRowProps) {
  const { trackRef, pause, resume } = useInfiniteScroll(speed, reverse);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      <div ref={trackRef} className="flex will-change-transform">
        {[...techs, ...techs].map((tech, i) => (
          <TechCard key={`${tech.name}-${i}`} {...tech} />
        ))}
      </div>
    </div>
  );
}

function RowLabel({ label }: { label: string }) {
  return (
    <div className="px-4 sm:px-6 mb-4 flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest text-brand">{label}</span>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
  );
}

/* ─── Section ──────────────────────────────────────────────────── */
export function TechnologiesSection() {
  return (
    <section id="tecnologias" className="bg-white py-16 md:py-24 border-b border-zinc-100">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <div className="fade-in text-center">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Stack</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Tecnologías Utilizadas
          </h2>
          <p className="text-base text-zinc-500 max-w-xl mx-auto mt-4">
            Stack moderno para una experiencia robusta y escalable
          </p>
        </div>
      </div>

      {/* Carruseles contenidos dentro del max-w-6xl */}
      <div className="fade-in max-w-6xl mx-auto space-y-8">
        <div>
          <RowLabel label="Frontend" />
          <div className="overflow-hidden">
            <CarouselRow techs={TECHS_ROW_1} speed={55} />
          </div>
        </div>
        <div>
          <RowLabel label="Backend" />
          <div className="overflow-hidden">
            <CarouselRow techs={TECHS_ROW_2} reverse speed={45} />
          </div>
        </div>
      </div>
    </section>
  );
}
