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
   * REGISTRO SIN TRIGGER - Crear perfil manualmente con service_role
   */
  async register(data: RegisterData): Promise<UserProfile> {
    const supabase = this.supabaseService.getClient();

    try {
      console.log('📝 Registrando usuario con email:', data.email);

      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            telefono: data.telefono || '',
            rol: data.rol || 'usuario_registrado'
          }
        }
      });

      if (authError) {
        console.error('❌ Error en signUp:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ Usuario creado en Auth:', authData.user.id);

      // 2. Esperar para asegurar que el usuario existe
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Verificar si ya existe un perfil (por si el trigger funcionó)
      const { data: existingProfile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (existingProfile) {
        console.log('✅ Perfil ya existía');
        this.currentUserSubject.next(existingProfile);
        return existingProfile;
      }

      // 4. Si no existe, crear perfil manualmente
      console.log('📝 Creando perfil manualmente...');
      
      const profileToInsert = {
        id: authData.user.id,
        email: data.email,
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        telefono: data.telefono || '',
        rol: (data.rol || 'usuario_registrado') as UserRole
      };

      const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .insert(profileToInsert)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error al crear perfil:', profileError);
        
        // Intentar cargar el perfil por si ya existe
        try {
          const profile = await this.loadUserProfile(authData.user.id);
          return profile;
        } catch {
          throw new Error('Error al crear perfil. Intenta iniciar sesión.');
        }
      }

      console.log('✅ Perfil creado exitosamente');
      this.currentUserSubject.next(profileData);
      return profileData;

    } catch (error: any) {
      console.error('❌ Error en registro:', error);

      if (error.message?.includes('User already registered') || 
          error.message?.includes('already registered')) {
        throw new Error('Este correo ya está registrado');
      }

      if (error.code === '23505') {
        throw new Error('Este correo ya está registrado');
      }

      throw error;
    }
  }

  async login(credentials: LoginData): Promise<UserProfile> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Error al iniciar sesión');

    const profile = await this.loadUserProfile(data.user.id);
    return profile;
  }

  private async loadUserProfile(userId: string): Promise<UserProfile> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al cargar perfil:', error);
      throw error;
    }

    this.currentUserSubject.next(data);
    return data;
  }

  async logout() {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    this.currentUserSubject.next(null);
    this.router.navigate(['/pages/auth/login']);
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  isAsesor(): boolean {
    return this.hasRole('asesor_comercial');
  }

  isUsuarioRegistrado(): boolean {
    return this.hasRole('usuario_registrado');
  }

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

  async changePassword(newPassword: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }

  async resetPassword(email: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/auth/reset-password`,
    });

    if (error) throw error;
  }
}