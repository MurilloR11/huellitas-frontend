import { useState } from 'react';
import { PawPrint, Search, Calendar, Eye, Power, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
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

type Species   = 'dog' | 'cat' | 'other';
type PetStatus = 'available' | 'in_process' | 'adopted' | 'suspended';

interface AdminPet {
  id:           number;
  code:         string;
  name:         string;
  species:      Species;
  breed:        string;
  age:          string;
  foundation:   string;
  status:       PetStatus;
  published_at: string;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const INITIAL: AdminPet[] = [
  { id: 1,  code: 'HU-0001', name: 'Max',      species: 'dog',   breed: 'Labrador Retriever', age: '2 años',   foundation: 'Fundación Vida Animal',  status: 'available',  published_at: '2026-04-01' },
  { id: 2,  code: 'HU-0002', name: 'Luna',     species: 'dog',   breed: 'Mestizo',            age: '1 año',    foundation: 'Animal SOS',             status: 'available',  published_at: '2026-04-05' },
  { id: 3,  code: 'HU-0003', name: 'Rocky',    species: 'dog',   breed: 'Beagle',             age: '3 años',   foundation: 'Colitas Felices',        status: 'available',  published_at: '2026-04-08' },
  { id: 4,  code: 'HU-0004', name: 'Bella',    species: 'dog',   breed: 'Golden Retriever',   age: '4 años',   foundation: 'Refugio San Francisco',  status: 'available',  published_at: '2026-04-10' },
  { id: 5,  code: 'HU-0005', name: 'Bruno',    species: 'dog',   breed: 'Bulldog Francés',    age: '1 año',    foundation: 'Animales del Valle',     status: 'available',  published_at: '2026-04-12' },
  { id: 6,  code: 'HU-0006', name: 'Mía',      species: 'cat',   breed: 'Mestizo',            age: '2 años',   foundation: 'Rescate Antioquia',      status: 'available',  published_at: '2026-04-03' },
  { id: 7,  code: 'HU-0007', name: 'Simba',    species: 'cat',   breed: 'Siamés',             age: '3 años',   foundation: 'Fundación Pelaje',       status: 'available',  published_at: '2026-04-14' },
  { id: 8,  code: 'HU-0008', name: 'Cleo',     species: 'cat',   breed: 'Persa',              age: '5 años',   foundation: 'Patas y Colitas',        status: 'available',  published_at: '2026-04-18' },
  { id: 9,  code: 'HU-0009', name: 'Toby',     species: 'dog',   breed: 'Schnauzer',          age: '2 años',   foundation: 'Animal SOS',             status: 'in_process', published_at: '2026-03-20' },
  { id: 10, code: 'HU-0010', name: 'Nala',     species: 'dog',   breed: 'Mestizo',            age: '6 meses',  foundation: 'Colitas Felices',        status: 'in_process', published_at: '2026-03-25' },
  { id: 11, code: 'HU-0011', name: 'Oliver',   species: 'cat',   breed: 'Mestizo',            age: '1 año',    foundation: 'Fundación Vida Animal',  status: 'in_process', published_at: '2026-03-28' },
  { id: 12, code: 'HU-0012', name: 'Lola',     species: 'dog',   breed: 'Poodle',             age: '3 años',   foundation: 'Refugio Los Andes',      status: 'in_process', published_at: '2026-04-02' },
  { id: 13, code: 'HU-0013', name: 'Manchas',  species: 'dog',   breed: 'Dálmata',            age: '2 años',   foundation: 'Animal SOS',             status: 'in_process', published_at: '2026-04-15' },
  { id: 14, code: 'HU-0014', name: 'Rex',      species: 'dog',   breed: 'Pastor Alemán',      age: '4 años',   foundation: 'Refugio San Francisco',  status: 'adopted',    published_at: '2026-02-10' },
  { id: 15, code: 'HU-0015', name: 'Coco',     species: 'dog',   breed: 'Mestizo',            age: '2 años',   foundation: 'Animales del Valle',     status: 'adopted',    published_at: '2026-02-15' },
  { id: 16, code: 'HU-0016', name: 'Kitty',    species: 'cat',   breed: 'Angora',             age: '3 años',   foundation: 'Rescate Antioquia',      status: 'adopted',    published_at: '2026-02-20' },
  { id: 17, code: 'HU-0017', name: 'Thor',     species: 'dog',   breed: 'Rottweiler',         age: '5 años',   foundation: 'Patas y Colitas',        status: 'adopted',    published_at: '2026-03-01' },
  { id: 18, code: 'HU-0018', name: 'Milo',     species: 'cat',   breed: 'Mestizo',            age: '1 año',    foundation: 'Animal SOS',             status: 'adopted',    published_at: '2026-03-05' },
  { id: 19, code: 'HU-0019', name: 'Daisy',    species: 'dog',   breed: 'Chihuahua',          age: '2 años',   foundation: 'Fundación Pelaje',       status: 'adopted',    published_at: '2026-03-10' },
  { id: 20, code: 'HU-0020', name: 'Spike',    species: 'dog',   breed: 'Mestizo',            age: '3 años',   foundation: 'Huellitas del Pacífico', status: 'suspended',  published_at: '2026-03-15' },
  { id: 21, code: 'HU-0021', name: 'Whiskers', species: 'cat',   breed: 'Mestizo',            age: '4 años',   foundation: 'Patas y Colitas',        status: 'suspended',  published_at: '2026-03-18' },
  { id: 22, code: 'HU-0022', name: 'Bugs',     species: 'other', breed: 'Conejo',             age: '1 año',    foundation: 'Animal SOS',             status: 'available',  published_at: '2026-04-20' },
  { id: 23, code: 'HU-0023', name: 'Tweety',   species: 'other', breed: 'Pájaro',             age: '2 años',   foundation: 'Colitas Felices',        status: 'available',  published_at: '2026-04-22' },
  { id: 24, code: 'HU-0024', name: 'Kira',     species: 'dog',   breed: 'Shih Tzu',           age: '1 año',    foundation: 'Fundación Vida Animal',  status: 'available',  published_at: '2026-04-25' },
  { id: 25, code: 'HU-0025', name: 'Pelusa',   species: 'cat',   breed: 'Maine Coon',         age: '6 meses',  foundation: 'Rescate Antioquia',      status: 'available',  published_at: '2026-04-26' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE   = 7;
const FOUNDATIONS = [...new Set(INITIAL.map(p => p.foundation))].sort();

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

function SpeciesBadge({ species }: { species: Species }) {
  return <Pill {...SPECIES_PILL[species]} />;
}

function StatusBadge({ status }: { status: PetStatus }) {
  return <Pill {...STATUS_PILL[status]} />;
}

// ─── PetModal ──────────────────────────────────────────────────────────────────

function PetModal({
  pet,
  open,
  onClose,
  onToggle,
}: {
  pet:      AdminPet | null;
  open:     boolean;
  onClose:  () => void;
  onToggle: () => void;
}) {
  if (!pet) return null;

  const canToggle   = pet.status !== 'adopted';
  const isSuspended = pet.status === 'suspended';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        {/* Header */}
        <div className="bg-stone-50 px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${AVATAR_BG[pet.species]}`}>
              <PawPrint className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base text-stone-900 leading-snug">{pet.name}</DialogTitle>
              <DialogDescription className="sr-only">Detalles de la mascota</DialogDescription>
              <div className="mt-1.5 flex items-center gap-2">
                <SpeciesBadge species={pet.species} />
                <StatusBadge status={pet.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Código</p>
            <p className="text-sm text-stone-700 font-mono">{pet.code}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Raza</p>
            <p className="text-sm text-stone-700">{pet.breed}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Edad</p>
            <p className="text-sm text-stone-700">{pet.age}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Fundación</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {pet.foundation}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Publicada</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {formatDate(pet.published_at, 'long')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          {canToggle ? (
            <DialogClose asChild>
              <Button
                size="sm"
                onClick={onToggle}
                className={isSuspended
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                }
              >
                <Power className="w-3.5 h-3.5 mr-1" />
                {isSuspended ? 'Reactivar publicación' : 'Suspender publicación'}
              </Button>
            </DialogClose>
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
  const [pets, setPets]                         = useState<AdminPet[]>(INITIAL);
  const [search, setSearch]                     = useState('');
  const [speciesFilter, setSpeciesFilter]       = useState<Species | 'all'>('all');
  const [statusFilter, setStatusFilter]         = useState<PetStatus | 'all'>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [selected, setSelected]                 = useState<AdminPet | null>(null);
  const [page, setPage]                         = useState(1);

  const filtered = pets.filter(p => {
    const matchesSearch     = p.code.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies    = speciesFilter === 'all' || p.species === speciesFilter;
    const matchesStatus     = statusFilter === 'all' || p.status === statusFilter;
    const matchesFoundation = foundationFilter === 'all' || p.foundation === foundationFilter;
    return matchesSearch && matchesSpecies && matchesStatus && matchesFoundation;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleStatus(id: number) {
    setPets(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'suspended' ? 'available' : 'suspended' } : p
    ));
    setSelected(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por código (HU-0001)..."
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
            {FOUNDATIONS.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
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
            {paginated.map(p => (
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
                  <SpeciesBadge species={p.species} />
                </TableCell>

                <TableCell className="py-4 hidden md:table-cell">
                  <span className="text-stone-500 text-sm">{p.age}</span>
                </TableCell>

                <TableCell className="py-4 hidden lg:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                    <Building2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    {p.foundation}
                  </span>
                </TableCell>

                <TableCell className="py-4 hidden md:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    {formatDate(p.published_at)}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <StatusBadge status={p.status} />
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

      <PetModal
        pet={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onToggle={() => selected && toggleStatus(selected.id)}
      />

    </div>
  );
}
