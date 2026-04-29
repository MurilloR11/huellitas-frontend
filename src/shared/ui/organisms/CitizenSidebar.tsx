import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PawPrint,
  Search,
  FileText,
  Clock,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  ChevronsUpDown,
  UserRound,
  Bell,
  LogOut,
  ChevronRight,
  PanelLeft,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type NavId = 'browse' | 'apply' | 'track' | 'schedule' | 'requirements' | 'contact';

const ADOPTION_ITEMS: { id: NavId; icon: typeof PawPrint; label: string }[] = [
  { id: 'requirements', icon: ClipboardList, label: 'Requisitos de adopción' },
  { id: 'apply',        icon: FileText,      label: 'Solicitar adopción'     },
  { id: 'track',        icon: Clock,         label: 'Estado de mi solicitud' },
  { id: 'schedule',     icon: CalendarDays,  label: 'Agendar un encuentro'   },
];

const RESOURCE_ITEMS: { id: NavId; icon: typeof PawPrint; label: string }[] = [
  { id: 'contact', icon: MessageCircle, label: 'Contactar a un agente' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
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
  items: { id: NavId; icon: typeof PawPrint; label: string }[];
  activeNav: NavId;
  onSelect: (id: NavId) => void;
  defaultOpen?: boolean;
  collapsed: boolean;
}

function NavSection({ label, items, activeNav, onSelect, defaultOpen = false, collapsed }: NavSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (collapsed) {
    return (
      <>
        {items.map(({ id, icon: Icon, label: itemLabel }) => (
          <SidebarMenuItem key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              aria-current={activeNav === id ? 'page' : undefined}
              title={itemLabel}
              className={cn(
                'flex w-full items-center justify-center rounded-lg p-2.5',
                'text-sidebar-foreground/70 transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                activeNav === id && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
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
        <div className="ml-3 mt-0.5 overflow-hidden flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
          {items.map(({ id, icon: Icon, label: itemLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={activeNav === id ? 'page' : undefined}
              className={cn(
                'flex w-full overflow-hidden items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-left',
                'text-sidebar-foreground/70 transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                activeNav === id && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
              )}
            >
              <Icon className="w-[15px] h-[15px] shrink-0" strokeWidth={1.75} />
              <span className="min-w-0 truncate">{itemLabel}</span>
            </button>
          ))}
        </div>
      )}
    </SidebarMenuItem>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface CitizenSidebarProps {
  activeNav: NavId;
  onNavChange: (id: NavId) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function CitizenSidebar({ activeNav, onNavChange, collapsed, onToggle, mobileOpen = false, onMobileClose }: CitizenSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isMobile = useIsMobile();
  const effectiveCollapsed = collapsed && !isMobile;
  const handleNavChange = (id: NavId) => { onNavChange(id); if (isMobile) onMobileClose?.(); };

  const initials = user ? getInitials(user.full_name) : '--';
  const displayName = user?.full_name ?? 'Invitado';

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
              Huellitas
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

          {/* Browse */}
          <SidebarMenuItem>
            {effectiveCollapsed ? (
              <button
                type="button"
                onClick={() => handleNavChange('browse')}
                aria-current={activeNav === 'browse' ? 'page' : undefined}
                title="Ver animales disponibles"
                className={cn(
                  'flex w-full items-center justify-center rounded-lg p-2.5',
                  'text-sidebar-foreground/70 transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  activeNav === 'browse' && 'bg-sidebar-accent text-sidebar-accent-foreground',
                )}
              >
                <Search className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
              </button>
            ) : (
              <SidebarMenuButton
                isActive={activeNav === 'browse'}
                onClick={() => handleNavChange('browse')}
                aria-current={activeNav === 'browse' ? 'page' : undefined}
                className="h-10 px-3 gap-3 rounded-lg text-[13px]"
              >
                <Search className="!w-[18px] !h-[18px] shrink-0" strokeWidth={1.75} />
                <span className="truncate">Ver animales disponibles</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>

          <NavSection
            label="Adopciones"
            items={ADOPTION_ITEMS}
            activeNav={activeNav}
            onSelect={handleNavChange}
            collapsed={effectiveCollapsed}
          />

          {!effectiveCollapsed && (
            <li role="separator" aria-hidden="true" className="mx-2 my-1.5 h-px bg-sidebar-border list-none" />
          )}

          <NavSection
            label="Recursos"
            items={RESOURCE_ITEMS}
            activeNav={activeNav}
            onSelect={handleNavChange}
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
                      <p className="text-xs text-sidebar-foreground/50 leading-tight truncate mt-0.5">
                        Adoptante
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
                      <p className="text-xs text-muted-foreground leading-tight truncate mt-0.5">
                        Adoptante
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <UserRound className="w-4 h-4" />
                    Mi cuenta
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="w-4 h-4" />
                    Notificaciones
                  </DropdownMenuItem>
                </DropdownMenuGroup>

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
            Tu sesión actual se cerrará. Tendrás que volver a iniciar sesión para acceder a tu cuenta.
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
