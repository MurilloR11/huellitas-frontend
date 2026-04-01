import { Compass, Eye } from 'lucide-react';

const CARDS = [
  {
    Icon: Compass,
    label: 'Misión',
    title: 'Nuestro propósito',
    text: 'Facilitar el proceso de adopción animal en el departamento del Tolima mediante una plataforma web que conecte a fundaciones animalistas con ciudadanos, promoviendo la tenencia responsable y reduciendo el número de animales en situación de abandono a través de herramientas digitales accesibles y eficientes.',
    accent: 'from-brand/20 to-transparent',
  },
  {
    Icon: Eye,
    label: 'Visión',
    title: 'Hacia dónde vamos',
    text: 'Consolidar a Huellitas como la plataforma de referencia para la adopción de animales en el Tolima, reconocida por su impacto social, la calidad de sus datos abiertos y su contribución a la construcción de una comunidad más comprometida con el bienestar animal.',
    accent: 'from-amber-500/15 to-transparent',
  },
] as const;

export function MissionVisionSection() {
  return (
    <section
      id="mision-vision"
      className="relative bg-zinc-900 py-20 md:py-28 border-b border-zinc-800 overflow-hidden"
    >
      {/* Radial glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="fade-in text-center mb-16">
          <p className="text-brand font-semibold text-sm uppercase tracking-widest mb-3">
            Lo que nos mueve
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Misión{' '}
            <span className="text-zinc-500">&</span>{' '}
            Visión
          </h2>
          <div className="w-12 h-1 bg-brand rounded-full mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {CARDS.map(({ Icon, label, title, text, accent }, i) => (
            <div
              key={label}
              className={`fade-in ${i === 1 ? 'delay-100' : ''} group relative rounded-2xl border border-zinc-700/40 bg-zinc-800/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600/60 hover:-translate-y-1`}
            >
              {/* Top gradient accent */}
              <div
                className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${accent}`}
              />

              <div className="p-8 md:p-10">
                {/* Icon + Label row */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand/20 rounded-xl blur-md transition-all duration-300 group-hover:blur-lg group-hover:bg-brand/30" />
                    <div className="relative bg-brand/10 border border-brand/20 rounded-xl w-12 h-12 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand" />
                    </div>
                  </div>
                  <span className="text-brand font-bold text-xs uppercase tracking-[0.2em]">
                    {label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-[1.65rem] font-bold text-white mb-4 leading-tight">
                  {title}
                </h3>

                {/* Separator */}
                <div className="w-8 h-px bg-zinc-600 mb-4 transition-all duration-300 group-hover:w-12 group-hover:bg-brand/60" />

                {/* Body */}
                <p className="text-zinc-400 leading-relaxed text-[0.95rem]">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
