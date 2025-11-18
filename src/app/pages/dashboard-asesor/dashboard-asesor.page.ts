import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-asesor',
  templateUrl: './dashboard-asesor.page.html',
  styleUrls: ['./dashboard-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class DashboardAsesorPage implements OnInit {

  planesActivos = [
    {
      id: 1,
      nombre: 'Plan Smart 5GB',
      precio: 15.99,
      datos: '5 GB',
      minutos: '100 min',
      descripcion: 'Perfecto para navegar y estar conectado',
      promocion: '¡Primer mes gratis!'
    },
    {
      id: 2,
      nombre: 'Plan Premium 10GB',
      precio: 24.99,
      datos: '10 GB',
      minutos: 'Ilimitado',
      descripcion: 'Ideal para redes sociales y streaming',
      promocion: null
    }
  ];

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  //  Crear nuevo plan
  crearNuevoPlan() {
    this.router.navigate(['/pages/crear-plan']);
  }

  //  Editar plan
  editarPlan(plan: any) {
    this.router.navigate(['/pages/detalle-plan', plan.id]);
  }

  //  Eliminar plan (con alerta + refresco del array)
  async eliminarPlan(plan: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar plan',
      message: `¿Seguro que deseas eliminar el plan <b>${plan.nombre}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            
            // Eliminar del array 
            this.planesActivos = [
              ...this.planesActivos.filter(p => p.id !== plan.id)
            ];

            // Toast de confirmación
            const t = await this.toastCtrl.create({
              message: 'Plan eliminado correctamente',
              duration: 2000,
              color: 'danger'
            });
            t.present();

          }
        }
      ]
    });

    await alert.present();
  }

  // Navegación inferior
  goToPlanes() {}
  goToSolicitudes() { this.router.navigate(['/pages/solicitudes-asesor']); }
  goToChats() { this.router.navigate(['/pages/chats-asesor']); }
  goToPerfil() { this.router.navigate(['/pages/perfil-asesor']); }
}
