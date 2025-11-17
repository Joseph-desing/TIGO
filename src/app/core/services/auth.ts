import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase';
import { UserProfile, RegisterData, LoginData, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$: Observable<UserProfile | null> = this.currentUserSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.checkSession();
  }

  /**
   * Verificar si hay una sesión activa al iniciar
   */
  private async checkSession() {
    try {
      const session = await this.supabaseService.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<UserProfile> {
    const supabase = this.supabaseService.getClient();

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Error al crear usuario');

    // 2. Crear perfil en tabla perfiles
    const userProfile: Partial<UserProfile> = {
      id: authData.user.id,
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      rol: 'usuario_registrado', // Rol por defecto
    };

    const { data: profileData, error: profileError } = await supabase
      .from('perfiles')
      .insert(userProfile)
      .select()
      .single();

    if (profileError) throw profileError;

    this.currentUserSubject.next(profileData);
    return profileData;
  }

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginData): Promise<UserProfile> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Error al iniciar sesión');

    // Cargar perfil del usuario
    const profile = await this.loadUserProfile(data.user.id);
    return profile;
  }

  /**
   * Cargar perfil de usuario desde la BD
   */
  private async loadUserProfile(userId: string): Promise<UserProfile> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    this.currentUserSubject.next(data);
    return data;
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    this.currentUserSubject.next(null);
    this.router.navigate(['/pages/auth/login']);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  /**
   * Verificar si es asesor
   */
  isAsesor(): boolean {
    return this.hasRole('asesor_comercial');
  }

  /**
   * Verificar si es usuario registrado
   */
  isUsuarioRegistrado(): boolean {
    return this.hasRole('usuario_registrado');
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    this.currentUserSubject.next(data);
    return data;
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(newPassword: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }

  /**
   * Recuperar contraseña (enviar email)
   */
  async resetPassword(email: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/auth/reset-password`,
    });

    if (error) throw error;
  }
}