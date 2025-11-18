import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-invitado',
  templateUrl: './dashboard-invitado.page.html',
  styleUrls: ['./dashboard-invitado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DashboardInvitadoPage implements OnInit {

  planes = [
    {
      id: 1,
      nombre: 'Plan Smart 5GB',
      precio: 15.99,
      descripcion: 'Perfecto para navegar y estar conectado',
      gb: 5,
      minutos: 100,
      etiqueta: '¡Primer mes gratis!',
      colorIndex: 1
    },
    {
      id: 2,
      nombre: 'Plan Premium 15GB',
      precio: 29.99,
      descripcion: 'Para quienes necesitan más datos',
      gb: 15,
      minutos: 300,
      etiqueta: 'WhatsApp ilimitado',
      colorIndex: 2
    },
    {
      id: 3,
      nombre: 'Plan Ilimitado',
      precio: 45.99,
      descripcion: 'Sin límites para tu conexión',
      gb: null,
      minutos: null,
      etiqueta: 'Redes sociales gratis',
      colorIndex: 3
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // marcamos rol invitado por si lo usas en otros lados
    localStorage.setItem('rol', 'invitado');
  }

  irLogin() {
    this.router.navigate(['/pages/auth/login']);
  }

  verDetalle(plan: any) {
    // cuando tengas id real del plan, cámbialo
    this.router.navigate(['/pages/detalle-plan', plan.id]);
  }

  volverSplash() {
    this.router.navigate(['/pages/splash'], { replaceUrl: true });
  }
}
