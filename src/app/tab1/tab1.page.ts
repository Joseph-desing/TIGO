import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButtons,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cellularOutline, 
  callOutline, 
  chatbubbleOutline,
  searchOutline,
  logOutOutline
} from 'ionicons/icons';
import { PlanesService } from '../core/services/planes';
import { ContratacionesService } from '../core/services/contrataciones';
import { AuthService } from '../core/services/auth';
import { Plan } from '../core/models';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButtons
  ],
})
export class Tab1Page implements OnInit {
  planes: Plan[] = [];
  planesFiltrados: Plan[] = [];
  isLoading = true;
  searchTerm = '';
  segmentoSeleccionado = 'todos';

  constructor(
    private planesService: PlanesService,
    private contratacionesService: ContratacionesService,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      cellularOutline, 
      callOutline, 
      chatbubbleOutline,
      searchOutline,
      logOutOutline
    });
  }

  async ngOnInit() {
    await this.cargarPlanes();
    this.subscribeToRealtimeUpdates();
  }

  async cargarPlanes() {
    try {
      this.isLoading = true;
      this.planes = await this.planesService.getPlanes();
      this.planesFiltrados = [...this.planes];
    } catch (error) {
      console.error('Error al cargar planes:', error);
      this.showToast('Error al cargar los planes', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  filtrarPlanes() {
    let planesTemp = [...this.planes];

    // Filtrar por segmento
    if (this.segmentoSeleccionado !== 'todos') {
      planesTemp = planesTemp.filter(p => p.segmento === this.segmentoSeleccionado);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      planesTemp = planesTemp.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.nombre_comercial.toLowerCase().includes(term) ||
        p.datos_moviles.toLowerCase().includes(term)
      );
    }

    this.planesFiltrados = planesTemp;
  }

  verDetallePlan(plan: Plan) {
    this.router.navigate(['/detalle-plan'], { 
      state: { plan } 
    });
  }

  async contratarPlan(plan: Plan) {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.showToast('Debes iniciar sesión para contratar un plan', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    // Verificar si ya tiene contratación activa
    const tieneActiva = await this.contratacionesService.tieneContratacionActiva(plan.id!);
    
    if (tieneActiva) {
      this.showToast('Ya tienes una contratación activa de este plan', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Contratación',
      message: `¿Deseas contratar el plan ${plan.nombre_comercial} por $${plan.precio}/mes?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Contratar',
          handler: async () => {
            await this.procesarContratacion(plan);
          }
        }
      ]
    });

    await alert.present();
  }

  private async procesarContratacion(plan: Plan) {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando contratación...',
    });
    await loading.present();

    try {
      const user = this.authService.getCurrentUser();
      
      await this.contratacionesService.createContratacion({
        user_id: user!.id,
        plan_id: plan.id!,
        notas: `Contratación desde la app - ${new Date().toLocaleDateString()}`
      });

      await loading.dismiss();
      this.showToast('¡Plan contratado exitosamente!', 'success');
      
      // Ir a la pestaña de mis contrataciones
      this.router.navigate(['/tabs/tab2']);
      
    } catch (error) {
      await loading.dismiss();
      console.error('Error al contratar:', error);
      this.showToast('Error al procesar la contratación', 'danger');
    }
  }

  subscribeToRealtimeUpdates() {
    this.planesService.subscribeToPlanes((planes) => {
      this.planes = planes;
      this.filtrarPlanes();
    });
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: async () => {
            try {
              await this.authService.logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}