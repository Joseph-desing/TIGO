import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { 
  Contratacion, 
  ContratacionCreate, 
  ContratacionUpdate, 
  ContratacionStats,
  EstadoContratacion 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Crear una nueva contratación
   */
  async createContratacion(contratacion: ContratacionCreate): Promise<Contratacion> {
    const supabase = this.supabaseService.getClient();

    const contratacionData = {
      ...contratacion,
      estado: 'pendiente' as EstadoContratacion,
      fecha_contratacion: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('contrataciones')
      .insert(contratacionData)
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener contrataciones del usuario actual
   */
  async getMisContrataciones(): Promise<Contratacion[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener todas las contrataciones (solo asesores)
   */
  async getAllContrataciones(): Promise<Contratacion[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*),
        asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener contrataciones pendientes (solo asesores)
   */
  async getContratacionesPendientes(): Promise<Contratacion[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*)
      `)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener contrataciones por estado
   */
  async getContratacionesByEstado(estado: EstadoContratacion): Promise<Contratacion[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*)
      `)
      .eq('estado', estado)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener una contratación por ID
   */
  async getContratacionById(id: string): Promise<Contratacion> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*),
        asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Actualizar contratación (solo asesores)
   */
  async updateContratacion(update: ContratacionUpdate): Promise<Contratacion> {
    const supabase = this.supabaseService.getClient();

    const { id, ...updates } = update;

    // Si se está activando, agregar fecha de activación
    if (updates.estado === 'activo' && !updates.fecha_activacion) {
      updates.fecha_activacion = new Date().toISOString();
    }

    // Si se está finalizando, agregar fecha de finalización
    if (updates.estado === 'finalizado' && !updates.fecha_finalizacion) {
      updates.fecha_finalizacion = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('contrataciones')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*),
        asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Asignar asesor a una contratación
   */
  async asignarAsesor(contratacionId: string, asesorId: string): Promise<Contratacion> {
    return this.updateContratacion({
      id: contratacionId,
      asesor_asignado: asesorId,
    });
  }

  /**
   * Cambiar estado de contratación
   */
  async cambiarEstado(contratacionId: string, estado: EstadoContratacion, notas?: string): Promise<Contratacion> {
    return this.updateContratacion({
      id: contratacionId,
      estado,
      notas,
    });
  }

  /**
   * Activar contratación
   */
  async activarContratacion(contratacionId: string): Promise<Contratacion> {
    return this.cambiarEstado(contratacionId, 'activo');
  }

  /**
   * Cancelar contratación
   */
  async cancelarContratacion(contratacionId: string, motivo?: string): Promise<Contratacion> {
    return this.cambiarEstado(contratacionId, 'cancelado', motivo);
  }

  /**
   * Obtener estadísticas de contrataciones (para dashboard asesor)
   */
  async getStats(): Promise<ContratacionStats> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select('estado');

    if (error) throw error;

    const stats: ContratacionStats = {
      total: data.length,
      pendientes: data.filter(c => c.estado === 'pendiente').length,
      activas: data.filter(c => c.estado === 'activo').length,
      canceladas: data.filter(c => c.estado === 'cancelado').length,
      finalizadas: data.filter(c => c.estado === 'finalizado').length,
    };

    return stats;
  }

  /**
   * Obtener contrataciones del asesor actual
   */
  async getMisContratacionesComoAsesor(): Promise<Contratacion[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles!contrataciones_user_id_fkey(*)
      `)
      .eq('asesor_asignado', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Verificar si el usuario tiene contrataciones activas de un plan
   */
  async tieneContratacionActiva(planId: string): Promise<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select('id')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .in('estado', ['pendiente', 'activo'])
      .limit(1);

    if (error) throw error;
    return data.length > 0;
  }

  /**
   * Suscribirse a cambios en contrataciones en tiempo real
   */
  subscribeToContrataciones(callback: () => void) {
    return this.supabaseService.subscribeToTable('contrataciones', callback);
  }

  /**
   * Eliminar una contratación (solo en casos excepcionales)
   */
  async deleteContratacion(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('contrataciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}