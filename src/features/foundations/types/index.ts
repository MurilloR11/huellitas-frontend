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

export interface FoundationAdoption {
  id: number;
  pet_id: number;
  pet_name: string;
  pet_photo?: string;
  adopter_id: string;
  adopter_name: string;
  adopter_email: string;
  foundation_id: string;
  status: FoundationAdoptionStatus;
  message: string;
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
