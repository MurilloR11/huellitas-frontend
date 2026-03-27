import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/routes';

const PLATFORM_LINKS = [
  { label: 'Adoptar',           href: '#adoptar' },
  { label: 'Para fundaciones',  href: '#fundaciones' },
  { label: 'API pública',       href: '#api' },
] as const;

const RESOURCE_LINKS = [
  { label: 'Documentación',      href: '#' },
  { label: 'API Reference',      href: '#' },
  { label: 'Estado del sistema', href: '#' },
] as const;

export function FooterSection() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-8">

          {/* Col 1-2: Logo + description */}
          <div className="md:col-span-2">
            <Link to={ROUTES.HOME} className="inline-flex items-center mb-3">
              <span className="font-extrabold text-white">Huellitas</span>
              <span className="font-extrabold text-brand">API</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs">
              La primera plataforma de adopción animal del Tolima.
              Conectamos fundaciones con familias responsables.
            </p>
          </div>

          {/* Col 3: Platform */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Plataforma</p>
            <ul className="space-y-2">
              {PLATFORM_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Recursos</p>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-xs text-zinc-600">© 2025 HuellitasAPI</p>
          <p className="text-xs text-zinc-600">Hecho con amor por el Tolima</p>
        </div>

      </div>
    </footer>
  );
}
