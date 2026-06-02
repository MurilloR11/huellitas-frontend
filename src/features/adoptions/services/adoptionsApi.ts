import apiClient from '../../../shared/lib/apiClient';
import type { AdoptionRequest, CreateAdoptionPayload } from '../types';

export const adoptionsApi = {
  create: (payload: CreateAdoptionPayload) =>
    apiClient.post<AdoptionRequest>('/adoptions', payload).then((r) => r.data),

  myAdoptions: () =>
    apiClient.get<AdoptionRequest[]>('/adoptions/mine').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<AdoptionRequest>(`/adoptions/${id}`).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    apiClient.patch<AdoptionRequest>(`/adoptions/${id}/status`, { status }).then((r) => r.data),

  scheduleVisit: (adoptionId: number, scheduledAt: string) =>
    apiClient
      .post<AdoptionRequest>(`/adoptions/${adoptionId}/schedule`, { scheduled_at: scheduledAt })
      .then((r) => r.data),
};
