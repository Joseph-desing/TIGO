import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../core/services/supabase';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab1Page implements OnInit {

  planes: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.cargarPlanes();
  }

  async cargarPlanes() {
    this.loading = true;
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('planes_moviles')
        .select('*')
        .eq('activo', true)
        .order('precio', { ascending: true });

      if (error) throw error;
      this.planes = data || [];
    } catch (err) {
      console.error('Error cargando planes', err);
    } finally {
      this.loading = false;
    }
  }

  verDetalle(planId: string) {
    this.router.navigate(['/pages/detalle-plan', planId]);
  }
}
