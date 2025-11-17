import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializar cliente de Supabase
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  /**
   * Obtener la instancia del cliente de Supabase
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Obtener el usuario autenticado actual
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Obtener la sesión actual
   */
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Subir archivo a Supabase Storage
   */
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener URL pública de un archivo
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Eliminar archivo de Storage
   */
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  /**
   * Suscribirse a cambios en tiempo real de una tabla
   */
  subscribeToTable(table: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: table },
        callback
      )
      .subscribe();
  }

  /**
   * Desuscribirse de un canal
   */
  async unsubscribe(channel: any) {
    await this.supabase.removeChannel(channel);
  }
}