import apiClient from '../../../shared/lib/apiClient';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  active: boolean;
}

export interface CreatedApiKey extends ApiKey {
  key: string;
}

export interface StatsData {
  daily: { date: string; calls: number; errors: number }[];
  total_calls_7d: number;
  total_calls_all: number;
  total_errors_7d: number;
  errors_by_code: { '404': number; '429': number; '5xx': number };
  recent_errors: {
    id: number;
    status: number;
    method: string;
    path: string;
    key_name: string;
    created_at: string;
  }[];
}

export const developerApi = {
  listKeys: () =>
    apiClient.get<{ data: ApiKey[] }>('/developer/keys').then((r) => r.data.data),

  createKey: (name: string) =>
    apiClient.post<CreatedApiKey>('/developer/keys', { name }).then((r) => r.data),

  revokeKey: (id: string) =>
    apiClient.delete(`/developer/keys/${id}`).then((r) => r.data),

  getStats: () =>
    apiClient.get<StatsData>('/developer/stats').then((r) => r.data),
};
