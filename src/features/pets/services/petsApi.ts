import apiClient from '../../../shared/lib/apiClient';
import type { Pet, SearchFilters } from '../types';
import type { CreatePetPayload } from '../../foundations/types';
import type { PaginatedResponse } from '../../../shared/types';

export const petsApi = {
  list: (filters: SearchFilters) =>
    apiClient
      .get<PaginatedResponse<Pet>>('/pets', { params: filters })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Pet>(`/pets/${id}`).then((r) => r.data),

  getByCode: (code: string) =>
    apiClient.get<Pet>(`/pets/by-code/${code}`).then((r) => r.data),

  create: (payload: CreatePetPayload) =>
    apiClient.post<Pet>('/pets', payload).then((r) => r.data),

  uploadPhoto: (petId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<{ url: string }>(`/pets/${petId}/photos`, form, {
        headers: { 'Content-Type': undefined },
      })
      .then((r) => r.data);
  },
};
