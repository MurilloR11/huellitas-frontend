import { useState, useEffect, useRef, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FoundationSidebar, type FoundationNavId } from '@/shared/ui/organisms/FoundationSidebar';
import { ChevronRight, Menu, PawPrint, ImagePlus } from 'lucide-react';
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

// ─── Add pet form ──────────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 ' +
  'text-stone-800 dark:text-zinc-100 text-sm px-3 py-2.5 ' +
  'placeholder:text-stone-400 dark:placeholder:text-zinc-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors';

interface AddPetForm {
  name: string;
  species: Pet['species'] | '';
  other_species: string;
  breed: string;
  age_months: string;
  size: Pet['size'] | '';
  good_with_kids: boolean;
  good_with_pets: boolean;
}

const EMPTY_FORM: AddPetForm = {
  name: '', species: '', other_species: '', breed: '', age_months: '', size: '',
  good_with_kids: false, good_with_pets: false,
};

function FormField({
  label, required, error, children, className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider select-none">
        {label}{required && <span className="text-brand ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function PillGroup<T extends string>({
  options, value, onChange, error,
}: {
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (v: T) => void;
  error?: string;
}) {
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 h-10 rounded-lg text-sm font-medium border-2 transition-all',
            value === opt.value
              ? 'bg-brand text-white border-brand'
              : cn(
                  'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700',
                  'hover:border-brand/50 hover:text-brand',
                  error && 'border-red-300 dark:border-red-800',
                ),
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-3.5 rounded-full bg-brand shrink-0" />
      <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider select-none">
        {children}
      </span>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
        checked ? 'bg-brand' : 'bg-stone-200 dark:bg-zinc-700',
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0',
      )} />
    </button>
  );
}

function AddPetPage() {
  const [form, setForm] = useState<AddPetForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AddPetForm, string>>>({});
  const [done, setDone] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, Math.max(0, 5 - photos.length))
      .map(file => ({ file, url: URL.createObjectURL(file) }));
    if (next.length) setPhotos(p => [...p, ...next]);
  }, [photos.length]);

  const removePhoto = (idx: number) => {
    setPhotos(p => {
      URL.revokeObjectURL(p[idx].url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof AddPetForm]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof AddPetForm, string>> = {};
    if (!form.species) errs.species = 'Selecciona una especie';
    if (!form.size)    errs.size    = 'Selecciona un tamaño';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-brand-light flex items-center justify-center mb-6">
          <PawPrint className="w-10 h-10 text-brand" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">¡Mascota registrada!</h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 mb-8 max-w-xs leading-relaxed">
          El perfil fue publicado. Los adoptantes ya pueden verlo en el catálogo.
        </p>
        <button
          onClick={() => { reset(); setDone(false); }}
          className="h-10 px-6 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          Agregar otra mascota
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-8 py-6">

      <div className="mb-5">
        <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Registrar mascota</h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
          Completa los datos del animal para publicarlo en el catálogo de adopción.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start">

          {/* ── Photos panel ── */}
          <div className="space-y-3 lg:sticky lg:top-4">
            <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider select-none block">
              Fotos <span className="text-stone-300 dark:text-zinc-600 font-normal normal-case tracking-normal">(máx. 5)</span>
            </span>

            {/* Cover photo / dropzone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => photos.length === 0 && fileInputRef.current?.click()}
              className={cn(
                'relative w-full aspect-[4/3] rounded-2xl overflow-hidden transition-all',
                photos.length === 0 && cn(
                  'border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer',
                  dragging
                    ? 'border-brand bg-brand-light dark:bg-brand/10'
                    : 'border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900 hover:border-brand/50',
                ),
                photos.length > 0 && 'bg-stone-100 dark:bg-zinc-800',
              )}
            >
              {photos.length === 0 ? (
                <>
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
                    dragging ? 'bg-brand/20' : 'bg-stone-100 dark:bg-zinc-800',
                  )}>
                    <ImagePlus className={cn('w-8 h-8', dragging ? 'text-brand' : 'text-stone-300 dark:text-zinc-600')} strokeWidth={1.5} />
                  </div>
                  <div className="text-center px-6">
                    <p className="text-sm font-semibold text-stone-700 dark:text-zinc-300">
                      {dragging ? 'Suelta para subir' : 'Arrastra las fotos aquí'}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">JPG, PNG o WebP · máx. 5 MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="h-9 px-5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Seleccionar archivos
                  </button>
                </>
              ) : (
                <>
                  <img src={photos[0].url} alt="Foto principal" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3.5 text-[11px] font-bold text-white/90 uppercase tracking-widest">
                    Portada
                  </span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removePhoto(0); }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails row */}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(1).map((p, i) => (
                  <div key={p.url} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 group">
                    <img src={p.url} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i + 1)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 flex items-center justify-center hover:border-brand/50 transition-colors"
                  >
                    <ImagePlus className="w-5 h-5 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* ── Form fields panel ── */}
          <div className="space-y-6">

            {/* Section 1 — Datos básicos */}
            <div>
              <SectionHeading>Datos básicos</SectionHeading>
              <div className="space-y-4">
                <FormField label="Nombre" required>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    placeholder="Ej. Luna"
                    className={INPUT_CLS}
                  />
                </FormField>

                <FormField label="Especie" required error={errors.species}>
                  <PillGroup
                    options={[
                      { value: 'dog'   as Pet['species'], label: 'Perro' },
                      { value: 'cat'   as Pet['species'], label: 'Gato'  },
                      { value: 'other' as Pet['species'], label: 'Otro'  },
                    ]}
                    value={form.species}
                    onChange={v => { setForm(f => ({ ...f, species: v, other_species: '' })); setErrors(e => ({ ...e, species: undefined })); }}
                    error={errors.species}
                  />
                  {form.species === 'other' && (
                    <input
                      name="other_species"
                      value={form.other_species}
                      onChange={onChange}
                      autoFocus
                      placeholder="Ej. Conejo, Hurón, Tortuga…"
                      className={INPUT_CLS}
                    />
                  )}
                </FormField>
              </div>
            </div>

            {/* Section 2 — Características físicas */}
            <div>
              <SectionHeading>Características</SectionHeading>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Raza">
                    <input
                      name="breed"
                      value={form.breed}
                      onChange={onChange}
                      placeholder="Ej. Labrador mestizo"
                      className={INPUT_CLS}
                    />
                  </FormField>

                  <FormField label="Edad (meses)" required>
                    <input
                      name="age_months"
                      type="number"
                      min={0}
                      max={360}
                      value={form.age_months}
                      onChange={onChange}
                      required
                      placeholder="Ej. 18"
                      className={INPUT_CLS}
                    />
                  </FormField>
                </div>

                <FormField label="Tamaño" required error={errors.size}>
                  <PillGroup
                    options={[
                      { value: 'small'  as Pet['size'], label: 'Pequeño' },
                      { value: 'medium' as Pet['size'], label: 'Mediano' },
                      { value: 'large'  as Pet['size'], label: 'Grande'  },
                    ]}
                    value={form.size}
                    onChange={v => { setForm(f => ({ ...f, size: v })); setErrors(e => ({ ...e, size: undefined })); }}
                    error={errors.size}
                  />
                </FormField>
              </div>
            </div>

            {/* Section 3 — Compatibilidad */}
            <div>
              <SectionHeading>Compatibilidad</SectionHeading>
              <div className="space-y-2">
                <label className="flex items-center justify-between gap-4 cursor-pointer group bg-stone-50 dark:bg-zinc-900/60 rounded-xl px-4 py-3.5 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-zinc-100">Bueno con niños</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Se lleva bien con menores de edad</p>
                  </div>
                  <ToggleSwitch
                    checked={form.good_with_kids}
                    onChange={() => setForm(f => ({ ...f, good_with_kids: !f.good_with_kids }))}
                  />
                </label>

                <label className="flex items-center justify-between gap-4 cursor-pointer group bg-stone-50 dark:bg-zinc-900/60 rounded-xl px-4 py-3.5 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-zinc-100">Bueno con mascotas</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Convive bien con otros animales</p>
                  </div>
                  <ToggleSwitch
                    checked={form.good_with_pets}
                    onChange={() => setForm(f => ({ ...f, good_with_pets: !f.good_with_pets }))}
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="h-11 px-8 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                Registrar mascota
              </button>
              <button
                type="button"
                onClick={reset}
                className="h-11 px-5 rounded-xl text-stone-500 dark:text-zinc-400 text-sm font-medium hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Limpiar
              </button>
            </div>

          </div>
        </div>
      </form>
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
