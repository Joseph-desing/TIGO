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
    if (this.loginForm.invalid) return;
    this.loadingUser = true;

    try {
      const { email, password } = this.loginForm.value;
      const user = await this.authService.login({ email, password });

      // guarda rol por si usas guards/UI
      localStorage.setItem('rol', user.rol);

      // 👇 ajusta 'usuario_registrado' si en tu BD usas otro string
      if (user.rol !== 'usuario_registrado') {
        await this.showToast('Tu cuenta no es de usuario. Usa el botón de asesor.', 'warning');
        return;
      }

      await this.showToast(`¡Bienvenido ${user.nombre || 'de nuevo'}!`, 'success');

      // 👉 USUARIO → DASHBOARD USUARIO
      this.router.navigate(['/pages/dashboard-usuario'], { replaceUrl: true });

    } catch (error: any) {
      await this.showToast('Correo o contraseña incorrectos', 'danger');
    } finally {
      this.loadingUser = false;
    }
  }

  /** Login Asesor */
  async loginAsAdvisor() {
    if (this.loginForm.invalid) return;
    this.loadingAdvisor = true;

    try {
      const { email, password } = this.loginForm.value;
      const user = await this.authService.login({ email, password });

      localStorage.setItem('rol', user.rol);

      // 👇 ajusta 'asesor_comercial' si en tu BD usas otro string
      if (user.rol !== 'asesor_comercial') {
        await this.showToast('Tu cuenta no es de asesor. Usa el botón de usuario.', 'warning');
        return;
      }

      await this.showToast(`¡Bienvenido ${user.nombre || 'de nuevo'}!`, 'success');

      // 👉 ASESOR → DASHBOARD ASESOR
      this.router.navigate(['/pages/dashboard-asesor'], { replaceUrl: true });

    } catch (error: any) {
      await this.showToast('Correo o contraseña incorrectos', 'danger');
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
      inputs: [{ name: 'email', type: 'email', placeholder: 'Correo electrónico' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (!data.email) {
              this.showToast('Ingresa un correo electrónico', 'warning');
              return false;
            }
            try {
              await this.authService.resetPassword(data.email);
              this.showToast('Revisa tu correo para restablecer tu contraseña', 'success');
              return true;
            } catch {
              this.showToast('Error al enviar el correo', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /** Mostrar toast */
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
