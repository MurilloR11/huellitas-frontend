import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabaseClient';
import apiClient from '../../../shared/lib/apiClient';
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
    avatar_url: meta.avatar_url,
    phone: meta.phone,
    municipio: meta.municipio,
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw new Error(mapError(error.message));
    const supabaseProfile = buildAuthUser(user!);
    const { data: backendProfile } = await apiClient.get<AuthUser>('/auth/me');
    apiClient.post('/auth/activity', { action: 'login' }).catch(() => {});
    return { ...supabaseProfile, role: backendProfile.role, status: backendProfile.status };
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
          ...(payload.role === 'fundacion'
            ? { org_name: payload.full_name, status: 'pending' }
            : {}),
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

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const path = `${userId}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw new Error(`Error al subir la imagen: ${uploadError.message}`);

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl },
    });

    if (updateError) throw new Error(`Error al actualizar el perfil: ${updateError.message}`);

    return data.publicUrl;
  },

  async updateProfile(data: { full_name?: string; phone?: string; municipio?: string }): Promise<AuthUser> {
    const { data: updated, error } = await supabase.auth.updateUser({ data });
    if (error) throw new Error('No se pudo actualizar el perfil');
    if (!updated.user) throw new Error('No se pudo actualizar el perfil');
    // Build from Supabase (source of truth for metadata fields)
    const supabaseProfile = buildAuthUser(updated.user);
    try {
      const { data: backendProfile } = await apiClient.get<AuthUser>('/auth/me');
      return { ...supabaseProfile, role: backendProfile.role, status: backendProfile.status };
    } catch {
      return supabaseProfile;
    }
  },

  async logout(): Promise<void> {
    // Log before signOut so the JWT is still valid for the request
    await apiClient.post('/auth/activity', { action: 'logout' }).catch(() => {});
    await supabase.auth.signOut();
  },

  async enrollMFA(): Promise<{ factorId: string; qrCode: string; secret: string }> {
    // Ask the backend to clean up pending factors via the Supabase Admin API.
    // The JS SDK cannot see factors created in previous sessions, so we rely on the backend.
    await apiClient.delete('/auth/mfa/pending');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error || !data) throw new Error(error?.message ?? 'No se pudo iniciar la activación de MFA');
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  },

  async verifyMFAEnrollment(factorId: string, code: string): Promise<void> {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) throw new Error('Código incorrecto. Intenta de nuevo.');
  },

  async unenrollMFA(factorId: string): Promise<void> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw new Error('No se pudo desactivar MFA');
  },

  async listMFAFactors(): Promise<Array<{ id: string; status: string }>> {
    // Use the backend admin API for reliable server-side factor data.
    const { data } = await apiClient.get<{ id: string | null }>('/auth/mfa/factor');
    if (!data?.id) return [];
    return [{ id: data.id, status: 'verified' }];
  },

  async getMFAStatus(): Promise<{ required: boolean; factorId: string | null }> {
    // Use the backend admin API directly — getAuthenticatorAssuranceLevel() parses
    // the JWT and misses factors enrolled in previous sessions.
    const { data } = await apiClient.get<{ id: string | null }>('/auth/mfa/factor');
    if (data?.id) return { required: true, factorId: data.id };
    return { required: false, factorId: null };
  },

  async completeMFAChallenge(factorId: string, code: string): Promise<void> {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) throw new Error('Código incorrecto. Intenta de nuevo.');
  },

  async me(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await apiClient.get<AuthUser>('/auth/me');
    return profile;
  },
};
