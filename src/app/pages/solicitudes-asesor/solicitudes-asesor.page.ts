import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { SupabaseService } from '../../core/services/supabase';
import { AuthService } from '../../core/services/auth';

type EstadoSolicitud = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

interface SolicitudItem {
  id: string;
  cliente: string;
  plan: string;
  fecha: string;
  estado: EstadoSolicitud;
}

@Component({
  selector: 'app-solicitudes-asesor',
  templateUrl: './solicitudes-asesor.page.html',
  styleUrls: ['./solicitudes-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class SolicitudesAsesorPage implements OnInit {

  solicitudes: SolicitudItem[] = [];
  loading = false;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  // 🔹 Traer solicitudes desde Supabase (contrataciones + perfiles + planes_moviles)
  async cargarSolicitudes() {
    this.loading = true;
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        id,
        estado,
        fecha_contratacion,
        user:perfiles!contrataciones_user_id_fkey(
          id,
          nombre,
          apellido,
          telefono,
          email,
          rol
        ),
        plan:planes_moviles!contrataciones_plan_id_fkey(
          id,
          nombre,
          precio
        )
      `)
      .order('fecha_contratacion', { ascending: false });

    if (error) {
      console.error('Error cargando solicitudes:', error);
      this.solicitudes = [];
      this.loading = false;
      return;
    }

    this.solicitudes = (data || []).map((row: any) => ({
      id: row.id,
      cliente: `${row.user?.nombre || ''} ${row.user?.apellido || ''}`.trim(),
      plan: row.plan?.nombre || 'Plan sin nombre',
      fecha: row.fecha_contratacion
        ? new Date(row.fecha_contratacion).toISOString().slice(0, 10)
        : '',
      estado: (row.estado || 'PENDIENTE') as EstadoSolicitud,
    }));

    this.loading = false;
  }

  // 🔹 Aprobar
  async aprobarSolicitud(s: SolicitudItem) {
    await this.cambiarEstado(s, 'APROBADO');
  }

  // 🔹 Rechazar
  async rechazarSolicitud(s: SolicitudItem) {
    await this.cambiarEstado(s, 'RECHAZADO');
  }

  // 🔹 Cambiar estado en Supabase + refrescar UI
  private async cambiarEstado(s: SolicitudItem, nuevoEstado: EstadoSolicitud) {
    const supabase = this.supabaseService.getClient();
    const asesor = this.authService.getCurrentUser();

    const alert = await this.alertCtrl.create({
      header: nuevoEstado === 'APROBADO' ? 'Aprobar solicitud' : 'Rechazar solicitud',
      message: `¿Seguro que deseas marcar la solicitud de <b>${s.cliente}</b> como <b>${nuevoEstado}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            const { error } = await supabase
              .from('contrataciones')
              .update({
                estado: nuevoEstado,
                updated_at: new Date().toISOString(),
                asesor_asignado: asesor?.id || null,
              })
              .eq('id', s.id);

            if (error) {
              console.error('Error actualizando estado:', error);
              const tErr = await this.toastCtrl.create({
                message: 'No se pudo actualizar la solicitud',
                duration: 2000,
                color: 'danger',
              });
              tErr.present();
              return;
            }

            // Actualizar en memoria
            this.solicitudes = this.solicitudes.map(sol =>
              sol.id === s.id ? { ...sol, estado: nuevoEstado } : sol
            );

            const tOk = await this.toastCtrl.create({
              message:
                nuevoEstado === 'APROBADO'
                  ? 'Solicitud aprobada correctamente'
                  : 'Solicitud rechazada correctamente',
              duration: 2000,
              color: nuevoEstado === 'APROBADO' ? 'success' : 'danger',
            });
            tOk.present();
          },
        },
      ],
    });

    await alert.present();
  }

  // 🔹 Navegación footer
  goToPlanes()      { this.router.navigate(['/pages/dashboard-asesor']); }
  goToSolicitudes() {} // ya estás aquí
  goToChats()       { this.router.navigate(['/pages/chats-asesor']); }
  goToPerfil()      { this.router.navigate(['/pages/perfil-asesor']); }
}
