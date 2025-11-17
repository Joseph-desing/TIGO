import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { Mensaje, MensajeCreate, ChatConversacion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  public mensajes$: Observable<Mensaje[]> = this.mensajesSubject.asObservable();

  private conversacionesSubject = new BehaviorSubject<ChatConversacion[]>([]);
  public conversaciones$: Observable<ChatConversacion[]> = this.conversacionesSubject.asObservable();

  private realtimeChannel: any;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Enviar un mensaje
   */
  async enviarMensaje(mensaje: MensajeCreate): Promise<Mensaje> {
    const supabase = this.supabaseService.getClient();

    const mensajeData = {
      ...mensaje,
      leido: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('mensajes_chat')
      .insert(mensajeData)
      .select(`
        *,
        sender:perfiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener mensajes de una contratación
   */
  async getMensajes(contratacionId: string): Promise<Mensaje[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('mensajes_chat')
      .select(`
        *,
        sender:perfiles(*)
      `)
      .eq('contratacion_id', contratacionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    this.mensajesSubject.next(data);
    return data;
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeido(contratacionId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('mensajes_chat')
      .update({ leido: true })
      .eq('contratacion_id', contratacionId)
      .neq('sender_id', userId)
      .eq('leido', false);

    if (error) throw error;
  }

  /**
   * Contar mensajes no leídos de una contratación
   */
  async contarMensajesNoLeidos(contratacionId: string, userId: string): Promise<number> {
    const supabase = this.supabaseService.getClient();

    const { data, error, count } = await supabase
      .from('mensajes_chat')
      .select('id', { count: 'exact', head: true })
      .eq('contratacion_id', contratacionId)
      .neq('sender_id', userId)
      .eq('leido', false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Obtener todas las conversaciones del usuario
   */
  async getMisConversaciones(): Promise<ChatConversacion[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const supabase = this.supabaseService.getClient();

    // Obtener contrataciones del usuario con último mensaje
    const { data: contrataciones, error } = await supabase
      .from('contrataciones')
      .select(`
        id,
        plan:planes_moviles(nombre, nombre_comercial),
        usuario:perfiles!contrataciones_user_id_fkey(nombre, email)
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    // Para cada contratación, obtener el último mensaje y contar no leídos
    const conversaciones: ChatConversacion[] = await Promise.all(
      contrataciones.map(async (contratacion: any) => {
        // Último mensaje
        const { data: ultimoMensaje } = await supabase
          .from('mensajes_chat')
          .select('mensaje, created_at')
          .eq('contratacion_id', contratacion.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Mensajes no leídos
        const noLeidos = await this.contarMensajesNoLeidos(contratacion.id, user.id);

        return {
          contratacion_id: contratacion.id,
          ultimo_mensaje: ultimoMensaje?.mensaje,
          fecha_ultimo_mensaje: ultimoMensaje?.created_at,
          mensajes_no_leidos: noLeidos,
          plan_nombre: contratacion.plan?.nombre_comercial || contratacion.plan?.nombre,
          usuario_nombre: contratacion.usuario?.nombre,
          usuario_email: contratacion.usuario?.email,
        };
      })
    );

    this.conversacionesSubject.next(conversaciones);
    return conversaciones;
  }

  /**
   * Obtener conversaciones para asesores (todas las contrataciones con chat activo)
   */
  async getConversacionesAsesor(): Promise<ChatConversacion[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const supabase = this.supabaseService.getClient();

    // Obtener contrataciones asignadas o todas si es asesor
    const { data: contrataciones, error } = await supabase
      .from('contrataciones')
      .select(`
        id,
        plan:planes_moviles(nombre, nombre_comercial),
        usuario:perfiles!contrataciones_user_id_fkey(nombre, email)
      `)
      .or(`asesor_asignado.eq.${user.id},asesor_asignado.is.null`)
      .in('estado', ['pendiente', 'activo']);

    if (error) throw error;

    // Para cada contratación, obtener info del chat
    const conversaciones: ChatConversacion[] = await Promise.all(
      contrataciones.map(async (contratacion: any) => {
        // Último mensaje
        const { data: ultimoMensaje } = await supabase
          .from('mensajes_chat')
          .select('mensaje, created_at')
          .eq('contratacion_id', contratacion.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Mensajes no leídos
        const noLeidos = await this.contarMensajesNoLeidos(contratacion.id, user.id);

        return {
          contratacion_id: contratacion.id,
          ultimo_mensaje: ultimoMensaje?.mensaje,
          fecha_ultimo_mensaje: ultimoMensaje?.created_at,
          mensajes_no_leidos: noLeidos,
          plan_nombre: contratacion.plan?.nombre_comercial || contratacion.plan?.nombre,
          usuario_nombre: contratacion.usuario?.nombre,
          usuario_email: contratacion.usuario?.email,
        };
      })
    );

    // Filtrar solo conversaciones que tengan al menos un mensaje
    const conversacionesActivas = conversaciones.filter(c => c.ultimo_mensaje);

    this.conversacionesSubject.next(conversacionesActivas);
    return conversacionesActivas;
  }

  /**
   * Suscribirse a mensajes en tiempo real de una contratación
   */
  subscribirAChatEnTiempoReal(contratacionId: string, callback: (mensaje: Mensaje) => void) {
    const supabase = this.supabaseService.getClient();

    this.realtimeChannel = supabase
      .channel(`chat:${contratacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`,
        },
        async (payload: any) => {
          // Obtener el mensaje completo con el perfil del sender
          const { data } = await supabase
            .from('mensajes_chat')
            .select(`
              *,
              sender:perfiles(*)
            `)
            .eq('id', payload.new['id'])
            .single();

          if (data) {
            // Actualizar lista de mensajes
            const mensajesActuales = this.mensajesSubject.value;
            this.mensajesSubject.next([...mensajesActuales, data]);
            
            // Ejecutar callback
            callback(data);
          }
        }
      )
      .subscribe();

    return this.realtimeChannel;
  }

  /**
   * Desuscribirse del chat en tiempo real
   */
  async desuscribirDeChat() {
    if (this.realtimeChannel) {
      await this.supabaseService.unsubscribe(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  /**
   * Eliminar un mensaje (opcional)
   */
  async eliminarMensaje(mensajeId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('mensajes_chat')
      .delete()
      .eq('id', mensajeId);

    if (error) throw error;
  }

  /**
   * Obtener total de mensajes no leídos del usuario
   */
  async getTotalMensajesNoLeidos(): Promise<number> {
    const user = this.authService.getCurrentUser();
    if (!user) return 0;

    const conversaciones = await this.getMisConversaciones();
    return conversaciones.reduce((total, conv) => total + conv.mensajes_no_leidos, 0);
  }

  /**
   * Limpiar estado
   */
  clearMensajes() {
    this.mensajesSubject.next([]);
  }
}