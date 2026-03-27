import apiClient from '../../../shared/lib/apiClient';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient
      .post<{ user: AuthUser; token: string }>('/auth/login', payload)
      .then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient
      .post<{ user: AuthUser; token: string }>('/auth/register', payload)
      .then((r) => r.data),

  me: () =>
    apiClient.get<AuthUser>('/auth/me').then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),
};
