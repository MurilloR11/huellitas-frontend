export type AdoptionStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'completed';

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
}

export interface CreateAdoptionPayload {
  pet_id: number;
  message: string;
}
