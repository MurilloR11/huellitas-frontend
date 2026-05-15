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
};
