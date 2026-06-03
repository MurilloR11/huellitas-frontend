import { Bell, PawPrint, HeartHandshake, RefreshCw, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../hooks/useNotifications';

// ─── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: typeof Bell; color: string; bg: string }
> = {
  new_pet: {
    icon: PawPrint,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  new_adoption_request: {
    icon: HeartHandshake,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  adoption_status_changed: {
    icon: RefreshCw,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBody(body: string): string {
  return body.replace(/\*\*(.*?)\*\*/g, '$1');
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'hace un momento';
  if (mins < 60)  return `hace ${mins} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days < 7)   return `hace ${days} día${days !== 1 ? 's' : ''}`;
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-stone-100 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-stone-100 rounded-md w-3/4" />
        <div className="h-3 bg-stone-100 rounded-md w-full" />
        <div className="h-3 bg-stone-100 rounded-md w-1/4" />
      </div>
    </div>
  );
}

// ─── Notification Row ──────────────────────────────────────────────────────────

function NotificationRow({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const config = TYPE_CONFIG[notification.type] ?? {
    icon: Bell,
    color: 'text-zinc-500',
    bg: 'bg-zinc-50',
  };
  const Icon = config.icon;

  return (
    <li
      className={cn(
        'flex items-start gap-4 px-5 py-4 transition-colors cursor-default',
        'border-b border-stone-100 last:border-0',
        !notification.read && 'bg-blue-50/40',
      )}
      onClick={() => { if (!notification.read) onRead(notification.id); }}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
        <Icon className={cn('w-4.5 h-4.5', config.color)} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm leading-snug text-stone-900', !notification.read && 'font-semibold')}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-label="No leída" />
          )}
        </div>

        <p className="mt-0.5 text-sm text-stone-500 leading-relaxed">
          {formatBody(notification.body)}
        </p>

        <p className="mt-1.5 text-xs text-stone-400">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </li>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
        <Bell className="w-7 h-7 text-stone-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-stone-700">Sin notificaciones</p>
      <p className="mt-1 text-sm text-stone-400 max-w-xs">
        Cuando haya actualizaciones sobre mascotas o solicitudes de adopción, aparecerán aquí.
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-stone-400">
              {unreadCount} sin leer
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <ul>
            {Array.from({ length: 4 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </ul>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <ul>
            {notifications.map(n => (
              <NotificationRow key={n.id} notification={n} onRead={markRead} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
