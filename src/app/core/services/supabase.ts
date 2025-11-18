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
      environment.supabaseKey,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: false,
          
          multiTab: false,
        }
      } as any  
    );
  }

  
  getClient(): SupabaseClient {
    return this.supabase;
  }

  
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  
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

  
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

 
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  
  subscribeToTable(table: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        callback
      )
      .subscribe();
  }

 
  async unsubscribe(channel: any) {
    await this.supabase.removeChannel(channel);
  }
}
