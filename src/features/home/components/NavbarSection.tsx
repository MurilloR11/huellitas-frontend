import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';

const NAV_LINKS = [
  { href: '#nosotros',      label: 'Nosotros' },
  { href: '#mision-vision', label: 'Misión y Visión' },
  { href: '#objetivos',     label: 'Objetivos' },
  { href: '#tecnologias',   label: 'Tecnologías' },
] as const;

export function NavbarSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white border-b border-zinc-200' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={ROUTES.HOME} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center shrink-0">
          <span className={`text-base font-extrabold tracking-tight transition-colors duration-300 ${scrolled ? 'text-zinc-900' : 'text-white'}`}>
            Huellitas
          </span>
          <span className="text-base font-extrabold text-brand">API</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                scrolled
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
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
            className={`md:hidden p-2 rounded-md transition-colors ${
              scrolled
                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
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
        <div className={`md:hidden px-4 pt-2 pb-4 ${scrolled ? 'bg-white border-t border-zinc-100' : 'bg-black/70 backdrop-blur-md'}`}>
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                scrolled
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </a>
          ))}
          <div className={`mt-2 pt-3 ${scrolled ? 'border-t border-zinc-100' : 'border-t border-white/20'}`}>
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
