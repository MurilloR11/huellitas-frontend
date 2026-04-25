import { useState, useMemo, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CitizenSidebar, type NavId } from '@/shared/ui/organisms/CitizenSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Tag, Cake, Maximize2, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import RequirementsPage from '@/features/adoptions/pages/RequirementsPage';
import ApplyPage from '@/features/adoptions/pages/ApplyPage';
import StatusPage from '@/features/adoptions/pages/StatusPage';
import SchedulePage from '@/features/adoptions/pages/SchedulePage';
import ContactPage from '@/features/adoptions/pages/ContactPage';

// ─── Domain types ──────────────────────────────────────────────────────────────

type Species = 'Dog' | 'Cat' | 'Rabbit' | 'Other';
type AgeRange = 'Puppy' | 'Young' | 'Adult' | 'Senior';
type AnimalSize = 'Small' | 'Medium' | 'Large';
type AdoptionStatus = 'Available' | 'Pending' | 'Reserved';

interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  ageRange: AgeRange;
  size: AnimalSize;
  status: AdoptionStatus;
  photo: string;
  goodWithKids: boolean;
  goodWithPets: boolean;
}

// ─── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<NavId, string[]> = {
  browse:       [],
  requirements: ['Adopciones', 'Requisitos de adopción'],
  apply:        ['Adopciones', 'Solicitar adopción'],
  track:        ['Adopciones', 'Estado de mi solicitud'],
  schedule:     ['Adopciones', 'Agendar un encuentro'],
  contact:      ['Recursos', 'Contactar a un agente'],
};

// ─── Mock catalog ──────────────────────────────────────────────────────────────

const ANIMALS: Animal[] = [
  {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '3 años',
    ageRange: 'Adult',
    size: 'Large',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/golden,retriever,dog/all?lock=1',
    goodWithKids: true,
    goodWithPets: true,
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: '2 años',
    ageRange: 'Young',
    size: 'Small',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/siamese,cat/all?lock=2',
    goodWithKids: true,
    goodWithPets: false,
  },
  {
    id: '3',
    name: 'Mango',
    species: 'Dog',
    breed: 'Labrador Mix',
    age: '5 meses',
    ageRange: 'Puppy',
    size: 'Medium',
    status: 'Pending',
    photo: 'https://loremflickr.com/400/300/labrador,puppy/all?lock=3',
    goodWithKids: true,
    goodWithPets: true,
  },
  {
    id: '4',
    name: 'Cleo',
    species: 'Cat',
    breed: 'Persa',
    age: '9 años',
    ageRange: 'Senior',
    size: 'Small',
    status: 'Reserved',
    photo: 'https://loremflickr.com/400/300/persian,cat/all?lock=4',
    goodWithKids: false,
    goodWithPets: false,
  },
  {
    id: '5',
    name: 'Rex',
    species: 'Dog',
    breed: 'Pastor Alemán',
    age: '4 años',
    ageRange: 'Adult',
    size: 'Large',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/german,shepherd,dog/all?lock=5',
    goodWithKids: true,
    goodWithPets: false,
  },
  {
    id: '6',
    name: 'Pip',
    species: 'Rabbit',
    breed: 'Holland Lop',
    age: '1 año',
    ageRange: 'Young',
    size: 'Small',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/rabbit,bunny/all?lock=6',
    goodWithKids: true,
    goodWithPets: true,
  },
  {
    id: '7',
    name: 'Bella',
    species: 'Dog',
    breed: 'Beagle',
    age: '18 meses',
    ageRange: 'Young',
    size: 'Medium',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/beagle,dog/all?lock=7',
    goodWithKids: true,
    goodWithPets: true,
  },
  {
    id: '8',
    name: 'Shadow',
    species: 'Cat',
    breed: 'Doméstico',
    age: '5 años',
    ageRange: 'Adult',
    size: 'Medium',
    status: 'Pending',
    photo: 'https://loremflickr.com/400/300/black,cat/all?lock=8',
    goodWithKids: false,
    goodWithPets: true,
  },
  {
    id: '9',
    name: 'Cosmo',
    species: 'Dog',
    breed: 'Pastor Australiano',
    age: '8 meses',
    ageRange: 'Puppy',
    size: 'Medium',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/australian,shepherd,dog/all?lock=9',
    goodWithKids: true,
    goodWithPets: true,
  },
  {
    id: '10',
    name: 'Willow',
    species: 'Cat',
    breed: 'Maine Coon',
    age: '7 años',
    ageRange: 'Senior',
    size: 'Large',
    status: 'Reserved',
    photo: 'https://loremflickr.com/400/300/maine,coon,cat/all?lock=10',
    goodWithKids: true,
    goodWithPets: false,
  },
  {
    id: '11',
    name: 'Daisy',
    species: 'Dog',
    breed: 'Dachshund',
    age: '6 años',
    ageRange: 'Adult',
    size: 'Small',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/dachshund,dog/all?lock=11',
    goodWithKids: true,
    goodWithPets: true,
  },
  {
    id: '12',
    name: 'Ash',
    species: 'Rabbit',
    breed: 'Gigante de Flandes',
    age: '2 años',
    ageRange: 'Young',
    size: 'Large',
    status: 'Available',
    photo: 'https://loremflickr.com/400/300/rabbit,flemish/all?lock=12',
    goodWithKids: false,
    goodWithPets: true,
  },
];

// ─── Display label maps ────────────────────────────────────────────────────────

const SIZE_LABELS: Record<AnimalSize | 'All', string> = {
  All: 'Cualquier tamaño', Small: 'Pequeño', Medium: 'Mediano', Large: 'Grande',
};

const STATUS_LABELS: Record<AdoptionStatus, string> = {
  Available: 'Disponible', Pending: 'En proceso', Reserved: 'Reservado',
};

// ─── Filter state ──────────────────────────────────────────────────────────────

interface Filters {
  species: Species | 'All';
  ageRange: AgeRange | 'All';
  size: AnimalSize | 'All';
}

const INITIAL_FILTERS: Filters = {
  species: 'All',
  ageRange: 'All',
  size: 'All',
};

// ─── Filter select ─────────────────────────────────────────────────────────────

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[152px]">
      <label className="text-xs font-medium text-stone-500 dark:text-zinc-400 select-none">
        {label}
      </label>
      <Select value={value} onValueChange={v => onChange(v as T)}>
        <SelectTrigger className="bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Animal card ───────────────────────────────────────────────────────────────

function AnimalCard({ animal }: { animal: Animal }) {
  const statusVariant =
    animal.status === 'Available'
      ? 'available'
      : animal.status === 'Pending'
        ? 'pending'
        : 'reserved';

  return (
    <article
      className={cn(
        'group flex flex-col h-full overflow-hidden rounded-2xl',
        'bg-white dark:bg-zinc-900',
        'border border-stone-100 dark:border-zinc-800',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
      )}
    >
      {/* Image */}
      <div className="card-image bg-stone-100 dark:bg-zinc-800 shrink-0">
        <img
          src={animal.photo}
          alt={`${animal.name} — ${animal.breed}`}
          className="transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Name + status badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-stone-900 dark:text-zinc-50 leading-snug">
            {animal.name}
          </h3>
          <Badge
            variant={statusVariant}
            className="uppercase text-[10px] tracking-wide font-semibold shrink-0 mt-0.5"
          >
            {STATUS_LABELS[animal.status]}
          </Badge>
        </div>

        {/* Breed */}
        <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-zinc-400 truncate">
          <Tag className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate">{animal.breed}</span>
        </span>

        {/* Age + Size on same row */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-zinc-400">
            <Cake className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {animal.age}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-zinc-400">
            <Maximize2 className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {SIZE_LABELS[animal.size]}
          </span>
        </div>


      </div>
    </article>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      role="status"
      aria-live="polite"
      aria-label="Ningún animal coincide con los filtros actuales"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted dark:bg-zinc-800 mb-5">
        <Search
          className="w-6 h-6 text-muted-foreground dark:text-zinc-500"
          aria-hidden="true"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-sm font-semibold text-stone-900 dark:text-zinc-100 mb-1">
        Ningún animal coincide con tus filtros
      </h3>
      <p className="text-xs text-muted-foreground dark:text-zinc-400 max-w-[280px] mb-6 leading-relaxed">
        Intenta ajustar o limpiar los filtros para descubrir más animales disponibles
        para adopción.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs hover:bg-muted dark:hover:bg-zinc-800"
      >
        <X className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
        Limpiar filtros
      </Button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [activeNav, setActiveNav] = useState<NavId>('browse');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  const filtered = useMemo(
    () =>
      ANIMALS.filter(a => {
        if (filters.species !== 'All' && a.species !== filters.species) return false;
        if (filters.ageRange !== 'All' && a.ageRange !== filters.ageRange) return false;
        if (filters.size !== 'All' && a.size !== filters.size) return false;
        return true;
      }),
    [filters],
  );

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <CitizenSidebar activeNav={activeNav} onNavChange={setActiveNav} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-zinc-950">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-6 h-14 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 shrink-0">
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

          {/* Non-browse pages */}
          {activeNav === 'requirements' && (
            <RequirementsPage onContinue={() => setActiveNav('apply')} />
          )}

          {activeNav === 'apply' && <ApplyPage />}

          {activeNav === 'track' && <StatusPage />}

          {activeNav === 'schedule' && <SchedulePage />}

          {activeNav === 'contact' && <ContactPage />}

          {/* Browse view */}
          {activeNav === 'browse' && (
            <>
              {/* Filter bar — card style matching reference */}
              <section className="px-6 py-4" aria-label="Filtrar animales">
                <div className="flex items-end gap-5 flex-wrap bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl px-5 py-4">

                  <FilterSelect
                    label="Especie"
                    value={filters.species}
                    onChange={v => setFilters(f => ({ ...f, species: v }))}
                    options={[
                      { value: 'All',    label: 'Todas las especies' },
                      { value: 'Dog',    label: 'Perro'              },
                      { value: 'Cat',    label: 'Gato'               },
                      { value: 'Rabbit', label: 'Conejo'             },
                      { value: 'Other',  label: 'Otro'               },
                    ]}
                  />

                  <FilterSelect
                    label="Edad"
                    value={filters.ageRange}
                    onChange={v => setFilters(f => ({ ...f, ageRange: v }))}
                    options={[
                      { value: 'All',    label: 'Cualquier edad' },
                      { value: 'Puppy',  label: 'Cachorro'       },
                      { value: 'Young',  label: 'Joven'          },
                      { value: 'Adult',  label: 'Adulto'         },
                      { value: 'Senior', label: 'Senior'         },
                    ]}
                  />

                  <FilterSelect
                    label="Tamaño"
                    value={filters.size}
                    onChange={v => setFilters(f => ({ ...f, size: v }))}
                    options={[
                      { value: 'All',    label: 'Cualquier tamaño' },
                      { value: 'Small',  label: 'Pequeño'          },
                      { value: 'Medium', label: 'Mediano'          },
                      { value: 'Large',  label: 'Grande'           },
                    ]}
                  />

                </div>
              </section>

              {/* Catalog grid */}
              <main className="px-6 pb-6" id="main-content">
                {filtered.length === 0 ? (
                  <EmptyState onClear={clearFilters} />
                ) : (
                  <ul
                    className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    aria-label="Animales disponibles para adopción"
                  >
                    {filtered.map(animal => (
                      <li key={animal.id}>
                        <AnimalCard animal={animal} />
                      </li>
                    ))}
                  </ul>
                )}
              </main>
            </>
          )}

        </div>
      </div>
    </SidebarProvider>
  );
}
