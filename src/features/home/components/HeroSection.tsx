import { Search, Code, MapPin, Syringe, Scissors, Users } from 'lucide-react';

const CHIPS = [
  { icon: Syringe,  label: 'Vacunado' },
  { icon: Scissors, label: 'Esterilizado' },
  { icon: Users,    label: 'Con niños' },
] as const;

export function HeroSection() {
  return (
    <section className="bg-white pt-10 pb-14 md:pt-12 md:pb-16 border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left */}
          <div className="fade-in">
            <div className="inline-flex items-center gap-1.5 bg-brand-muted border border-brand-badge text-brand-dark text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              La primera plataforma de adopción del Tolima
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 leading-tight tracking-tight mb-5">
              La adopción del Tolima,{' '}
              <span className="text-brand">por fin digital</span>
            </h1>

            <p className="text-base sm:text-xl text-zinc-500 leading-relaxed mb-8 max-w-md">
              Las fundaciones usaban WhatsApp y grupos de Facebook. HuellitasAPI centraliza
              fichas clínicas, solicitudes de adopción y expone una API pública para desarrolladores.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#adoptar"
                className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-md hover:bg-brand-dark transition-colors"
              >
                <Search className="w-4 h-4" />
                Explorar animales
              </a>
              <a
                href="#api"
                className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-700 font-semibold px-5 py-2.5 rounded-md hover:bg-zinc-50 transition-colors"
              >
                <Code className="w-4 h-4" />
                Ver la API
              </a>
            </div>
          </div>

          {/* Right */}
          <div className="fade-in delay-100 relative">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80"
                alt="Labrador en adopción"
                className="w-full h-80 md:h-96 object-cover"
              />
            </div>

            {/* Floating card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white border border-zinc-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-sm text-zinc-900">Rocky</p>
                  <p className="text-xs text-zinc-400">Labrador · 2 años · Ibagué</p>
                </div>
                <span className="bg-brand-light text-brand text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                  Disponible
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CHIPS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded px-2 py-1"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
