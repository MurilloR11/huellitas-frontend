import apiClient from '../../../shared/lib/apiClient';

export const securityApi = {
  async generateBackupCodes(): Promise<string[]> {
    const { data } = await apiClient.post<{ codes: string[] }>('/auth/backup-codes/generate');
    return data.codes;
  },

  async regenerateBackupCodes(): Promise<string[]> {
    const { data } = await apiClient.post<{ codes: string[] }>('/auth/backup-codes/regenerate');
    return data.codes;
  },

  async getBackupCodesStatus(): Promise<{ total: number; remaining: number }> {
    const { data } = await apiClient.get<{ total: number; remaining: number }>('/auth/backup-codes/status');
    return data;
  },

  async verifyBackupCode(code: string): Promise<void> {
    await apiClient.post('/auth/backup-codes/verify', { code });
  },

  async generateAccessKey(): Promise<string> {
    const { data } = await apiClient.post<{ key: string }>('/auth/access-key/generate');
    return data.key;
  },

  async getAccessKeyStatus(): Promise<{ has_key: boolean; created_at: string | null }> {
    const { data } = await apiClient.get<{ has_key: boolean; created_at: string | null }>('/auth/access-key/status');
    return data;
  },

  async revokeAccessKey(): Promise<void> {
    await apiClient.delete('/auth/access-key');
  },

  async loginWithAccessKey(user_id: string, key: string): Promise<{ hashed_token: string }> {
    const { data } = await apiClient.post<{ hashed_token: string }>('/auth/access-key/login', { user_id, key });
    return data;
  },
};
