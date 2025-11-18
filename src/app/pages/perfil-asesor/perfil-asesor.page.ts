import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-perfil-asesor',
  templateUrl: './perfil-asesor.page.html',
  styleUrls: ['./perfil-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class PerfilAsesorPage implements OnInit {

  user = this.authService.getCurrentUser();

  constructor(
  private authService: AuthService,
  public router: Router,
  private alertCtrl: AlertController
) {}

  ngOnInit() {}

  get inicialNombre(): string {
    if (!this.user?.nombre) return 'A';
    return this.user.nombre.charAt(0).toUpperCase();
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/pages/splash'], { replaceUrl: true });
  }

  editarPerfil() {
    // más adelante puedes ir a una página para editar datos
    console.log('Editar perfil asesor');
  }
}
