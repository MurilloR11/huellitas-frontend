import apiClient from '../../../shared/lib/apiClient';
import type { PaginatedResponse } from '../../../shared/types';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'adoption_request'
  | 'adoption_cancelled'
  | 'adoption_status_updated'
  | 'visit_scheduled'
  | 'profile_updated'
  | 'foundation_approved'
  | 'foundation_rejected'
  | 'pet_published'
  | 'pet_suspended'
  | 'pet_unsuspended'
  | 'user_banned'
  | 'user_unbanned';

export type DateRangeFilter = 'today' | 'week' | 'month' | 'all';

export interface Activity {
  id:          number;
  user_id:     string;
  user_name:   string;
  user_email:  string;
  user_role:   'ciudadano' | 'fundacion' | 'admin' | 'developer';
  action:      ActivityType;
  description: string;
  metadata?:   Record<string, unknown>;
  ip_address?: string;
  created_at:  string;
}

export interface GetActivitiesParams {
  page:        number;
  search?:     string;
  action?:     ActivityType;
  date_range?: DateRangeFilter;
}

export const activityApi = {
  getActivities: (params: GetActivitiesParams) =>
    apiClient
      .get<PaginatedResponse<Activity>>('/admin/activities', { params })
      .then((r) => r.data),
};
