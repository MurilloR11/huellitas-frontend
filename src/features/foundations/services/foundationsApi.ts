import apiClient from '../../../shared/lib/apiClient';
import type { Foundation, FoundationAdoption, AvailabilityDay } from '../types';
import type { Pet } from '../../pets/types';
import type { PaginatedResponse } from '../../../shared/types';

export const foundationsApi = {
  list: (params?: { city?: string; page?: number }) =>
    apiClient
      .get<PaginatedResponse<Foundation>>('/foundations', { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Foundation>(`/foundations/${id}`).then((r) => r.data),

  myPets: () =>
    apiClient.get<Pet[]>('/foundations/me/pets').then((r) => r.data),

  myAdoptions: () =>
    apiClient.get<FoundationAdoption[]>('/foundations/me/adoptions').then((r) => r.data),

  setAvailability: (days: AvailabilityDay[]) =>
    apiClient
      .post<{ message: string }>('/foundations/me/availability', { days })
      .then((r) => r.data),

  getAvailability: (foundationId: string | number, fromDate?: string) =>
    apiClient
      .get<AvailabilityDay[]>(`/foundations/${foundationId}/availability`, {
        params: fromDate ? { from_date: fromDate } : undefined,
      })
      .then((r) => r.data),
};
