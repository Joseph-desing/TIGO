import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-usuario',
  templateUrl: './dashboard-usuario.page.html',
  styleUrls: ['./dashboard-usuario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DashboardUsuarioPage {

  constructor(private router: Router) {}

  verCatalogo() {
    // Tab1 = catálogo (tabs redirige a tab1 por defecto)
    this.router.navigate(['/tabs'], { replaceUrl: true });
  }

  verMisContrataciones() {
    this.router.navigate(['/tabs/tab2']);
  }

  verPerfil() {
    this.router.navigate(['/tabs/tab3']);
  }

  irSplash() {
    this.router.navigate(['/pages/splash'], { replaceUrl: true });
  }
}
