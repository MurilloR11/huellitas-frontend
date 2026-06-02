import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CitizenSidebar, type NavId } from '@/shared/ui/organisms/CitizenSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Tag, Cake, Maximize2, ChevronLeft, ChevronRight, PawPrint, Copy, Check, Menu, AlertCircle, RefreshCw, MapPin, Building2 } from 'lucide-react';
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
import { petsApi } from '@/features/pets/services/petsApi';
import { useRealtimeTable } from '@/shared/hooks/useRealtimeTable';
import type { Pet, PetSpecies, PetSize } from '@/features/pets/types';

// ─── Domain types ──────────────────────────────────────────────────────────────

type Species = 'Dog' | 'Cat' | 'Rabbit' | 'Other';
type AgeRange = 'Puppy' | 'Young' | 'Adult' | 'Senior';
type AnimalSize = 'Small' | 'Medium' | 'Large';
type AdoptionStatus = 'Available' | 'Pending' | 'Adopted';

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
  photos: string[];
  description?: string;
  clinicalRecord?: {
    vaccinated: boolean;
    sterilized: boolean;
    dewormed: boolean;
    microchipped: boolean;
  };
  foundationName?: string;
  city?: string;
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

// ─── Pet mapping helpers ────────────────────────────────────────────────────────

const SPECIES_MAP: Record<string, Species> = {
  dog: 'Dog', cat: 'Cat', rabbit: 'Rabbit', other: 'Other',
};

const SIZE_MAP: Record<string, AnimalSize> = {
  small: 'Small', medium: 'Medium', large: 'Large',
};

function getAgeRange(months: number): AgeRange {
  if (months < 6) return 'Puppy';
  if (months < 24) return 'Young';
  if (months < 96) return 'Adult';
  return 'Senior';
}

function formatAge(months: number): string {
  if (months < 1) return 'Menos de 1 mes';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} ${years === 1 ? 'año' : 'años'} y ${rem} ${rem === 1 ? 'mes' : 'meses'}`;
}

function mapStatus(s: string): AdoptionStatus {
  if (s === 'available') return 'Available';
  if (s === 'in_process') return 'Pending';
  return 'Adopted';
}

function mapPet(pet: Pet): Animal {
  return {
    id: String(pet.id),
    name: pet.name,
    species: SPECIES_MAP[pet.species] ?? 'Other',
    breed: pet.breed ?? 'Desconocida',
    age: formatAge(pet.age_months),
    ageRange: getAgeRange(pet.age_months),
    size: SIZE_MAP[pet.size] ?? 'Medium',
    status: mapStatus(pet.status),
    photo: pet.photos[0] ?? '',
    photos: pet.photos,
    description: pet.description || undefined,
    clinicalRecord: pet.clinical_record,
    foundationName: pet.foundation_name,
    city: pet.city,
  };
}

// ─── Display label maps ────────────────────────────────────────────────────────

const SIZE_LABELS: Record<AnimalSize | 'All', string> = {
  All: 'Cualquier tamaño', Small: 'Pequeño', Medium: 'Mediano', Large: 'Grande',
};

const STATUS_LABELS: Record<AdoptionStatus, string> = {
  Available: 'Disponible', Pending: 'En proceso', Adopted: 'Adoptado',
};

const SPECIES_LABELS: Record<Species, string> = {
  Dog: 'Perro', Cat: 'Gato', Rabbit: 'Conejo', Other: 'Otro',
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
    <div className="flex flex-col gap-1.5 w-full">
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

// ─── Modal helpers ─────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-stone-400 dark:text-zinc-500 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-stone-800 dark:text-zinc-200 truncate">{value}</p>
      </div>
    </div>
  );
}

function TraitPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
        ok
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500',
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', ok ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-zinc-600')} />
      {label}
    </span>
  );
}

// ─── Photo carousel ────────────────────────────────────────────────────────────

function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imgErrored, setImgErrored] = useState(false);

  const go = (next: number, dir: number) => { setDirection(dir); setCurrent(next); setImgErrored(false); };
  const prev = () => go((current - 1 + photos.length) % photos.length, -1);
  const next = () => go((current + 1) % photos.length, 1);

  if (photos.length === 0) {
    return (
      <div className="relative w-full h-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
        <PawPrint className="w-16 h-16 text-stone-300 dark:text-zinc-600" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
      {imgErrored ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <PawPrint className="w-16 h-16 text-stone-300 dark:text-zinc-600" strokeWidth={1} />
        </div>
      ) : (
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.img
          key={current}
          src={photos[current]}
          alt={`${name} — foto ${current + 1} de ${photos.length}`}
          className="absolute inset-0 w-full h-full object-cover"
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: dir * 50, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit:  (dir: number) => ({ x: -dir * 50, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          onError={() => setImgErrored(true)}
        />
      </AnimatePresence>
      )}

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > current ? 1 : -1)}
                aria-label={`Foto ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full bg-white transition-all duration-200',
                  i === current ? 'w-4 opacity-100' : 'w-1.5 opacity-50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Animal Modal ──────────────────────────────────────────────────────────────

function AnimalModal({ animal, onClose, onApply }: { animal: Animal; onClose: () => void; onApply: () => void }) {
  const statusVariant =
    animal.status === 'Available' ? 'available' : animal.status === 'Pending' ? 'pending' : 'reserved';
  const code = `HLL-${animal.id.padStart(5, '0')}`;
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cr = animal.clinicalRecord;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full sm:max-w-5xl rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 flex flex-col sm:flex-row"
        style={{ maxHeight: '92vh' }}
      >
        {/* Left — carousel */}
        <div className="w-full sm:w-[44%] shrink-0 relative min-h-60 sm:min-h-90">
          <PhotoCarousel photos={animal.photos} name={animal.name} />
        </div>

        {/* Right — info */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-stone-100 dark:border-zinc-800 shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 leading-tight">
                {animal.name}
              </h2>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mt-0.5">{animal.breed}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0 mt-0.5 ml-3"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 min-h-0">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant={statusVariant}
                className="uppercase text-[10px] tracking-wide font-semibold"
              >
                {STATUS_LABELS[animal.status]}
              </Badge>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500">
                  Código de adopción:
                </span>
                <span className="font-mono text-xs font-bold tracking-widest" style={{ color: 'var(--color-brand)' }}>
                  {code}
                </span>
                <button
                  onClick={copyCode}
                  aria-label={copied ? 'Copiado' : 'Copiar código'}
                  className="flex items-center justify-center w-5 h-5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {copied
                    ? <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
                    : <Copy className="w-3 h-3" strokeWidth={2} />
                  }
                </button>
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <InfoRow
                icon={<PawPrint className="w-4 h-4" strokeWidth={1.5} />}
                label="Especie"
                value={SPECIES_LABELS[animal.species]}
              />
              <InfoRow
                icon={<Tag className="w-4 h-4" strokeWidth={1.5} />}
                label="Raza"
                value={animal.breed}
              />
              <InfoRow
                icon={<Cake className="w-4 h-4" strokeWidth={1.5} />}
                label="Edad"
                value={animal.age}
              />
              <InfoRow
                icon={<Maximize2 className="w-4 h-4" strokeWidth={1.5} />}
                label="Tamaño"
                value={SIZE_LABELS[animal.size]}
              />
              {animal.foundationName && (
                <InfoRow
                  icon={<Building2 className="w-4 h-4" strokeWidth={1.5} />}
                  label="Fundación"
                  value={animal.foundationName}
                />
              )}
              {animal.city && (
                <InfoRow
                  icon={<MapPin className="w-4 h-4" strokeWidth={1.5} />}
                  label="Ciudad"
                  value={animal.city}
                />
              )}
            </div>

            {/* Description */}
            {animal.description && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-2">
                  Descripción
                </p>
                <p className="text-sm text-stone-700 dark:text-zinc-300 leading-relaxed">
                  {animal.description}
                </p>
              </div>
            )}

            {/* Clinical record */}
            {cr && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-2.5">
                  Historial clínico
                </p>
                <div className="flex flex-wrap gap-2">
                  <TraitPill ok={cr.vaccinated}  label="Vacunado"      />
                  <TraitPill ok={cr.sterilized}  label="Esterilizado"  />
                  <TraitPill ok={cr.dewormed}    label="Desparasitado" />
                  <TraitPill ok={cr.microchipped} label="Microchip"    />
                </div>
              </div>
            )}
          </div>

          {/* Footer — apply CTA */}
          {animal.status === 'Available' && (
            <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={onApply}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'var(--color-brand)' }}
              >
                <PawPrint className="w-4 h-4" strokeWidth={2} />
                Solicitar adopción
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

// ─── Pet photo (with broken-URL fallback) ─────────────────────────────────────

function PetPhoto({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <PawPrint className="w-12 h-12 text-stone-300 dark:text-zinc-600" strokeWidth={1} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

// ─── Animal card ───────────────────────────────────────────────────────────────

function AnimalCard({ animal, onView }: { animal: Animal; onView: () => void }) {
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
        <PetPhoto
          src={animal.photo}
          alt={`${animal.name} — ${animal.breed}`}
          className="transition-transform duration-300 group-hover:scale-105"
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

        {/* View button */}
        <div className="pt-1 mt-auto border-t border-stone-100 dark:border-zinc-800">
          <button
            onClick={onView}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.98] text-white"
            style={{ background: 'var(--color-brand)' }}
          >
            <PawPrint className="w-3.5 h-3.5" strokeWidth={2} />
            Conocer más
          </button>
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
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted dark:bg-zinc-800 mb-5">
        <Search className="w-6 h-6 text-muted-foreground dark:text-zinc-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-stone-900 dark:text-zinc-100 mb-1">
        Ningún animal coincide con tus filtros
      </h3>
      <p className="text-xs text-muted-foreground dark:text-zinc-400 max-w-70 mb-6 leading-relaxed">
        Intenta ajustar o limpiar los filtros para descubrir más animales disponibles para adopción.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs hover:bg-muted dark:hover:bg-zinc-800"
      >
        <X className="w-3.5 h-3.5 mr-1.5" />
        Limpiar filtros
      </Button>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function PetsSkeleton() {
  return (
    <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Cargando animales">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="rounded-2xl overflow-hidden border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse">
          <div className="h-48 bg-stone-100 dark:bg-zinc-800" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between gap-2">
              <div className="h-4 bg-stone-100 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-4 bg-stone-100 dark:bg-zinc-800 rounded w-16" />
            </div>
            <div className="h-3 bg-stone-100 dark:bg-zinc-800 rounded w-2/3" />
            <div className="h-3 bg-stone-100 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-8 bg-stone-100 dark:bg-zinc-800 rounded mt-2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center" role="alert">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 mb-5">
        <AlertCircle className="w-6 h-6 text-red-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-stone-900 dark:text-zinc-100 mb-1">
        No pudimos cargar los animales
      </h3>
      <p className="text-xs text-muted-foreground dark:text-zinc-400 max-w-70 mb-6 leading-relaxed">
        Ocurrió un error al conectar con el servidor. Verifica tu conexión e intenta de nuevo.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}
        className="border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs"
      >
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Intentar de nuevo
      </Button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const location = useLocation();
  const _locState = location.state as { navId?: NavId; adoptionId?: number } | null;
  const [activeNav, setActiveNav] = useState<NavId>(_locState?.navId ?? 'browse');
  const [trackAdoptionId, setTrackAdoptionId] = useState<number | undefined>(_locState?.adoptionId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Lock page scroll
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  // Build query params from filters (species + size go to the API; ageRange is client-side)
  const petParams = useMemo(() => {
    const params: Record<string, string | number> = { per_page: 100, status: 'available' };
    if (filters.species !== 'All') params.species = filters.species.toLowerCase() as PetSpecies;
    if (filters.size !== 'All') params.size = filters.size.toLowerCase() as PetSize;
    return params;
  }, [filters.species, filters.size]);

  const {
    data: petsData,
    isLoading: loading,
    isError: error,
    refetch,
  } = useQuery({
    queryKey: ['pets', filters.species, filters.size],
    queryFn: () => petsApi.list(petParams),
    enabled: activeNav === 'browse',
  });

  useRealtimeTable('pets', [['pets']]);

  const animals = useMemo(() => (petsData?.data ?? []).map(mapPet), [petsData]);

  // ageRange is filtered in memory
  const filtered = useMemo(
    () => animals.filter(a =>
      filters.ageRange === 'All' || a.ageRange === filters.ageRange
    ),
    [animals, filters.ageRange],
  );

  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);
  const handleRetry = useCallback(() => refetch(), [refetch]);

  return (
    <>
    <AnimatePresence>
      {selectedAnimal && (
        <AnimalModal
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onApply={() => {
            setSelectedAnimal(null);
            setActiveNav('apply');
          }}
        />
      )}
    </AnimatePresence>
    <SidebarProvider className="h-screen overflow-hidden">
      <CitizenSidebar activeNav={activeNav} onNavChange={setActiveNav} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-zinc-950">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 sm:px-6 h-14 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 shrink-0">
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
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
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-zinc-600 shrink-0" />
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
          {activeNav === 'track' && <StatusPage adoptionId={trackAdoptionId} onFoundId={setTrackAdoptionId} />}
          {activeNav === 'schedule' && <SchedulePage onNavChange={setActiveNav} />}
          {activeNav === 'contact' && <ContactPage />}

          {/* Browse view */}
          {activeNav === 'browse' && (
            <>
              {/* Filter bar */}
              <section className="px-4 sm:px-6 py-4" aria-label="Filtrar animales">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl px-5 py-4">

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
              <main className="px-4 sm:px-6 pb-4 sm:pb-6" id="main-content">
                {loading ? (
                  <PetsSkeleton />
                ) : error ? (
                  <ErrorState onRetry={handleRetry} />
                ) : filtered.length === 0 ? (
                  <EmptyState onClear={clearFilters} />
                ) : (
                  <ul
                    className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    aria-label="Animales disponibles para adopción"
                  >
                    {filtered.map(animal => (
                      <li key={animal.id}>
                        <AnimalCard animal={animal} onView={() => setSelectedAnimal(animal)} />
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
    </>
  );
}
