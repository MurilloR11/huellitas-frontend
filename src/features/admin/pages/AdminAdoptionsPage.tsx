import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Calendar, Eye, PawPrint, Building2,
  Phone, Mail, MapPin, ChevronLeft, ChevronRight, Ban, ClipboardList, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { adminApi } from '../services/adminApi';
import type { AdminAdoption, RequestStatus, Species } from '../services/adminApi';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TimelineStep {
  label: string;
  date:  string | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined, month: 'short' | 'long' = 'short'): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month, year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('') || '?';
}

function buildTimeline(req: AdminAdoption): TimelineStep[] {
  const { status, created_at, updated_at, visit_at } = req;
  const step1 = { label: 'Solicitud enviada', date: created_at };

  if (status === 'pending') {
    return [step1, { label: 'Revisada por fundación', date: null }, { label: 'Visita programada', date: null }, { label: 'Adopción finalizada', date: null }];
  }
  if (status === 'reviewing') {
    return [step1, { label: 'En revisión por fundación', date: updated_at }, { label: 'Visita programada', date: null }, { label: 'Adopción finalizada', date: null }];
  }
  if (status === 'approved') {
    return [step1, { label: 'Aprobada por fundación', date: updated_at }, { label: 'Visita programada', date: visit_at }, { label: 'Adopción finalizada', date: null }];
  }
  if (status === 'completed') {
    return [step1, { label: 'Aprobada por fundación', date: updated_at }, { label: 'Visita programada', date: visit_at }, { label: 'Adopción finalizada', date: updated_at }];
  }
  if (status === 'rejected') {
    return [step1, { label: 'Revisada por fundación', date: updated_at }, { label: 'Solicitud rechazada', date: updated_at }];
  }
  if (status === 'cancelled') {
    return [step1, { label: 'Cancelada por administrador', date: updated_at }];
  }
  return [step1];
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

const STATUS_PILL: Record<RequestStatus, { dot: string; text: string; color: string }> = {
  pending:   { dot: 'bg-amber-400',  text: 'Pendiente',   color: 'text-amber-700 bg-amber-50 border-amber-200'    },
  reviewing: { dot: 'bg-blue-400',   text: 'En revisión', color: 'text-blue-700 bg-blue-50 border-blue-200'       },
  approved:  { dot: 'bg-green-500',  text: 'Aprobada',    color: 'text-green-700 bg-green-50 border-green-200'    },
  rejected:  { dot: 'bg-red-400',    text: 'Rechazada',   color: 'text-red-600 bg-red-50 border-red-200'          },
  completed: { dot: 'bg-teal-500',   text: 'Completada',  color: 'text-teal-700 bg-teal-50 border-teal-200'       },
  cancelled: { dot: 'bg-stone-400',  text: 'Cancelada',   color: 'text-stone-500 bg-stone-100 border-stone-200'   },
};

const SPECIES_AVATAR: Record<Species, string> = {
  dog:   'bg-amber-100 text-amber-600',
  cat:   'bg-purple-100 text-purple-600',
  other: 'bg-stone-100 text-stone-500',
};

function stepDotClass(label: string, date: string | null): string {
  if (!date) return '';
  if (label.toLowerCase().includes('rechazada')) return 'bg-red-400';
  if (label.toLowerCase().includes('cancelada')) return 'bg-stone-400';
  return 'bg-stone-700';
}

function stepLabelClass(label: string, date: string | null): string {
  if (!date) return 'text-stone-300';
  if (label.toLowerCase().includes('rechazada')) return 'text-red-500';
  if (label.toLowerCase().includes('cancelada')) return 'text-stone-400';
  return 'text-stone-700';
}

function RequesterAvatar({ userId, name }: { userId: string; name: string }) {
  const avatarUrl = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar`).data.publicUrl;
  return (
    <div className="relative w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0 select-none overflow-hidden">
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

function SkeletonRow() {
  return (
    <TableRow className="border-stone-100">
      <TableCell className="pl-0 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-stone-100 rounded animate-pulse" />
            <div className="h-3 w-36 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 hidden sm:table-cell">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-stone-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-16 bg-stone-100 rounded animate-pulse" />
            <div className="h-3 w-14 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 hidden lg:table-cell"><div className="h-3.5 w-32 bg-stone-100 rounded animate-pulse" /></TableCell>
      <TableCell className="py-4 hidden md:table-cell"><div className="h-3.5 w-24 bg-stone-100 rounded animate-pulse" /></TableCell>
      <TableCell className="py-4"><div className="h-5 w-20 bg-stone-100 rounded-full animate-pulse" /></TableCell>
      <TableCell className="py-4 text-right"><div className="h-7 w-16 bg-stone-100 rounded animate-pulse ml-auto" /></TableCell>
    </TableRow>
  );
}

// ─── RequestModal ──────────────────────────────────────────────────────────────

function RequestModal({
  request,
  open,
  onClose,
  onCancel,
  isPending,
}: {
  request:   AdminAdoption | null;
  open:      boolean;
  onClose:   () => void;
  onCancel:  () => void;
  isPending: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!request) return null;

  const isTerminal = ['rejected', 'completed', 'cancelled'].includes(request.status);
  const timeline   = buildTimeline(request);

  function handleOpenChange(v: boolean) {
    if (!v) { setConfirming(false); onClose(); }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        {/* Header */}
        <div className="bg-stone-50 px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
              <ClipboardList className="w-5 h-5 text-stone-500" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-base text-stone-900 font-mono">{request.code}</DialogTitle>
                <DialogDescription className="sr-only">Detalles de la solicitud de adopción</DialogDescription>
                <Pill {...STATUS_PILL[request.status]} />
              </div>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 shrink-0" />
                {request.foundation_name || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Solicitante */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Solicitante</p>
            <div className="flex items-start gap-3">
              <RequesterAvatar userId={request.requester_id} name={request.requester_name} />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-stone-800">{request.requester_name || '—'}</p>
                <p className="text-xs text-stone-400 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0" />{request.requester_email || '—'}
                </p>
                {request.requester_phone && (
                  <p className="text-xs text-stone-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 shrink-0" />{request.requester_phone}
                  </p>
                )}
                {request.requester_city && (
                  <p className="text-xs text-stone-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />{request.requester_city}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100" />

          {/* Mascota */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Mascota</p>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${SPECIES_AVATAR[request.pet_species]}`}>
                <PawPrint className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-stone-800">{request.pet_name || '—'}</p>
                <p className="text-xs text-stone-400 font-mono">{request.pet_code}</p>
                <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3 h-3 shrink-0" />
                  Solicitado el {formatDate(request.created_at, 'long')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100" />

          {/* Timeline */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Proceso</p>
            <div className="space-y-2.5">
              {timeline.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.date ? (
                    <div className={`w-2 h-2 rounded-full shrink-0 ${stepDotClass(step.label, step.date)}`} />
                  ) : (
                    <div className="w-2 h-2 rounded-full shrink-0 border-2 border-stone-200" />
                  )}
                  <div className="flex-1 flex items-center justify-between gap-3">
                    <span className={`text-sm ${stepLabelClass(step.label, step.date)}`}>
                      {step.label}
                    </span>
                    <span className={`text-xs shrink-0 ${step.date ? 'text-stone-400' : 'text-stone-300'}`}>
                      {step.date ? formatDate(step.date) : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-3">
          {isTerminal ? (
            <span className="text-xs text-stone-400">
              {request.status === 'completed' ? 'Adopción completada.' : request.status === 'cancelled' ? 'Esta solicitud fue cancelada.' : 'Esta solicitud fue rechazada.'}
            </span>
          ) : confirming ? (
            <>
              <span className="text-xs text-stone-500 font-medium">¿Confirmar cancelación?</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => { onCancel(); setConfirming(false); }}
                  className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
                >
                  Confirmar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  className="h-7 px-3 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                >
                  No, volver
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => setConfirming(true)}
                className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
              >
                <Ban className="w-3.5 h-3.5 mr-1.5" />
                Cancelar solicitud
              </Button>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                >
                  Cerrar
                </Button>
              </DialogClose>
            </>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── AdminAdoptionsPage ────────────────────────────────────────────────────────

export default function AdminAdoptionsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch]                     = useState('');
  const [statusFilter, setStatusFilter]         = useState<RequestStatus | 'all'>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [selected, setSelected]                 = useState<AdminAdoption | null>(null);
  const [page, setPage]                         = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey:  ['admin-adoptions'],
    queryFn:   () => adminApi.listAdoptions(),
    staleTime: 5 * 60 * 1000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => adminApi.cancelAdoption(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin-adoptions'] }),
  });

  const foundations = useMemo(
    () => [...new Set((data?.data ?? []).map(r => r.foundation_name))].filter(Boolean).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    let list = data?.data ?? [];
    if (s) list = list.filter(r =>
      r.code.toLowerCase().includes(s)        ||
      r.pet_code.toLowerCase().includes(s)    ||
      r.pet_name.toLowerCase().includes(s)    ||
      r.requester_name.toLowerCase().includes(s) ||
      r.requester_email.toLowerCase().includes(s)
    );
    if (statusFilter     !== 'all') list = list.filter(r => r.status          === statusFilter);
    if (foundationFilter !== 'all') list = list.filter(r => r.foundation_name === foundationFilter);
    return list;
  }, [data, search, statusFilter, foundationFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCancel() {
    if (!selected) return;
    cancelMutation.mutate(selected.id);
    setSelected(null);
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por código, mascota o solicitante..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as RequestStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-44 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="reviewing">En revisión</SelectItem>
            <SelectItem value="approved">Aprobadas</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={foundationFilter} onValueChange={v => { setFoundationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-52 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fundaciones</SelectItem>
            {foundations.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No se pudo cargar la lista de solicitudes. Intenta de nuevo.
        </div>
      )}

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      {!isError && (
        <>
          {!isLoading && filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-stone-400">Sin resultados para los filtros aplicados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-stone-200 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">Solicitante</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Mascota</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden lg:table-cell">Fundación</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: PAGE_SIZE }, (_, i) => <SkeletonRow key={i} />)
                  : paginated.map(r => (
                    <TableRow
                      key={r.id}
                      className={`border-stone-100 hover:bg-stone-50/60 ${r.status === 'cancelled' ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="pl-0 py-4">
                        <div className="flex items-center gap-3">
                          <RequesterAvatar userId={r.requester_id} name={r.requester_name} />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate">{r.requester_name || '—'}</p>
                            <p className="text-xs text-stone-400 truncate">{r.requester_email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${SPECIES_AVATAR[r.pet_species]}`}>
                            <PawPrint className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-stone-700 truncate">{r.pet_name || '—'}</p>
                            <p className="text-xs text-stone-400 font-mono truncate">{r.pet_code}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                          <Building2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          {r.foundation_name || '—'}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 hidden md:table-cell">
                        <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          {formatDate(r.created_at)}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <Pill {...STATUS_PILL[r.status]} />
                      </TableCell>

                      <TableCell className="py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(r)}
                          className="h-7 px-3 text-xs border-stone-200 text-stone-600 hover:bg-stone-50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          )}

          {/* ── Paginación ─────────────────────────────────────────────── */}
          {!isLoading && totalPages > 1 && (
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

      <RequestModal
        request={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onCancel={handleCancel}
        isPending={cancelMutation.isPending}
      />

    </div>
  );
}
