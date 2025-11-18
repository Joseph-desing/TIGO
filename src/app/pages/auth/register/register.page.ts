import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;

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
   * Inicializar formulario con validaciones
   */
  initForm() {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      rol: ['usuario_registrado', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Toggle mostrar/ocultar contraseña
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle mostrar/ocultar confirmar contraseña
   */
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Registrar nuevo usuario
   */
  async onRegister() {
    if (this.registerForm.invalid) return;

    this.loading = true;

    try {
      // Sacamos confirmPassword y aceptaTerminos, PERO DEJAMOS rol
      const { confirmPassword, aceptaTerminos, ...registerData } = this.registerForm.value;

      const user = await this.authService.register(registerData);

      // Mostrar mensaje de éxito
      await this.showToast('¡Cuenta creada exitosamente!', 'success');

     

      this.router.navigate(['/tabs/tab1'], { replaceUrl: true });

    } catch (error: any) {
      console.error('Register error:', error);
      
      let message = 'Error al crear la cuenta';
      
      if (error.message?.includes('already registered')) {
        message = 'Este correo ya está registrado';
      } else if (error.message?.includes('Invalid email')) {
        message = 'Correo electrónico inválido';
      } else if (error.message?.includes('Password')) {
        message = 'La contraseña debe tener al menos 6 caracteres';
      }

      await this.showToast(message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async showTerminos(event: Event) {
    event.preventDefault();
    
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <p><strong>Términos y Condiciones de Uso - TIGO Conecta</strong></p>
        <p>Al usar esta aplicación, aceptas:</p>
        <ul>
          <li>Proporcionar información veraz y actualizada</li>
          <li>Mantener la confidencialidad de tu cuenta</li>
          <li>Usar la app de manera legal y ética</li>
          <li>Los planes están sujetos a disponibilidad</li>
          <li>Precios pueden variar sin previo aviso</li>
        </ul>
        <p><small>Última actualización: Noviembre 2025</small></p>
      `,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async showPrivacidad(event: Event) {
    event.preventDefault();
    
    const alert = await this.alertController.create({
      header: 'Política de Privacidad',
      message: `
        <p><strong>Política de Privacidad - TIGO Conecta</strong></p>
        <p>Protegemos tus datos personales:</p>
        <ul>
          <li>Tus datos son almacenados de forma segura</li>
          <li>No compartimos información con terceros</li>
          <li>Usamos encriptación para proteger tu información</li>
          <li>Puedes solicitar eliminación de tus datos</li>
          <li>Cumplimos con normativas de protección de datos</li>
        </ul>
        <p><small>Última actualización: Noviembre 2025</small></p>
      `,
      buttons: ['Cerrar']
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
