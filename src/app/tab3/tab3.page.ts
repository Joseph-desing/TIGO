import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../core/services/supabase';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab3Page implements OnInit {

  usuario: any = {
    nombre: '',
    email: '',
    telefono: ''
  };

  inicial = 'U';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      this.usuario = {
        nombre: `${data.nombre} ${data.apellido || ''}`.trim(),
        email: data.email,
        telefono: data.telefono
      };

      this.inicial = (data.nombre || 'U').charAt(0).toUpperCase();
    } catch (err) {
      console.error('Error cargando perfil', err);
    }
  }

  async logout() {
    try {
      const supabase = this.supabaseService.getClient();
      await supabase.auth.signOut();
      localStorage.clear();
      this.router.navigate(['/pages/splash'], { replaceUrl: true });
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  }
}
