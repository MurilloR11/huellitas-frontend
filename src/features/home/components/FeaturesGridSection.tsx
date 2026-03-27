import { SlidersHorizontal, Bell, ShieldCheck, MapPin } from 'lucide-react';

const FEATURES = [
  {
    Icon: SlidersHorizontal,
    title: 'Filtros que realmente importan',
    desc: 'Especie, ciudad, tamaño, edad, sexo y salud — en segundos.',
  },
  {
    Icon: Bell,
    title: 'Sin mensajes manuales',
    desc: 'Al aprobar la adopción, el adoptante recibe los datos de contacto automáticamente.',
  },
  {
    Icon: ShieldCheck,
    title: 'Solo refugios reales y activos',
    desc: 'Fundaciones verificadas y activas del Tolima únicamente.',
  },
  {
    Icon: MapPin,
    title: 'Disponible en todo el departamento',
    desc: 'Ibagué, Espinal, Honda, Melgar, Chaparral desde el primer día.',
  },
] as const;

export function FeaturesGridSection() {
  return (
    <section className="bg-zinc-50 py-16 md:py-24 border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="fade-in text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Qué incluye</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Todo lo que faltaba en el Tolima
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="fade-in group bg-white border border-zinc-200 rounded-2xl p-5 sm:p-8 flex gap-4 sm:gap-6 items-start card-hover shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors">
                <Icon className="w-5 h-5 text-zinc-500 group-hover:text-orange-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 mb-1">{title}</h3>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
