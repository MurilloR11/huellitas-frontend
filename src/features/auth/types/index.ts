export type Role = 'ciudadano' | 'fundacion' | 'developer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  status?: 'pending' | 'approved' | 'rejected';
  avatar_url?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: Role;
  municipio?: string;
  phone?: string;
}
