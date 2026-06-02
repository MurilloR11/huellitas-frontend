import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Subscribes to Supabase Realtime changes on a table and invalidates React Query
 * cache keys when any row is inserted, updated, or deleted.
 *
 * Requires the table to have Realtime enabled in the Supabase dashboard:
 *   Database → Replication → Tables → toggle the table on.
 */
export function useRealtimeTable(
  table: string,
  queryKeys: QueryKey[],
  enabled = true,
) {
  const queryClient = useQueryClient();
  // Keep queryKeys stable without needing them as a dep — they won't change at runtime
  const keysRef = useRef(queryKeys);
  keysRef.current = queryKeys;

  useEffect(() => {
    if (!enabled) return;

    // Unique channel name so multiple calls with the same table don't share a channel
    const channelId = `${table}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          keysRef.current.forEach(key =>
            queryClient.invalidateQueries({ queryKey: key as string[] }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled, queryClient]);
}
