import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';

const NAV_LINKS = [
  { href: '#adoptar',     label: 'Adoptar' },
  { href: '#fundaciones', label: 'Para fundaciones' },
  { href: '#api',         label: 'API pública' },
  { href: '#perdidos',    label: 'Animales perdidos' },
] as const;

export function NavbarSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center shrink-0">
          <span className="text-base font-extrabold text-zinc-900 tracking-tight">Huellitas</span>
          <span className="text-base font-extrabold text-brand">API</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-md transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA + mobile hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={ROUTES.REGISTER}
            className="hidden md:inline-flex items-center bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-brand-dark transition-colors"
          >
            Registrarse
          </Link>

          <button
            className="md:hidden p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-4 pt-2 pb-4">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex w-full px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="border-t border-zinc-100 mt-2 pt-3">
            <Link
              to={ROUTES.REGISTER}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-brand-dark transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
