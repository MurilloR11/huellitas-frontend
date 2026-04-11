import { useRef } from 'react';

/* ─── Tech definitions ─────────────────────────────────────────── */
interface Tech {
  name: string;
  iconClass: string;
}

const TECHS_ROW_1: Tech[] = [
  { name: 'React',        iconClass: 'devicon-react-original colored' },
  { name: 'TypeScript',   iconClass: 'devicon-typescript-plain colored' },
  { name: 'Tailwind CSS', iconClass: 'devicon-tailwindcss-plain colored' },
  { name: 'Vite',         iconClass: 'devicon-vitejs-plain colored' },
  { name: 'React Router', iconClass: 'devicon-reactrouter-plain colored' },
  { name: 'JavaScript',   iconClass: 'devicon-javascript-plain colored' },
];

const TECHS_ROW_2: Tech[] = [
  { name: 'Python',     iconClass: 'devicon-python-plain colored' },
  { name: 'Flask',      iconClass: 'devicon-flask-original colored' },
  { name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain colored' },
  { name: 'SQLAlchemy', iconClass: 'devicon-sqlalchemy-plain colored' },
  { name: 'Swagger',    iconClass: 'devicon-swagger-plain colored' },
  { name: 'Git',        iconClass: 'devicon-git-plain colored' },
];

/* ─── Sub-components ───────────────────────────────────────────── */
function TechCard({ name, iconClass }: Tech) {
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
      <i className={`${iconClass} text-4xl`} />
      <p className="text-xs font-medium text-zinc-600 text-center leading-tight px-1">{name}</p>
    </div>
  );
}

/* ─── CarouselRow ──────────────────────────────────────────────── */
interface CarouselRowProps {
  techs: Tech[];
  reverse?: boolean;
  speed?: number; // px/s
}

function CarouselRow({ techs, reverse = false, speed = 60 }: CarouselRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Each card: w-28 (112px) + mx-3*2 (24px) = 136px. One copy = techs.length × 136px.
  const duration = (techs.length * 136) / speed;

  const pause  = () => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused';  };
  const resume = () => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; };

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      <div
        ref={trackRef}
        className={`flex ${reverse ? 'carousel-right' : 'carousel-left'}`}
        style={{ animationDuration: `${duration}s` }}
      >
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
