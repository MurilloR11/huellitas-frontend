import { useState } from 'react';
import { Clock, MapPin, Camera, Bell, Calendar, PlusCircle } from 'lucide-react';

const FEATURE_PILLS = [
  { Icon: MapPin,   label: 'Búsqueda por municipio' },
  { Icon: Camera,   label: 'Foto y descripción' },
  { Icon: Bell,     label: 'Notificación al dueño' },
  { Icon: Calendar, label: 'Fecha y zona del hallazgo' },
] as const;

export function LostAnimalsSection() {
  const [email, setEmail] = useState('');

  return (
    <section id="perdidos" className="bg-white py-16 md:py-24 border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left */}
          <div className="fade-in">
            <div className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Clock className="w-3.5 h-3.5" />
              Próximamente
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
              ¿Encontraste un animal extraviado en el Tolima?
            </h2>
            <p className="text-zinc-500 mb-6">
              Pronto podrás reportar animales perdidos o encontrados en tu municipio
              para conectarlos con sus dueños.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {FEATURE_PILLS.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 text-zinc-600 text-xs font-medium px-3 py-2 rounded-lg"
                >
                  <Icon className="w-3.5 h-3.5 text-brand" />
                  {label}
                </div>
              ))}
            </div>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-zinc-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-brand-dark transition-colors whitespace-nowrap"
              >
                <Bell className="w-4 h-4" />
                Avísame
              </button>
            </form>
            <p className="text-xs text-zinc-400 mt-3">Sin spam. Solo te avisamos cuando esté disponible.</p>
          </div>

          {/* Right: cards */}
          <div className="fade-in delay-100 flex flex-col gap-4">

            {/* Lost */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-md flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1611003228941-98852ba62227?w=120&q=80"
                alt="Michi"
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm text-zinc-900">Michi — gato naranja</p>
                  <span className="bg-red-50 text-red-500 border border-red-100 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                    Perdido
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-1">Barrio El Jordán · Ibagué · Hace 2 días</p>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  Cra. 5 con Cll. 42
                </div>
              </div>
            </div>

            {/* Found */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-md flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&q=80"
                alt="Perro mediano collar azul"
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm text-zinc-900">Perro mediano, collar azul</p>
                  <span className="bg-green-50 text-green-600 border border-green-100 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                    Encontrado
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-1">Espinal · Hace 5 horas</p>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  Parque principal del Espinal
                </div>
              </div>
            </div>

            {/* Coming soon placeholder */}
            <div className="border-2 border-dashed border-zinc-300 rounded-xl p-5 text-center bg-zinc-50">
              <PlusCircle className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Reportar animal perdido o encontrado</p>
              <p className="text-xs text-zinc-300 mt-1">Disponible pronto</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
