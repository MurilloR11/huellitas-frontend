import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  PawPrint,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  Hash,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealtimeTable } from '../../../shared/hooks/useRealtimeTable';
import { adoptionsApi } from '../services/adoptionsApi';
import type { AdoptionRequest, AdoptionStatus } from '../types';

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AdoptionStatus, { label: string; bg: string; fg: string }> = {
  pending:   { label: 'Pendiente',    bg: '#f5f5f4', fg: '#57534e' },
  reviewing: { label: 'En revisión',  bg: '#fef3c7', fg: '#92400e' },
  approved:  { label: 'Aprobada',     bg: '#dcfce7', fg: '#166534' },
  rejected:  { label: 'No aprobada',  bg: '#fee2e2', fg: '#991b1b' },
  completed: { label: 'Completada',   bg: '#fdf3ee', fg: '#e85d26' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Adoption Card ─────────────────────────────────────────────────────────────

function AdoptionCard({ request }: { request: AdoptionRequest }) {
  const config = STATUS_CONFIG[request.status];

  return (
    <li>
      <Link
        to={`/adoptions/${request.id}`}
        className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-stone-300 dark:hover:border-zinc-600 hover:shadow-md transition-all group"
      >
        {/* Photo */}
        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
          {request.pet_photo ? (
            <img
              src={request.pet_photo}
              alt={request.pet_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <PawPrint className="w-7 h-7 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate">
            {request.pet_name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: config.bg, color: config.fg }}
            >
              {config.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-zinc-500">
              <CalendarDays className="w-3 h-3 shrink-0" strokeWidth={1.75} />
              {formatDate(request.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <Hash className="w-3 h-3 text-stone-300 dark:text-zinc-600 shrink-0" strokeWidth={2} />
            <span className="font-mono text-[11px] text-stone-400 dark:text-zinc-500 tracking-wider">
              {request.tracking_code ?? `SOL-${String(request.id).padStart(5, '0')}`}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          className="w-4 h-4 text-stone-300 dark:text-zinc-600 shrink-0 group-hover:text-stone-500 dark:group-hover:text-zinc-400 transition-colors"
          strokeWidth={2}
        />
      </Link>
    </li>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AdoptionsSkeleton() {
  return (
    <div className="px-6 py-6 max-w-3xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <ul className="space-y-3">
        {[0, 1, 2].map(i => (
          <li key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl">
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-56" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center gap-4">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <ClipboardList
          className="w-8 h-8"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
      </div>
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
          Aún no tienes solicitudes
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
          Cuando envíes una solicitud de adopción, aparecerá aquí para que puedas
          hacer seguimiento.
        </p>
      </div>
      <Link
        to="/explore"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-brand)' }}
      >
        <PawPrint className="w-4 h-4" strokeWidth={2} />
        Explorar animales
      </Link>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center gap-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30">
        <RefreshCw className="w-7 h-7 text-red-400" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
          Error al cargar solicitudes
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1 max-w-xs">
          No pudimos obtener tus solicitudes. Verifica tu conexión e intenta de nuevo.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <RefreshCw className="w-4 h-4" strokeWidth={2} />
        Reintentar
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyAdoptionsPage() {
  const { data: adoptions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['my-adoptions'],
    queryFn: () => adoptionsApi.myAdoptions(),
  });

  useRealtimeTable('adoption_requests', [['my-adoptions']]);

  if (isLoading) return <AdoptionsSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (adoptions.length === 0) return <EmptyState />;

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
            Mis solicitudes
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300">
            {adoptions.length}
          </span>
        </div>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
          Seguimiento de tus solicitudes de adopción activas e históricas.
        </p>
      </header>

      <ul className="space-y-3">
        {adoptions.map(r => (
          <AdoptionCard key={r.id} request={r} />
        ))}
      </ul>
    </div>
  );
}
