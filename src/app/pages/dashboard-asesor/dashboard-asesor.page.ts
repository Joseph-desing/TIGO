import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-asesor',
  templateUrl: './dashboard-asesor.page.html',
  styleUrls: ['./dashboard-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DashboardAsesorPage {

  constructor(private router: Router) {}

  // Ver catálogo de planes (como asesor, para ver info general)
  verCatalogoPlanes() {
    this.router.navigate(['/tabs']);   // tab1 catálogo
  }

  // Ver contrataciones pendientes (luego las podrás filtrar en esa página/tab)
  verContrataciones() {
    this.router.navigate(['/tabs/tab2']);  // tab2 podrías usarlo como "contrataciones"
  }

  // Ir al perfil del asesor (si usas tab3 como perfil)
  verPerfilAsesor() {
    this.router.navigate(['/tabs/tab3']);
  }

  irSplash() {
    this.router.navigate(['/pages/splash'], { replaceUrl: true });
  }
}
