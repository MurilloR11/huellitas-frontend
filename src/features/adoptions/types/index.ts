export type AdoptionStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'completed';

export type VisitStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface VisitSchedule {
  id: number;
  scheduled_at: string;
  location?: string;
  status: VisitStatus;
}

export interface AdoptionRequest {
  id: number;
  pet_id: number;
  pet_name: string;
  pet_photo?: string;
  adopter_id: number;
  foundation_id: number;
  status: AdoptionStatus;
  message: string;
  created_at: string;
  updated_at: string;
  tracking_code?: string;
  foundation_name?: string;
  foundation_address?: string;
  visit_schedule?: VisitSchedule | null;
}

export interface CreateAdoptionPayload {
  pet_id: number;
  message: string;
}
