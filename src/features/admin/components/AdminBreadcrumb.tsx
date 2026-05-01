import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Crumb = { label: string };

const ROUTE_MAP: Record<string, Crumb[]> = {
  '/admin':             [{ label: 'Resumen' }],
  '/admin/fundaciones': [{ label: 'Gestión' }, { label: 'Fundaciones' }],
  '/admin/usuarios':    [{ label: 'Gestión' }, { label: 'Usuarios' }],
  '/admin/mascotas':    [{ label: 'Plataforma' }, { label: 'Mascotas' }],
  '/admin/solicitudes': [{ label: 'Plataforma' }, { label: 'Solicitudes' }],
};

export function AdminBreadcrumb() {
  const { pathname } = useLocation();
  const crumbs = ROUTE_MAP[pathname] ?? [{ label: 'Admin' }];

  return (
    <nav aria-label="Navegación" className="flex items-center gap-1">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" strokeWidth={2} />
          )}
          <span
            className={cn(
              'text-sm',
              i === crumbs.length - 1
                ? 'text-stone-800 font-medium'
                : 'text-stone-400',
            )}
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}
