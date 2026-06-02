export interface Foundation {
  id: number;
  name: string;
  city: string;
  description: string;
  logo?: string;
  contact_email: string;
  contact_phone?: string;
  instagram?: string;
  active_pets_count: number;
  adopted_pets_count: number;
  created_at: string;
}

export type FoundationAdoptionStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'completed';

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

export interface VisitSchedule {
  id: number;
  scheduled_at: string;
  location?: string;
  status: string;
}

export interface FoundationAdoption {
  id: number;
  tracking_code?: string;
  pet_id: number;
  pet_name: string;
  pet_photo?: string;
  adopter_id: string;
  adopter_name: string;
  adopter_email: string;
  foundation_id: string;
  foundation_name?: string;
  status: FoundationAdoptionStatus;
  message: string;
  form_data?: AdoptionFormData;
  visit_schedule?: VisitSchedule;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityDay {
  available_date: string; // YYYY-MM-DD
  start_time: string;     // HH:MM
  end_time: string;       // HH:MM
}

export interface CreatePetPayload {
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'other';
  breed?: string;
  age_months: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  description?: string;
  city: string;
  clinical_record?: {
    vaccinated?: boolean;
    sterilized?: boolean;
    dewormed?: boolean;
    microchipped?: boolean;
    health_notes?: string;
  };
}
