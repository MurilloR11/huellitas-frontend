import apiClient from '../../../shared/lib/apiClient';
import type { Foundation } from '../types';
import type { PaginatedResponse } from '../../../shared/types';

export const foundationsApi = {
  list: (params?: { city?: string; page?: number }) =>
    apiClient
      .get<PaginatedResponse<Foundation>>('/foundations', { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Foundation>(`/foundations/${id}`).then((r) => r.data),
};
