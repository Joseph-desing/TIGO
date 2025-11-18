import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../core/services/supabase';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab2Page implements OnInit {

  contrataciones: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.cargarContrataciones();
  }

  async cargarContrataciones() {
    this.loading = true;
    try {
      const supabase = this.supabaseService.getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        this.contrataciones = [];
        return;
      }

      const { data, error } = await supabase
        .from('contrataciones')
        .select('id, estado, created_at, planes_moviles ( nombre, precio )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // normalizamos para el template
      this.contrataciones = (data || []).map((c: any) => ({
        id: c.id,
        estado: c.estado,
        fecha: c.created_at,
        plan_nombre: c.planes_moviles?.nombre,
        plan_precio: c.planes_moviles?.precio,
      }));
    } catch (err) {
      console.error('Error cargando contrataciones', err);
    } finally {
      this.loading = false;
    }
  }

  abrirChat(contratacionId: string) {
    this.router.navigate(['/pages/chat', contratacionId]);
  }
}
