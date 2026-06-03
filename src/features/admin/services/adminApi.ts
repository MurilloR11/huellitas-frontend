import apiClient from '../../../shared/lib/apiClient';
import type { PaginatedResponse } from '../../../shared/types';

export interface AdminStats {
  available: number;
  in_process: number;
  adopted: number;
  total_pets: number;
  dogs: number;
  cats: number;
  other: number;
  foundations: number;
  adoption_trend: { mes: string; adopciones: number }[];
}

export type FoundationStatus = 'approved' | 'pending' | 'rejected';

export type UserRole   = 'ciudadano' | 'fundacion' | 'admin' | 'developer';
export type UserStatus = 'active' | 'inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login: string | null;
}

export type Species   = 'dog' | 'cat' | 'other';
export type PetStatus = 'available' | 'in_process' | 'adopted' | 'suspended';

export interface AdminPet {
  id:              number;
  code:            string;
  name:            string;
  species:         Species;
  breed:           string;
  age_months:      number | null;
  foundation_name: string;
  foundation_id:   string;
  status:          PetStatus;
  created_at:      string;
}

export type RequestStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface AdminAdoption {
  id:              number;
  code:            string;
  requester_name:  string;
  requester_email: string;
  requester_phone: string;
  requester_city:  string;
  pet_id:          number | null;
  pet_code:        string;
  pet_name:        string;
  pet_species:     Species;
  foundation_name: string;
  status:          RequestStatus;
  created_at:      string;
  updated_at:      string | null;
  visit_at:        string | null;
}

export interface AdminFoundation {
  id: string;
  name: string;
  city: string;
  contact_email: string;
  active_pets_count: number;
  adopted_pets_count: number;
  created_at: string;
  status: FoundationStatus;
}

export const adminApi = {
  getStats: () =>
    apiClient.get<AdminStats>('/admin/stats').then((r) => r.data),

  listFoundations: (status: FoundationStatus | 'all', page: number) =>
    apiClient
      .get<PaginatedResponse<AdminFoundation>>('/admin/foundations', { params: { status, page } })
      .then((r) => r.data),

  approveFoundation: (id: string) =>
    apiClient.post(`/foundations/${id}/approve`).then((r) => r.data),

  rejectFoundation: (id: string, rejection_reason: string) =>
    apiClient.post(`/foundations/${id}/reject`, { rejection_reason }).then((r) => r.data),

  listUsers: (search: string) =>
    apiClient
      .get<{ data: AdminUser[]; total: number }>('/admin/users', { params: { search } })
      .then((r) => r.data),

  banUser: (id: string) =>
    apiClient.post(`/admin/users/${id}/ban`).then((r) => r.data),

  unbanUser: (id: string) =>
    apiClient.post(`/admin/users/${id}/unban`).then((r) => r.data),

  listAdoptions: () =>
    apiClient
      .get<{ data: AdminAdoption[]; total: number }>('/admin/adoptions')
      .then((r) => r.data),

  cancelAdoption: (id: number) =>
    apiClient.post(`/admin/adoptions/${id}/cancel`).then((r) => r.data),

  listPets: () =>
    apiClient
      .get<{ data: AdminPet[]; total: number }>('/admin/pets')
      .then((r) => r.data),

  suspendPet: (id: number) =>
    apiClient.post(`/admin/pets/${id}/suspend`).then((r) => r.data),

  unsuspendPet: (id: number) =>
    apiClient.post(`/admin/pets/${id}/unsuspend`).then((r) => r.data),
};
