// Базовый интерфейс пользователя (из auth.users)
export interface BaseUser {
  id: string;
  email: string;
  created_at: string;
}

// Физические лица (клиенты)
export interface Client {
  id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  rating: number;
  total_spent: number; // в копейках
  active_orders: number;
  completed_orders: number;
  created_at: string;
  updated_at: string;
}

// Юридические лица (бизнес)
export interface Business {
  id: string;
  company_name: string;
  idno: string; // код предприятия
  contact_person: string;
  legal_address: string;
  phone: string | null;
  email: string | null;
  rating: number;
  total_spent: number; // в копейках
  active_contracts: number;
  completed_contracts: number;
  created_at: string;
  updated_at: string;
}

// Специалисты
export interface Professional {
  id: string;
  full_name: string;
  phone: string | null;
  categories: string[];
  service_radius_km: number;
  bio: string | null;
  hourly_rate: number; // в копейках
  rating: number;
  total_earned: number; // в копейках
  active_jobs: number;
  completed_jobs: number;
  kyc_status: 'pending' | 'verified' | 'rejected';
  is_available: boolean;
  response_time_minutes: number;
  created_at: string;
  updated_at: string;
}

// Универсальный тип профиля для компонентов
export type UserProfile = Client | Business | Professional;

// Тип пользователя для определения роли
export type UserType = 'client' | 'business' | 'professional';

// Устаревший интерфейс Profile (для совместимости)
export interface Profile {
  id: string;
  role: 'user' | 'pro' | 'admin';
  full_name: string | null;
  email?: string | null;
  phone: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
  account_type?: 'client' | 'business' | 'pro';
  business_id?: string | null;
  contact_person?: string | null;
  legal_address?: string | null;
}

export interface Pro {
  id: string;
  categories: string[];
  service_radius_km: number;
  kyc_status: 'pending' | 'verified' | 'rejected';
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  category: string;
  geo: any; // PostGIS geography type
  brief: string | null;
  price_est_min: number;
  price_est_max: number;
  status: 'new' | 'offered' | 'accepted' | 'in_progress' | 'done' | 'disputed' | 'cancelled';
  pro_id: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tender {
  id: string;
  user_id: string;
  category: string;
  geo: any; // PostGIS geography type
  brief: string | null;
  window_from: string | null;
  window_to: string | null;
  budget_hint: number;
  status: 'open' | 'bafo' | 'awarded' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  tender_id: string;
  pro_id: string;
  price: number;
  eta_slot: string | null;
  warranty_days: number;
  note: string | null;
  is_final: boolean;
  score: number | null;
  created_at: string;
}

export interface Wallet {
  pro_id: string;
  balance_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Charge {
  id: string;
  subject: string;
  subject_id: string | null;
  pro_id: string;
  amount_cents: number;
  meta: any;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'job_accepted' | 'tender_won' | 'new_job' | 'tender_available' | 'payment_received' | 'review_received';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  pro_id: string;
  message: string;
  estimated_duration: string;
  availability: string;
  photos: string[];
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Chat {
  id: string;
  job_id?: string;
  tender_id?: string;
  client_id: string;
  professional_id: string;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface BidPhoto {
  id: string;
  bid_id: string;
  photo_url: string;
  description: string | null;
  created_at: string;
}