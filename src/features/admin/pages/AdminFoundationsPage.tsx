import { useState } from 'react';
import { Building2, Mail, MapPin, Search, Check, X, Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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

// ─── Types ─────────────────────────────────────────────────────────────────────

type Status = 'pending' | 'approved' | 'rejected';

interface AdminFoundation {
  id: number;
  name: string;
  city: string;
  contact_email: string;
  active_pets_count: number;
  adopted_pets_count: number;
  created_at: string;
  status: Status;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const INITIAL: AdminFoundation[] = [
  { id: 1,  name: 'Patitas Felices',          city: 'Bogotá',        contact_email: 'info@patitasfelices.com',       active_pets_count: 0,  adopted_pets_count: 0,  created_at: '2026-04-20', status: 'pending'  },
  { id: 2,  name: 'Huellas de Amor',           city: 'Medellín',      contact_email: 'contacto@huellasdeamor.com',   active_pets_count: 0,  adopted_pets_count: 0,  created_at: '2026-04-27', status: 'pending'  },
  { id: 3,  name: 'Amigos Peludos',            city: 'Bucaramanga',   contact_email: 'hola@amigospeludos.com',       active_pets_count: 0,  adopted_pets_count: 0,  created_at: '2026-04-15', status: 'pending'  },
  { id: 4,  name: 'Rescate Animal Caribe',     city: 'Cartagena',     contact_email: 'info@rescatecaribe.com',       active_pets_count: 0,  adopted_pets_count: 0,  created_at: '2026-04-30', status: 'pending'  },
  { id: 5,  name: 'Hogar Peludo',              city: 'Pereira',       contact_email: 'hogarpeludo@gmail.com',        active_pets_count: 0,  adopted_pets_count: 0,  created_at: '2026-05-01', status: 'pending'  },
  { id: 6,  name: 'Refugio San Francisco',     city: 'Cali',          contact_email: 'refugio@sanfrancisco.com',     active_pets_count: 8,  adopted_pets_count: 21, created_at: '2026-01-10', status: 'approved' },
  { id: 7,  name: 'Animales del Valle',        city: 'Cali',          contact_email: 'info@animalesvalle.com',       active_pets_count: 15, adopted_pets_count: 45, created_at: '2026-02-05', status: 'approved' },
  { id: 8,  name: 'Patas y Colitas',           city: 'Barranquilla',  contact_email: 'contacto@patascolitas.com',    active_pets_count: 5,  adopted_pets_count: 12, created_at: '2026-03-01', status: 'approved' },
  { id: 9,  name: 'Fundación Vida Animal',     city: 'Bogotá',        contact_email: 'info@vidaanimal.org',          active_pets_count: 22, adopted_pets_count: 67, created_at: '2025-11-14', status: 'approved' },
  { id: 10, name: 'Refugio Los Andes',         city: 'Manizales',     contact_email: 'losandes@refugio.com',         active_pets_count: 3,  adopted_pets_count: 9,  created_at: '2025-12-20', status: 'approved' },
  { id: 11, name: 'Colitas Felices',           city: 'Medellín',      contact_email: 'colitas@felices.com',          active_pets_count: 11, adopted_pets_count: 33, created_at: '2025-10-05', status: 'approved' },
  { id: 12, name: 'Rescate Antioquia',         city: 'Medellín',      contact_email: 'rescate@antioquia.org',        active_pets_count: 7,  adopted_pets_count: 18, created_at: '2026-01-22', status: 'approved' },
  { id: 13, name: 'Animal SOS',               city: 'Bogotá',        contact_email: 'sos@animalcol.com',            active_pets_count: 19, adopted_pets_count: 54, created_at: '2025-09-30', status: 'approved' },
  { id: 14, name: 'Huellitas del Pacífico',   city: 'Buenaventura',  contact_email: 'huellitas@pacifico.com',       active_pets_count: 4,  adopted_pets_count: 7,  created_at: '2026-02-18', status: 'approved' },
  { id: 15, name: 'Fundación Pelaje',          city: 'Ibagué',        contact_email: 'pelaje@fundacion.com',         active_pets_count: 6,  adopted_pets_count: 14, created_at: '2026-03-09', status: 'approved' },
  { id: 16, name: 'Amparar Animal',            city: 'Neiva',         contact_email: 'amparar@animal.org',           active_pets_count: 0,  adopted_pets_count: 5,  created_at: '2026-01-30', status: 'approved' },
  { id: 17, name: 'Patitas del Sur',           city: 'Pasto',         contact_email: 'patitas@sur.com',              active_pets_count: 9,  adopted_pets_count: 27, created_at: '2025-12-01', status: 'approved' },
  { id: 18, name: 'Lazos de Vida',             city: 'Villavicencio', contact_email: 'lazos@vidaanimal.com',         active_pets_count: 2,  adopted_pets_count: 6,  created_at: '2026-02-25', status: 'rejected' },
  { id: 19, name: 'Sin Hogar No Más',          city: 'Santa Marta',   contact_email: 'sinhogar@nomas.com',           active_pets_count: 0,  adopted_pets_count: 0,  created_at: '2026-04-10', status: 'rejected' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 7;

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

// ─── StatusBadge ───────────────────────────────────────────────────────────────

const STATUS_PILL: Record<Status, { dot: string; text: string; color: string }> = {
  approved: { dot: 'bg-green-500',  text: 'Registrada', color: 'text-green-700 bg-green-50 border-green-200'  },
  pending:  { dot: 'bg-amber-400',  text: 'Pendiente',  color: 'text-amber-700 bg-amber-50 border-amber-200'  },
  rejected: { dot: 'bg-stone-400',  text: 'Rechazada',  color: 'text-stone-500 bg-stone-100 border-stone-200' },
};

function StatusBadge({ status }: { status: Status }) {
  return <Pill {...STATUS_PILL[status]} />;
}

const ICON_BG:    Record<Status, string> = { approved: 'bg-green-50',  pending: 'bg-amber-50',  rejected: 'bg-stone-100' };
const ICON_COLOR: Record<Status, string> = { approved: 'text-green-600', pending: 'text-amber-500', rejected: 'text-stone-400' };

// ─── FoundationModal ───────────────────────────────────────────────────────────

function FoundationModal({
  foundation,
  open,
  onClose,
  onApprove,
  onReject,
}: {
  foundation: AdminFoundation | null;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!foundation) return null;

  const fecha = formatDate(foundation.created_at, 'long');

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        {/* Header con fondo ámbar suave */}
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

        {/* Cuerpo */}
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
              {fecha}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="sm"
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Aprobar
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              className="text-stone-400 hover:text-red-600 hover:bg-red-50"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Rechazar
            </Button>
          </DialogClose>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── ActiveBadge ───────────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <Pill dot="bg-green-500" text="Activa"   color="text-green-700 bg-green-50 border-green-200"  />
    : <Pill dot="bg-stone-400" text="Inactiva" color="text-stone-500 bg-stone-100 border-stone-200" />;
}

// ─── AdminFoundationsPage ──────────────────────────────────────────────────────

export default function AdminFoundationsPage() {
  const [foundations, setFoundations]   = useState<AdminFoundation[]>(INITIAL);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('approved');
  const [selected, setSelected]         = useState<AdminFoundation | null>(null);
  const [page, setPage]                 = useState(1);

  const filtered = foundations.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                          f.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setStatus(id: number, status: Status) {
    setFoundations(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    setSelected(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por nombre o ciudad..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={v => { setStatusFilter(v as Status | 'all'); setPage(1); }}
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

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-stone-400">Sin resultados para los filtros aplicados.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-stone-200 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">
                Nombre
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">
                Ciudad
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">
                Registro
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">
                {statusFilter === 'approved' ? 'Actividad' : 'Estado'}
              </TableHead>
              {statusFilter !== 'approved' && (
                <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(f => (
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
            ))}
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

      <FoundationModal
        foundation={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onApprove={() => selected && setStatus(selected.id, 'approved')}
        onReject={() => selected && setStatus(selected.id, 'rejected')}
      />

    </div>
  );
}
