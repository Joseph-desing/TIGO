import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  loadingUser = false;
  loadingAdvisor = false;
  production = environment.production;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  /**
   * Inicializar formulario
   */
  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Toggle mostrar/ocultar contraseña
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Login como usuario
   */
  async loginAsUser() {
    if (this.loginForm.invalid) return;
    this.loadingUser = true;

    try {
      const { email, password } = this.loginForm.value;
      const user = await this.authService.login({ email, password });

      await this.showToast(`¡Bienvenido ${user.nombre || 'de nuevo'}!`, 'success');

      // Redirigir según rol del usuario
      if (user.rol === 'asesor_comercial') {
        this.router.navigate(['/pages/dashboard-asesor'], { replaceUrl: true });
      } else {
        this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
      }

    } catch (error: any) {
      console.error('Login error:', error);

      let message = 'Error al iniciar sesión';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor confirma tu correo electrónico';
      }

      await this.showToast(message, 'danger');
    } finally {
      this.loadingUser = false;
    }
  }

  /**
   * Login como asesor (siempre al dashboard de asesor)
   */
  async loginAsAdvisor() {
    if (this.loginForm.invalid) return;
    this.loadingAdvisor = true;

    try {
      const { email, password } = this.loginForm.value;
      const user = await this.authService.login({ email, password });

      await this.showToast(`¡Bienvenido ${user.nombre || 'de nuevo'}!`, 'success');

      // REDIRECCIÓN FIJA AL DASHBOARD DE ASESOR
      this.router.navigate(['/pages/dashboard-asesor'], { replaceUrl: true });

    } catch (error: any) {
      console.error('Login error:', error);

      let message = 'Error al iniciar sesión';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor confirma tu correo electrónico';
      }

      await this.showToast(message, 'danger');
    } finally {
      this.loadingAdvisor = false;
    }
  }

  /**
   * Ir a página de registro
   */
  goToRegister() {
    this.router.navigate(['/pages/auth/register']);
  }

  /**
   * Continuar como invitado
   */
  async continueAsGuest() {
    const alert = await this.alertController.create({
      header: 'Modo Invitado',
      message: 'Como invitado solo podrás ver el catálogo de planes. Para contratar planes necesitas crear una cuenta.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Continuar', handler: () => this.router.navigate(['/tabs/tab1'], { replaceUrl: true }) }
      ]
    });
    await alert.present();
  }

  /**
   * Recuperar contraseña
   */
  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu correo electrónico para recibir instrucciones',
      inputs: [{ name: 'email', type: 'email', placeholder: 'Correo electrónico' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (!data.email) { this.showToast('Ingresa un correo electrónico', 'warning'); return false; }
            try {
              await this.authService.resetPassword(data.email);
              this.showToast('Revisa tu correo para restablecer tu contraseña', 'success');
              return true;
            } catch (error) {
              this.showToast('Error al enviar el correo', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Mostrar toast
   */
  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
