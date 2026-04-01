import { Heart, Target, Users } from 'lucide-react';

const STATS = [
  {
    Icon: Heart,
    label: 'Problema',
    value: 'Miles de animales sin hogar en el Tolima sin una plataforma digital unificada',
  },
  {
    Icon: Target,
    label: 'Solución',
    value: 'Plataforma web que conecta fundaciones con adoptantes',
  },
  {
    Icon: Users,
    label: 'Beneficiarios',
    value: 'Fundaciones animalistas, ciudadanos y desarrolladores',
  },
] as const;

export function AboutProjectSection() {
  return (
    <section id="proyecto" className="bg-white py-16 md:py-24 border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="fade-in text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Contexto</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Sobre el Proyecto
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto mt-4">
            Tecnología al servicio de la adopción responsable en el Tolima
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left: Description */}
          <div className="fade-in">
            <p className="text-zinc-600 leading-relaxed mb-5">
              Huellitas es una plataforma web diseñada para transformar el proceso de adopción
              animal en el departamento del Tolima. Ante la falta de herramientas digitales que
              conecten a las fundaciones animalistas con ciudadanos interesados en adoptar, surge
              esta solución tecnológica que centraliza la información de animales disponibles,
              automatiza las solicitudes de adopción y ofrece una API pública para integrar estos
              datos en otras aplicaciones.
            </p>
            <p className="text-zinc-500 leading-relaxed">
              El proyecto nace de la necesidad de digitalizar un proceso que actualmente depende
              de redes sociales y comunicación informal, lo que dificulta el seguimiento, la
              verificación de fundaciones y la visibilidad de los animales que necesitan un hogar.
            </p>
          </div>

          {/* Right: Stat cards */}
          <div className="fade-in delay-100 space-y-4">
            {STATS.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
                    {label}
                  </p>
                  <p className="text-sm text-zinc-700 leading-snug">{value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
