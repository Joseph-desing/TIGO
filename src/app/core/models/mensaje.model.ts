import { UserProfile } from './user.model';

export interface Mensaje {
  id?: string;
  contratacion_id: string;
  sender_id: string; // ID del usuario que envía (puede ser usuario o asesor)
  mensaje: string;
  leido: boolean;
  created_at?: string;
  
  // Relaciones
  sender?: UserProfile;
}

export interface MensajeCreate {
  contratacion_id: string;
  sender_id: string;
  mensaje: string;
}

export interface ChatConversacion {
  contratacion_id: string;
  ultimo_mensaje?: string;
  fecha_ultimo_mensaje?: string;
  mensajes_no_leidos: number;
  plan_nombre?: string;
  usuario_nombre?: string;
  usuario_email?: string;
}