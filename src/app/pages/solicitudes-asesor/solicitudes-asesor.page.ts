import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-solicitudes-asesor',
  templateUrl: './solicitudes-asesor.page.html',
  styleUrls: ['./solicitudes-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class SolicitudesAsesorPage implements OnInit {

  // 🔹 Datos de ejemplo (luego los sacas de Supabase: tabla "contrataciones")
  solicitudes = [
    {
      id: 1,
      cliente: 'María González',
      plan: 'Plan Premium 15GB',
      fecha: '2024-11-10',
      estado: 'PENDIENTE' as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
    },
    {
      id: 2,
      cliente: 'Carlos Ramírez',
      plan: 'Plan Smart 5GB',
      fecha: '2024-11-09',
      estado: 'PENDIENTE' as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
    },
    {
      id: 3,
      cliente: 'Ana López',
      plan: 'Plan Ilimitado',
      fecha: '2024-11-08',
      estado: 'APROBADO' as 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // aquí luego llamarás a Supabase para cargar solicitudes reales
  }

  aprobarSolicitud(s: any) {
    s.estado = 'APROBADO';
    // TODO: llamar a Supabase para actualizar estado en "contrataciones"
    console.log('Aprobar solicitud', s);
  }

  rechazarSolicitud(s: any) {
    s.estado = 'RECHAZADO';
    // TODO: update Supabase
    console.log('Rechazar solicitud', s);
  }

  abrirChat(s: any) {
    // Puedes navegar al chat con el usuario
    console.log('Abrir chat con', s.cliente);
    this.router.navigate(['/chat']);
  }

  // 🔹 Footer tabs del asesor
  goToPlanes() {
    this.router.navigate(['/pages/dashboard-asesor']);
  }

  goToSolicitudes() {
    // ya estás aquí
  }

  goToChats() {
    this.router.navigate(['/chat']);
  }

  goToPerfil() {
    this.router.navigate(['/pages/dashboard-asesor/perfil']); // ajusta si creas esa página
  }
}
