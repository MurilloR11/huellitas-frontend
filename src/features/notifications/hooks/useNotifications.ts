import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRealtimeTable } from '../../../shared/hooks/useRealtimeTable';

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_pet' | 'new_adoption_request' | 'adoption_status_changed';
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

const QUERY_KEY = ['notifications'];

async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as Notification[];
}

async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  });

  useRealtimeTable('notifications', [QUERY_KEY], !!user);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllAsRead(user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
