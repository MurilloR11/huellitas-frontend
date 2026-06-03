import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Globe, ChevronLeft, ChevronRight, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/shared/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  activityApi,
  type Activity,
  type ActivityType,
  type DateRangeFilter,
} from '../services/adminActivityApi';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function Pill({ dot, text, color }: { dot: string; text: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

// ─── Lookup maps ───────────────────────────────────────────────────────────────

const ACTION_PILL: Record<ActivityType, { dot: string; text: string; color: string }> = {
  login:                   { dot: 'bg-blue-400',   text: 'Inicio sesión',          color: 'text-blue-700 bg-blue-50 border-blue-200'         },
  logout:                  { dot: 'bg-blue-300',   text: 'Cierre sesión',          color: 'text-blue-600 bg-blue-50 border-blue-200'         },
  adoption_request:        { dot: 'bg-green-500',  text: 'Solicitud adopción',     color: 'text-green-700 bg-green-50 border-green-200'      },
  adoption_cancelled:      { dot: 'bg-stone-400',  text: 'Adopción cancelada',     color: 'text-stone-500 bg-stone-100 border-stone-200'     },
  adoption_status_updated: { dot: 'bg-green-400',  text: 'Estado actualizado',     color: 'text-green-700 bg-green-50 border-green-200'      },
  visit_scheduled:         { dot: 'bg-cyan-400',   text: 'Visita agendada',        color: 'text-cyan-700 bg-cyan-50 border-cyan-200'         },
  profile_updated:         { dot: 'bg-violet-400', text: 'Perfil actualizado',     color: 'text-violet-700 bg-violet-50 border-violet-200'   },
  foundation_approved:     { dot: 'bg-orange-400', text: 'Fundación aprobada',     color: 'text-orange-700 bg-orange-50 border-orange-200'   },
  foundation_rejected:     { dot: 'bg-orange-500', text: 'Fundación rechazada',    color: 'text-orange-700 bg-orange-50 border-orange-200'   },
  pet_published:           { dot: 'bg-violet-500', text: 'Mascota publicada',      color: 'text-violet-700 bg-violet-50 border-violet-200'   },
  pet_suspended:           { dot: 'bg-amber-400',  text: 'Mascota suspendida',     color: 'text-amber-700 bg-amber-50 border-amber-200'      },
  pet_unsuspended:         { dot: 'bg-amber-300',  text: 'Mascota reactivada',     color: 'text-amber-700 bg-amber-50 border-amber-200'      },
  user_banned:             { dot: 'bg-red-400',    text: 'Usuario bloqueado',      color: 'text-red-600 bg-red-50 border-red-200'            },
  user_unbanned:           { dot: 'bg-teal-500',   text: 'Usuario desbloqueado',   color: 'text-teal-700 bg-teal-50 border-teal-200'         },
};

const AVATAR_BG: Record<Activity['user_role'], string> = {
  ciudadano: 'bg-blue-100 text-blue-700',
  fundacion: 'bg-violet-100 text-violet-700',
  admin:     'bg-teal-100 text-teal-700',
  developer: 'bg-orange-100 text-orange-700',
};

function ActivityAvatar({ userId, name, role }: { userId: string; name: string; role: Activity['user_role'] }) {
  const avatarUrl = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar`).data.publicUrl;
  return (
    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold overflow-hidden ${AVATAR_BG[role]}`}>
      {getInitials(name)}
      <img
        src={avatarUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}

const ACTION_LABELS: Record<ActivityType, string> = {
  login:                   'Inicio sesión',
  logout:                  'Cierre sesión',
  adoption_request:        'Solicitud adopción',
  adoption_cancelled:      'Adopción cancelada',
  adoption_status_updated: 'Estado actualizado',
  visit_scheduled:         'Visita agendada',
  profile_updated:         'Perfil actualizado',
  foundation_approved:     'Fundación aprobada',
  foundation_rejected:     'Fundación rechazada',
  pet_published:           'Mascota publicada',
  pet_suspended:           'Mascota suspendida',
  pet_unsuspended:         'Mascota reactivada',
  user_banned:             'Usuario bloqueado',
  user_unbanned:           'Usuario desbloqueado',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow className="border-stone-100">
      <TableCell className="pl-0 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-100 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-36 bg-stone-100 rounded animate-pulse" />
            <div className="h-3 w-28 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell py-4">
        <div className="h-5 w-32 bg-stone-100 rounded-full animate-pulse" />
      </TableCell>
      <TableCell className="hidden md:table-cell py-4">
        <div className="h-3.5 w-48 bg-stone-100 rounded animate-pulse" />
      </TableCell>
      <TableCell className="hidden lg:table-cell py-4">
        <div className="h-3.5 w-24 bg-stone-100 rounded animate-pulse" />
      </TableCell>
      <TableCell className="py-4">
        <div className="h-3.5 w-28 bg-stone-100 rounded animate-pulse" />
      </TableCell>
    </TableRow>
  );
}

const PAGE_SIZE = 15;

const ACTION_GROUPS: { label: string; items: ActivityType[] }[] = [
  { label: 'Sesión',      items: ['login', 'logout'] },
  { label: 'Adopciones',  items: ['adoption_request', 'adoption_cancelled', 'adoption_status_updated', 'visit_scheduled'] },
  { label: 'Mascotas',    items: ['pet_published', 'pet_suspended', 'pet_unsuspended'] },
  { label: 'Fundaciones', items: ['foundation_approved', 'foundation_rejected'] },
  { label: 'Usuarios',    items: ['profile_updated', 'user_banned', 'user_unbanned'] },
];

// ─── AdminActivityPage ─────────────────────────────────────────────────────────

export default function AdminActivityPage() {
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [actionFilter, setActionFilter] = useState<ActivityType | 'all'>('all');
  const [actionOpen, setActionOpen]     = useState(false);
  const [dateFilter, setDateFilter]     = useState<DateRangeFilter>('all');
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [actionFilter, dateFilter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-activities', search, actionFilter, dateFilter, page],
    queryFn: () => activityApi.getActivities({
      page,
      search:     search || undefined,
      action:     actionFilter !== 'all' ? actionFilter : undefined,
      date_range: dateFilter !== 'all' ? dateFilter : undefined,
    }),
    staleTime: 0,
    refetchInterval: 5_000,
    placeholderData: (prev) => prev,
  });

  const activities = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="p-6 space-y-6">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por usuario o email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Popover open={actionOpen} onOpenChange={setActionOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-52 items-center justify-between rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <span className="truncate">
                {actionFilter === 'all' ? 'Todas las acciones' : ACTION_LABELS[actionFilter]}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-1">
            <div className="max-h-72 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => { setActionFilter('all'); setPage(1); setActionOpen(false); }}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100"
              >
                <Check className={cn('w-3.5 h-3.5 shrink-0', actionFilter !== 'all' && 'invisible')} />
                Todas las acciones
              </button>

              {ACTION_GROUPS.map((group, gi) => (
                <div key={group.label}>
                  <div className={cn('mt-1 border-t border-stone-100', gi === 0 && 'mt-1')} />
                  <p className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    {group.label}
                  </p>
                  {group.items.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => { setActionFilter(item); setPage(1); setActionOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100"
                    >
                      <Check className={cn('w-3.5 h-3.5 shrink-0', actionFilter !== item && 'invisible')} />
                      {ACTION_LABELS[item]}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select value={dateFilter} onValueChange={v => setDateFilter(v as DateRangeFilter)}>
          <SelectTrigger className="w-40 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el tiempo</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No se pudo cargar el registro de actividad. Intenta de nuevo.
        </div>
      )}

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      {!isError && (
        <>
          {!isLoading && activities.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-stone-400">Sin actividad para los filtros aplicados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-stone-200 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">Usuario</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Acción</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Descripción</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden lg:table-cell">IP</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">Fecha/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : activities.map(a => (
                    <TableRow key={a.id} className="border-stone-100 hover:bg-stone-50/60">

                      <TableCell className="pl-0 py-4">
                        <div className="flex items-center gap-3">
                          <ActivityAvatar userId={a.user_id} name={a.user_name} role={a.user_role} />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate">{a.user_name}</p>
                            <p className="text-xs text-stone-400 truncate">{a.user_email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden sm:table-cell">
                        <Pill {...ACTION_PILL[a.action]} />
                      </TableCell>

                      <TableCell className="py-4 hidden md:table-cell">
                        <span className="text-xs text-stone-500 line-clamp-2">{a.description}</span>
                      </TableCell>

                      <TableCell className="py-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                          <Globe className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          {a.ip_address ?? '—'}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <span className="text-xs text-stone-500 whitespace-nowrap">
                          {formatDateTime(a.created_at)}
                        </span>
                      </TableCell>

                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          )}

          {/* ── Paginación ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 border-stone-200 text-stone-500 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <Button
                    key={n}
                    variant={n === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 p-0 text-xs ${
                      n === page
                        ? 'bg-stone-800 hover:bg-stone-700 text-white'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 border-stone-200 text-stone-500 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
