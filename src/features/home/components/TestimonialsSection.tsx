import { Star, User } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'Antes teníamos un grupo de WhatsApp con 300 personas y era un caos. Ahora todo llega al panel y podemos aprobar adopciones en minutos.',
    name: 'Carolina Ríos',
    role: 'Fundación Patitas Ibagué',
  },
  {
    quote: 'Encontré a Max filtrando por "perro pequeño, compatible con niños" y en una tarde ya tenía toda su ficha clínica. Algo impensable hace un año.',
    name: 'Andrés Molina',
    role: 'Adoptante, Espinal, Tolima',
  },
  {
    quote: 'Integré la API en nuestra app de bienestar animal en menos de una tarde. La documentación es clara y los endpoints hacen exactamente lo que prometen.',
    name: 'Felipe Torres',
    role: 'Desarrollador, Ibagué',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="bg-zinc-50 py-16 md:py-24 border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="fade-in text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Quienes ya lo usan</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Tres perspectivas del Tolima
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="fade-in bg-white border border-zinc-200 rounded-xl p-5 sm:p-8 card-hover shadow-xs">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-brand fill-brand" />
                ))}
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed mb-5">{quote}</p>
              <div className="flex items-center gap-3 pt-5 border-t border-zinc-100">
                <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-zinc-900">{name}</p>
                  <p className="text-xs text-zinc-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
