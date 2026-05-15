import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FoundationSidebar, type FoundationNavId } from '@/shared/ui/organisms/FoundationSidebar';
import { ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<FoundationNavId, string[]> = {
  overview:  [],
  'my-pets': ['Mascotas', 'Mis mascotas'],
  'add-pet': ['Mascotas', 'Agregar mascota'],
  requests:  ['Adopciones', 'Solicitudes recibidas'],
  schedule:  ['Adopciones', 'Agendar un encuentro'],
  history:   ['Adopciones', 'Historial'],
};

// ─── Placeholder pages ─────────────────────────────────────────────────────────

function OverviewPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Resumen</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
        Próximamente: estadísticas y actividad reciente de tu fundación.
      </p>
    </div>
  );
}

function MyPetsPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Mis mascotas</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
        Próximamente: listado de animales de tu fundación.
      </p>
    </div>
  );
}

function AddPetPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Agregar mascota</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
        Próximamente: formulario para registrar un nuevo animal.
      </p>
    </div>
  );
}

function RequestsPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Solicitudes recibidas</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
        Próximamente: solicitudes de adopción pendientes de revisión.
      </p>
    </div>
  );
}

function ScheduleFoundationPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Agendar un encuentro</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
        Próximamente: calendario de citas con adoptantes.
      </p>
    </div>
  );
}

function HistoryPage() {
  return (
    <div className="px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Historial</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
        Próximamente: historial de adopciones completadas.
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FoundationPage() {
  const [activeNav, setActiveNav] = useState<FoundationNavId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <FoundationSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-zinc-950">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 sm:px-6 h-14 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 shrink-0">
          <button
            className={cn(
              'md:hidden flex items-center justify-center w-9 h-9 rounded-lg',
              'text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0',
            )}
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>
          <nav aria-label="Ubicación actual">
            <ol className="flex items-center gap-1 text-sm">
              <li className="font-semibold text-stone-400 dark:text-zinc-500">Huellitas</li>
              {BREADCRUMBS[activeNav].map((crumb, i, arr) => (
                <li key={crumb} className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-zinc-600 shrink-0" aria-hidden="true" />
                  <span className={i === arr.length - 1
                    ? 'font-semibold text-stone-800 dark:text-zinc-100'
                    : 'text-stone-400 dark:text-zinc-500'
                  }>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeNav === 'overview'  && <OverviewPage />}
          {activeNav === 'my-pets'   && <MyPetsPage />}
          {activeNav === 'add-pet'   && <AddPetPage />}
          {activeNav === 'requests'  && <RequestsPage />}
          {activeNav === 'schedule'  && <ScheduleFoundationPage />}
          {activeNav === 'history'   && <HistoryPage />}
        </div>

      </div>
    </SidebarProvider>
  );
}
