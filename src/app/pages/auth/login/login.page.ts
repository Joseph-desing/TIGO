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

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /** Login Usuario */
  async loginAsUser() {
    if (this.loginForm.invalid) {
      await this.showToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    this.loadingUser = true;

    try {
      const { email, password } = this.loginForm.value;
      console.log(' Intentando login como usuario...');

      const user = await this.authService.login({ email, password });

      console.log(' Login exitoso:', user);

      // Guardar rol en localStorage
      localStorage.setItem('rol', user.rol);

      // Verificar que sea usuario registrado
      if (user.rol !== 'usuario_registrado') {
        await this.showToast('Tu cuenta no es de usuario. Usa el botón de asesor.', 'warning');
        await this.authService.logout();
        return;
      }

      await this.showToast(`¡Bienvenido ${user.nombre || 'Usuario'}!`, 'success');

      // Redirigir a dashboard de usuario o tabs
      this.router.navigate(['/tabs/tab1'], { replaceUrl: true });

    } catch (error: any) {
      console.error(' Login usuario error:', error);
      
      let message = 'Correo o contraseña incorrectos';
      
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Por favor confirma tu correo electrónico';
      } else if (error.message) {
        message = error.message;
      }

      await this.showToast(message, 'danger');
    } finally {
      this.loadingUser = false;
    }
  }

  /** Login Asesor */
  async loginAsAdvisor() {
    if (this.loginForm.invalid) {
      await this.showToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    this.loadingAdvisor = true;

    try {
      const { email, password } = this.loginForm.value;
      console.log(' Intentando login como asesor...');

      const user = await this.authService.login({ email, password });

      console.log(' Login exitoso:', user);

      // Guardar rol en localStorage
      localStorage.setItem('rol', user.rol);

      // Verificar que sea asesor comercial
      if (user.rol !== 'asesor_comercial') {
        await this.showToast('Tu cuenta no es de asesor. Usa el botón de usuario.', 'warning');
        await this.authService.logout();
        return;
      }

      await this.showToast(`¡Bienvenido ${user.nombre || 'Asesor'}!`, 'success');

      // Redirigir a dashboard de asesor
      this.router.navigate(['/pages/dashboard-asesor'], { replaceUrl: true });

    } catch (error: any) {
      console.error(' Login asesor error:', error);
      
      let message = 'Correo o contraseña incorrectos';
      
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Por favor confirma tu correo electrónico';
      } else if (error.message) {
        message = error.message;
      }

      await this.showToast(message, 'danger');
    } finally {
      this.loadingAdvisor = false;
    }
  }

  /** Ir a registro */
  goToRegister() {
    this.router.navigate(['/pages/auth/register']);
  }

  /** Recuperar contraseña */
  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Ingresa tu correo electrónico para recibir instrucciones',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'correo@ejemplo.com'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (!data.email) {
              await this.showToast('Ingresa un correo electrónico', 'warning');
              return false;
            }

            try {
              await this.authService.resetPassword(data.email);
              await this.showToast('Revisa tu correo para restablecer tu contraseña', 'success');
              return true;
            } catch (error: any) {
              console.error('Reset password error:', error);
              await this.showToast('Error al enviar el correo de recuperación', 'danger');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

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