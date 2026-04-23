import { useState } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavId = 'browse' | 'apply' | 'track' | 'schedule' | 'requirements' | 'contact';

const ADOPTION_ITEMS: { id: NavId; icon: typeof PawPrint; label: string }[] = [
  { id: 'browse',   icon: Search,       label: 'Ver animales disponibles' },
  { id: 'apply',    icon: FileText,     label: 'Solicitar adopción'       },
  { id: 'track',    icon: Clock,        label: 'Estado de mi solicitud'   },
  { id: 'schedule', icon: CalendarDays, label: 'Agendar un encuentro'     },
];

const RESOURCE_ITEMS: { id: NavId; icon: typeof PawPrint; label: string }[] = [
  { id: 'requirements', icon: ClipboardList, label: 'Requisitos de adopción' },
  { id: 'contact',      icon: MessageCircle, label: 'Contactar a un agente'  },
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

// ─── NavSection ────────────────────────────────────────────────────────────────

interface NavSectionProps {
  label: string;
  items: { id: NavId; icon: typeof PawPrint; label: string }[];
  activeNav: NavId;
  onSelect: (id: NavId) => void;
  defaultOpen?: boolean;
}

function NavSection({ label, items, activeNav, onSelect, defaultOpen = true }: NavSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/section">
      <SidebarGroup className="p-0">
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="px-2 mb-1 h-auto py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50 cursor-pointer select-none flex items-center justify-between hover:text-sidebar-foreground/70 transition-colors w-full">
            {label}
            <ChevronDown
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/section:rotate-180"
              strokeWidth={2}
            />
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ id, icon: Icon, label: itemLabel }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={activeNav === id}
                    onClick={() => onSelect(id)}
                    aria-current={activeNav === id ? 'page' : undefined}
                    className="h-10 px-3 gap-3 rounded-lg text-[13px]"
                  >
                    <Icon className="!w-[18px] !h-[18px] shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{itemLabel}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CitizenSidebar() {
  const [activeNav, setActiveNav] = useState<NavId>('browse');
  const { user, logout } = useAuth();

  const initials = user ? getInitials(user.full_name) : '--';
  const displayName = user?.full_name ?? 'Invitado';

  return (
    <Sidebar
      collapsible="none"
      className="border-r border-sidebar-border overflow-hidden"
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <SidebarHeader className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary shrink-0">
            <PawPrint className="w-5 h-5 text-sidebar-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground tracking-tight leading-none">
            Huellitas
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3 overflow-hidden">

        <NavSection label="Adopciones" items={ADOPTION_ITEMS} activeNav={activeNav} onSelect={setActiveNav} defaultOpen />

        <SidebarSeparator className="my-3" />

        <NavSection label="Recursos" items={RESOURCE_ITEMS} activeNav={activeNav} onSelect={setActiveNav} defaultOpen />

      </SidebarContent>

      {/* ── User profile footer ────────────────────────────────────────────── */}
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 select-none"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>

                  {/* Name + role */}
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
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={8}
                className="w-56"
              >
                {/* User info header */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-2 py-2">
                    <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 select-none">
                      {initials}
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
                  <DropdownMenuItem>
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
                  onClick={logout}
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
  );
}
