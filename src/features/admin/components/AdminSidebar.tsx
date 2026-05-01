import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  PawPrint,
  ClipboardList,
  LogOut,
  PanelLeft,
  ChevronRight,
  X,
  ChevronsUpDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavItem = { icon: typeof PawPrint; label: string; path: string };

const GESTION_ITEMS: NavItem[] = [
  { icon: Building2,     label: 'Fundaciones', path: '/admin/fundaciones' },
  { icon: Users,         label: 'Usuarios',    path: '/admin/usuarios'    },
];

const PLATAFORMA_ITEMS: NavItem[] = [
  { icon: PawPrint,      label: 'Mascotas',    path: '/admin/mascotas'    },
  { icon: ClipboardList, label: 'Solicitudes', path: '/admin/solicitudes' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

// ─── NavSection ────────────────────────────────────────────────────────────────

interface NavSectionProps {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  defaultOpen?: boolean;
}

function NavSection({ label, items, collapsed, defaultOpen = true }: NavSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const location = useLocation();
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <>
        {items.map(({ icon: Icon, label: itemLabel, path }) => (
          <SidebarMenuItem key={path}>
            <button
              type="button"
              onClick={() => navigate(path)}
              title={itemLabel}
              aria-current={location.pathname.startsWith(path) ? 'page' : undefined}
              className={cn(
                'flex w-full items-center justify-center rounded-lg p-2.5',
                'text-sidebar-foreground/70 transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                location.pathname.startsWith(path) && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} />
            </button>
          </SidebarMenuItem>
        ))}
      </>
    );
  }

  return (
    <SidebarMenuItem className="w-full overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-3 text-[13px] text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        <span className="flex-1 min-w-0 truncate font-medium">{label}</span>
        <ChevronRight
          className={cn(
            'w-4 h-4 shrink-0 text-sidebar-foreground/40 transition-transform duration-200',
            open && 'rotate-90',
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 overflow-hidden border-l border-sidebar-border pl-3">
          {items.map(({ icon: Icon, label: itemLabel, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex w-full overflow-hidden items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-left',
                  'text-sidebar-foreground/70 transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  active && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                )}
              >
                <Icon className="w-3.75 h-3.75 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 truncate">{itemLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </SidebarMenuItem>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isMobile = useIsMobile();

  const effectiveCollapsed = collapsed && !isMobile;

  const displayName = user?.full_name ?? 'Admin';
  const initials = getInitials(user?.full_name ?? '') || 'AD';
  const avatarEl = user?.avatar_url
    ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
    : initials;

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsible="none"
        className={cn(
          'border-r border-sidebar-border overflow-hidden shrink-0',
          'md:transition-[width,min-width,max-width] md:duration-300 md:ease-in-out',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-2xl',
          'max-md:transition-transform max-md:duration-300 max-md:ease-in-out',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
        style={{
          width:    effectiveCollapsed ? '3.5rem' : 'var(--sidebar-width)',
          minWidth: effectiveCollapsed ? '3.5rem' : 'var(--sidebar-width)',
          maxWidth: effectiveCollapsed ? '3.5rem' : 'var(--sidebar-width)',
        }}
      >
        {/* ── Logo ──────────────────────────────────────────────────────────── */}
        <SidebarHeader className={cn('py-3', effectiveCollapsed ? 'px-1.5' : 'px-4')}>
          <div className="flex items-center gap-3">
            {!effectiveCollapsed && (
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary shrink-0">
                <PawPrint className="w-5 h-5 text-sidebar-primary-foreground" strokeWidth={2} />
              </div>
            )}

            {!effectiveCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground tracking-tight leading-none flex-1">
                Panel Admin
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                'h-8 w-8 shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                'max-md:hidden',
                effectiveCollapsed && 'mx-auto',
              )}
              aria-label={effectiveCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <PanelLeft
                className={cn('h-4 w-4 transition-transform duration-300', effectiveCollapsed && 'rotate-180')}
              />
            </Button>

            {isMobile && (
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Cerrar menú"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0 ml-auto"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        {/* ── Nav ───────────────────────────────────────────────────────────── */}
        <SidebarContent className={cn('py-3', effectiveCollapsed ? 'px-1.5' : 'px-2')} style={{ overflow: 'hidden' }}>
          <SidebarMenu>

            {/* Resumen */}
            <SidebarMenuItem>
              {effectiveCollapsed ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  title="Resumen"
                  aria-current={location.pathname === '/admin' ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg p-2.5',
                    'text-sidebar-foreground/70 transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    location.pathname === '/admin' && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  )}
                >
                  <LayoutDashboard className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} />
                </button>
              ) : (
                <SidebarMenuButton
                  isActive={location.pathname === '/admin'}
                  onClick={() => navigate('/admin')}
                  aria-current={location.pathname === '/admin' ? 'page' : undefined}
                  className="h-10 px-3 gap-3 rounded-lg text-[13px]"
                >
                  <LayoutDashboard className="w-4.5! h-4.5! shrink-0" strokeWidth={1.75} />
                  <span className="truncate">Resumen</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>

            {!effectiveCollapsed && (
              <li role="separator" aria-hidden="true" className="mx-2 my-1.5 h-px bg-sidebar-border list-none" />
            )}

            <NavSection
              label="Gestión"
              items={GESTION_ITEMS}
              collapsed={effectiveCollapsed}
            />

            {!effectiveCollapsed && (
              <li role="separator" aria-hidden="true" className="mx-2 my-1.5 h-px bg-sidebar-border list-none" />
            )}

            <NavSection
              label="Plataforma"
              items={PLATAFORMA_ITEMS}
              collapsed={effectiveCollapsed}
            />

          </SidebarMenu>
        </SidebarContent>

        {/* ── User profile footer ────────────────────────────────────────────── */}
        <SidebarFooter className={cn('border-t border-sidebar-border', effectiveCollapsed ? 'p-1.5' : 'p-2')}>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {effectiveCollapsed ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-center rounded-lg p-1.5 hover:bg-sidebar-accent transition-colors"
                      aria-label={displayName}
                    >
                      <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 select-none overflow-hidden">
                        {avatarEl}
                      </div>
                    </button>
                  ) : (
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 select-none overflow-hidden">
                        {avatarEl}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">
                          {displayName}
                        </p>
                        <p className="text-xs font-semibold text-sidebar-foreground/50 leading-tight truncate mt-0.5">
                          Administrador
                        </p>
                      </div>
                      <ChevronsUpDown className="ml-auto w-4 h-4 text-sidebar-foreground/40 shrink-0" />
                    </SidebarMenuButton>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent side={isMobile ? 'top' : 'right'} align="end" sideOffset={8} className="w-56">
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2.5 px-2 py-2">
                      <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 select-none overflow-hidden">
                        {avatarEl}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight truncate">
                          {displayName}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground leading-tight truncate mt-0.5">
                          Administrador
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setLogoutOpen(true)}
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
          <div className="px-6 pt-5 pb-4">
            <AlertDialogTitle className="text-base font-semibold text-foreground">
              ¿Cerrar sesión?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Tu sesión de administrador se cerrará. Tendrás que volver a iniciar sesión para continuar.
            </AlertDialogDescription>
          </div>
          <div className="flex items-center justify-between gap-2 px-6 py-4 bg-muted/40 border-t border-border">
            <AlertDialogAction
              className="h-9 px-4 text-sm rounded-lg bg-destructive text-white hover:bg-destructive/90 shadow-sm"
              onClick={logout}
            >
              Cerrar sesión
            </AlertDialogAction>
            <AlertDialogCancel className="h-9 px-4 text-sm rounded-lg border border-border bg-white hover:bg-muted/60 text-foreground">
              Cancelar
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
