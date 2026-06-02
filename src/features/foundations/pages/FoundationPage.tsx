import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FoundationSidebar, type FoundationNavId } from '@/shared/ui/organisms/FoundationSidebar';
import {
  ChevronRight, ChevronLeft, ChevronDown, Menu, PawPrint, ImagePlus, Check,
  Calendar, Heart, TrendingUp, Clock, AlertCircle, RefreshCw, Loader2,
  Phone, Home, Sparkles, FileText, Eye, X, ScanLine, User,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Pet, PetStatus } from '@/features/pets/types';
import type { FoundationAdoption, FoundationAdoptionStatus, CreatePetPayload } from '@/features/foundations/types';
import { useRealtimeTable } from '@/shared/hooks/useRealtimeTable';
import { foundationsApi } from '../services/foundationsApi';
import { petsApi } from '@/features/pets/services/petsApi';
import { adoptionsApi } from '@/features/adoptions/services/adoptionsApi';

// ─── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<FoundationNavId, string[]> = {
  overview:  [],
  'my-pets': ['Mascotas', 'Mis mascotas'],
  'add-pet': ['Mascotas', 'Agregar mascota'],
  requests:  ['Adopciones', 'Solicitudes recibidas'],
  schedule:  ['Adopciones', 'Agendar encuentros'],
  verify:    ['Adopciones', 'Recibir adoptante'],
  history:   ['Adopciones', 'Historial'],
};

// ─── Shared config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PetStatus, { label: string; badge: string; dot: string }> = {
  available:  { label: 'Disponible', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  in_process: { label: 'En proceso', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   dot: 'bg-amber-500'   },
  adopted:    { label: 'Adoptado',   badge: 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400',          dot: 'bg-stone-400'   },
};

const SPECIES_LABEL: Record<Pet['species'], string> = { dog: 'Perro', cat: 'Gato', rabbit: 'Conejo', other: 'Otro' };
const GENDER_LABEL:  Record<Pet['gender'],  string> = { male: 'Macho', female: 'Hembra' };
const SIZE_LABEL:    Record<Pet['size'],    string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} ${y === 1 ? 'año' : 'años'}`;
  return `${y} a. ${m} m.`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Shared empty/error states ─────────────────────────────────────────────────

function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30">
        <RefreshCw className="w-6 h-6 text-red-400" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">Error al cargar</p>
        <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Verifica tu conexión e intenta de nuevo.</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <RefreshCw className="w-4 h-4" strokeWidth={2} />
        Reintentar
      </button>
    </div>
  );
}

// ─── Pet card ──────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 5;

function PetCard({ pet }: { pet: Pet }) {
  const cfg = STATUS_CONFIG[pet.status];
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => petsApi.uploadPhoto(pet.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foundation-pets'] }),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || uploadMutation.isPending) return;
    const remaining = MAX_PHOTOS - pet.photos.length;
    if (remaining <= 0) return;
    const file = Array.from(files).find(f => f.type.startsWith('image/'));
    if (file) uploadMutation.mutate(file);
  };

  const canAddMore = pet.photos.length < MAX_PHOTOS;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-stone-100 dark:bg-zinc-800 flex items-center justify-center group/img">
        {pet.photos.length > 0 ? (
          <img src={pet.photos[0]} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <PawPrint className="w-12 h-12 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
        )}

        {canAddMore && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
            aria-label="Subir foto"
            className={cn(
              'absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all',
              'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70',
              pet.photos.length === 0 && 'opacity-100',
              pet.photos.length > 0 && 'opacity-0 group-hover/img:opacity-100',
            )}
          >
            {uploadMutation.isPending
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <ImagePlus className="w-3 h-3" strokeWidth={2} />}
            {pet.photos.length === 0 ? 'Subir foto' : 'Añadir'}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        />

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

// ─── Overview page ─────────────────────────────────────────────────────────────

function OverviewPage({
  onNavigate,
  pets,
  adoptions,
  petsLoading,
  adoptionsLoading,
}: {
  onNavigate: (id: FoundationNavId) => void;
  pets: Pet[];
  adoptions: FoundationAdoption[];
  petsLoading: boolean;
  adoptionsLoading: boolean;
}) {
  const pending  = adoptions.filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const resolved  = adoptions.filter(r => r.status === 'completed' || r.status === 'rejected');
  const adopted   = adoptions.filter(r => r.status === 'completed');
  const successRate = resolved.length > 0 ? Math.round((adopted.length / resolved.length) * 100) : 0;
  const avgDays = adopted.length > 0
    ? Math.round(
        adopted.reduce((sum, a) => {
          const ms = new Date(a.updated_at).getTime() - new Date(a.created_at).getTime();
          return sum + ms / (1000 * 60 * 60 * 24);
        }, 0) / adopted.length,
      )
    : 0;

  const healthIssues = pets
    .filter(p => p.status !== 'adopted')
    .map(p => {
      const missing: string[] = [];
      if (!p.clinical_record.vaccinated) missing.push('Sin vacunar');
      if (!p.clinical_record.sterilized) missing.push('Sin esterilizar');
      if (!p.clinical_record.dewormed)   missing.push('Sin desparasitar');
      return { pet: p, missing };
    })
    .filter(e => e.missing.length > 0);

  return (
    <div className="px-6 sm:px-8 py-6 space-y-5">

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Tasa de éxito</p>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
          </div>
          {adoptionsLoading ? <Skeleton className="h-8 w-20" /> : (
            <>
              <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {successRate}<span className="text-lg font-semibold ml-0.5">%</span>
              </p>
              <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5 leading-snug">
                {adopted.length} de {resolved.length} solicitudes terminaron en adopción
              </p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Tiempo promedio</p>
            <Clock className="w-4 h-4 text-blue-400 shrink-0" strokeWidth={2} />
          </div>
          {adoptionsLoading ? <Skeleton className="h-8 w-20" /> : (
            <>
              <p className="text-3xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">
                {avgDays}<span className="text-base font-medium text-stone-400 dark:text-zinc-500 ml-1.5">días</span>
              </p>
              <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5 leading-snug">entre solicitud y adopción confirmada</p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Pendientes</p>
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
          </div>
          {adoptionsLoading ? <Skeleton className="h-8 w-16" /> : (
            <>
              <p className="text-3xl font-bold tabular-nums text-amber-500">{pending.length}</p>
              <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5 leading-snug">
                {pending.length === 1 ? 'solicitud esperando respuesta' : 'solicitudes esperando respuesta'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pending requests */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Solicitudes pendientes</span>
              {pending.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold px-1.5 py-0.5 tabular-nums">
                  {pending.length}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('requests')} className="text-xs text-brand font-medium hover:underline underline-offset-2">Ver todas</button>
          </div>

          {adoptionsLoading ? (
            <div className="space-y-2.5">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <Check className="w-7 h-7 text-emerald-400" strokeWidth={2} />
              <p className="text-xs text-stone-400 dark:text-zinc-500">Todo al día — sin solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pending.slice(0, 4).map(req => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-brand/20 shrink-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-brand select-none">{getInitials(req.adopter_name || 'U')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 dark:text-zinc-300 truncate">
                      <span className="font-medium">{req.adopter_name || 'Adoptante'}</span>
                      <span className="text-stone-400 dark:text-zinc-500 mx-1">→</span>
                      <span className="font-semibold text-brand">{req.pet_name}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-zinc-500 shrink-0 tabular-nums whitespace-nowrap">
                    {formatDate(req.created_at)}
                  </span>
                </div>
              ))}
              {pending.length > 4 && (
                <p className="text-xs text-stone-400 dark:text-zinc-500 pt-1">+{pending.length - 4} más</p>
              )}
            </div>
          )}
        </div>

        {/* Pet health panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Salud de mascotas</span>
              {healthIssues.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] font-bold px-1.5 py-0.5 tabular-nums">
                  {healthIssues.length}
                </span>
              )}
            </div>
            <button onClick={() => onNavigate('my-pets')} className="text-xs text-brand font-medium hover:underline underline-offset-2">Ver mascotas</button>
          </div>

          {petsLoading ? (
            <div className="space-y-2.5">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
          ) : healthIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <Check className="w-7 h-7 text-emerald-400" strokeWidth={2} />
              <p className="text-xs text-stone-400 dark:text-zinc-500">Todos los registros médicos están completos</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {healthIssues.slice(0, 4).map(({ pet, missing }) => (
                <div key={pet.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center mt-0.5">
                    <PawPrint className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 dark:text-zinc-100 truncate">{pet.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {missing.map(issue => (
                        <span key={issue} className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">{issue}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {healthIssues.length > 4 && (
                <p className="text-xs text-stone-400 dark:text-zinc-500 pt-1">+{healthIssues.length - 4} más</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── My Pets page ──────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { id: PetStatus | 'all'; label: string }[] = [
  { id: 'all',        label: 'Todos'       },
  { id: 'available',  label: 'Disponibles' },
  { id: 'in_process', label: 'En proceso'  },
  { id: 'adopted',    label: 'Adoptados'   },
];

function MyPetsPage({
  pets,
  loading,
  error,
  onRetry,
}: {
  pets: Pet[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const [filter, setFilter] = useState<PetStatus | 'all'>('all');

  const counts = {
    all:        pets.length,
    available:  pets.filter(p => p.status === 'available').length,
    in_process: pets.filter(p => p.status === 'in_process').length,
    adopted:    pets.filter(p => p.status === 'adopted').length,
  };

  const filtered = filter === 'all' ? pets : pets.filter(p => p.status === filter);

  if (error) return <div className="px-4 sm:px-6 py-8"><SectionError onRetry={onRetry} /></div>;

  return (
    <div className="px-4 sm:px-6 py-8">
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
            <span className={cn('ml-1.5 text-xs tabular-nums', filter === opt.id ? 'text-white/70' : 'text-stone-400 dark:text-zinc-500')}>
              {loading ? '…' : counts[opt.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-3.5 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
                <div className="flex gap-1.5"><Skeleton className="h-5 w-14 rounded" /><Skeleton className="h-5 w-16 rounded" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
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
            {filter === 'all' ? 'Aún no has registrado ninguna mascota.' : 'No hay mascotas con este estado actualmente.'}
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
  breed: string;
  age_months: string;
  gender: Pet['gender'] | '';
  size: Pet['size'] | '';
  description: string;
  city: string;
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  microchipped: boolean;
}

const EMPTY_FORM: AddPetForm = {
  name: '', species: '', breed: '', age_months: '', gender: '', size: '',
  description: '', city: '', vaccinated: false, sterilized: false, dewormed: false, microchipped: false,
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
      <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider select-none">{children}</span>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer bg-stone-50 dark:bg-zinc-900/60 rounded-xl px-4 py-3.5 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors">
      <div>
        <p className="text-sm font-medium text-stone-800 dark:text-zinc-100">{label}</p>
        {description && <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">{description}</p>}
      </div>
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
    </label>
  );
}

function AddPetPage({
  onAdded,
  onNavigate,
}: {
  onAdded: () => void;
  onNavigate: (id: FoundationNavId) => void;
}) {
  const [form, setForm] = useState<AddPetForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AddPetForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [done, setDone] = useState<{ name: string } | null>(null);
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
    setPhotos(p => { URL.revokeObjectURL(p[idx].url); return p.filter((_, i) => i !== idx); });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof AddPetForm]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError(false);
    photos.forEach(p => URL.revokeObjectURL(p.url));
    setPhotos([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof AddPetForm, string>> = {};
    if (!form.species) errs.species = 'Selecciona una especie';
    if (!form.gender)  errs.gender  = 'Selecciona un género';
    if (!form.size)    errs.size    = 'Selecciona un tamaño';
    if (!form.city.trim()) errs.city = 'Ingresa la ciudad';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload: CreatePetPayload = {
      name: form.name,
      species: form.species as Pet['species'],
      breed: form.breed.trim() || undefined,
      age_months: Number(form.age_months),
      gender: form.gender as Pet['gender'],
      size: form.size as Pet['size'],
      description: form.description.trim() || undefined,
      city: form.city.trim(),
      clinical_record: {
        vaccinated: form.vaccinated,
        sterilized: form.sterilized,
        dewormed: form.dewormed,
        microchipped: form.microchipped,
      },
    };

    setSubmitting(true);
    setSubmitError(false);
    try {
      const pet = await petsApi.create(payload);
      for (const p of photos) {
        try { await petsApi.uploadPhoto(pet.id, p.file); } catch { /* non-fatal */ }
      }
      setDone({ name: pet.name });
      onAdded();
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-brand-light flex items-center justify-center mb-6">
          <PawPrint className="w-10 h-10 text-brand" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">¡{done.name} fue registrado!</h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 mb-8 max-w-xs leading-relaxed">
          El perfil fue publicado. Los adoptantes ya pueden verlo en el catálogo.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { reset(); setDone(null); }}
            className="h-10 px-6 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Agregar otra
          </button>
          <button
            onClick={() => onNavigate('my-pets')}
            className="h-10 px-5 rounded-xl text-stone-600 dark:text-zinc-400 text-sm font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Ver mis mascotas
          </button>
        </div>
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

      {submitError && (
        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.75} />
          <p className="text-xs text-red-600 dark:text-red-400">No pudimos registrar la mascota. Intenta de nuevo.</p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start">

          {/* ── Photos panel ── */}
          <div className="space-y-3 lg:sticky lg:top-4">
            <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider select-none block">
              Fotos <span className="text-stone-300 dark:text-zinc-600 font-normal normal-case tracking-normal">(máx. 5)</span>
            </span>

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
                  <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center transition-colors', dragging ? 'bg-brand/20' : 'bg-stone-100 dark:bg-zinc-800')}>
                    <ImagePlus className={cn('w-8 h-8', dragging ? 'text-brand' : 'text-stone-300 dark:text-zinc-600')} strokeWidth={1.5} />
                  </div>
                  <div className="text-center px-6">
                    <p className="text-sm font-semibold text-stone-700 dark:text-zinc-300">{dragging ? 'Suelta para subir' : 'Arrastra las fotos aquí'}</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">JPG, PNG o WebP · máx. 5 MB</p>
                    <p className="text-xs text-stone-300 dark:text-zinc-600 mt-0.5">(Solo previsualización por ahora)</p>
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
                  <span className="absolute bottom-3 left-3.5 text-[11px] font-bold text-white/90 uppercase tracking-widest">Portada</span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removePhoto(0); }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M3 3l6 6M9 3l-6 6" stroke="white" strokeWidth={1.8} strokeLinecap="round" /></svg>
                  </button>
                </>
              )}
            </div>

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
                      <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M3 3l6 6M9 3l-6 6" stroke="white" strokeWidth={1.8} strokeLinecap="round" /></svg>
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

            <div>
              <SectionHeading>Datos básicos</SectionHeading>
              <div className="space-y-4">
                <FormField label="Nombre" required>
                  <input name="name" value={form.name} onChange={onChange} required placeholder="Ej. Luna" className={INPUT_CLS} />
                </FormField>

                <FormField label="Especie" required error={errors.species}>
                  <PillGroup
                    options={[
                      { value: 'dog'    as Pet['species'], label: 'Perro'  },
                      { value: 'cat'    as Pet['species'], label: 'Gato'   },
                      { value: 'rabbit' as Pet['species'], label: 'Conejo' },
                      { value: 'other'  as Pet['species'], label: 'Otro'   },
                    ]}
                    value={form.species}
                    onChange={v => { setForm(f => ({ ...f, species: v })); setErrors(e => ({ ...e, species: undefined })); }}
                    error={errors.species}
                  />
                </FormField>
              </div>
            </div>

            <div>
              <SectionHeading>Características</SectionHeading>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Raza">
                    <input name="breed" value={form.breed} onChange={onChange} placeholder="Ej. Labrador mestizo" className={INPUT_CLS} />
                  </FormField>
                  <FormField label="Edad (meses)" required>
                    <input name="age_months" type="number" min={0} max={360} value={form.age_months} onChange={onChange} required placeholder="Ej. 18" className={INPUT_CLS} />
                  </FormField>
                </div>

                <FormField label="Género" required error={errors.gender}>
                  <PillGroup
                    options={[
                      { value: 'male'   as Pet['gender'], label: 'Macho'  },
                      { value: 'female' as Pet['gender'], label: 'Hembra' },
                    ]}
                    value={form.gender}
                    onChange={v => { setForm(f => ({ ...f, gender: v })); setErrors(e => ({ ...e, gender: undefined })); }}
                    error={errors.gender}
                  />
                </FormField>

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

                <FormField label="Ciudad" required error={errors.city}>
                  <input name="city" value={form.city} onChange={onChange} required placeholder="Ej. Bogotá" className={INPUT_CLS} />
                </FormField>

                <FormField label="Descripción">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    rows={3}
                    placeholder="Cuéntanos sobre la personalidad y necesidades del animal…"
                    className={cn(INPUT_CLS, 'resize-none')}
                  />
                </FormField>
              </div>
            </div>

            <div>
              <SectionHeading>Registro médico</SectionHeading>
              <div className="space-y-2">
                <ToggleSwitch
                  checked={form.vaccinated}
                  onChange={() => setForm(f => ({ ...f, vaccinated: !f.vaccinated }))}
                  label="Vacunado"
                  description="Tiene esquema de vacunación completo o al día"
                />
                <ToggleSwitch
                  checked={form.sterilized}
                  onChange={() => setForm(f => ({ ...f, sterilized: !f.sterilized }))}
                  label="Esterilizado"
                  description="Fue sometido a procedimiento de esterilización"
                />
                <ToggleSwitch
                  checked={form.dewormed}
                  onChange={() => setForm(f => ({ ...f, dewormed: !f.dewormed }))}
                  label="Desparasitado"
                  description="Tratamiento antiparasitario interno y externo"
                />
                <ToggleSwitch
                  checked={form.microchipped}
                  onChange={() => setForm(f => ({ ...f, microchipped: !f.microchipped }))}
                  label="Microchip"
                  description="Identificado con microchip de registro"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-8 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Registrando…' : 'Registrar mascota'}
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

// ─── Requests page ─────────────────────────────────────────────────────────────

const REQUEST_STATUS_CONFIG: Record<FoundationAdoptionStatus, { label: string; badge: string; dot: string }> = {
  pending:    { label: 'Pendiente',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         dot: 'bg-amber-500'   },
  reviewing:  { label: 'En revisión',badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',             dot: 'bg-blue-500'    },
  approved:   { label: 'Aprobada',   badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  rejected:   { label: 'Rechazada',  badge: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',                dot: 'bg-red-400'     },
  completed:  { label: 'Completada', badge: 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400',              dot: 'bg-stone-400'   },
};

// ─── Adoption form data helpers ────────────────────────────────────────────────

const HOUSING_LABEL: Record<string, string> = {
  house: 'Casa', apartment: 'Apartamento', rural: 'Finca / Predio rural', other: 'Otro',
};
const OWNERSHIP_LABEL: Record<string, string> = {
  owner: 'Propietario', renter: 'Arrendatario', family: 'Vivienda familiar',
};
const OUTDOOR_LABEL: Record<string, string> = {
  large: 'Sí, amplio (jardín / patio)', small: 'Sí, pequeño (balcón)', none: 'No tiene',
};
const RESIDENTS_LABEL: Record<string, string> = {
  '1': '1 persona', '2': '2 personas', '3-4': '3–4 personas', '5+': '5 o más',
};
const CHILDREN_LABEL: Record<string, string> = {
  none: 'No hay', '1': 'Sí, 1', '2+': 'Sí, 2 o más',
};
const CURRENT_PETS_LABEL: Record<string, string> = {
  none: 'Ninguna', '1-dog': '1 perro', '1-cat': '1 gato', multi: '2 o más mascotas', other: 'Otra especie',
};
const PREV_PETS_LABEL: Record<string, string> = {
  yes: 'Sí', no: 'No (primera mascota)',
};

function label(map: Record<string, string>, key?: string): string {
  return key ? (map[key] ?? key) : '—';
}

function InfoPair({ name, value }: { name: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wide leading-none mb-0.5">{name}</p>
      <p className="text-xs font-medium text-stone-700 dark:text-zinc-200 leading-snug">{value}</p>
    </div>
  );
}

function DocumentLink({ url, label, onOpen }: { url: string; label: string; onOpen: () => void }) {
  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('application/pdf');
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors group min-w-0 w-full text-left"
    >
      {isPdf ? (
        <FileText className="w-4 h-4 text-red-400 shrink-0" strokeWidth={1.75} />
      ) : (
        <div className="w-6 h-6 rounded overflow-hidden shrink-0 bg-stone-200 dark:bg-zinc-700">
          <img src={url} alt={label} className="w-full h-full object-cover" />
        </div>
      )}
      <span className="text-xs font-medium text-stone-600 dark:text-zinc-300 truncate flex-1">{label}</span>
      <Eye className="w-3 h-3 text-stone-300 dark:text-zinc-600 shrink-0 group-hover:text-brand transition-colors" strokeWidth={2} />
    </button>
  );
}

function DocumentViewerModal({ doc, onClose }: { doc: { url: string; label: string }; onClose: () => void }) {
  const isPdf = doc.url.toLowerCase().includes('.pdf') || doc.url.includes('application/pdf');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-400 dark:text-zinc-500" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">{doc.label}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center bg-stone-50 dark:bg-zinc-950 p-4 overflow-auto">
          {isPdf ? (
            <iframe
              src={doc.url}
              title={doc.label}
              className="w-full border-0 rounded-lg"
              style={{ minHeight: '65vh' }}
            />
          ) : (
            <img
              src={doc.url}
              alt={doc.label}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}

const REQUEST_FILTER_OPTIONS: { id: FoundationAdoptionStatus | 'all'; label: string }[] = [
  { id: 'all',       label: 'Todas'      },
  { id: 'pending',   label: 'Pendientes' },
  { id: 'reviewing', label: 'En revisión'},
  { id: 'approved',  label: 'Aprobadas'  },
  { id: 'rejected',  label: 'Rechazadas' },
];

function RequestsPage({
  adoptions,
  loading,
  error,
  onRetry,
  onUpdateStatus,
}: {
  adoptions: FoundationAdoption[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onUpdateStatus: (id: number, status: FoundationAdoptionStatus) => Promise<unknown>;
}) {
  const [filter, setFilter]     = useState<FoundationAdoptionStatus | 'all'>('all');
  const [updating, setUpdating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [viewDoc, setViewDoc]   = useState<{ url: string; label: string } | null>(null);

  const counts = {
    all:       adoptions.length,
    pending:   adoptions.filter(r => r.status === 'pending').length,
    reviewing: adoptions.filter(r => r.status === 'reviewing').length,
    approved:  adoptions.filter(r => r.status === 'approved').length,
    rejected:  adoptions.filter(r => r.status === 'rejected').length,
    completed: adoptions.filter(r => r.status === 'completed').length,
  };

  const filtered = filter === 'all' ? adoptions : adoptions.filter(r => r.status === filter);

  const handleAction = async (id: number, status: FoundationAdoptionStatus) => {
    setUpdating(id);
    try { await onUpdateStatus(id, status); } finally { setUpdating(null); }
  };

  if (error) return <div className="px-6 sm:px-8 py-6"><SectionError onRetry={onRetry} /></div>;

  return (
    <div className="px-6 sm:px-8 py-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {REQUEST_FILTER_OPTIONS.map(opt => (
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
            <span className={cn('ml-1.5 text-xs tabular-nums', filter === opt.id ? 'text-white/70' : 'text-stone-400 dark:text-zinc-500')}>
              {loading ? '…' : (opt.id === 'all' ? counts.all : counts[opt.id as FoundationAdoptionStatus] ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(req => {
            const cfg        = REQUEST_STATUS_CONFIG[req.status];
            const isUpdating = updating === req.id;
            const isExpanded = expanded === req.id;
            const fd         = req.form_data;
            const hasDetails = !!fd;

            return (
              <div key={req.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
                {/* ── Header row ── */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-brand/20 shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-brand select-none">{getInitials(req.adopter_name || 'U')}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">{req.adopter_name || 'Adoptante'}</span>
                      <span className="text-xs text-stone-400 dark:text-zinc-500">quiere adoptar a</span>
                      <span className="text-sm font-semibold text-brand">{req.pet_name}</span>
                    </div>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
                      {req.adopter_email} · {formatDate(req.created_at)}
                    </p>

                    {/* Toggle button */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : req.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:opacity-75 transition-opacity"
                    >
                      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} strokeWidth={2} />
                      {isExpanded ? 'Ocultar detalles' : hasDetails ? 'Ver solicitud completa' : 'Ver mensaje'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium', cfg.badge)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                      {cfg.label}
                    </span>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'reviewing')}
                          disabled={isUpdating}
                          className="h-8 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                        >
                          Revisar
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'rejected')}
                          disabled={isUpdating}
                          className="h-8 px-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {req.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'approved')}
                          disabled={isUpdating}
                          className="h-8 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'rejected')}
                          disabled={isUpdating}
                          className="h-8 px-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <span className="text-[11px] text-stone-400 dark:text-zinc-500 italic">
                        Esperando visita
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Expanded detail panel ── */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-5">

                    {fd && (
                      <>
                        {/* Contact */}
                        {(fd.phone || fd.city) && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" strokeWidth={1.75} />
                              <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Contacto</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {fd.phone && <InfoPair name="Teléfono" value={fd.phone} />}
                              {fd.city  && <InfoPair name="Ciudad"   value={fd.city}  />}
                            </div>
                          </div>
                        )}

                        {/* Home */}
                        {(fd.housing_type || fd.ownership || fd.outdoor_space || fd.residents || fd.children || fd.current_pets) && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <Home className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" strokeWidth={1.75} />
                              <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Hogar</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {fd.housing_type  && <InfoPair name="Tipo de vivienda"    value={label(HOUSING_LABEL,      fd.housing_type)}  />}
                              {fd.ownership     && <InfoPair name="Tenencia"             value={label(OWNERSHIP_LABEL,    fd.ownership)}     />}
                              {fd.outdoor_space && <InfoPair name="Espacio exterior"     value={label(OUTDOOR_LABEL,      fd.outdoor_space)} />}
                              {fd.residents     && <InfoPair name="Personas en el hogar" value={label(RESIDENTS_LABEL,   fd.residents)}     />}
                              {fd.children      && <InfoPair name="Niños menores de 12"  value={label(CHILDREN_LABEL,    fd.children)}      />}
                              {fd.current_pets  && <InfoPair name="Mascotas actuales"    value={label(CURRENT_PETS_LABEL, fd.current_pets)} />}
                            </div>
                          </div>
                        )}

                        {/* Experience */}
                        {fd.prev_pets && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <Sparkles className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" strokeWidth={1.75} />
                              <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Experiencia</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <InfoPair name="Mascotas previas" value={label(PREV_PETS_LABEL, fd.prev_pets)} />
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {fd.documents && (fd.documents.doc_id || fd.documents.doc_address || fd.documents.doc_landlord) && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" strokeWidth={1.75} />
                              <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Documentos adjuntos</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {fd.documents.doc_id       && <DocumentLink url={fd.documents.doc_id}       label="Cédula de ciudadanía"    onOpen={() => setViewDoc({ url: fd.documents!.doc_id!,       label: 'Cédula de ciudadanía'    })} />}
                              {fd.documents.doc_address  && <DocumentLink url={fd.documents.doc_address}  label="Comprobante de domicilio" onOpen={() => setViewDoc({ url: fd.documents!.doc_address!,  label: 'Comprobante de domicilio' })} />}
                              {fd.documents.doc_landlord && <DocumentLink url={fd.documents.doc_landlord} label="Autorización arrendador"  onOpen={() => setViewDoc({ url: fd.documents!.doc_landlord!, label: 'Autorización arrendador'  })} />}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Full message */}
                    {req.message && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Heart className="w-3.5 h-3.5 text-stone-400 dark:text-zinc-500" strokeWidth={1.75} />
                          <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Razón para adoptar</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed italic bg-stone-50 dark:bg-zinc-800/60 rounded-lg px-3 py-2.5">
                          "{req.message}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <PawPrint className="w-7 h-7 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">Sin solicitudes</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
            {filter === 'all' ? 'Aún no has recibido solicitudes de adopción.' : 'No hay solicitudes con este estado.'}
          </p>
        </div>
      )}

      {viewDoc && <DocumentViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} />}
    </div>
  );
}

// ─── History page ──────────────────────────────────────────────────────────────

const HISTORY_FILTER_OPTIONS: { id: 'all' | 'completed' | 'rejected'; label: string }[] = [
  { id: 'all',       label: 'Todas'      },
  { id: 'completed', label: 'Adoptadas'  },
  { id: 'rejected',  label: 'Rechazadas' },
];

function HistoryPage({
  adoptions,
  loading,
  error,
  onRetry,
}: {
  adoptions: FoundationAdoption[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'rejected'>('all');

  const history = adoptions.filter(a => a.status === 'completed' || a.status === 'rejected');
  const stats = {
    total:     history.length,
    completed: history.filter(a => a.status === 'completed').length,
    rejected:  history.filter(a => a.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? history : history.filter(a => a.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (error) return <div className="px-6 sm:px-8 py-6"><SectionError onRetry={onRetry} /></div>;

  return (
    <div className="px-6 sm:px-8 py-6">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-4 py-3.5">
          <p className="text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">{loading ? '…' : stats.total}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Total procesadas</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-4 py-3.5">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{loading ? '…' : stats.completed}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Adoptadas</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-4 py-3.5">
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 tabular-nums">{loading ? '…' : stats.rejected}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Rechazadas</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {HISTORY_FILTER_OPTIONS.map(opt => {
          const count = opt.id === 'all' ? stats.total : stats[opt.id];
          return (
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
              <span className={cn('ml-1.5 text-xs tabular-nums', filter === opt.id ? 'text-white/70' : 'text-stone-400 dark:text-zinc-500')}>
                {loading ? '…' : count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-0.5',
                  entry.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/20',
                )}>
                  {entry.status === 'completed'
                    ? <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} fill="currentColor" />
                    : <PawPrint className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">{entry.pet_name}</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                    {entry.adopter_name || 'Adoptante'}
                    {entry.adopter_email && <span className="text-stone-300 dark:text-zinc-600 mx-1">·</span>}
                    {entry.adopter_email}
                  </p>
                  {entry.message && (
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-2 italic line-clamp-1">"{entry.message}"</p>
                  )}
                  <p className="text-[11px] text-stone-300 dark:text-zinc-600 mt-1.5">
                    Resuelta el {formatDate(entry.updated_at)}
                  </p>
                </div>

                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0',
                  entry.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', entry.status === 'completed' ? 'bg-emerald-500' : 'bg-red-400')} />
                  {entry.status === 'completed' ? 'Adoptada' : 'Rechazada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <PawPrint className="w-7 h-7 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">Sin registros</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
            No hay adopciones {filter === 'completed' ? 'completadas' : 'rechazadas'} aún.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Verify (check-in) page ────────────────────────────────────────────────────

function CompletionToast({
  petName,
  adopterName,
  onClose,
}: {
  petName: string;
  adopterName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl max-w-sm animate-in slide-in-from-top-2 duration-300">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-brand)' }}
      >
        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Adopción completada</p>
        <p className="text-xs text-stone-500 dark:text-zinc-400 truncate">
          {petName} ya tiene hogar con {adopterName}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function AdopteeModal({
  adoption,
  searchCode,
  onClose,
  onComplete,
  completing,
}: {
  adoption: FoundationAdoption;
  searchCode: string;
  onClose: () => void;
  onComplete: () => void;
  completing: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const alreadyDone = adoption.status === 'completed';
  const canComplete = adoption.status === 'approved';
  const statusCfg = REQUEST_STATUS_CONFIG[adoption.status];

  function formatVisitDate(iso: string) {
    const [datePart, timePart = '00:00:00'] = iso.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute).toLocaleString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400">
            <ScanLine className="w-4 h-4 text-brand" strokeWidth={1.75} />
            <span className="text-sm font-semibold">Solicitud verificada</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-stone-400 dark:text-zinc-500"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Adopter identity */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              {adoption.adopter_name
                ? <span className="text-xl font-bold text-brand select-none">{getInitials(adoption.adopter_name)}</span>
                : <User className="w-7 h-7 text-brand/50" strokeWidth={1.75} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-stone-900 dark:text-zinc-100 truncate leading-tight">
                {adoption.adopter_name || 'Adoptante'}
              </p>
              {adoption.adopter_email && (
                <p className="text-xs text-stone-400 dark:text-zinc-500 truncate mt-0.5">{adoption.adopter_email}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="font-mono text-[11px] bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 px-2 py-0.5 rounded">
                  {searchCode}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                  statusCfg.badge,
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusCfg.dot)} />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pet card */}
        <div className="mx-5 mb-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-700 p-3.5 flex items-center gap-3">
          {adoption.pet_photo ? (
            <img src={adoption.pet_photo} alt={adoption.pet_name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              <PawPrint className="w-5 h-5 text-brand/50" strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Mascota solicitada</p>
            <p className="text-base font-bold text-brand truncate">{adoption.pet_name}</p>
          </div>
        </div>

        {/* Visit */}
        {adoption.visit_schedule && (
          <div className="mx-5 mb-4 flex items-center gap-3 p-3.5 rounded-xl border border-stone-100 dark:border-zinc-700">
            <Calendar className="w-4 h-4 text-stone-400 dark:text-zinc-500 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Visita agendada</p>
              <p className="text-sm font-medium text-stone-700 dark:text-zinc-200 capitalize">
                {formatVisitDate(adoption.visit_schedule.scheduled_at)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5">
          {alreadyDone && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Adopción completada</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                  {adoption.pet_name} ya tiene un hogar con {adoption.adopter_name || 'el adoptante'}.
                </p>
              </div>
            </div>
          )}

          {!alreadyDone && adoption.status !== 'approved' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" strokeWidth={1.75} />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Esta solicitud está en estado <strong>{statusCfg.label.toLowerCase()}</strong>. Solo se puede completar una solicitud aprobada.
              </p>
            </div>
          )}

          {canComplete && (
            <button
              onClick={onComplete}
              disabled={completing}
              className="w-full h-12 rounded-xl active:scale-[.98] text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
          style={{ background: 'var(--color-brand)' }}
            >
              {completing
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Completando…</>
                : <><Check className="w-4 h-4" strokeWidth={2.5} />Confirmar adopción completada</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VerifyPage({
  onUpdateStatus,
}: {
  onUpdateStatus: (id: number, status: FoundationAdoptionStatus) => Promise<unknown>;
}) {
  const qc = useQueryClient();
  const [input, setInput]           = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast]           = useState<{ petName: string; adopterName: string } | null>(null);

  const { data: adoption, isFetching, isError, error } = useQuery({
    queryKey: ['verify-code', searchCode],
    queryFn: () => foundationsApi.verifyCode(searchCode),
    enabled: !!searchCode,
    retry: false,
    gcTime: 0,
  });

  useEffect(() => {
    if (adoption && !isFetching) {
      setShowModal(true);
    }
  }, [adoption, isFetching]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = input.trim().toUpperCase();
    if (!code) return;
    setShowModal(false);
    setSearchCode(code);
  };

  const handleComplete = async () => {
    if (!adoption) return;
    setCompleting(true);
    try {
      await onUpdateStatus(adoption.id, 'completed');
      setShowModal(false);
      setToast({ petName: adoption.pet_name, adopterName: adoption.adopter_name || 'el adoptante' });
      qc.invalidateQueries({ queryKey: ['verify-code', searchCode] });
    } finally {
      setCompleting(false);
    }
  };

  const notFound = isError && (error as { response?: { status?: number } })?.response?.status === 404;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12">
      {/* Icon + heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
          <ScanLine className="w-7 h-7 text-brand" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">Recibir adoptante</h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
          Ingresa el código que te entrega el adoptante al llegar para verificar su información.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="CIT-00001"
          maxLength={12}
          autoFocus
          className={cn(
            'flex-1 h-12 rounded-xl border bg-white dark:bg-zinc-900 px-4 font-mono text-base tracking-widest',
            'text-stone-800 dark:text-zinc-100 placeholder:text-stone-300 dark:placeholder:text-zinc-600 placeholder:font-sans placeholder:tracking-normal',
            'border-stone-200 dark:border-zinc-700',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors',
            notFound && 'border-red-400 dark:border-red-600 focus:ring-red-300',
          )}
        />
        <button
          type="submit"
          disabled={isFetching || !input.trim()}
          className="h-12 px-6 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 active:scale-[.97] transition-all disabled:opacity-50 shrink-0 flex items-center gap-2"
        >
          {isFetching
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <ScanLine className="w-4 h-4" strokeWidth={2} />
          }
          Verificar
        </button>
      </form>

      {/* Not found */}
      {notFound && (
        <div className="mt-4 w-full max-w-md flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Código no encontrado</p>
            <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">Verifica que el código sea correcto y pertenezca a tu fundación.</p>
          </div>
        </div>
      )}

      {/* Generic error */}
      {isError && !notFound && (
        <div className="mt-4 w-full max-w-md flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.75} />
          <p className="text-sm text-red-600 dark:text-red-400">Error al verificar el código. Intenta de nuevo.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && adoption && (
        <AdopteeModal
          adoption={adoption}
          searchCode={searchCode}
          onClose={() => setShowModal(false)}
          onComplete={handleComplete}
          completing={completing}
        />
      )}

      {/* Toast */}
      {toast && (
        <CompletionToast
          petName={toast.petName}
          adopterName={toast.adopterName}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ─── Schedule page (unchanged) ─────────────────────────────────────────────────

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface DateSlot { start: string; end: string; }

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatSlotDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

const TIME_INPUT_CLS =
  'h-8 px-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 ' +
  'text-sm text-stone-700 dark:text-zinc-200 tabular-nums ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors';

function ScheduleFoundationPage() {
  const { user } = useAuth();
  const todayRef = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  const [viewYear,  setViewYear]  = useState(todayRef.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayRef.getMonth());
  const [selected,  setSelected]  = useState<Map<string, DateSlot>>(new Map());
  const [saved,     setSaved]     = useState(false);

  const { data: existingAvailability = [] } = useQuery({
    queryKey: ['foundation-availability', user?.id],
    queryFn: () => foundationsApi.getAvailability(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (existingAvailability.length === 0) return;
    setSelected(new Map(
      existingAvailability.map(a => [a.available_date, { start: a.start_time, end: a.end_time }])
    ));
  }, [existingAvailability]);

  const saveMutation = useMutation({
    mutationFn: () =>
      foundationsApi.setAvailability(
        Array.from(selected.entries()).map(([date, slot]) => ({
          available_date: date,
          start_time: slot.start,
          end_time: slot.end,
        }))
      ),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };

  const toggleDay = (d: Date) => {
    if (d < todayRef) return;
    const key = toDateKey(d);
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key); else next.set(key, { start: '09:00', end: '17:00' });
      return next;
    });
  };

  const updateTime = (key: string, field: 'start' | 'end', value: string) => {
    setSelected(prev => {
      const next = new Map(prev);
      const slot = next.get(key);
      if (slot) next.set(key, { ...slot, [field]: value });
      return next;
    });
  };

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay  = new Date(viewYear, viewMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const calDays: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) calDays.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) calDays.push(new Date(viewYear, viewMonth, d));
  while (calDays.length % 7 !== 0) calDays.push(null);

  const numWeeks = calDays.length / 7;
  const todayKey = toDateKey(todayRef);
  const selectedEntries = Array.from(selected.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col min-h-full p-6 sm:p-8 gap-4">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-w-0 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          <div className="grid grid-cols-7 shrink-0 mb-1">
            {DAY_HEADERS.map(h => (
              <div key={h} className="text-center text-[11px] font-semibold text-stone-400 dark:text-zinc-500 pb-2">{h}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}>
            {calDays.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = toDateKey(d);
              const isPast = d < todayRef;
              const isToday = key === todayKey;
              const isSel  = selected.has(key);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => toggleDay(d)}
                  className={cn(
                    'flex items-center justify-center rounded-xl text-sm font-medium transition-all m-0.5',
                    isPast  && 'text-stone-300 dark:text-zinc-700 cursor-not-allowed',
                    !isPast && !isSel && 'text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800',
                    isSel   && 'bg-brand text-white hover:bg-brand-dark shadow-sm',
                    isToday && !isSel && 'ring-2 ring-inset ring-brand/40 text-brand font-semibold',
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-72 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Días seleccionados</span>
            {selected.size > 0 && <span className="ml-auto text-xs tabular-nums text-stone-400 dark:text-zinc-500">{selected.size}</span>}
          </div>
          {selectedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-stone-400 dark:text-zinc-500">Selecciona días en el calendario</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
              {selectedEntries.map(([key, slot]) => (
                <div key={key} className="rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-xs font-semibold text-stone-700 dark:text-zinc-200 capitalize mb-2">{formatSlotDate(key)}</p>
                  <div className="flex items-center gap-1.5">
                    <input type="time" value={slot.start} onChange={e => updateTime(key, 'start', e.target.value)} className={cn(TIME_INPUT_CLS, 'flex-1 min-w-0')} />
                    <span className="text-[10px] text-stone-300 dark:text-zinc-600 shrink-0">—</span>
                    <input type="time" value={slot.end} onChange={e => updateTime(key, 'end', e.target.value)} className={cn(TIME_INPUT_CLS, 'flex-1 min-w-0')} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-stone-400 dark:text-zinc-500">
          {selected.size === 0 ? 'Ningún día seleccionado' : `${selected.size} ${selected.size === 1 ? 'día seleccionado' : 'días seleccionados'}`}
        </p>
        <div className="flex items-center gap-3">
          {saveMutation.isError && (
            <span className="text-xs font-medium text-red-500 dark:text-red-400">
              Error al guardar. Intenta de nuevo.
            </span>
          )}
          {saved && !saveMutation.isError && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              Guardado
            </span>
          )}
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="h-9 px-5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveMutation.isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
            )}
            Guardar disponibilidad
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FoundationPage() {
  const qc = useQueryClient();
  const [activeNav, setActiveNav] = useState<FoundationNavId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    data: pets = [],
    isLoading: petsLoading,
    isError: petsError,
  } = useQuery({
    queryKey: ['foundation-pets'],
    queryFn: () => foundationsApi.myPets(),
  });

  const {
    data: adoptions = [],
    isLoading: adoptionsLoading,
    isError: adoptionsError,
  } = useQuery({
    queryKey: ['foundation-adoptions'],
    queryFn: () => foundationsApi.myAdoptions(),
  });

  useRealtimeTable('adoption_requests', [['foundation-adoptions']]);
  useRealtimeTable('visit_schedules', [['foundation-adoptions']]);
  useRealtimeTable('pets', [['foundation-pets']]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: FoundationAdoptionStatus }) =>
      adoptionsApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['foundation-adoptions'] });
      qc.setQueryData<FoundationAdoption[]>(
        ['foundation-adoptions'],
        old => old?.map(a => a.id === id ? { ...a, status } : a) ?? [],
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['foundation-adoptions'] });
      qc.invalidateQueries({ queryKey: ['foundation-pets'] });
    },
  });

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  const handleUpdateStatus = (id: number, status: FoundationAdoptionStatus) =>
    updateStatusMutation.mutateAsync({ id, status });

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
                  <span className={i === arr.length - 1 ? 'font-semibold text-stone-800 dark:text-zinc-100' : 'text-stone-400 dark:text-zinc-500'}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeNav === 'overview' && (
            <OverviewPage
              onNavigate={setActiveNav}
              pets={pets}
              adoptions={adoptions}
              petsLoading={petsLoading}
              adoptionsLoading={adoptionsLoading}
            />
          )}
          {activeNav === 'my-pets' && (
            <MyPetsPage
              pets={pets}
              loading={petsLoading}
              error={petsError}
              onRetry={() => qc.invalidateQueries({ queryKey: ['foundation-pets'] })}
            />
          )}
          {activeNav === 'add-pet' && (
            <AddPetPage
              onAdded={() => qc.invalidateQueries({ queryKey: ['foundation-pets'] })}
              onNavigate={setActiveNav}
            />
          )}
          {activeNav === 'requests' && (
            <RequestsPage
              adoptions={adoptions}
              loading={adoptionsLoading}
              error={adoptionsError}
              onRetry={() => qc.invalidateQueries({ queryKey: ['foundation-adoptions'] })}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          {activeNav === 'schedule' && <ScheduleFoundationPage />}
          {activeNav === 'verify' && (
            <VerifyPage onUpdateStatus={handleUpdateStatus} />
          )}
          {activeNav === 'history' && (
            <HistoryPage
              adoptions={adoptions}
              loading={adoptionsLoading}
              error={adoptionsError}
              onRetry={() => qc.invalidateQueries({ queryKey: ['foundation-adoptions'] })}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
