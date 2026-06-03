import { Bell, PawPrint, HeartHandshake, RefreshCw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '@/lib/utils';

function notifTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

const NOTIF_TYPE_CONFIG = {
  new_pet:                 { icon: PawPrint,       bg: 'bg-emerald-100 dark:bg-emerald-950/40', color: 'text-emerald-600 dark:text-emerald-400' },
  new_adoption_request:    { icon: HeartHandshake, bg: 'bg-blue-100 dark:bg-blue-950/40',      color: 'text-blue-600 dark:text-blue-400'      },
  adoption_status_changed: { icon: RefreshCw,      bg: 'bg-orange-100 dark:bg-orange-950/40',  color: 'text-orange-600 dark:text-orange-400'  },
} as const;

interface NotificationsBellProps {
  className?: string;
}

export function NotificationsBell({ className }: NotificationsBellProps) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificaciones"
          className={cn(
            'relative flex items-center justify-center w-9 h-9 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0',
            className,
          )}
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[14px] h-3.5 rounded-full bg-blue-500 text-white text-[9px] font-bold px-1 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[360px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-zinc-800">
          <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Notificaciones</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col divide-y divide-stone-100 dark:divide-zinc-800">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3 bg-stone-100 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-stone-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Bell className="w-8 h-8 text-stone-300 dark:text-zinc-600 mb-2" strokeWidth={1.5} />
              <p className="text-sm font-medium text-stone-500 dark:text-zinc-400">Sin notificaciones</p>
              <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Te avisaremos cuando haya novedades</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-stone-100 dark:divide-zinc-800">
              {notifications.map(n => {
                const cfg = NOTIF_TYPE_CONFIG[n.type as keyof typeof NOTIF_TYPE_CONFIG] ?? NOTIF_TYPE_CONFIG.new_pet;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { if (!n.read) markRead(n.id); }}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800/50',
                      !n.read && 'bg-blue-50/40 dark:bg-blue-950/10',
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('w-4 h-4', cfg.color)} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-stone-800 dark:text-zinc-100 leading-snug">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-zinc-400 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">{notifTimeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
