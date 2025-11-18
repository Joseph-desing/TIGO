import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { SupabaseService } from '../../core/services/supabase';

interface ConversacionItem {
  id: string;
  nombre: string;
  email: string;
  ultimoMensaje?: string;
  hora?: string;
  tieneNoLeidos?: boolean;
}

@Component({
  selector: 'app-chats-asesor',
  templateUrl: './chats-asesor.page.html',
  styleUrls: ['./chats-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ChatsAsesorPage implements OnInit {

  conversaciones: ConversacionItem[] = [];
  loading = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarConversaciones();
  }

  // 🔹 Traer desde Supabase solo usuarios registrados
  async cargarConversaciones() {
    this.loading = true;
    const supabase = this.supabaseService.getClient();

    // perfiles: id, nombre, apellido, email, rol, estado
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, apellido, email, estado, rol')
      .eq('rol', 'usuario_registrado'); // 👈 solo usuarios

    if (error) {
      console.error('Error cargando conversaciones:', error);
      this.loading = false;
      return;
    }

    // Mapear a estructura de la lista
    this.conversaciones = (data || []).map((p: any, index: number) => ({
      id: p.id,
      nombre: `${p.nombre || ''} ${p.apellido || ''}`.trim(),
      email: p.email,
      // De momento datos “mock” para la vista; luego puedes
      // reemplazar con info real de mensajes_chat si quieres.
      ultimoMensaje: 'Toca para chatear',
      hora: '',
      tieneNoLeidos: false
    }));

    this.loading = false;
  }

  // Al tocar una conversación, ir a la pantalla de chat
  abrirChat(conv: ConversacionItem) {
    // Aquí puedes pasar el id del usuario para usarlo en la página de chat
    this.router.navigate(['/chat'], {
      queryParams: { userId: conv.id, nombre: conv.nombre }
    });
  }

  // Footer tabs del asesor
  goToPlanes()      { this.router.navigate(['/pages/dashboard-asesor']); }
  goToSolicitudes() { this.router.navigate(['/pages/solicitudes-asesor']); }
  goToChats()       {} // ya estás aquí
  goToPerfil()      { this.router.navigate(['/pages/perfil-asesor']); }
}
