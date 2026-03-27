import apiClient from '../../../shared/lib/apiClient';
import type { Pet, SearchFilters } from '../types';
import type { PaginatedResponse } from '../../../shared/types';

export const petsApi = {
  list: (filters: SearchFilters) =>
    apiClient
      .get<PaginatedResponse<Pet>>('/pets', { params: filters })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Pet>(`/pets/${id}`).then((r) => r.data),
};
