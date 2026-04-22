import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabaseClient';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types';

function mapError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
  if (message.includes('Email not confirmed')) return 'Debes confirmar tu correo electrónico';
  if (message.includes('User already registered')) return 'Ya existe una cuenta con este correo';
  if (message.includes('Password should be')) return 'La contraseña no cumple los requisitos mínimos';
  return 'Ocurrió un error inesperado. Inténtalo de nuevo';
}

export function buildAuthUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: meta.full_name ?? '',
    role: meta.role ?? 'ciudadano',
    status: meta.status,
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw new Error(mapError(error.message));
    return buildAuthUser(data.user);
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.full_name,
          role: payload.role,
          ...(payload.municipio ? { municipio: payload.municipio } : {}),
          ...(payload.phone ? { phone: payload.phone } : {}),
          ...(payload.role === 'fundacion' ? { status: 'pending' } : {}),
        },
      },
    });
    if (error) throw new Error(mapError(error.message));
    if (!data.user) throw new Error('No se pudo crear la cuenta');
    const user = buildAuthUser(data.user);
    // signUp creates a session automatically — sign out so the user
    // must log in manually with their credentials.
    await supabase.auth.signOut();
    return user;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async me(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? buildAuthUser(user) : null;
  },
};
