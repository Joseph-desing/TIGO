import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat';
import { SupabaseService } from '../../core/services/supabase';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ChatPage implements OnInit, OnDestroy {

  mensajes: any[] = [];
  nuevoMensaje = '';

  userId: string | null = null;
  contratacionId: string | null = null;

  cargando = true;
  sinContrataciones = false;

  private subscription: any;

  constructor(
    private chatService: ChatService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    try {
      // 1) Obtener usuario actual
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.sinContrataciones = true;
        this.cargando = false;
        return;
      }
      this.userId = user.id;

      // 2) Buscar su contratación más reciente
      const db = this.supabase.getClient();
      const { data, error } = await db
        .from('contrataciones')
        .select('id, created_at, estado')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        this.sinContrataciones = true;
        this.cargando = false;
        return;
      }

      this.contratacionId = data.id;

      // 3) Cargar mensajes existentes
      await this.cargarMensajes();

      // 4) Suscribirse a cambios en tiempo real
      this.subscription = this.chatService.onMensajesChange(
        this.contratacionId as string,          // 👈 cast para evitar el error de TS
        (nuevo: any) => {
          const esPropio = nuevo.sender_id === this.userId;
          this.mensajes.push({ ...nuevo, esPropio });
        }
      );
    } catch (e) {
      console.error(e);
      this.sinContrataciones = true;
    } finally {
      this.cargando = false;
    }
  }

  async cargarMensajes() {
    if (!this.contratacionId) return;

    const data = await this.chatService.getMensajes(this.contratacionId as string);
    this.mensajes = data.map((m: any) => ({
      ...m,
      esPropio: m.sender_id === this.userId
    }));
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;
    if (!this.contratacionId || !this.userId) return;

    const enviado = await this.chatService.enviarMensaje(
      this.contratacionId as string,      // 👈 cast
      this.userId as string,              // 👈 cast
      this.nuevoMensaje.trim()
    );

    this.nuevoMensaje = '';

    this.mensajes.push({
      ...enviado,
      esPropio: true
    });
  }

  ngOnDestroy() {
    if (this.subscription && typeof this.subscription.unsubscribe === 'function') {
      this.subscription.unsubscribe();
    }
  }
}
