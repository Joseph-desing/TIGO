// src/app/pages/perfil-asesor/perfil-asesor.page.ts

import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { UserProfile } from '../../core/models';

@Component({
  selector: 'app-perfil-asesor',
  templateUrl: './perfil-asesor.page.html',
  styleUrls: ['./perfil-asesor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule],
})
export class PerfilAsesorPage implements OnInit {

  user: UserProfile | null = null;
  perfilForm!: FormGroup;
  editMode = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.initForm();
  }

  // Inicializar formulario con los datos actuales
  initForm() {
    this.perfilForm = this.fb.group({
      nombre:    [this.user?.nombre   || '', Validators.required],
      apellido:  [this.user?.apellido || ''],
      telefono:  [this.user?.telefono || '']
      // el email y rol NO los dejamos editar aquí
    });
  }

  // Botón principal: si no está en edición, activa edición.
  // Si ya está en edición, intenta guardar.
  async onEditarGuardar() {
    if (!this.editMode) {
      this.editMode = true;
      return;
    }

    // Modo edición -> guardar cambios
    await this.guardarPerfil();
  }

  async guardarPerfil() {
    if (this.perfilForm.invalid || !this.user) {
      return;
    }

    this.loading = true;
    try {
      const updates = this.perfilForm.value;

      const perfilActualizado = await this.authService.updateProfile(updates);
      this.user = perfilActualizado;   // actualizar en pantalla
      this.editMode = false;

      const t = await this.toastCtrl.create({
        message: 'Perfil actualizado correctamente',
        duration: 2000,
        color: 'success'
      });
      t.present();
    } catch (err) {
      console.error(err);
      const t = await this.toastCtrl.create({
        message: 'No se pudo actualizar el perfil',
        duration: 2000,
        color: 'danger'
      });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  cancelarEdicion() {
    this.editMode = false;
    this.initForm();   // volver a los valores originales
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      const t = await this.toastCtrl.create({
        message: 'Sesión cerrada',
        duration: 2000,
        color: 'primary'
      });
      t.present();
      this.router.navigate(['/pages/splash']);
    } catch (err) {
      console.error(err);
    }
  }

  // Footer tabs
  goToPlanes()      { this.router.navigate(['/pages/dashboard-asesor']); }
  goToSolicitudes() { this.router.navigate(['/pages/solicitudes-asesor']); }
  goToChats()       { this.router.navigate(['/pages/chats-asesor']); }
  goToPerfil()      {} // ya estás aquí
}
