export type PetSpecies = 'dog' | 'cat' | 'other';
export type PetGender = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';
export type PetStatus = 'available' | 'in_process' | 'adopted';

export interface ClinicalRecord {
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  microchipped: boolean;
  health_notes?: string;
}

export interface Pet {
  id: number;
  name: string;
  species: PetSpecies;
  breed?: string;
  age_months: number;
  gender: PetGender;
  size: PetSize;
  description: string;
  photos: string[];
  status: PetStatus;
  clinical_record: ClinicalRecord;
  foundation_id: number;
  foundation_name: string;
  city: string;
  created_at: string;
}

export interface SearchFilters {
  species?: PetSpecies;
  city?: string;
  size?: PetSize;
  status?: PetStatus;
  page?: number;
  per_page?: number;
  q?: string;
}
