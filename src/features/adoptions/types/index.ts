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

export interface AdoptionDocuments {
  doc_id?: string;
  doc_address?: string;
  doc_landlord?: string;
}

export interface AdoptionFormData {
  phone?: string;
  city?: string;
  housing_type?: string;
  ownership?: string;
  outdoor_space?: string;
  residents?: string;
  children?: string;
  current_pets?: string;
  prev_pets?: string;
  documents?: AdoptionDocuments;
}

export interface CreateAdoptionPayload {
  pet_id: number;
  message: string;
  form_data?: AdoptionFormData;
}
