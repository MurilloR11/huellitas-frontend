import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PawPrint, Search, Calendar, Eye, Power, ChevronLeft, ChevronRight, Building2, AlertCircle } from 'lucide-react';
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
import type { AdminPet, Species, PetStatus } from '../services/adminApi';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function formatAge(months: number | null | undefined): string {
  if (months == null) return '—';
  if (months === 0) return '< 1 mes';
  if (months < 12) return months === 1 ? '1 mes' : `${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 año' : `${years} años`;
}

function formatDate(iso: string | null | undefined, month: 'short' | 'long' = 'short'): string {
  if (!iso) return '—';
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

// ─── Lookup maps ───────────────────────────────────────────────────────────────

const SPECIES_PILL: Record<Species, { dot: string; text: string; color: string }> = {
  dog:   { dot: 'bg-amber-400',  text: 'Perro', color: 'text-amber-700 bg-amber-50 border-amber-200'    },
  cat:   { dot: 'bg-purple-400', text: 'Gato',  color: 'text-purple-700 bg-purple-50 border-purple-200' },
  other: { dot: 'bg-stone-400',  text: 'Otro',  color: 'text-stone-500 bg-stone-100 border-stone-200'   },
};

const STATUS_PILL: Record<PetStatus, { dot: string; text: string; color: string }> = {
  available:  { dot: 'bg-green-500', text: 'Disponible', color: 'text-green-700 bg-green-50 border-green-200'  },
  in_process: { dot: 'bg-amber-400', text: 'En proceso', color: 'text-amber-700 bg-amber-50 border-amber-200'  },
  adopted:    { dot: 'bg-blue-400',  text: 'Adoptada',   color: 'text-blue-700 bg-blue-50 border-blue-200'     },
  suspended:  { dot: 'bg-red-400',   text: 'Suspendida', color: 'text-red-600 bg-red-50 border-red-200'        },
};

const AVATAR_BG: Record<Species, string> = {
  dog:   'bg-amber-100 text-amber-600',
  cat:   'bg-purple-100 text-purple-600',
  other: 'bg-stone-100 text-stone-500',
};

function SkeletonRow() {
  return (
    <TableRow className="border-stone-100">
      <TableCell className="pl-0 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-stone-100 rounded animate-pulse" />
            <div className="h-3 w-16 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 hidden sm:table-cell"><div className="h-5 w-16 bg-stone-100 rounded-full animate-pulse" /></TableCell>
      <TableCell className="py-4 hidden md:table-cell"><div className="h-3.5 w-12 bg-stone-100 rounded animate-pulse" /></TableCell>
      <TableCell className="py-4 hidden lg:table-cell"><div className="h-3.5 w-32 bg-stone-100 rounded animate-pulse" /></TableCell>
      <TableCell className="py-4 hidden md:table-cell"><div className="h-3.5 w-24 bg-stone-100 rounded animate-pulse" /></TableCell>
      <TableCell className="py-4"><div className="h-5 w-20 bg-stone-100 rounded-full animate-pulse" /></TableCell>
      <TableCell className="py-4 text-right"><div className="h-7 w-16 bg-stone-100 rounded animate-pulse ml-auto" /></TableCell>
    </TableRow>
  );
}

// ─── PetModal ──────────────────────────────────────────────────────────────────

function PetModal({
  pet,
  open,
  onClose,
  onToggle,
  isPending,
}: {
  pet:       AdminPet | null;
  open:      boolean;
  onClose:   () => void;
  onToggle:  () => void;
  isPending: boolean;
}) {
  if (!pet) return null;

  const canToggle   = pet.status !== 'adopted';
  const isSuspended = pet.status === 'suspended';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        <div className="bg-stone-50 px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${AVATAR_BG[pet.species]}`}>
              <PawPrint className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base text-stone-900 leading-snug">{pet.name}</DialogTitle>
              <DialogDescription className="sr-only">Detalles de la mascota</DialogDescription>
              <div className="mt-1.5 flex items-center gap-2">
                <Pill {...SPECIES_PILL[pet.species]} />
                <Pill {...STATUS_PILL[pet.status]} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Código</p>
            <p className="text-sm text-stone-700 font-mono">{pet.code}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Raza</p>
            <p className="text-sm text-stone-700">{pet.breed || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Edad</p>
            <p className="text-sm text-stone-700">{formatAge(pet.age_months)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Fundación</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {pet.foundation_name || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Publicada</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {formatDate(pet.created_at, 'long')}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          {canToggle ? (
            <Button
              size="sm"
              disabled={isPending}
              onClick={onToggle}
              className={isSuspended
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
              }
            >
              <Power className="w-3.5 h-3.5 mr-1" />
              {isSuspended ? 'Reactivar publicación' : 'Suspender publicación'}
            </Button>
          ) : (
            <span className="text-xs text-stone-400">Mascota adoptada — sin acciones disponibles.</span>
          )}
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-600 hover:bg-stone-50">
              Cancelar
            </Button>
          </DialogClose>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── AdminPetsPage ─────────────────────────────────────────────────────────────

export default function AdminPetsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch]                     = useState('');
  const [speciesFilter, setSpeciesFilter]       = useState<Species | 'all'>('all');
  const [statusFilter, setStatusFilter]         = useState<PetStatus | 'all'>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [selected, setSelected]                 = useState<AdminPet | null>(null);
  const [page, setPage]                         = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-pets'],
    queryFn:  () => adminApi.listPets(),
    staleTime: 5 * 60 * 1000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: number; suspend: boolean }) =>
      suspend ? adminApi.suspendPet(id) : adminApi.unsuspendPet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pets'] }),
  });

  const foundations = useMemo(
    () => [...new Set((data?.data ?? []).map(p => p.foundation_name))].filter(Boolean).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    let list = data?.data ?? [];
    if (s) list = list.filter(p =>
      p.code.toLowerCase().includes(s) || p.name.toLowerCase().includes(s)
    );
    if (speciesFilter    !== 'all') list = list.filter(p => p.species        === speciesFilter);
    if (statusFilter     !== 'all') list = list.filter(p => p.status         === statusFilter);
    if (foundationFilter !== 'all') list = list.filter(p => p.foundation_name === foundationFilter);
    return list;
  }, [data, search, speciesFilter, statusFilter, foundationFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleToggle() {
    if (!selected) return;
    const suspend = selected.status !== 'suspended';
    toggleMutation.mutate({ id: selected.id, suspend });
    setSelected(null);
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select value={speciesFilter} onValueChange={v => { setSpeciesFilter(v as Species | 'all'); setPage(1); }}>
          <SelectTrigger className="w-44 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especies</SelectItem>
            <SelectItem value="dog">Perros</SelectItem>
            <SelectItem value="cat">Gatos</SelectItem>
            <SelectItem value="other">Otros</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as PetStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-44 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="available">Disponibles</SelectItem>
            <SelectItem value="in_process">En proceso</SelectItem>
            <SelectItem value="adopted">Adoptadas</SelectItem>
            <SelectItem value="suspended">Suspendidas</SelectItem>
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
          No se pudo cargar la lista de mascotas. Intenta de nuevo.
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
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">Mascota</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Especie</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Edad</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden lg:table-cell">Fundación</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Publicada</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: PAGE_SIZE }, (_, i) => <SkeletonRow key={i} />)
                  : paginated.map(p => (
                    <TableRow
                      key={p.id}
                      className={`border-stone-100 hover:bg-stone-50/60 ${p.status === 'suspended' ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="pl-0 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${AVATAR_BG[p.species]}`}>
                            <PawPrint className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate">{p.name}</p>
                            <p className="text-xs text-stone-400 font-mono truncate">{p.code}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden sm:table-cell">
                        <Pill {...SPECIES_PILL[p.species]} />
                      </TableCell>

                      <TableCell className="py-4 hidden md:table-cell">
                        <span className="text-stone-500 text-sm">{formatAge(p.age_months)}</span>
                      </TableCell>

                      <TableCell className="py-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                          <Building2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          {p.foundation_name || '—'}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 hidden md:table-cell">
                        <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          {formatDate(p.created_at)}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <Pill {...STATUS_PILL[p.status]} />
                      </TableCell>

                      <TableCell className="py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(p)}
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
        </>
      )}

      <PetModal
        pet={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onToggle={handleToggle}
        isPending={toggleMutation.isPending}
      />

    </div>
  );
}
