import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Search, Calendar, Clock, Eye, Power, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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
import { adminApi, type AdminUser, type UserRole, type UserStatus } from '../services/adminApi';
import { supabase } from '@/shared/lib/supabaseClient';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined, month: 'short' | 'long' = 'short') {
  if (!iso) return '—';
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

const ROLE_PILL: Record<UserRole, { dot: string; text: string; color: string }> = {
  ciudadano: { dot: 'bg-blue-400',   text: 'Adoptante',  color: 'text-blue-700 bg-blue-50 border-blue-200'       },
  fundacion: { dot: 'bg-violet-400', text: 'Fundación',  color: 'text-violet-700 bg-violet-50 border-violet-200' },
  admin:     { dot: 'bg-teal-400',   text: 'Admin',      color: 'text-teal-700 bg-teal-50 border-teal-200'       },
  developer: { dot: 'bg-orange-400', text: 'Developer',  color: 'text-orange-700 bg-orange-50 border-orange-200' },
};

const STATUS_PILL: Record<UserStatus, { dot: string; text: string; color: string }> = {
  active:   { dot: 'bg-green-500', text: 'Activo',   color: 'text-green-700 bg-green-50 border-green-200'  },
  inactive: { dot: 'bg-stone-400', text: 'Inactivo', color: 'text-stone-500 bg-stone-100 border-stone-200' },
};

const AVATAR_BG: Record<UserRole, string> = {
  ciudadano: 'bg-blue-100 text-blue-700',
  fundacion: 'bg-violet-100 text-violet-700',
  admin:     'bg-teal-100 text-teal-700',
  developer: 'bg-orange-100 text-orange-700',
};

function UserAvatar({ userId, name, role, size = 'sm' }: { userId: string; name: string; role: UserRole; size?: 'sm' | 'lg' }) {
  const avatarUrl = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar`).data.publicUrl;
  const sizeClass = size === 'lg' ? 'w-14 h-14 rounded-xl text-lg font-semibold' : 'w-8 h-8 rounded-full text-xs font-semibold';
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${sizeClass} ${AVATAR_BG[role]}`}>
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
      <TableCell className="hidden sm:table-cell">
        <div className="h-5 w-24 bg-stone-100 rounded-full animate-pulse" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="h-3.5 w-28 bg-stone-100 rounded animate-pulse" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="h-3.5 w-28 bg-stone-100 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-5 w-16 bg-stone-100 rounded-full animate-pulse" />
      </TableCell>
      <TableCell className="text-right">
        <div className="h-7 w-16 bg-stone-100 rounded animate-pulse ml-auto" />
      </TableCell>
    </TableRow>
  );
}

// ─── UserModal ─────────────────────────────────────────────────────────────────

function UserModal({
  user,
  open,
  onClose,
  isPending,
  onToggle,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onToggle: () => void;
}) {
  if (!user) return null;
  const isActive = user.status === 'active';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        <div className="bg-stone-50 px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <UserAvatar userId={user.id} name={user.name} role={user.role} size="lg" />
            <div className="min-w-0">
              <DialogTitle className="text-base text-stone-900 leading-snug">{user.name}</DialogTitle>
              <DialogDescription className="sr-only">Perfil y detalles del usuario</DialogDescription>
              <div className="mt-1.5">
                <Pill {...ROLE_PILL[user.role]} />
              </div>
            </div>
          </div>
        </div>

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

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <Button
            size="sm"
            disabled={isPending}
            onClick={onToggle}
            className={isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
            }
          >
            <Power className="w-3.5 h-3.5 mr-1" />
            {isPending ? 'Guardando...' : isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
          </Button>
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

const PAGE_SIZE = 15;

// ─── AdminUsersPage ────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [page, setPage]                 = useState(1);
  const [selected, setSelected]         = useState<AdminUser | null>(null);

  // Debounce search — only the server call is debounced
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page when filters or debounced search change
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  // Fetch all matching users for the current search — role/status/page are client-side
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.listUsers(search),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const toggleMutation = useMutation({
    mutationFn: (user: AdminUser) =>
      user.status === 'active' ? adminApi.banUser(user.id) : adminApi.unbanUser(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelected(null);
    },
  });

  // Client-side filter + paginate — instant
  const filtered = useMemo(() => {
    let list = data?.data ?? [];
    if (roleFilter   !== 'all') list = list.filter(u => u.role   === roleFilter);
    if (statusFilter !== 'all') list = list.filter(u => u.status === statusFilter);
    return list;
  }, [data, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const users      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select value={roleFilter} onValueChange={v => setRoleFilter(v as UserRole | 'all')}>
          <SelectTrigger className="w-48 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="ciudadano">Adoptantes</SelectItem>
            <SelectItem value="fundacion">Fundaciones</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="developer">Developers</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as UserStatus | 'all')}>
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

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No se pudo cargar la lista de usuarios.
        </div>
      )}

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      {!isError && (
        <>
          {!isLoading && users.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-stone-400">Sin resultados para los filtros aplicados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-stone-200 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">Usuario</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Rol</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Registro</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden lg:table-cell">Último acceso</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : users.map(u => (
                    <TableRow key={u.id} className="border-stone-100 hover:bg-stone-50/60">

                      <TableCell className="pl-0 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar userId={u.id} name={u.name} role={u.role} />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate">{u.name}</p>
                            <p className="text-xs text-stone-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 hidden sm:table-cell">
                        <Pill {...ROLE_PILL[u.role]} />
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
                        <Pill {...STATUS_PILL[u.status]} />
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
                  ))
                }
              </TableBody>
            </Table>
          )}

          {/* ── Paginación (client-side) ──────────────────────────────── */}
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

      <UserModal
        user={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        isPending={toggleMutation.isPending}
        onToggle={() => selected && toggleMutation.mutate(selected)}
      />

    </div>
  );
}
