import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private supabase: SupabaseService) {}

  // 1) Obtener mensajes de una contratación
  async getMensajes(contratacionId: string) {
    const db = this.supabase.getClient();

    const { data, error } = await db
      .from('mensajes_chat')
      .select('*')
      .eq('contratacion_id', contratacionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 2) Enviar mensaje
  async enviarMensaje(contratacionId: string, senderId: string, texto: string) {
    const db = this.supabase.getClient();

    const { data, error } = await db
      .from('mensajes_chat')
      .insert({
        contratacion_id: contratacionId,
        sender_id: senderId,
        mensaje: texto,
        leido: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 3) Escuchar cambios en tiempo real
  onMensajesChange(contratacionId: string, callback: (msg: any) => void) {
    const db = this.supabase.getClient();

    return db
      .channel(`mensajes:${contratacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`
        },
        (payload: any) => callback(payload.new)
      )
      .subscribe();
  }
}
