import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chats-asesor',
  templateUrl: './chats-asesor.page.html',
  styleUrls: ['./chats-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ChatsAsesorPage implements OnInit {

  conversaciones = [
    {
      id: 1,
      nombre: 'María González',
      inicial: 'M',
      hora: '10:45',
      mensaje: '¿Cuándo se activa mi plan?',
      leido: false,
    },
    {
      id: 2,
      nombre: 'Carlos Ramírez',
      inicial: 'C',
      hora: '09:30',
      mensaje: 'Gracias por tu ayuda',
      leido: true,
    },
    {
      id: 3,
      nombre: 'Ana López',
      inicial: 'A',
      hora: 'Ayer',
      mensaje: '¿Tienen promociones?',
      leido: false,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  abrirChat(conv: any) {
    console.log('Abrir chat con', conv.nombre);
    // aquí luego puedes navegar a /chat con parámetros
    this.router.navigate(['/chat']);
  }

  // Tabs del footer
  goToPlanes() {
    this.router.navigate(['/pages/dashboard-asesor']);
  }

  goToSolicitudes() {
    this.router.navigate(['/pages/solicitudes-asesor']);
  }

  goToChats() {
    // ya estás aquí
  }

  goToPerfil() {
    this.router.navigate(['/pages/perfil-asesor']);
  }
}
