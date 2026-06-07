import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Mail, MapPin, Search, Check, X,
  Calendar, Eye, ChevronLeft, ChevronRight, AlertCircle,
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
} from '@/components/ui/dialog';
import { adminApi, type AdminFoundation, type FoundationStatus } from '../services/adminApi';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string, month: 'short' | 'long' = 'short') {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month, year: 'numeric',
  });
}

function Pill({ dot, text, color }: { dot: string; text: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

// ─── Status badges ─────────────────────────────────────────────────────────────

const STATUS_PILL: Record<FoundationStatus, { dot: string; text: string; color: string }> = {
  approved: { dot: 'bg-green-500',  text: 'Registrada', color: 'text-green-700 bg-green-50 border-green-200'  },
  pending:  { dot: 'bg-amber-400',  text: 'Pendiente',  color: 'text-amber-700 bg-amber-50 border-amber-200'  },
  rejected: { dot: 'bg-stone-400',  text: 'Rechazada',  color: 'text-stone-500 bg-stone-100 border-stone-200' },
};

const ICON_BG:    Record<FoundationStatus, string> = { approved: 'bg-green-50',  pending: 'bg-amber-50',  rejected: 'bg-stone-100' };
const ICON_COLOR: Record<FoundationStatus, string> = { approved: 'text-green-600', pending: 'text-amber-500', rejected: 'text-stone-400' };

function StatusBadge({ status }: { status: FoundationStatus }) {
  return <Pill {...STATUS_PILL[status]} />;
}

function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <Pill dot="bg-green-500" text="Activa"   color="text-green-700 bg-green-50 border-green-200"  />
    : <Pill dot="bg-stone-400" text="Inactiva" color="text-stone-500 bg-stone-100 border-stone-200" />;
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow className="border-stone-100">
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className="py-4">
          <div className="h-4 bg-stone-100 rounded animate-pulse" style={{ width: i === 0 ? 160 : 100 }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ─── FoundationModal ───────────────────────────────────────────────────────────

function FoundationModal({
  foundation,
  open,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  foundation: AdminFoundation | null;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  function handleReject() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError('El motivo es requerido para rechazar.');
      return;
    }
    setReasonError('');
    onReject(trimmed);
  }

  function handleClose() {
    setReason('');
    setReasonError('');
    onClose();
  }

  if (!foundation) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        <div className="bg-amber-50 px-6 pt-6 pb-5 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
            </div>
            <div>
              <DialogTitle className="text-base text-stone-900">{foundation.name}</DialogTitle>
              <DialogDescription className="sr-only">Detalles de la fundación</DialogDescription>
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{foundation.city}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Email de contacto</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {foundation.contact_email}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Fecha de solicitud</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {formatDate(foundation.created_at, 'long')}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-stone-400">Motivo de rechazo <span className="text-stone-300">(requerido para rechazar)</span></p>
            <textarea
              placeholder="Explica por qué se rechaza esta fundación..."
              value={reason}
              onChange={e => { setReason(e.target.value); setReasonError(''); }}
              rows={3}
              className="w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 resize-none"
            />
            {reasonError && (
              <p className="text-xs text-red-500">{reasonError}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            {isApproving ? 'Aprobando...' : 'Aprobar'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={isApproving || isRejecting}
            className="text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            {isRejecting ? 'Rechazando...' : 'Rechazar'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── AdminFoundationsPage ──────────────────────────────────────────────────────

export default function AdminFoundationsPage() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<FoundationStatus | 'all'>('approved');
  const [selected, setSelected]         = useState<AdminFoundation | null>(null);
  const [page, setPage]                 = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-foundations', statusFilter, page],
    queryFn: () => adminApi.listFoundations(statusFilter, page),
    staleTime: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveFoundation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foundations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelected(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectFoundation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foundations'] });
      setSelected(null);
    },
  });

  const foundations = data?.data ?? [];

  const filtered = foundations.filter(f => {
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q);
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / (data.per_page))) : 1;
  const colCount = statusFilter !== 'approved' ? 6 : 5;

  return (
    <div className="p-6 space-y-6">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por nombre o ciudad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={v => { setStatusFilter(v as FoundationStatus | 'all'); setPage(1); setSearch(''); }}
        >
          <SelectTrigger className="w-48 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approved">Registradas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Estado de error ────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No se pudieron cargar las fundaciones. Intenta recargar la página.
        </div>
      )}

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      {!isError && (filtered.length === 0 && !isLoading) ? (
        <div className="py-20 text-center">
          <p className="text-sm text-stone-400">Sin resultados para los filtros aplicados.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-stone-200 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">Nombre</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Ciudad</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Email</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Registro</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">
                {statusFilter === 'approved' ? 'Actividad' : 'Estado'}
              </TableHead>
              {statusFilter !== 'approved' && (
                <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
              : filtered.map(f => (
                  <TableRow key={f.id} className="border-stone-100 hover:bg-stone-50/60">

                    <TableCell className="pl-0 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ICON_BG[f.status]}`}>
                          <Building2 className={`w-4 h-4 ${ICON_COLOR[f.status]}`} strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 truncate">{f.name}</p>
                          <p className="text-xs text-stone-400 sm:hidden flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{f.city}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                        {f.city}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                        <Mail className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                        {f.contact_email}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                        {formatDate(f.created_at)}
                      </span>
                    </TableCell>

                    <TableCell className="py-4">
                      {statusFilter === 'approved'
                        ? <ActiveBadge active={f.active_pets_count > 0} />
                        : <StatusBadge status={f.status} />
                      }
                    </TableCell>

                    {statusFilter !== 'approved' && (
                      <TableCell className="py-4 text-right">
                        {f.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(f)}
                            className="h-7 px-3 text-xs border-stone-200 text-stone-600 hover:bg-stone-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Ver
                          </Button>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
                        )}
                      </TableCell>
                    )}

                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      )}

      {/* ── Paginación ─────────────────────────────────────────────────── */}
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
                variant="ghost"
                size="sm"
                onClick={() => setPage(n)}
                className={`h-8 w-8 p-0 text-xs ${
                  n === page
                    ? 'text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
                style={n === page ? { background: 'var(--color-brand)' } : {}}
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

      <FoundationModal
        foundation={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onApprove={() => selected && approveMutation.mutate(selected.id)}
        onReject={(reason) => selected && rejectMutation.mutate({ id: selected.id, reason })}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />

    </div>
  );
}
