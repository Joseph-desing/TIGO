export type UserRole = 'usuario_registrado' | 'asesor_comercial';

export interface UserProfile {
  id: string; // UUID de Supabase Auth
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  session: any; // Session de Supabase
}