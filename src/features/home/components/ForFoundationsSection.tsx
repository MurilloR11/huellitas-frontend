import { Link } from 'react-router-dom';
import { Check, ArrowRight, Dog, Cat } from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';

const CHECKLIST = [
  {
    title: 'Ficha clínica digital completa',
    desc: 'Vacunas, historial médico, comportamiento y fotos en un archivo estructurado.',
  },
  {
    title: 'Gestión de solicitudes en un panel',
    desc: 'Aprueba, rechaza o pide más información — notificación automática al adoptante.',
  },
  {
    title: 'Verificación y credibilidad',
    desc: 'Las fundaciones verificadas generan más confianza en los adoptantes.',
  },
  {
    title: 'Cobertura en todo el departamento',
    desc: 'Ibagué, Espinal, Honda, Melgar, Chaparral y todo el Tolima.',
  },
] as const;

const ANIMALS = [
  { name: 'Rocky', breed: 'Labrador · 2 años',       status: 'Disponible', statusClass: 'bg-brand-light text-brand',    Icon: Dog },
  { name: 'Luna',  breed: 'Gato doméstico · 1 año',  status: 'En proceso', statusClass: 'bg-zinc-100 text-zinc-500',   Icon: Cat },
  { name: 'Bruno', breed: 'Mestizo · 4 años',         status: 'Disponible', statusClass: 'bg-brand-light text-brand',    Icon: Dog },
] as const;

export function ForFoundationsSection() {
  return (
    <section id="fundaciones" className="bg-zinc-50 py-16 md:py-24 border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="fade-in">
            <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Para fundaciones</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
              Deja el WhatsApp para la familia
            </h2>
            <p className="text-zinc-500 mb-8">
              Gestiona tus animales, responde a solicitudes de adopción y recibe adoptantes
              verificados desde un panel diseñado para organizaciones.
            </p>

            <ul className="space-y-5 mb-8">
              {CHECKLIST.map(({ title, desc }) => (
                <li key={title} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-md hover:bg-brand-dark transition-colors"
            >
              Registrar mi fundación
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Foundation panel mock */}
          <div className="fade-in delay-100">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-lg">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-bold text-zinc-900">Panel de fundación</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Patitas Ibagué</p>
                </div>
                <span className="bg-zinc-100 text-zinc-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Verificada
                </span>
              </div>

              {/* Animal rows */}
              <div className="space-y-3 mb-5">
                {ANIMALS.map(({ name, breed, status, statusClass, Icon }) => (
                  <div key={name} className="bg-zinc-50 border border-zinc-100 rounded-lg p-4 flex items-center justify-between card-hover">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-zinc-200 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{name}</p>
                        <p className="text-xs text-zinc-400">{breed}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats footer */}
              <div className="grid grid-cols-3 text-center border-t border-zinc-100 pt-4">
                <div>
                  <p className="text-2xl font-extrabold text-zinc-900">12</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Animales</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-brand">4</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Solicitudes</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-zinc-900">28</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Adopciones</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
