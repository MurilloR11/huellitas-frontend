import { useState } from 'react';
import { Mail, Search, Calendar, Clock, Eye, Power, ChevronLeft, ChevronRight } from 'lucide-react';
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

type Role = 'adopter' | 'foundation_admin' | 'developer';
type UserStatus = 'active' | 'inactive';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: string;
  last_login: string;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const INITIAL: AdminUser[] = [
  { id: 1,  name: 'María Fernanda López',    email: 'mflopez@gmail.com',       role: 'adopter',          status: 'active',   created_at: '2025-08-15', last_login: '2026-04-28' },
  { id: 2,  name: 'Carlos Andrés Martínez',  email: 'camartinez@hotmail.com',  role: 'adopter',          status: 'active',   created_at: '2025-09-20', last_login: '2026-04-30' },
  { id: 3,  name: 'Ana Sofía Rodríguez',     email: 'asrodriguez@gmail.com',   role: 'adopter',          status: 'active',   created_at: '2025-10-05', last_login: '2026-05-01' },
  { id: 4,  name: 'Juan Pablo García',       email: 'jpgarcia@outlook.com',    role: 'adopter',          status: 'active',   created_at: '2025-11-12', last_login: '2026-04-25' },
  { id: 5,  name: 'Laura Valentina Torres',  email: 'lvtorres@gmail.com',      role: 'adopter',          status: 'active',   created_at: '2025-12-01', last_login: '2026-04-29' },
  { id: 6,  name: 'Diego Alejandro Herrera', email: 'daherrera@gmail.com',     role: 'adopter',          status: 'active',   created_at: '2026-01-08', last_login: '2026-04-20' },
  { id: 7,  name: 'Camila Andrea Gómez',     email: 'cagomez@gmail.com',       role: 'adopter',          status: 'active',   created_at: '2026-01-22', last_login: '2026-04-15' },
  { id: 8,  name: 'Sebastián Felipe Moreno', email: 'sfmoreno@yahoo.com',      role: 'adopter',          status: 'active',   created_at: '2026-02-10', last_login: '2026-04-10' },
  { id: 9,  name: 'Valeria Daniela Cruz',    email: 'vdcruz@gmail.com',        role: 'adopter',          status: 'active',   created_at: '2026-02-28', last_login: '2026-04-05' },
  { id: 10, name: 'Nicolás Eduardo Ramos',   email: 'neramos@gmail.com',       role: 'adopter',          status: 'active',   created_at: '2026-03-15', last_login: '2026-03-25' },
  { id: 11, name: 'Paula Andrea Nieto',      email: 'panieto@hotmail.com',     role: 'adopter',          status: 'inactive', created_at: '2025-07-20', last_login: '2025-12-15' },
  { id: 12, name: 'Andrés Felipe Castro',    email: 'afcastro@gmail.com',      role: 'adopter',          status: 'inactive', created_at: '2025-06-10', last_login: '2025-11-30' },
  { id: 13, name: 'Roberto Carlos Vargas',   email: 'rcvargas@refugiosf.com',  role: 'foundation_admin', status: 'active',   created_at: '2026-01-10', last_login: '2026-04-30' },
  { id: 14, name: 'Marcela Jimena Soto',     email: 'mjsoto@animalesvalle.com',role: 'foundation_admin', status: 'active',   created_at: '2026-02-05', last_login: '2026-04-28' },
  { id: 15, name: 'Fernando Augusto Díaz',   email: 'fadiaz@patascolitas.com', role: 'foundation_admin', status: 'active',   created_at: '2026-03-01', last_login: '2026-04-25' },
  { id: 16, name: 'Gabriela Esperanza Ruiz', email: 'geruiz@vidaanimal.org',   role: 'foundation_admin', status: 'active',   created_at: '2025-11-14', last_login: '2026-04-27' },
  { id: 17, name: 'Hernando Miguel Peña',    email: 'hmpeña@losandes.com',     role: 'foundation_admin', status: 'inactive', created_at: '2025-12-20', last_login: '2026-02-10' },
  { id: 18, name: 'Santiago Murillo',        email: 'dev@huellitas.com',        role: 'developer',        status: 'active',   created_at: '2025-01-01', last_login: '2026-05-01' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 7;

function formatDate(iso: string, month: 'short' | 'long' = 'short') {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month, year: 'numeric',
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

const ROLE_PILL: Record<Role, { dot: string; text: string; color: string }> = {
  adopter:          { dot: 'bg-blue-400',   text: 'Adoptante',        color: 'text-blue-700 bg-blue-50 border-blue-200'       },
  foundation_admin: { dot: 'bg-violet-400', text: 'Admin. fundación', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  developer:        { dot: 'bg-teal-400',   text: 'Developer',        color: 'text-teal-700 bg-teal-50 border-teal-200'       },
};

const STATUS_PILL: Record<UserStatus, { dot: string; text: string; color: string }> = {
  active:   { dot: 'bg-green-500', text: 'Activo',   color: 'text-green-700 bg-green-50 border-green-200'  },
  inactive: { dot: 'bg-stone-400', text: 'Inactivo', color: 'text-stone-500 bg-stone-100 border-stone-200' },
};

const AVATAR_BG: Record<Role, string> = {
  adopter:          'bg-blue-100 text-blue-700',
  foundation_admin: 'bg-violet-100 text-violet-700',
  developer:        'bg-teal-100 text-teal-700',
};

function RoleBadge({ role }: { role: Role }) {
  return <Pill {...ROLE_PILL[role]} />;
}

function StatusBadge({ status }: { status: UserStatus }) {
  return <Pill {...STATUS_PILL[status]} />;
}

// ─── UserModal ─────────────────────────────────────────────────────────────────

function UserModal({
  user,
  open,
  onClose,
  onToggle,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  if (!user) return null;

  const isActive = user.status === 'active';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        {/* Header */}
        <div className="bg-stone-50 px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-lg font-semibold ${AVATAR_BG[user.role]}`}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base text-stone-900 leading-snug">{user.name}</DialogTitle>
              <DialogDescription className="sr-only">Perfil y detalles del usuario</DialogDescription>
              <div className="mt-1.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-stone-400">Correo electrónico</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {user.email}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Fecha de registro</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {formatDate(user.created_at, 'long')}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-400">Último acceso</p>
            <p className="text-sm text-stone-700 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {formatDate(user.last_login, 'long')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <DialogClose asChild>
            <Button
              size="sm"
              onClick={onToggle}
              className={isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            >
              <Power className="w-3.5 h-3.5 mr-1" />
              {isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
            </Button>
          </DialogClose>
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

// ─── AdminUsersPage ────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers]               = useState<AdminUser[]>(INITIAL);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [selected, setSelected]         = useState<AdminUser | null>(null);
  const [page, setPage]                 = useState(1);

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole   = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleStatus(id: number) {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
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
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v as Role | 'all'); setPage(1); }}>
          <SelectTrigger className="w-48 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="adopter">Adoptantes</SelectItem>
            <SelectItem value="foundation_admin">Admins. fundación</SelectItem>
            <SelectItem value="developer">Developers</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as UserStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
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
                Usuario
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">
                Rol
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">
                Registro
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden lg:table-cell">
                Último acceso
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">
                Estado
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(u => (
              <TableRow key={u.id} className="border-stone-100 hover:bg-stone-50/60">

                <TableCell className="pl-0 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${AVATAR_BG[u.role]}`}>
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800 truncate">{u.name}</p>
                      <p className="text-xs text-stone-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 hidden sm:table-cell">
                  <RoleBadge role={u.role} />
                </TableCell>

                <TableCell className="py-4 hidden md:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    {formatDate(u.created_at)}
                  </span>
                </TableCell>

                <TableCell className="py-4 hidden lg:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Clock className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    {formatDate(u.last_login)}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <StatusBadge status={u.status} />
                </TableCell>

                <TableCell className="py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(u)}
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

      <UserModal
        user={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onToggle={() => selected && toggleStatus(selected.id)}
      />

    </div>
  );
}
