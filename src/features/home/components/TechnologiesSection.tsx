import { Monitor, Server } from 'lucide-react';

interface TechItem {
  name: string;
  description: string;
  color: string;
}

const FRONTEND_TECHS: TechItem[] = [
  { name: 'React 19',       description: 'Biblioteca de interfaces de usuario',      color: 'bg-sky-400' },
  { name: 'TypeScript',     description: 'Tipado estático para mayor robustez',      color: 'bg-blue-500' },
  { name: 'Tailwind CSS 4', description: 'Framework de estilos utilitarios',         color: 'bg-teal-400' },
  { name: 'Vite',           description: 'Herramienta de build ultrarrápida',        color: 'bg-violet-500' },
  { name: 'React Router',   description: 'Enrutamiento del lado del cliente',        color: 'bg-rose-400' },
  { name: 'TanStack Query', description: 'Gestión de estado del servidor',           color: 'bg-amber-500' },
];

const BACKEND_TECHS: TechItem[] = [
  { name: 'Python',      description: 'Lenguaje principal del servidor',  color: 'bg-yellow-400' },
  { name: 'Flask',        description: 'Microframework web ligero',       color: 'bg-zinc-600' },
  { name: 'PostgreSQL',   description: 'Base de datos relacional',        color: 'bg-blue-600' },
  { name: 'SQLAlchemy',   description: 'ORM para Python',                 color: 'bg-red-400' },
  { name: 'JWT',          description: 'Autenticación basada en tokens',  color: 'bg-emerald-500' },
  { name: 'Swagger',      description: 'Documentación de la API',         color: 'bg-green-500' },
];

function TechGrid({ items }: { items: TechItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map(({ name, description, color }) => (
        <div key={name} className="flex gap-3 items-start">
          <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0 mt-1.5`} />
          <div>
            <p className="font-semibold text-zinc-800 text-sm">{name}</p>
            <p className="text-xs text-zinc-500">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TechnologiesSection() {
  return (
    <section id="tecnologias" className="bg-zinc-50 py-16 md:py-24 border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="fade-in text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Stack</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Tecnologías Utilizadas
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto mt-4">
            Stack tecnológico moderno para una experiencia robusta y escalable
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Frontend card */}
          <div className="fade-in bg-white rounded-2xl p-8 border border-zinc-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                <Monitor className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Frontend</h3>
            </div>
            <TechGrid items={FRONTEND_TECHS} />
          </div>

          {/* Backend card */}
          <div className="fade-in delay-100 bg-white rounded-2xl p-8 border border-zinc-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                <Server className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Backend</h3>
            </div>
            <TechGrid items={BACKEND_TECHS} />
          </div>

        </div>
      </div>
    </section>
  );
}
