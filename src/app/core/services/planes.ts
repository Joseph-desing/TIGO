import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Plan, PlanCreate, PlanUpdate } from '../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private planesSubject = new BehaviorSubject<Plan[]>([]);
  public planes$: Observable<Plan[]> = this.planesSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtener todos los planes activos
   */
  async getPlanes(): Promise<Plan[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .eq('activo', true)
      .order('precio', { ascending: true });

    if (error) throw error;

    this.planesSubject.next(data);
    return data;
  }

  /**
   * Obtener todos los planes (incluyendo inactivos) - Solo para asesores
   */
  async getAllPlanes(): Promise<Plan[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Obtener un plan por ID
   */
  async getPlanById(id: string): Promise<Plan> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Crear un nuevo plan (solo asesores)
   */
  async createPlan(plan: PlanCreate, imagen?: File): Promise<Plan> {
    const supabase = this.supabaseService.getClient();

    // Si hay imagen, subirla primero
    let imagen_url = undefined;
    if (imagen) {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${imagen.name}`;
      
      await this.supabaseService.uploadFile('planes-imagenes', fileName, imagen);
      imagen_url = this.supabaseService.getPublicUrl('planes-imagenes', fileName);
    }

    const planData = { ...plan, imagen_url };

    const { data, error } = await supabase
      .from('planes_moviles')
      .insert(planData)
      .select()
      .single();

    if (error) throw error;

    // Actualizar lista de planes
    await this.getPlanes();
    
    return data;
  }

  /**
   * Actualizar un plan existente (solo asesores)
   */
  async updatePlan(planUpdate: PlanUpdate, nuevaImagen?: File): Promise<Plan> {
    const supabase = this.supabaseService.getClient();

    // Si hay nueva imagen
    if (nuevaImagen) {
      // Obtener plan actual para eliminar imagen antigua
      const planActual = await this.getPlanById(planUpdate.id);
      
      // Eliminar imagen antigua si existe
      if (planActual.imagen_url) {
        const oldFileName = planActual.imagen_url.split('/').pop();
        if (oldFileName) {
          try {
            await this.supabaseService.deleteFile('planes-imagenes', oldFileName);
          } catch (error) {
            console.warn('No se pudo eliminar la imagen antigua:', error);
          }
        }
      }

      // Subir nueva imagen
      const timestamp = Date.now();
      const fileName = `${timestamp}_${nuevaImagen.name}`;
      
      await this.supabaseService.uploadFile('planes-imagenes', fileName, nuevaImagen);
      planUpdate.imagen_url = this.supabaseService.getPublicUrl('planes-imagenes', fileName);
    }

    const { id, ...updates } = planUpdate;

    const { data, error } = await supabase
      .from('planes_moviles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Actualizar lista de planes
    await this.getPlanes();

    return data;
  }

  /**
   * Eliminar un plan (solo asesores)
   */
  async deletePlan(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Obtener plan para eliminar imagen
    const plan = await this.getPlanById(id);
    
    if (plan.imagen_url) {
      const fileName = plan.imagen_url.split('/').pop();
      if (fileName) {
        try {
          await this.supabaseService.deleteFile('planes-imagenes', fileName);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen:', error);
        }
      }
    }

    const { error } = await supabase
      .from('planes_moviles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Actualizar lista de planes
    await this.getPlanes();
  }

  /**
   * Activar/Desactivar un plan
   */
  async togglePlanStatus(id: string, activo: boolean): Promise<Plan> {
    return this.updatePlan({ id, activo });
  }

  /**
   * Filtrar planes por segmento
   */
  async getPlanesBySegmento(segmento: 'basico' | 'medio' | 'premium'): Promise<Plan[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .eq('segmento', segmento)
      .eq('activo', true)
      .order('precio', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Buscar planes por nombre
   */
  async searchPlanes(query: string): Promise<Plan[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .or(`nombre.ilike.%${query}%,nombre_comercial.ilike.%${query}%`)
      .eq('activo', true);

    if (error) throw error;
    return data;
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToPlanes(callback: (planes: Plan[]) => void) {
    return this.supabaseService.subscribeToTable('planes_moviles', async () => {
      const planes = await this.getPlanes();
      callback(planes);
    });
  }
}