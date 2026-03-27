import apiClient from '../../../shared/lib/apiClient';
import type { AdoptionRequest, CreateAdoptionPayload } from '../types';

export const adoptionsApi = {
  create: (payload: CreateAdoptionPayload) =>
    apiClient.post<AdoptionRequest>('/adoptions', payload).then((r) => r.data),

  myAdoptions: () =>
    apiClient.get<AdoptionRequest[]>('/adoptions/mine').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<AdoptionRequest>(`/adoptions/${id}`).then((r) => r.data),
};
