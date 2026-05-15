import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FoundationSidebar, type FoundationNavId } from '@/shared/ui/organisms/FoundationSidebar';
import { ChevronRight, Menu, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pet, PetStatus } from '@/features/pets/types';

// ─── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<FoundationNavId, string[]> = {
  overview:  [],
  'my-pets': ['Mascotas', 'Mis mascotas'],
  'add-pet': ['Mascotas', 'Agregar mascota'],
  requests:  ['Adopciones', 'Solicitudes recibidas'],
  schedule:  ['Adopciones', 'Agendar un encuentro'],
  history:   ['Adopciones', 'Historial'],
};

// ─── Static data (replace with API call later) ────────────────────────────────

const STATIC_PETS: Pet[] = [
  {
    id: 1, name: 'Luna', species: 'dog', breed: 'Labrador mestizo',
    age_months: 18, gender: 'female', size: 'large',
    description: 'Luna es una perra cariñosa y juguetona que busca una familia activa.',
    photos: [], status: 'available', foundation_id: 1, foundation_name: '',
    city: 'Bogotá', created_at: '2024-01-15T00:00:00Z',
    clinical_record: { vaccinated: true, sterilized: true, dewormed: true, microchipped: false },
  },
  {
    id: 2, name: 'Milo', species: 'cat', breed: 'Siamés mestizo',
    age_months: 8, gender: 'male', size: 'small',
    description: 'Milo es un gatito juguetón y sociable, ideal para apartamentos.',
    photos: [], status: 'available', foundation_id: 1, foundation_name: '',
    city: 'Bogotá', created_at: '2024-02-01T00:00:00Z',
    clinical_record: { vaccinated: true, sterilized: false, dewormed: true, microchipped: false },
  },
  {
    id: 3, name: 'Rocky', species: 'dog', breed: 'Pastor Alemán',
    age_months: 36, gender: 'male', size: 'large',
    description: 'Rocky es un perro leal y protector que necesita espacio para correr.',
    photos: [], status: 'in_process', foundation_id: 1, foundation_name: '',
    city: 'Bogotá', created_at: '2023-11-20T00:00:00Z',
    clinical_record: { vaccinated: true, sterilized: true, dewormed: true, microchipped: true },
  },
  {
    id: 4, name: 'Nala', species: 'cat', breed: 'Doméstico',
    age_months: 5, gender: 'female', size: 'small',
    description: 'Nala es una gatita tranquila que se lleva bien con niños.',
    photos: [], status: 'available', foundation_id: 1, foundation_name: '',
    city: 'Bogotá', created_at: '2024-03-10T00:00:00Z',
    clinical_record: { vaccinated: false, sterilized: false, dewormed: true, microchipped: false },
  },
  {
    id: 5, name: 'Max', species: 'dog', breed: 'Beagle',
    age_months: 24, gender: 'male', size: 'medium',
    description: 'Max encontró su hogar para siempre.',
    photos: [], status: 'adopted', foundation_id: 1, foundation_name: '',
    city: 'Bogotá', created_at: '2023-08-05T00:00:00Z',
    clinical_record: { vaccinated: true, sterilized: true, dewormed: true, microchipped: true },
  },
  {
    id: 6, name: 'Cleo', species: 'dog', breed: 'Poodle mestizo',
    age_months: 12, gender: 'female', size: 'small',
    description: 'Cleo está en proceso de adopción con una familia muy especial.',
    photos: [], status: 'in_process', foundation_id: 1, foundation_name: '',
    city: 'Bogotá', created_at: '2024-01-28T00:00:00Z',
    clinical_record: { vaccinated: true, sterilized: false, dewormed: true, microchipped: false },
  },
];

const STATIC_COUNTS = {
  all:        STATIC_PETS.length,
  available:  STATIC_PETS.filter(p => p.status === 'available').length,
  in_process: STATIC_PETS.filter(p => p.status === 'in_process').length,
  adopted:    STATIC_PETS.filter(p => p.status === 'adopted').length,
};

const STATUS_CONFIG: Record<PetStatus, { label: string; badge: string; dot: string }> = {
  available:  { label: 'Disponible', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  in_process: { label: 'En proceso', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   dot: 'bg-amber-500'   },
  adopted:    { label: 'Adoptado',   badge: 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400',          dot: 'bg-stone-400'   },
};

const SPECIES_LABEL: Record<Pet['species'], string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
const GENDER_LABEL:  Record<Pet['gender'],  string> = { male: 'Macho', female: 'Hembra' };
const SIZE_LABEL:    Record<Pet['size'],    string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} ${y === 1 ? 'año' : 'años'}`;
  return `${y} a. ${m} m.`;
}

// ─── Pet card ──────────────────────────────────────────────────────────────────

function PetCard({ pet }: { pet: Pet }) {
  const cfg = STATUS_CONFIG[pet.status];
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
        {pet.photos.length > 0 ? (
          <img src={pet.photos[0]} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <PawPrint className="w-12 h-12 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
        )}
        <span className={cn(
          'absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
          cfg.badge,
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
          {cfg.label}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100 truncate">{pet.name}</h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5 truncate">
          {SPECIES_LABEL[pet.species]}{pet.breed ? ` · ${pet.breed}` : ''} · {formatAge(pet.age_months)}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400">
            {GENDER_LABEL[pet.gender]}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400">
            {SIZE_LABEL[pet.size]}
          </span>
        </div>
      </div>
    </div>
  );
}

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

const FILTER_OPTIONS: { id: PetStatus | 'all'; label: string }[] = [
  { id: 'all',        label: 'Todos'       },
  { id: 'available',  label: 'Disponibles' },
  { id: 'in_process', label: 'En proceso'  },
  { id: 'adopted',    label: 'Adoptados'   },
];

function MyPetsPage() {
  const [filter, setFilter] = useState<PetStatus | 'all'>('all');
  const filtered = filter === 'all' ? STATIC_PETS : STATIC_PETS.filter(p => p.status === filter);

  return (
    <div className="px-4 sm:px-6 py-8">

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={cn(
              'h-8 px-3 rounded-lg text-sm font-medium transition-colors',
              filter === opt.id
                ? 'bg-brand text-white'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-brand-light hover:text-brand dark:hover:bg-zinc-700',
            )}
          >
            {opt.label}
            <span className={cn(
              'ml-1.5 text-xs tabular-nums',
              filter === opt.id ? 'text-white/70' : 'text-stone-400 dark:text-zinc-500',
            )}>
              {STATIC_COUNTS[opt.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <PawPrint className="w-7 h-7 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">Sin mascotas en esta categoría</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
            {filter === 'all'
              ? 'Aún no has registrado ninguna mascota.'
              : 'No hay mascotas con este estado actualmente.'}
          </p>
        </div>
      )}

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
