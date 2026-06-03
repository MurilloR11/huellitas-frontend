import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { developerApi } from '../services/developerApi';

export function useStats() {
  return useQuery({
    queryKey: ['developer', 'stats'],
    queryFn: developerApi.getStats,
    refetchInterval: 5_000,
  });
}

const KEYS_QK = ['developer', 'keys'] as const;

export function useApiKeys() {
  return useQuery({
    queryKey: KEYS_QK,
    queryFn: developerApi.listKeys,
  });
}

export function useCreateKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => developerApi.createKey(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS_QK }),
  });
}

export function useRevokeKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => developerApi.revokeKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS_QK }),
  });
}
