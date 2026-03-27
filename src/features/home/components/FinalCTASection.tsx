import { Link } from 'react-router-dom';
import {
  Building2, Heart, Terminal,
  ArrowRight, Search, Key, Check,
  ShieldCheck, MapPin, Lock, Zap,
} from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';

const TRUST_ITEMS = [
  { Icon: ShieldCheck, label: 'Fundaciones verificadas' },
  { Icon: MapPin,      label: 'Todo el Tolima' },
  { Icon: Lock,        label: 'Datos protegidos' },
  { Icon: Zap,         label: 'Acceso inmediato' },
] as const;

export function FinalCTASection() {
  return (
    <section id="registro" className="bg-zinc-900 py-16 md:py-24 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="fade-in text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Empieza hoy</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            El Tolima adopta diferente
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Elige cómo quieres ser parte de la primera plataforma de adopción del departamento.
          </p>
        </div>

        {/* 3 path cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-12">

          {/* Foundations */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 sm:p-8 flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-zinc-700 border border-zinc-600 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">Fundaciones</p>
            <h3 className="text-lg font-bold text-white mb-2">Digitaliza tu refugio</h3>
            <p className="text-zinc-400 text-sm mb-5">
              Panel completo para gestionar tus animales y responder solicitudes de adopción.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {['Panel de gestión propio', 'Verificación incluida', 'Gratis para el MVP'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-200 text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Registrar fundación
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Citizens — featured */}
          <div className="bg-dark-card border-2 border-brand rounded-2xl p-5 sm:p-8 flex flex-col sm:col-span-2 md:col-span-1 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Más popular
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand border border-brand-dark flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-1">Ciudadanos</p>
            <h3 className="text-lg font-bold text-white mb-2">Encuentra tu compañero</h3>
            <p className="text-zinc-400 text-sm mb-5">
              Busca entre todos los animales disponibles en el Tolima con filtros que funcionan.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {['Búsqueda con filtros avanzados', 'Ficha clínica completa', 'Notificación automática'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to={ROUTES.PETS}
              className="inline-flex items-center justify-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-brand-dark transition-colors"
            >
              <Search className="w-4 h-4" />
              Explorar animales
            </Link>
          </div>

          {/* Developers */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 sm:p-8 flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-zinc-700 border border-zinc-600 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">Desarrolladores</p>
            <h3 className="text-lg font-bold text-white mb-2">Conecta tu app al Tolima</h3>
            <p className="text-zinc-400 text-sm mb-5">
              API REST pública para integrar datos de adopción en tus aplicaciones.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {['API key en segundos', 'Endpoints documentados', 'Datos en tiempo real'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                  <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-200 text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-zinc-700 transition-colors"
            >
              <Key className="w-4 h-4" />
              Obtener API key
            </Link>
          </div>

        </div>

        {/* Trust strip */}
        <div className="border-t border-zinc-800 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-zinc-600" />
              <span className="text-xs text-zinc-500 font-medium text-center">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
