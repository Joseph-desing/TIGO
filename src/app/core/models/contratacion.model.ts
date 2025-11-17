import { Plan } from './plan.model';
import { UserProfile } from './user.model';

export type EstadoContratacion = 'pendiente' | 'activo' | 'cancelado' | 'finalizado';

export interface Contratacion {
  id?: string;
  user_id: string;
  plan_id: string;
  estado: EstadoContratacion;
  fecha_contratacion: string;
  fecha_activacion?: string;
  fecha_finalizacion?: string;
  notas?: string;
  asesor_asignado?: string; // ID del asesor
  
  // Relaciones (cuando se hace JOIN)
  plan?: Plan;
  usuario?: UserProfile;
  asesor?: UserProfile;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface ContratacionCreate {
  user_id: string;
  plan_id: string;
  notas?: string;
}

export interface ContratacionUpdate {
  id: string;
  estado?: EstadoContratacion;
  asesor_asignado?: string;
  notas?: string;
  fecha_activacion?: string;
  fecha_finalizacion?: string;
}

export interface ContratacionStats {
  total: number;
  pendientes: number;
  activas: number;
  canceladas: number;
  finalizadas: number;
}