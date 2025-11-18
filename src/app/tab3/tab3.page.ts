import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../core/services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  standalone: true,
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab3Page implements OnInit {

  cargando = true;
  editando = false;
  guardando = false;

  userId: string | null = null;
  email: string | null = null;

  perfil = {
    nombre: '',
    apellido: '',
    telefono: '',
    rol: 'usuario_registrado',
  };

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      this.cargando = true;

      // 1) Usuario actual
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.cargando = false;
        return;
      }

      this.userId = user.id;
      this.email = user.email ?? null;

      const db = this.supabase.getClient();

      // 2) Buscar perfil en la tabla perfiles
      const { data, error } = await db
        .from('perfiles')
        .select('nombre, apellido, telefono, rol')
        .eq('id', this.userId)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (data) {
        this.perfil = {
          nombre: data.nombre ?? '',
          apellido: data.apellido ?? '',
          telefono: data.telefono ?? '',
          rol: data.rol ?? 'usuario_registrado',
        };
      } else {
        // Sin perfil aún, dejamos valores por defecto
        this.perfil = {
          nombre: '',
          apellido: '',
          telefono: '',
          rol: 'usuario_registrado',
        };
      }

    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }

  get inicialAvatar(): string {
    if (this.perfil.nombre) {
      return this.perfil.nombre.charAt(0).toUpperCase();
    }
    if (this.email) {
      return this.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  onEditar() {
    this.editando = true;
  }

  onCancelar() {
    this.editando = false;
    this.cargarPerfil();
  }

  async onGuardar() {
    if (!this.userId) return;

    try {
      this.guardando = true;

      const db = this.supabase.getClient();

      const payload = {
        id: this.userId,
        email: this.email,                                // email NO puede ser null
        nombre: this.perfil.nombre || null,
        apellido: this.perfil.apellido || null,
        telefono: this.perfil.telefono || null,
        rol: this.perfil.rol || 'usuario_registrado',     // rol NO puede ser null
      };

      const { error } = await db
        .from('perfiles')
        .upsert(payload);

      if (error) {
        console.error('Error al guardar perfil:', error);
        return;
      }

      this.editando = false;

    } catch (e) {
      console.error('Error al guardar perfil:', e);
    } finally {
      this.guardando = false;
    }
  }

  async cerrarSesion() {
    try {
      const db = this.supabase.getClient();
      await db.auth.signOut();
      this.router.navigateByUrl('/pages/auth/login', { replaceUrl: true });
    } catch (e) {
      console.error(e);
    }
  }
}
