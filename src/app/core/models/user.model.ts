export type UserRole = 'usuario_registrado' | 'asesor_comercial';

export interface UserProfile {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol: UserRole;
  avatar_url?: string;
  estado?: string; // 👈 AGREGAR ESTA LÍNEA
  created_at?: string;
  updated_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  session: any; // Session de Supabase
}